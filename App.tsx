import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  StatusBar,
  Image
} from 'react-native';
import { 
  Compass, 
  PlusCircle, 
  MessageSquare, 
  ShieldCheck, 
  User, 
  MapPin, 
  LogOut
} from 'lucide-react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// Modular components and hooks imports
import useMobileData from './src/hooks/useMobileData';
import WelcomeScreen from './src/components/WelcomeScreen';
import DiscoverTab from './src/components/DiscoverTab';
import CreateTab from './src/components/CreateTab';
import ChatTab from './src/components/ChatTab';
import SafetyTab from './src/components/SafetyTab';
import ProfileTab from './src/components/ProfileTab';

// Modals
import HangoutDetailsModal from './src/components/HangoutDetailsModal';
import JoinRequestModal from './src/components/JoinRequestModal';
import ApprovalsModal from './src/components/ApprovalsModal';

export default function App() {
  return (
    <SafeAreaProvider>
      <MainApp />
    </SafeAreaProvider>
  );
}

function MainApp() {
  const {
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
    handleLogout,
    handleCreateGroup,
    handleSendRequest,
    handleApprovalAction,
    handleSendChat
  } = useMobileData();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* 1. WELCOME SCREEN / AUTH GATE */}
      {!isLoggedIn ? (
        <WelcomeScreen 
          emailInput={emailInput}
          setEmailInput={setEmailInput}
          phoneInput={phoneInput}
          setPhoneInput={setPhoneInput}
          onLogin={handleLogin}
        />
      ) : (
        /* 2. MAIN LOGGED-IN PORTAL */
        <View style={{ flex: 1 }}>
          
          {/* Main App Header */}
          <View style={styles.header}>
            <View style={styles.logoRow}>
              <Image 
                source={require('./assets/logo.png')} 
                style={{ width: 24, height: 24, borderRadius: 6 }} 
              />
              <Text style={styles.logoText}>NatsVibe</Text>
            </View>
            
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <TouchableOpacity style={styles.areaBadge}>
                <MapPin size={12} color="#8B5CF6" />
                <Text style={styles.areaText}>Poblacion</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleLogout}>
                <LogOut size={18} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Tab Pages Switcher */}
          <View style={styles.mainContent}>
            
            {/* TAB A: DISCOVER */}
            {activeTab === 'discover' && (
              <DiscoverTab 
                hangouts={hangouts}
                onSelectHangout={setSelectedHangout}
              />
            )}

            {/* TAB B: CREATE GROUP */}
            {activeTab === 'create' && (
              <CreateTab 
                venues={venues}
                onCreateGroup={handleCreateGroup}
              />
            )}

            {/* TAB C: GROUP CHAT */}
            {activeTab === 'chat' && (
              <ChatTab 
                messages={messages}
                typedMessage={typedMessage}
                setTypedMessage={setTypedMessage}
                onSendChat={handleSendChat}
              />
            )}

            {/* TAB D: SAFETY */}
            {activeTab === 'safety' && (
              <SafetyTab 
                trustedContact={trustedContact}
                setTrustedContact={setTrustedContact}
                checkInActive={checkInActive}
                setCheckInActive={setCheckInActive}
              />
            )}

            {/* TAB E: PROFILE & SETTINGS */}
            {activeTab === 'profile' && (
              <ProfileTab 
                currentUser={currentUser}
                onShowApprovals={() => setShowApprovalsPanel(true)}
              />
            )}

          </View>

          {/* Bottom Tab Bar */}
          <View style={styles.tabBar}>
            <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('discover')}>
              <Compass size={22} color={activeTab === 'discover' ? '#8B5CF6' : '#9CA3AF'} />
              <Text style={[styles.tabLabel, activeTab === 'discover' && styles.tabLabelActive]}>Discover</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('create')}>
              <PlusCircle size={22} color={activeTab === 'create' ? '#8B5CF6' : '#9CA3AF'} />
              <Text style={[styles.tabLabel, activeTab === 'create' && styles.tabLabelActive]}>Host</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('chat')}>
              <MessageSquare size={22} color={activeTab === 'chat' ? '#8B5CF6' : '#9CA3AF'} />
              <Text style={[styles.tabLabel, activeTab === 'chat' && styles.tabLabelActive]}>Chat</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('safety')}>
              <ShieldCheck size={22} color={activeTab === 'safety' ? '#8B5CF6' : '#9CA3AF'} />
              <Text style={[styles.tabLabel, activeTab === 'safety' && styles.tabLabelActive]}>Safety</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('profile')}>
              <User size={22} color={activeTab === 'profile' ? '#8B5CF6' : '#9CA3AF'} />
              <Text style={[styles.tabLabel, activeTab === 'profile' && styles.tabLabelActive]}>Profile</Text>
            </TouchableOpacity>
          </View>

          {/* A. DETAILED GROUP OVERLAY MODAL */}
          {selectedHangout && (
            <HangoutDetailsModal 
              hangout={selectedHangout}
              onClose={() => setSelectedHangout(null)}
              onRequestJoin={() => setShowRequestModal(true)}
            />
          )}

          {/* B. JOIN REQUEST FORM MODAL */}
          <JoinRequestModal 
            visible={showRequestModal}
            notes={joinNotes}
            setNotes={setJoinNotes}
            onSubmit={handleSendRequest}
            onCancel={() => { setShowRequestModal(false); setJoinNotes(''); }}
          />

          {/* C. HOST APPROVALS OVERLAY MODAL */}
          <ApprovalsModal 
            visible={showApprovalsPanel}
            requests={requests}
            onClose={() => setShowApprovalsPanel(false)}
            onAction={handleApprovalAction}
          />

        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07050E',
  },
  header: {
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 92, 246, 0.15)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: '#07050E',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -1,
  },
  areaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  areaText: {
    color: '#8B5CF6',
    fontSize: 12,
    fontWeight: '600',
  },
  mainContent: {
    flex: 1,
  },
  tabBar: {
    height: 60,
    borderTopWidth: 1,
    borderTopColor: 'rgba(139, 92, 246, 0.15)',
    flexDirection: 'row',
    backgroundColor: '#07050E',
    paddingBottom: 4,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabLabel: {
    color: '#9CA3AF',
    fontSize: 10,
    marginTop: 4,
  },
  tabLabelActive: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
});
