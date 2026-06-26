import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import type { Profile, Venue, Hangout, JoinRequest } from '../types';

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
    price_range: venue.price_range
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

export default function useMobileData() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'discover' | 'create' | 'chat' | 'safety' | 'profile'>('discover');
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);
  
  // Modal states
  const [selectedHangout, setSelectedHangout] = useState<Hangout | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [joinNotes, setJoinNotes] = useState('');
  const [showApprovalsPanel, setShowApprovalsPanel] = useState(false);

  // Authentication Fields
  const [emailInput, setEmailInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');

  const [currentUserId, setCurrentUserId] = useState<number>(5);

  // Current User
  const [currentUser, setCurrentUser] = useState<Profile>(emptyProfile);

  // Venues and Hangouts list
  const [venues, setVenues] = useState<Venue[]>([]);
  const [hangouts, setHangouts] = useState<Hangout[]>([]);

  // Host Join Requests List (kept local for MVP UI simulation)
  const [requests, setRequests] = useState<JoinRequest[]>([
    {
      id: 1,
      hangout_id: 1,
      hangout_title: 'Poblacion chill table',
      user: {
        name: 'Elena Ramos',
        age: 24,
        city: 'Mandaluyong',
        bio: 'Love cocktail tasting and electronic music events around Makati!',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        is_verified: true,
        vibe_tags: ['Gin', 'Electronic']
      },
      notes: 'Hi Renz! Count me in. I love craft vibes.',
      status: 'pending'
    }
  ]);

  // Chat Messages State
  const [messages, setMessages] = useState([
    { id: 1, sender: 'Sofia V.', text: 'Hey guys! Table is ready near the stage.', time: '8:45 PM', isMe: false },
    { id: 2, sender: 'Alex R.', text: 'Awesome. Parking now, see ya in 5 mins!', time: '8:50 PM', isMe: false },
    { id: 3, sender: 'Renz', text: 'On my way! Ordering the standard highball.', time: '8:52 PM', isMe: true }
  ]);
  const [typedMessage, setTypedMessage] = useState('');

  // Safety Status
  const [trustedContact, setTrustedContact] = useState({ name: 'Miguel (Brother)', phone: '+639171234567' });
  const [checkInActive, setCheckInActive] = useState(false);

  // Fetch initial database info
  const fetchVenues = useCallback(async () => {
    const data = await apiRequest<Venue[]>('/venues');
    setVenues(data.map(normalizeVenue));
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

  const refreshData = useCallback(async () => {
    setIsLoadingData(true);
    setBackendError(null);

    try {
      await Promise.all([fetchVenues(), fetchHangouts(), fetchJoinRequests()]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not connect to backend.';
      setBackendError(message);
      console.error('Error loading mobile backend data:', err);
      Alert.alert('Backend unavailable', `Could not load NatsVibe data from ${API_BASE}.`);
    } finally {
      setIsLoadingData(false);
    }
  }, [fetchHangouts, fetchJoinRequests, fetchVenues]);

  useEffect(() => {
    if (isLoggedIn) {
      refreshData();
    }
  }, [isLoggedIn, refreshData]);

  const handleLogin = async () => {
    if (!emailInput.trim()) {
      Alert.alert('Error', 'Please enter your email.');
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
          email: emailInput,
          phone: phoneInput
        })
      });

      authToken = result.token;
      setCurrentUserId(result.user.id);
      setCurrentUser(result.profile);
      setIsLoggedIn(true);
    } catch (err) {
      console.error('Login error:', err);
      Alert.alert('Login Failed', err instanceof Error ? err.message : 'Could not authenticate.');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleLogout = () => {
    authToken = null;
    setCurrentUserId(5);
    setCurrentUser(emptyProfile);
    setIsLoggedIn(false);
    setEmailInput('');
    setPhoneInput('');
  };

  const handleCreateGroup = async (title: string, dateTime: string, venueIndex: number, description: string) => {
    if (!title || !dateTime || !venues[venueIndex]) {
      Alert.alert('Error', 'Please fill in all required fields.');
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
      Alert.alert('Success', 'Hangout published successfully!');
      await fetchHangouts();
      setActiveTab('discover');
    } catch (err) {
      console.error('Error creating hangout on mobile:', err);
      Alert.alert('Error', 'Could not save hangout to backend.');
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
      const savedRequest = await apiRequest<JoinRequest>('/join-requests', {
        method: 'POST',
        body: JSON.stringify({
          hangout_id: selectedHangout.id,
          user_id: currentUserId,
          notes: joinNotes
        })
      });
      setRequests(prev => [...prev, savedRequest]);
      Alert.alert('Request Sent', 'Host will review your profile shortly!');
    } catch (err) {
      console.warn('Could not save join request to backend; keeping local pending request:', err);
      setRequests(prev => [...prev, newRequest]);
      Alert.alert('Request Saved Locally', 'Backend join-request endpoint is not available yet.');
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
      console.warn('Could not update join request on backend; applying local state only:', err);
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

  const handleSendChat = () => {
    if (!typedMessage.trim()) return;
    const msg = {
      id: messages.length + 1,
      sender: currentUser.name,
      text: typedMessage,
      time: 'Just Now',
      isMe: true
    };
    setMessages(prev => [...prev, msg]);
    setTypedMessage('');
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
    emailInput,
    setEmailInput,
    phoneInput,
    setPhoneInput,
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
    handleLogout,
    refreshData,
    handleCreateGroup,
    handleSendRequest,
    handleApprovalAction,
    handleSendChat
  };
}
