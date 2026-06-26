import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Profile, Venue, Hangout, JoinRequest, MyHangout } from '../types';

const API_BASE = (process.env.EXPO_PUBLIC_API_BASE ?? 'http://127.0.0.1:8000/api').replace(/\/$/, '');
let authToken: string | null = null;

type ApiEnvelope<T> = T | { data: T };

const emptyProfile: Profile = {
  name: 'Unknown',
  age: 0,
  city: '',
  bio: '',
  avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
  is_verified: false,
  vibe_tags: []
};

function unwrapData<T>(payload: ApiEnvelope<T>): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return payload.data;
  }

  return payload;
}

async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options?.body ? { 'Content-Type': 'application/json' } : {}),
      ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
      ...options?.headers
    }
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message =
      payload && typeof payload === 'object' && 'message' in payload
        ? String(payload.message)
        : `Backend request failed (${response.status})`;
    throw new Error(message);
  }

  return unwrapData(payload as ApiEnvelope<T>);
}

function normalizeProfile(profile?: Partial<Profile> | null): Profile {
  return {
    ...emptyProfile,
    ...profile,
    vibe_tags: Array.isArray(profile?.vibe_tags) ? profile.vibe_tags : []
  };
}

function normalizeVenue(venue: Venue): Venue {
  return {
    id: venue.id,
    name: venue.name,
    area: venue.area,
    address: venue.address,
    venue_type: venue.venue_type,
    price_range: venue.price_range,
    photos: Array.isArray(venue.photos) ? venue.photos : []
  };
}

function normalizeHangout(hangout: Hangout): Hangout {
  return {
    ...hangout,
    host: normalizeProfile(hangout.host),
    venue: normalizeVenue(hangout.venue),
    members_count: hangout.members_count ?? hangout.members?.length ?? 0,
    vibe_tags: Array.isArray(hangout.vibe_tags) ? hangout.vibe_tags : [],
    members: Array.isArray(hangout.members) ? hangout.members : []
  };
}

function formatDateTimeForApi(value: string): string {
  const trimmedValue = value.trim();
  const parsedDate = new Date(trimmedValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return trimmedValue;
  }

  return parsedDate.toISOString().slice(0, 19).replace('T', ' ');
}

const STATIC_VENUES: Venue[] = [
  {
    id: 1,
    name: 'Lowlight Wine Room',
    area: 'Poblacion',
    address: '4991 P. Guanzon, Makati, 1210 Metro Manila',
    venue_type: 'Wine Bar',
    price_range: '$$',
    photos: [
      {
        id: 1,
        photo_url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=600&q=80',
        is_primary: true
      }
    ]
  },
  {
    id: 2,
    name: 'Rooftop Social',
    area: 'BGC',
    address: '30th St, Taguig, Metro Manila',
    venue_type: 'Rooftop Lounge',
    price_range: '$$$',
    photos: [
      {
        id: 2,
        photo_url: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?auto=format&fit=crop&w=600&q=80',
        is_primary: true
      }
    ]
  },
  {
    id: 3,
    name: 'Karaoke Room 88',
    area: 'Makati',
    address: 'Valero Street, Salcedo Village, Makati',
    venue_type: 'Karaoke Lounge',
    price_range: '$',
    photos: [
      {
        id: 3,
        photo_url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80',
        is_primary: true
      }
    ]
  }
];

export default function useMobileData() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [customAlert, setCustomAlert] = useState<{ title: string; message: string } | null>(null);

  const showAlert = useCallback((title: string, message: string) => {
    setCustomAlert({ title, message });
  }, []);

  const hideAlert = useCallback(() => {
    setCustomAlert(null);
  }, []);
  const [activeTab, setActiveTab] = useState<'discover' | 'create' | 'chat' | 'safety' | 'profile'>('discover');
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);
  
  // Modal states
  const [selectedHangout, setSelectedHangout] = useState<Hangout | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [joinNotes, setJoinNotes] = useState('');
  const [showApprovalsPanel, setShowApprovalsPanel] = useState(false);

  // Authentication Fields
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const [currentUserId, setCurrentUserId] = useState<number>(5);

  // Current User
  const [currentUser, setCurrentUser] = useState<Profile>(emptyProfile);

  // Load persisted session on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem('@natsvibe:email');
        const savedToken = await AsyncStorage.getItem('@natsvibe:token');
        const savedRemember = await AsyncStorage.getItem('@natsvibe:remember');

        if (savedEmail) {
          setEmailInput(savedEmail);
        }
        if (savedRemember === 'true') {
          setRememberMe(true);
        }

        if (savedToken) {
          authToken = savedToken;
          setIsLoadingData(true);
          try {
            const result = await apiRequest<{
              user: { id: number; name: string; email: string };
              profile: Profile;
            }>('/me');
            
            setCurrentUserId(result.user.id);
            setCurrentUser(result.profile);
            setIsLoggedIn(true);
          } catch (err) {
            console.log('[Auth] Persisted session token invalid, clearing:', err);
            await AsyncStorage.removeItem('@natsvibe:token');
            authToken = null;
          } finally {
            setIsLoadingData(false);
          }
        }
      } catch (e) {
        console.log('[Auth] Error restoring session:', e);
      }
    };

    restoreSession();
  }, []);

  // Venues and Hangouts list
  const [venues, setVenues] = useState<Venue[]>(STATIC_VENUES);
  const [hangouts, setHangouts] = useState<Hangout[]>([]);

  // Host Join Requests List (kept local for MVP UI simulation)
  const [requests, setRequests] = useState<JoinRequest[]>([]);

  // Chat Messages State & User's Hangouts
  const [myHangoutsList, setMyHangoutsList] = useState<MyHangout[]>([]);
  const [activeChatHangout, setActiveChatHangout] = useState<MyHangout | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [typedMessage, setTypedMessage] = useState('');

  // Safety Status
  const [trustedContact, setTrustedContact] = useState({ name: 'Miguel (Brother)', phone: '+639171234567' });
  const [checkInActive, setCheckInActive] = useState(false);

  // Fetch initial database info
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const fetchVenues = useCallback(async () => {
    // Venues are handled statically on the frontend as requested
    setVenues(STATIC_VENUES);
  }, []);

  const fetchHangouts = useCallback(async () => {
    const data = await apiRequest<Hangout[]>('/hangouts');
    setHangouts(data.map(normalizeHangout));
  }, []);

  const fetchJoinRequests = useCallback(async () => {
    try {
      const data = await apiRequest<JoinRequest[]>(`/join-requests?host_id=${currentUserId}`);
      setRequests(data);
    } catch (err) {
      console.warn('Join request endpoint unavailable; keeping local approval data:', err);
    }
  }, [currentUserId]);

  const fetchMyHangouts = useCallback(async () => {
    try {
      const data = await apiRequest<MyHangout[]>('/my-hangouts');
      setMyHangoutsList(data);
      if (data.length > 0) {
        setActiveChatHangout(prev => {
          if (!prev || !data.some(h => h.id === prev.id)) {
            return data[0];
          }
          return data.find(h => h.id === prev.id) || data[0];
        });
      } else {
        setActiveChatHangout(null);
      }
    } catch (err) {
      console.log('[API] Error fetching my hangouts:', err);
    }
  }, []);

  const fetchMessages = useCallback(async (hangoutId: number) => {
    try {
      const data = await apiRequest<any[]>(`/hangouts/${hangoutId}/messages`);
      setMessages(data);
    } catch (err) {
      console.log('[API] Error fetching messages:', err);
    }
  }, []);

  const refreshData = useCallback(async () => {
    setIsLoadingData(true);
    setBackendError(null);

    try {
      await Promise.all([fetchVenues(), fetchHangouts(), fetchJoinRequests(), fetchMyHangouts()]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not connect to backend.';
      setBackendError(message);
      console.log('[API] Error loading mobile backend data:', err);
      showAlert('Backend unavailable', `Could not load NatsVibe data from ${API_BASE}.`);
    } finally {
      setIsLoadingData(false);
      setIsInitialLoad(false);
    }
  }, [fetchHangouts, fetchJoinRequests, fetchVenues, fetchMyHangouts]);

  useEffect(() => {
    if (isLoggedIn) {
      refreshData();
    }
  }, [isLoggedIn, refreshData]);

  // Refresh active hangouts when entering chat tab
  useEffect(() => {
    if (activeTab === 'chat' && isLoggedIn) {
      fetchMyHangouts();
    }
  }, [activeTab, isLoggedIn, fetchMyHangouts]);

  // Poll messages when in chat tab and there is an active hangout selected
  useEffect(() => {
    if (activeTab !== 'chat' || !activeChatHangout || !isLoggedIn) {
      return;
    }

    fetchMessages(activeChatHangout.id);

    const interval = setInterval(() => {
      fetchMessages(activeChatHangout.id);
    }, 3000);

    return () => clearInterval(interval);
  }, [activeTab, activeChatHangout?.id, isLoggedIn, fetchMessages]);

  const handleLogin = async () => {
    if (!emailInput.trim() || !passwordInput) {
      showAlert('Error', 'Please enter both email and password.');
      return;
    }

    setIsLoadingData(true);
    try {
      const result = await apiRequest<{
        token: string;
        user: { id: number; name: string; email: string };
        profile: Profile;
      }>('/login', {
        method: 'POST',
        body: JSON.stringify({
          email: emailInput.trim().toLowerCase(),
          password: passwordInput
        })
      });

      authToken = result.token;
      setCurrentUserId(result.user.id);
      setCurrentUser(result.profile);
      setIsLoggedIn(true);

      if (rememberMe) {
        await AsyncStorage.setItem('@natsvibe:email', emailInput.trim().toLowerCase());
        await AsyncStorage.setItem('@natsvibe:token', result.token);
        await AsyncStorage.setItem('@natsvibe:remember', 'true');
      } else {
        await AsyncStorage.removeItem('@natsvibe:token');
        await AsyncStorage.removeItem('@natsvibe:email');
        await AsyncStorage.setItem('@natsvibe:remember', 'false');
      }
    } catch (err) {
      console.log('[Auth] Login error:', err);
      showAlert('Login Failed', err instanceof Error ? err.message : 'Could not authenticate.');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleRegister = async () => {
    if (!nameInput.trim() || !emailInput.trim() || !passwordInput) {
      showAlert('Error', 'Please fill in Name, Email, and Password.');
      return;
    }

    setIsLoadingData(true);
    try {
      const result = await apiRequest<{
        token: string;
        user: { id: number; name: string; email: string };
        profile: Profile;
      }>('/register', {
        method: 'POST',
        body: JSON.stringify({
          name: nameInput.trim(),
          email: emailInput.trim().toLowerCase(),
          phone: phoneInput.trim() || null,
          password: passwordInput
        })
      });

      authToken = result.token;
      setCurrentUserId(result.user.id);
      setCurrentUser(result.profile);
      setIsLoggedIn(true);

      if (rememberMe) {
        await AsyncStorage.setItem('@natsvibe:email', emailInput.trim().toLowerCase());
        await AsyncStorage.setItem('@natsvibe:token', result.token);
        await AsyncStorage.setItem('@natsvibe:remember', 'true');
      } else {
        await AsyncStorage.removeItem('@natsvibe:token');
        await AsyncStorage.removeItem('@natsvibe:email');
        await AsyncStorage.setItem('@natsvibe:remember', 'false');
      }
      showAlert('Success', 'Registered successfully!');
    } catch (err) {
      console.log('[Auth] Registration error:', err);
      showAlert('Registration Failed', err instanceof Error ? err.message : 'Could not register.');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('@natsvibe:token');
    } catch (e) {
      console.log('[Auth] Error removing token on logout:', e);
    }
    authToken = null;
    setCurrentUserId(5);
    setCurrentUser(emptyProfile);
    setIsLoggedIn(false);
    if (!rememberMe) {
      setEmailInput('');
    }
    setPasswordInput('');
    setNameInput('');
    setPhoneInput('');
    setRequests([]);
  };

  const handleCreateGroup = async (title: string, dateTime: string, venueIndex: number, description: string) => {
    if (!title || !dateTime || !venues[venueIndex]) {
      showAlert('Error', 'Please fill in all required fields.');
      return;
    }

    const selectedVenue = venues[venueIndex];
    // Renz user has host_id = 5 as seeded in DB
    const postData = {
      title: title,
      venue_id: selectedVenue.id,
      date_time: formatDateTimeForApi(dateTime),
      area: selectedVenue.area,
      description: description,
      group_size_limit: 6,
      budget_range: selectedVenue.price_range,
      host_id: currentUserId
    };

    try {
      await apiRequest<Hangout>('/hangouts', {
        method: 'POST',
        body: JSON.stringify(postData)
      });
      showAlert('Success', 'Hangout published successfully!');
      await fetchHangouts();
      setActiveTab('discover');
    } catch (err) {
      console.log('[API] Error creating hangout on mobile:', err);
      showAlert('Error', 'Could not save hangout to backend.');
    }
  };

  const handleSendRequest = async () => {
    if (!selectedHangout) return;
    const newRequest: JoinRequest = {
      id: Date.now(),
      hangout_id: selectedHangout.id,
      hangout_title: selectedHangout.title,
      user: currentUser,
      notes: joinNotes,
      status: 'pending'
    };

    try {
      await apiRequest<JoinRequest>('/join-requests', {
        method: 'POST',
        body: JSON.stringify({
          hangout_id: selectedHangout.id,
          user_id: currentUserId,
          notes: joinNotes
        })
      });
      showAlert('Request Sent', 'Host will review your profile shortly!');
    } catch (err) {
      console.log('[API] Could not save join request to backend:', err);
      showAlert('Error', err instanceof Error ? err.message : 'Could not send join request.');
    } finally {
      setShowRequestModal(false);
      setSelectedHangout(null);
      setJoinNotes('');
    }
  };

  const handleApprovalAction = async (id: number, status: 'approved' | 'declined') => {
    try {
      await apiRequest<JoinRequest>(`/join-requests/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
    } catch (err) {
      console.log('[API] Could not update join request on backend:', err);
    }

    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    const request = requests.find(r => r.id === id);
    if (status === 'approved' && request) {
      setHangouts(prev => prev.map(h => h.id === request.hangout_id ? {
        ...h,
        members_count: h.members_count + 1,
        members: [...h.members, request.user.name]
      } : h));
    }
  };

  const handleSendChat = async () => {
    if (!typedMessage.trim() || !activeChatHangout) return;
    const textToSend = typedMessage.trim();
    setTypedMessage('');

    try {
      const result = await apiRequest<any>(`/hangouts/${activeChatHangout.id}/messages`, {
        method: 'POST',
        body: JSON.stringify({
          message_text: textToSend
        })
      });
      setMessages(prev => [...prev, result]);
    } catch (err) {
      console.log('[API] Error sending message:', err);
      showAlert('Error', 'Could not send message.');
    }
  };

  return {
    isLoggedIn,
    setIsLoggedIn,
    activeTab,
    setActiveTab,
    selectedHangout,
    setSelectedHangout,
    showRequestModal,
    setShowRequestModal,
    joinNotes,
    setJoinNotes,
    showApprovalsPanel,
    setShowApprovalsPanel,
    nameInput,
    setNameInput,
    emailInput,
    setEmailInput,
    phoneInput,
    setPhoneInput,
    passwordInput,
    setPasswordInput,
    rememberMe,
    setRememberMe,
    currentUser,
    venues,
    hangouts,
    isLoadingData,
    backendError,
    requests,
    messages,
    typedMessage,
    setTypedMessage,
    trustedContact,
    setTrustedContact,
    checkInActive,
    setCheckInActive,
    handleLogin,
    handleRegister,
    handleLogout,
    customAlert,
    showAlert,
    hideAlert,
    refreshData,
    handleCreateGroup,
    handleSendRequest,
    handleApprovalAction,
    handleSendChat,
    myHangoutsList,
    activeChatHangout,
    setActiveChatHangout,
    fetchMyHangouts
  };
}
