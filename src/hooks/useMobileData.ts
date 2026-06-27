import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { File } from 'expo-file-system';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { Platform } from 'react-native';
import type { AppNotification, Hangout, JoinRequest, Message, MyHangout, MyJoinRequest, NotificationPreference, Profile, Venue, VibeTagOption } from '../types';

const API_BASE = (process.env.EXPO_PUBLIC_API_BASE ?? 'http://127.0.0.1:8000/api/v1').replace(/\/$/, '');
let authToken: string | null = null;

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: true }),
});

type Page<T> = { data: T[]; next_cursor?: string | null };
type Envelope<T> = { data: T; error?: { message?: string; fields?: Record<string, string[]> } };

async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(typeof options.body === 'string' ? { 'Content-Type': 'application/json' } : {}),
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

async function registerPushToken(): Promise<void> {
  if (!Device.isDevice || !authToken) return;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', { name: 'NatsVibe', importance: Notifications.AndroidImportance.HIGH, vibrationPattern: [0, 250, 250, 250], lightColor: '#8B5CF6' });
  }
  const existing = await Notifications.getPermissionsAsync();
  const permission = existing.status === 'granted' ? existing : await Notifications.requestPermissionsAsync();
  if (permission.status !== 'granted') return;
  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) return;
  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  await api('/device-tokens', { method: 'POST', body: JSON.stringify({ token, platform: Platform.OS, device_name: Device.deviceName ?? 'mobile' }) });
}

const emptyProfile: Profile = {
  name: 'Unknown', age: 0, city: '', bio: '', avatar_url: '', is_verified: false, vibe_tags: [],
  verification_status: 'pending', completion_status: 'incomplete', account_status: 'pending_verification',
  photo_review_status: 'pending', host_verification_status: 'not_requested',
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
    is_verified: profile.verification_status === 'approved' && profile.photo_review_status === 'approved' && user?.status === 'active',
    vibe_tags: (profile.vibe_tags ?? []).map((tag: any) => typeof tag === 'string' ? tag : tag.name),
    verification_status: profile.verification_status ?? 'pending',
    completion_status: profile.completion_status ?? 'incomplete',
    account_status: user?.status ?? 'pending_verification',
    photo_review_status: profile.photo_review_status ?? 'pending',
    host_verification_status: profile.host_verification_status ?? 'not_requested',
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
  const [vibeTags, setVibeTags] = useState<VibeTagOption[]>([]);
  const [myJoinRequests, setMyJoinRequests] = useState<MyJoinRequest[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreference>({ push_enabled: true, email_enabled: true, join_updates: true, hangout_updates: true, safety_updates: true });
  const [showReportModal, setShowReportModal] = useState(false);
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
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const showAlert = useCallback((title: string, message: string) => setCustomAlert({ title, message }), []);
  const hideAlert = useCallback(() => setCustomAlert(null), []);

  const acceptSession = useCallback(async (result: any, persist: boolean) => {
    authToken = result.token;
    setCurrentUserId(result.user.id); setCurrentUserRole(result.user.role);
    setCurrentUser(profileFromUser(result.user)); setIsLoggedIn(true);
    void registerPushToken().catch(() => undefined);
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
  const fetchVibeTags = useCallback(async () => {
    const page = await api<Page<VibeTagOption> | VibeTagOption[]>('/vibe-tags');
    setVibeTags(Array.isArray(page) ? page : page.data);
  }, []);
  const fetchMyJoinRequests = useCallback(async () => {
    const page = await api<Page<MyJoinRequest>>('/me/join-requests');
    setMyJoinRequests(page.data);
  }, []);
  const fetchNotifications = useCallback(async () => {
    const page = await api<Page<AppNotification>>('/notifications');
    setNotifications(page.data);
  }, []);
  const fetchNotificationPreferences = useCallback(async () => {
    setNotificationPreferences(await api<NotificationPreference>('/notification-preferences'));
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
    try {
      await Promise.all([fetchVenues(), fetchHangouts(), fetchVibeTags(), fetchMyJoinRequests(), fetchNotifications(), fetchNotificationPreferences()]);
      // Pending accounts can browse, while member-specific data remains active-only.
      await fetchMyHangouts().catch(() => undefined);
    }
    catch (reason) { const message = reason instanceof Error ? reason.message : 'Could not connect to backend.'; setBackendError(message); }
    finally { setIsLoadingData(false); }
  }, [fetchHangouts, fetchMyHangouts, fetchMyJoinRequests, fetchNotificationPreferences, fetchNotifications, fetchVenues, fetchVibeTags]);

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
        void registerPushToken().catch(() => undefined);
      } catch { authToken = null; await AsyncStorage.removeItem('@natsvibe:token'); }
    })();
  }, []);
  useEffect(() => { if (isLoggedIn) void refreshData(); }, [isLoggedIn, refreshData]);
  useEffect(() => {
    if (!isLoggedIn) return;
    const timer = setInterval(() => void fetchNotifications().catch(() => undefined), 5000);
    return () => clearInterval(timer);
  }, [fetchNotifications, isLoggedIn]);
  useEffect(() => {
    if (!isLoggedIn) return;
    const open = (notification: Notifications.Notification) => {
      const hangoutId = notification.request.content.data?.hangout_id;
      if (typeof hangoutId === 'number') {
        setActiveTab('chat');
        setActiveChatHangout(items => items?.id === hangoutId ? items : myHangoutsList.find(item => item.id === hangoutId) ?? items);
      } else {
        setShowNotifications(true);
      }
    };
    const previous = Notifications.getLastNotificationResponse();
    if (previous?.notification) open(previous.notification);
    const subscription = Notifications.addNotificationResponseReceivedListener(response => open(response.notification));
    return () => subscription.remove();
  }, [isLoggedIn, myHangoutsList]);
  useEffect(() => {
    if (!isLoggedIn) return;
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') {
        void fetchNotifications().catch(() => undefined);
        void registerPushToken().catch(() => undefined);
      }
    });
    return () => subscription.remove();
  }, [fetchNotifications, isLoggedIn]);
  useEffect(() => {
    if (!isLoggedIn) return;
    const subscription = Notifications.addNotificationReceivedListener(() => void fetchNotifications().catch(() => undefined));
    return () => subscription.remove();
  }, [fetchNotifications, isLoggedIn]);
  useEffect(() => {
    if (activeTab !== 'chat' || !activeChatHangout) return;
    void fetchMessages(activeChatHangout.id);
    const timer = setInterval(() => void fetchMessages(activeChatHangout.id), 5000);
    return () => clearInterval(timer);
  }, [activeChatHangout, activeTab, fetchMessages]);

  const handleLogin = async () => {
    setPendingAction('login');
    try {
      const result = await api<any>('/auth/login', { method: 'POST', body: JSON.stringify({ email: emailInput.trim().toLowerCase(), password: passwordInput, device_name: 'mobile' }) });
      await acceptSession(result, rememberMe);
    } catch (reason) { showAlert('Login failed', reason instanceof Error ? reason.message : 'Could not authenticate.'); }
    finally { setPendingAction(null); }
  };
  const handleRegister = async (confirmPassword: string) => {
    if (passwordInput !== confirmPassword) {
      showAlert('Passwords do not match', 'Please enter the same password in both fields.');
      return;
    }
    setPendingAction('register');
    try {
      const result = await api<any>('/auth/register', { method: 'POST', body: JSON.stringify({
        name: nameInput.trim(), email: emailInput.trim().toLowerCase(), phone: phoneInput.trim(), date_of_birth: birthDateInput,
        password: passwordInput, password_confirmation: confirmPassword, device_name: 'mobile',
      }) });
      await acceptSession(result, rememberMe);
      showAlert('Account created', 'Complete your profile and verification before joining hangouts.');
    } catch (reason) { showAlert('Registration failed', reason instanceof Error ? reason.message : 'Could not register.'); }
    finally { setPendingAction(null); }
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
    setPendingAction('join-request');
    try {
      await api(`/hangouts/${selectedHangout.id}/join-requests`, { method: 'POST', body: JSON.stringify({ message: joinNotes }) });
      await fetchMyJoinRequests();
      showAlert('Request sent', 'The host will review your profile.');
    } catch (reason) { showAlert('Could not request', reason instanceof Error ? reason.message : 'Try again.'); }
    finally { setPendingAction(null); setShowRequestModal(false); setSelectedHangout(null); setJoinNotes(''); }
  };
  const refreshAccount = async () => {
    setPendingAction('refresh-account');
    try {
      const user = await api<any>('/me');
      setCurrentUserId(user.id); setCurrentUserRole(user.role); setCurrentUser(profileFromUser(user));
      showAlert('Status refreshed', user.status === 'active' ? 'Your account is verified and active.' : 'Your verification is still pending.');
    } catch (reason) { showAlert('Could not refresh', reason instanceof Error ? reason.message : 'Try again.'); }
    finally { setPendingAction(null); }
  };
  const updateProfile = async (input: { display_name: string; city: string; bio: string; vibe_tag_ids: number[] }) => {
    setPendingAction('profile');
    try {
      await api('/me/profile', { method: 'PUT', body: JSON.stringify(input) });
      const user = await api<any>('/me');
      setCurrentUser(profileFromUser(user));
      showAlert('Profile saved', 'Your profile details have been updated.');
    } catch (reason) { showAlert('Could not save profile', reason instanceof Error ? reason.message : 'Check your details and try again.'); }
    finally { setPendingAction(null); }
  };
  const uploadProfilePhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) { showAlert('Photo access needed', 'Allow photo access to choose a profile picture.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: .8 });
    if (result.canceled) return;
    const asset = result.assets[0];
    const form = new FormData();
    const photo = new File(asset.uri);
    form.append('photo', photo, asset.fileName ?? photo.name ?? 'profile.jpg');
    setPendingAction('photo');
    try {
      await api('/me/profile/photo', { method: 'POST', body: form });
      const user = await api<any>('/me'); setCurrentUser(profileFromUser(user));
      showAlert('Photo uploaded', 'Your new photo is queued for review.');
    } catch (reason) { showAlert('Photo upload failed', reason instanceof Error ? reason.message : 'Try another photo.'); }
    finally { setPendingAction(null); }
  };
  const requestHostVerification = async () => {
    setPendingAction('host-verification');
    try {
      await api('/me/host-verification', { method: 'POST' });
      const user = await api<any>('/me'); setCurrentUser(profileFromUser(user));
      showAlert('Host request sent', 'An admin will review your host access request.');
    } catch (reason) { showAlert('Host request unavailable', reason instanceof Error ? reason.message : 'Try again.'); }
    finally { setPendingAction(null); }
  };
  const markNotificationRead = async (id: string) => {
    await api(`/notifications/${id}/read`, { method: 'POST' });
    setNotifications(items => items.map(item => item.id === id ? { ...item, read_at: new Date().toISOString() } : item));
  };
  const markAllNotificationsRead = async () => {
    await api('/notifications/read-all', { method: 'POST' });
    setNotifications(items => items.map(item => ({ ...item, read_at: item.read_at ?? new Date().toISOString() })));
  };
  const openNotifications = async () => {
    setShowNotifications(true);
    await fetchNotifications().catch(reason => showAlert('Could not refresh notifications', reason instanceof Error ? reason.message : 'Try again.'));
  };
  const updateNotificationPreference = async (field: keyof NotificationPreference, value: boolean) => {
    const previous = notificationPreferences;
    setNotificationPreferences(current => ({ ...current, [field]: value }));
    try {
      setNotificationPreferences(await api<NotificationPreference>('/notification-preferences', { method: 'PUT', body: JSON.stringify({ [field]: value }) }));
    } catch (reason) {
      setNotificationPreferences(previous);
      showAlert('Could not update preference', reason instanceof Error ? reason.message : 'Try again.');
    }
  };
  const reportHangout = async (input: { reason: string; details: string; evidence?: { uri: string; name: string } }) => {
    if (!selectedHangout) return;
    const form = new FormData();
    form.append('reported_hangout_id', String(selectedHangout.id));
    form.append('reason', input.reason);
    form.append('details', input.details);
    if (input.evidence) form.append('evidence[]', new File(input.evidence.uri), input.evidence.name);
    setPendingAction('report');
    try {
      await api('/reports', { method: 'POST', body: form });
      setShowReportModal(false); setSelectedHangout(null);
      showAlert('Report submitted', 'Our safety team will review it privately.');
    } catch (reason) { showAlert('Report failed', reason instanceof Error ? reason.message : 'Try again.'); }
    finally { setPendingAction(null); }
  };
  const requestAccountDeletion = async () => {
    setPendingAction('delete-account');
    try {
      await api('/me', { method: 'DELETE' });
      authToken = null; await AsyncStorage.removeItem('@natsvibe:token'); setIsLoggedIn(false);
    } catch (reason) { showAlert('Could not schedule deletion', reason instanceof Error ? reason.message : 'Try again.'); }
    finally { setPendingAction(null); }
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
    venues, hangouts, vibeTags, myJoinRequests, notifications, notificationPreferences, showNotifications, setShowNotifications, showReportModal, setShowReportModal, requests, messages, typedMessage, setTypedMessage, trustedContact, setTrustedContact,
    checkInActive, setCheckInActive, isLoadingData, backendError, handleLogin, handleRegister, handleLogout,
    customAlert, showAlert, hideAlert, refreshData, handleCreateGroup, handleSendRequest, handleApprovalAction,
    handleSendChat, myHangoutsList, activeChatHangout, setActiveChatHangout, fetchMyHangouts,
    pendingAction, refreshAccount, updateProfile, uploadProfilePhoto, requestHostVerification,
    markNotificationRead, markAllNotificationsRead, openNotifications, updateNotificationPreference, reportHangout, requestAccountDeletion,
  };
}
