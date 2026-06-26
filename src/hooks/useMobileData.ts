import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import type { Hangout, JoinRequest, Message, MyHangout, Profile, Venue } from '../types';

const API_BASE = (process.env.EXPO_PUBLIC_API_BASE ?? 'http://127.0.0.1:8000/api/v1').replace(/\/$/, '');
let authToken: string | null = null;

type Page<T> = { data: T[]; next_cursor?: string | null };
type Envelope<T> = { data: T; error?: { message?: string; fields?: Record<string, string[]> } };

async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...options.headers,
    },
  });
  const payload = (await response.json().catch(() => ({}))) as Envelope<T>;
  if (!response.ok) {
    const fieldError = payload.error?.fields ? Object.values(payload.error.fields).flat()[0] : null;
    throw new Error(fieldError ?? payload.error?.message ?? `Backend request failed (${response.status})`);
  }
  return payload.data;
}

const emptyProfile: Profile = {
  name: 'Unknown', age: 0, city: '', bio: '', avatar_url: '', is_verified: false, vibe_tags: [],
};

function profileFromUser(user: any): Profile {
  const profile = user?.profile ?? user ?? {};
  const birth = user?.date_of_birth ? new Date(user.date_of_birth) : null;
  const age = birth ? Math.max(0, new Date().getFullYear() - birth.getFullYear()) : profile.age ?? 0;
  return {
    name: profile.display_name ?? profile.name ?? user?.name ?? 'Unknown',
    age,
    city: profile.city ?? '',
    bio: profile.bio ?? '',
    avatar_url: profile.avatar_url ? (profile.avatar_url.startsWith('http') ? profile.avatar_url : `${API_BASE.replace('/api/v1', '')}/storage/${profile.avatar_url}`) : '',
    is_verified: profile.verification_status === 'approved',
    vibe_tags: (profile.vibe_tags ?? []).map((tag: any) => typeof tag === 'string' ? tag : tag.name),
  };
}

function venueFromApi(venue: any): Venue {
  return {
    id: venue.id, name: venue.name, area: venue.area, address: venue.address,
    venue_type: venue.venue_type,
    price_range: venue.price_range ?? (venue.budget_min ? `PHP ${venue.budget_min}–${venue.budget_max ?? venue.budget_min}` : '$$'),
    reservation_required: Boolean(venue.reservation_required),
    photos: venue.photos ?? [],
  };
}

function hangoutFromApi(item: any): Hangout {
  const members = item.active_members ?? item.members ?? [];
  return {
    ...item,
    host_id: item.host_id,
    host: profileFromUser(item.host),
    venue: venueFromApi(item.venue),
    members_count: item.members_count ?? members.length,
    budget_range: item.budget_range ?? (item.budget_min ? `PHP ${item.budget_min}–${item.budget_max ?? item.budget_min}` : '$$'),
    vibe_tags: (item.vibe_tags ?? []).map((tag: any) => typeof tag === 'string' ? tag : tag.name),
    members: members.map((member: any) => member.name ?? member.display_name ?? 'Member'),
  };
}

export default function useMobileData() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'discover' | 'create' | 'chat' | 'safety' | 'profile'>('discover');
  const [customAlert, setCustomAlert] = useState<{ title: string; message: string } | null>(null);
  const [selectedHangout, setSelectedHangout] = useState<Hangout | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [joinNotes, setJoinNotes] = useState('');
  const [showApprovalsPanel, setShowApprovalsPanel] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [birthDateInput, setBirthDateInput] = useState('2000-01-01');
  const [rememberMe, setRememberMe] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(0);
  const [currentUserRole, setCurrentUserRole] = useState('user');
  const [currentUser, setCurrentUser] = useState<Profile>(emptyProfile);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [hangouts, setHangouts] = useState<Hangout[]>([]);
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [myHangoutsList, setMyHangoutsList] = useState<MyHangout[]>([]);
  const [activeChatHangout, setActiveChatHangout] = useState<MyHangout | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typedMessage, setTypedMessage] = useState('');
  const [trustedContact, setTrustedContactState] = useState({ name: '', phone: '' });
  const [trustedContactId, setTrustedContactId] = useState<number | null>(null);
  const [checkInActive, setCheckInActiveState] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);

  const showAlert = useCallback((title: string, message: string) => setCustomAlert({ title, message }), []);
  const hideAlert = useCallback(() => setCustomAlert(null), []);

  const acceptSession = useCallback(async (result: any, persist: boolean) => {
    authToken = result.token;
    setCurrentUserId(result.user.id); setCurrentUserRole(result.user.role);
    setCurrentUser(profileFromUser(result.user)); setIsLoggedIn(true);
    if (persist) {
      await AsyncStorage.multiSet([['@natsvibe:token', result.token], ['@natsvibe:email', result.user.email], ['@natsvibe:remember', 'true']]);
    }
  }, []);

  const fetchVenues = useCallback(async () => {
    const page = await api<Page<any>>('/venues'); setVenues(page.data.map(venueFromApi));
  }, []);
  const fetchHangouts = useCallback(async () => {
    const page = await api<Page<any>>('/hangouts'); setHangouts(page.data.map(hangoutFromApi));
  }, []);
  const fetchMyHangouts = useCallback(async () => {
    const page = await api<Page<any>>('/me/hangouts');
    const list = page.data.map(hangoutFromApi);
    const choices: MyHangout[] = list.map(item => ({
      id: item.id, title: item.title, venue_name: item.venue.name,
      members_names: item.members, time_summary: new Date(item.date_time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    }));
    setMyHangoutsList(choices);
    setActiveChatHangout(previous => choices.find(item => item.id === previous?.id) ?? choices[0] ?? null);

    const hosted = page.data.filter((item: any) => item.host_id === currentUserId);
    const groups = await Promise.all(hosted.map((item: any) => api<Page<any>>(`/hangouts/${item.id}/join-requests`).catch(() => ({ data: [] }))));
    setRequests(groups.flatMap(group => group.data.map((request: any) => ({
      id: request.id, hangout_id: request.hangout_id, hangout_title: request.hangout?.title ?? '',
      user: profileFromUser(request.user), notes: request.notes ?? '', status: request.status,
    }))));
  }, [currentUserId]);
  const fetchMessages = useCallback(async (hangoutId: number) => {
    const page = await api<Page<any>>(`/hangouts/${hangoutId}/messages`);
    setMessages(page.data.slice().reverse().map(message => ({
      id: message.id, sender: message.sender?.name ?? 'Member', text: message.message_text,
      time: new Date(message.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      isMe: message.sender_id === currentUserId,
    })));
  }, [currentUserId]);

  const refreshData = useCallback(async () => {
    setIsLoadingData(true); setBackendError(null);
    try { await Promise.all([fetchVenues(), fetchHangouts(), fetchMyHangouts()]); }
    catch (reason) { const message = reason instanceof Error ? reason.message : 'Could not connect to backend.'; setBackendError(message); }
    finally { setIsLoadingData(false); }
  }, [fetchHangouts, fetchMyHangouts, fetchVenues]);

  useEffect(() => {
    void (async () => {
      const values = await AsyncStorage.multiGet(['@natsvibe:token', '@natsvibe:email', '@natsvibe:remember']);
      const saved = Object.fromEntries(values);
      if (saved['@natsvibe:email']) setEmailInput(saved['@natsvibe:email']);
      setRememberMe(saved['@natsvibe:remember'] === 'true');
      if (!saved['@natsvibe:token']) return;
      authToken = saved['@natsvibe:token'];
      try {
        const user = await api<any>('/me');
        setCurrentUserId(user.id); setCurrentUserRole(user.role); setCurrentUser(profileFromUser(user)); setIsLoggedIn(true);
      } catch { authToken = null; await AsyncStorage.removeItem('@natsvibe:token'); }
    })();
  }, []);
  useEffect(() => { if (isLoggedIn) void refreshData(); }, [isLoggedIn, refreshData]);
  useEffect(() => {
    if (activeTab !== 'chat' || !activeChatHangout) return;
    void fetchMessages(activeChatHangout.id);
    const timer = setInterval(() => void fetchMessages(activeChatHangout.id), 5000);
    return () => clearInterval(timer);
  }, [activeChatHangout, activeTab, fetchMessages]);

  const handleLogin = async () => {
    try {
      const result = await api<any>('/auth/login', { method: 'POST', body: JSON.stringify({ email: emailInput.trim().toLowerCase(), password: passwordInput, device_name: 'mobile' }) });
      await acceptSession(result, rememberMe);
    } catch (reason) { showAlert('Login failed', reason instanceof Error ? reason.message : 'Could not authenticate.'); }
  };
  const handleRegister = async () => {
    try {
      const result = await api<any>('/auth/register', { method: 'POST', body: JSON.stringify({
        name: nameInput.trim(), email: emailInput.trim().toLowerCase(), phone: phoneInput.trim(), date_of_birth: birthDateInput,
        password: passwordInput, password_confirmation: passwordInput, device_name: 'mobile',
      }) });
      await acceptSession(result, rememberMe);
      showAlert('Account created', 'Complete your profile and verification before joining hangouts.');
    } catch (reason) { showAlert('Registration failed', reason instanceof Error ? reason.message : 'Could not register.'); }
  };
  const handleLogout = async () => {
    await api('/auth/logout', { method: 'POST' }).catch(() => undefined);
    authToken = null; await AsyncStorage.removeItem('@natsvibe:token');
    setIsLoggedIn(false); setCurrentUserId(0); setCurrentUser(emptyProfile); setRequests([]);
  };
  const handleCreateGroup = async (title: string, dateTime: string, venueIndex: number, description: string) => {
    const venue = venues[venueIndex]; if (!venue) return;
    try {
      await api('/hangouts', { method: 'POST', body: JSON.stringify({
        title, venue_id: venue.id, scheduled_at: new Date(dateTime).toISOString(), description,
        group_size_limit: 6, budget_min: 500, budget_max: 1500, currency: 'PHP', timezone: 'Asia/Manila',
      }) });
      await refreshData(); setActiveTab('discover'); showAlert('Published', 'Your hangout is now open.');
    } catch (reason) { showAlert('Could not publish', reason instanceof Error ? reason.message : 'Please check the form.'); }
  };
  const handleSendRequest = async () => {
    if (!selectedHangout) return;
    try {
      await api(`/hangouts/${selectedHangout.id}/join-requests`, { method: 'POST', body: JSON.stringify({ message: joinNotes }) });
      showAlert('Request sent', 'The host will review your profile.');
    } catch (reason) { showAlert('Could not request', reason instanceof Error ? reason.message : 'Try again.'); }
    finally { setShowRequestModal(false); setSelectedHangout(null); setJoinNotes(''); }
  };
  const handleApprovalAction = async (id: number, status: 'approved' | 'declined') => {
    try { await api(`/join-requests/${id}/${status === 'approved' ? 'approve' : 'decline'}`, { method: 'POST' }); await refreshData(); }
    catch (reason) { showAlert('Could not update request', reason instanceof Error ? reason.message : 'Try again.'); }
  };
  const handleSendChat = async () => {
    if (!typedMessage.trim() || !activeChatHangout) return;
    const body = typedMessage.trim(); setTypedMessage('');
    try { await api(`/hangouts/${activeChatHangout.id}/messages`, { method: 'POST', body: JSON.stringify({ body }) }); await fetchMessages(activeChatHangout.id); }
    catch (reason) { showAlert('Message failed', reason instanceof Error ? reason.message : 'Try again.'); }
  };
  const setTrustedContact = async (contact: { name: string; phone: string }) => {
    setTrustedContactState(contact);
    if (!contact.name || !contact.phone) return;
    try {
      const saved = await api<any>(trustedContactId ? `/trusted-contacts/${trustedContactId}` : '/trusted-contacts', {
        method: trustedContactId ? 'PUT' : 'POST', body: JSON.stringify({ name: contact.name, phone_number: contact.phone }),
      });
      setTrustedContactId(saved.id);
    } catch { /* Keep draft locally until both fields are valid. */ }
  };
  const setCheckInActive = async (active: boolean) => {
    if (!activeChatHangout) { showAlert('Choose a group', 'Open one of your approved groups in Chat first.'); return; }
    try {
      if (active) await api(`/hangouts/${activeChatHangout.id}/safety-checkins`, { method: 'POST', body: JSON.stringify({ scheduled_for: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() }) });
      setCheckInActiveState(active);
    } catch (reason) { showAlert('Safety timer failed', reason instanceof Error ? reason.message : 'Try again.'); }
  };

  return {
    isLoggedIn, setIsLoggedIn, activeTab, setActiveTab, selectedHangout, setSelectedHangout,
    showRequestModal, setShowRequestModal, joinNotes, setJoinNotes, showApprovalsPanel, setShowApprovalsPanel,
    nameInput, setNameInput, emailInput, setEmailInput, phoneInput, setPhoneInput, passwordInput, setPasswordInput,
    birthDateInput, setBirthDateInput, rememberMe, setRememberMe, currentUser, currentUserRole,
    venues, hangouts, requests, messages, typedMessage, setTypedMessage, trustedContact, setTrustedContact,
    checkInActive, setCheckInActive, isLoadingData, backendError, handleLogin, handleRegister, handleLogout,
    customAlert, showAlert, hideAlert, refreshData, handleCreateGroup, handleSendRequest, handleApprovalAction,
    handleSendChat, myHangoutsList, activeChatHangout, setActiveChatHangout, fetchMyHangouts,
  };
}
