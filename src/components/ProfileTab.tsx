import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Image 
} from 'react-native';
import { ShieldCheck, UserCheck, Check } from 'lucide-react-native';
import type { Profile } from '../types';

interface ProfileTabProps {
  currentUser: Profile;
  onShowApprovals: () => void;
  pendingApprovalsCount: number;
}

export default function ProfileTab({
  currentUser,
  onShowApprovals,
  pendingApprovalsCount
}: ProfileTabProps) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.profileHeader}>
        <Image source={{ uri: currentUser.avatar_url }} style={styles.profileAvatar} />
        <Text style={styles.profileName}>{currentUser.name}, {currentUser.age}</Text>
        
        <View style={styles.verifiedBadgeRow}>
          <ShieldCheck size={14} color="#10B981" />
          <Text style={styles.verifiedText}>Verified Profile</Text>
        </View>
      </View>

      {/* Approvals dashboard action */}
      <TouchableOpacity 
        style={styles.approvalsBar}
        onPress={onShowApprovals}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <UserCheck size={18} color="#8B5CF6" />
          <Text style={{ color: 'white', fontWeight: '600', fontSize: 14 }}>
            Review Host Approvals
          </Text>
        </View>
        {pendingApprovalsCount > 0 && (
          <View style={styles.redDot}>
            <Text style={{ color: 'white', fontSize: 10, fontWeight: '700' }}>{pendingApprovalsCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.profileBody}>
        <Text style={styles.profileSectionTitle}>About Me</Text>
        <Text style={styles.profileBioText}>{currentUser.bio}</Text>

        <Text style={styles.profileSectionTitle}>My Going-Out Vibes</Text>
        <View style={styles.vibeTagsContainer}>
          {currentUser.vibe_tags.map(tag => (
            <View key={tag} style={styles.tagBadge}>
              <Text style={styles.tagBadgeText}>{tag}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.profileSectionTitle}>Account Verification</Text>
        <View style={styles.checklistCard}>
          <View style={styles.checkItem}>
            <Check size={14} color="#10B981" />
            <Text style={styles.checkText}>Email Address verified</Text>
          </View>
          <View style={styles.checkItem}>
            <Check size={14} color="#10B981" />
            <Text style={styles.checkText}>Phone Number verified</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2.5,
    borderColor: '#8B5CF6',
    marginBottom: 12,
  },
  profileName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  verifiedBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  verifiedText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '700',
  },
  approvalsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(139,92,246,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.25)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  redDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileBody: {
    backgroundColor: '#120E22',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.15)',
    padding: 20,
  },
  profileSectionTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'left',
  },
  profileBioText: {
    color: '#9CA3AF',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'left',
  },
  vibeTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  tagBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  checklistCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginTop: 8,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkText: {
    color: '#9CA3AF',
    fontSize: 13,
    flex: 1,
    textAlign: 'left',
  },
});
