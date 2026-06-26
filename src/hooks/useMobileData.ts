import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import type { Profile, Venue, Hangout, JoinRequest } from '../types';

// Crucial: Connect to the machine's local IP address (not 127.0.0.1) so Expo physical phone works.
const API_BASE = 'http://192.168.1.21:8080/api';

export default function useMobileData() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'discover' | 'create' | 'chat' | 'safety' | 'profile'>('discover');
  
  // Modal states
  const [selectedHangout, setSelectedHangout] = useState<Hangout | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [joinNotes, setJoinNotes] = useState('');
  const [showApprovalsPanel, setShowApprovalsPanel] = useState(false);

  // Authentication Fields
  const [emailInput, setEmailInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');

  // Current User
  const [currentUser] = useState<Profile>({
    name: 'Renz',
    age: 24,
    city: 'Makati',
    bio: 'Electronic music and craft cocktail enthusiast.',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    is_verified: true,
    vibe_tags: ['Techno', 'Speakeasy', 'Craft Beer']
  });

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
  useEffect(() => {
    if (isLoggedIn) {
      fetchVenues();
      fetchHangouts();
    }
  }, [isLoggedIn]);

  const fetchVenues = () => {
    fetch(`${API_BASE}/venues`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch venues');
        return res.json();
      })
      .then((data: Venue[]) => {
        setVenues(data);
      })
      .catch(err => {
        console.error('Error fetching venues on mobile:', err);
      });
  };

  const fetchHangouts = () => {
    fetch(`${API_BASE}/hangouts`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch hangouts');
        return res.json();
      })
      .then((data: Hangout[]) => {
        setHangouts(data);
      })
      .catch(err => {
        console.error('Error fetching hangouts on mobile:', err);
      });
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleCreateGroup = (title: string, dateTime: string, venueIndex: number, description: string) => {
    if (!title || !dateTime || !venues[venueIndex]) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    const selectedVenue = venues[venueIndex];
    // Renz user has host_id = 5 as seeded in DB
    const postData = {
      title: title,
      venue_id: selectedVenue.id,
      date_time: new Date().toISOString().split('T')[0] + ' 21:00:00', // standard database format
      area: selectedVenue.area,
      description: description,
      group_size_limit: 6,
      budget_range: selectedVenue.price_range,
      host_id: 5
    };

    fetch(`${API_BASE}/hangouts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData)
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to create hangout');
        return res.json();
      })
      .then(() => {
        Alert.alert('Success', 'Hangout published successfully!');
        fetchHangouts(); // reload hangouts list
        setActiveTab('discover');
      })
      .catch(err => {
        console.error('Error creating hangout on mobile:', err);
        Alert.alert('Error', 'Could not save hangout to backend.');
      });
  };

  const handleSendRequest = () => {
    if (!selectedHangout) return;
    const newRequest: JoinRequest = {
      id: Date.now(),
      hangout_id: selectedHangout.id,
      hangout_title: selectedHangout.title,
      user: currentUser,
      notes: joinNotes,
      status: 'pending'
    };
    setRequests(prev => [...prev, newRequest]);
    setShowRequestModal(false);
    setSelectedHangout(null);
    setJoinNotes('');
    Alert.alert('Request Sent', 'Host will review your profile shortly!');
  };

  const handleApprovalAction = (id: number, status: 'approved' | 'declined') => {
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
    requests,
    messages,
    typedMessage,
    setTypedMessage,
    trustedContact,
    setTrustedContact,
    checkInActive,
    setCheckInActive,
    handleLogin,
    handleCreateGroup,
    handleSendRequest,
    handleApprovalAction,
    handleSendChat
  };
}
