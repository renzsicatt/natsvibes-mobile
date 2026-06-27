import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Check, Clock3, ShieldCheck, UserCheck } from 'lucide-react-native';
import type { Profile, VibeTagOption } from '../types';

interface ProfileTabProps {
  currentUser: Profile;
  currentUserRole: string;
  vibeTags: VibeTagOption[];
  pendingApprovalsCount: number;
  isSaving: boolean;
  isRefreshing: boolean;
  onShowApprovals: () => void;
  onRefreshStatus: () => void;
  onUploadPhoto: () => void;
  onRequestHost: () => void;
  onDeleteAccount: () => void;
  onSave: (input: { display_name: string; city: string; bio: string; vibe_tag_ids: number[] }) => void;
}

export default function ProfileTab({
  currentUser, currentUserRole, vibeTags, pendingApprovalsCount, isSaving, isRefreshing,
  onShowApprovals, onRefreshStatus, onSave,
  onUploadPhoto, onRequestHost, onDeleteAccount,
}: ProfileTabProps) {
  const [name, setName] = useState(currentUser.name);
  const [city, setCity] = useState(currentUser.city);
  const [bio, setBio] = useState(currentUser.bio);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);

  useEffect(() => {
    setName(currentUser.name); setCity(currentUser.city); setBio(currentUser.bio);
    setSelectedTags(vibeTags.filter(tag => currentUser.vibe_tags.includes(tag.name)).map(tag => tag.id));
  }, [currentUser, vibeTags]);

  const verified = currentUser.verification_status === 'approved'
    && currentUser.photo_review_status === 'approved'
    && currentUser.account_status === 'active';
  const complete = Boolean(name.trim() && city.trim() && bio.trim());
  const toggleTag = (id: number) => setSelectedTags(items => items.includes(id) ? items.filter(item => item !== id) : [...items, id]);

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      <View style={styles.profileHeader}>
        {currentUser.avatar_url ? <Image source={{ uri: currentUser.avatar_url }} style={styles.profileAvatar} /> : (
          <View style={[styles.profileAvatar, styles.avatarFallback]}><Text style={styles.avatarLetter}>{currentUser.name.charAt(0)}</Text></View>
        )}
        <Text style={styles.profileName}>{currentUser.name}{currentUser.age ? `, ${currentUser.age}` : ''}</Text>
        <View style={[styles.statusBadge, verified ? styles.verifiedBadge : styles.pendingBadge]}>
          {verified ? <ShieldCheck size={14} color="#10B981" /> : <Clock3 size={14} color="#F59E0B" />}
          <Text style={verified ? styles.verifiedText : styles.pendingText}>{verified ? 'Verified Profile' : 'Verification Pending'}</Text>
        </View>
        <TouchableOpacity style={styles.photoButton} onPress={onUploadPhoto} disabled={isSaving}>
          <Text style={styles.photoButtonText}>{isSaving ? 'Uploading…' : 'Choose profile photo'}</Text>
        </TouchableOpacity>
        <Text style={styles.reviewText}>Photo review: {currentUser.photo_review_status.replace('_', ' ')}</Text>
      </View>

      {!verified && (
        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>Your profile is under review</Text>
          <Text style={styles.noticeText}>You can browse now. Complete your profile, then wait for admin approval before joining or hosting.</Text>
          <TouchableOpacity style={styles.secondaryButton} onPress={onRefreshStatus} disabled={isRefreshing}>
            {isRefreshing ? <ActivityIndicator color="#8B5CF6" /> : <Text style={styles.secondaryButtonText}>Refresh verification status</Text>}
          </TouchableOpacity>
        </View>
      )}

      {['host', 'admin', 'super_admin'].includes(currentUserRole) && (
        <TouchableOpacity style={styles.approvalsBar} onPress={onShowApprovals}>
          <View style={styles.row}><UserCheck size={18} color="#8B5CF6" /><Text style={styles.approvalsText}>Review Join Requests</Text></View>
          {pendingApprovalsCount > 0 && <View style={styles.redDot}><Text style={styles.redDotText}>{pendingApprovalsCount}</Text></View>}
        </TouchableOpacity>
      )}

      <View style={styles.profileBody}>
        <Text style={styles.formTitle}>Complete your profile</Text>
        <Text style={styles.completionText}>{complete ? 'Profile details complete' : 'Name, city, and bio are required'}</Text>

        <Text style={styles.label}>Display name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Your display name" placeholderTextColor="#6B7280" />
        <Text style={styles.label}>City</Text>
        <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="e.g. Makati" placeholderTextColor="#6B7280" />
        <Text style={styles.label}>About me</Text>
        <TextInput style={[styles.input, styles.textArea]} value={bio} onChangeText={setBio} placeholder="Tell the group about your vibe" placeholderTextColor="#6B7280" multiline maxLength={500} />

        <Text style={styles.label}>Going-out vibes</Text>
        <View style={styles.vibeTagsContainer}>
          {vibeTags.map(tag => {
            const selected = selectedTags.includes(tag.id);
            return <TouchableOpacity key={tag.id} style={[styles.tagBadge, selected && styles.tagSelected]} onPress={() => toggleTag(tag.id)}>
              {selected && <Check size={12} color="#FFFFFF" />}<Text style={styles.tagBadgeText}>{tag.name}</Text>
            </TouchableOpacity>;
          })}
        </View>

        <TouchableOpacity style={[styles.saveButton, (!complete || isSaving) && styles.disabled]} disabled={!complete || isSaving} onPress={() => onSave({ display_name: name.trim(), city: city.trim(), bio: bio.trim(), vibe_tag_ids: selectedTags })}>
          {isSaving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveButtonText}>Save Profile</Text>}
        </TouchableOpacity>

        {verified && currentUser.host_verification_status !== 'approved' && (
          <View style={styles.hostCard}>
            <Text style={styles.noticeTitle}>Want to host a hangout?</Text>
            <Text style={styles.noticeText}>Host access requires a separate admin review.</Text>
            <TouchableOpacity style={[styles.secondaryButton, currentUser.host_verification_status === 'pending' && styles.disabled]} disabled={currentUser.host_verification_status === 'pending' || isRefreshing} onPress={onRequestHost}>
              <Text style={styles.secondaryButtonText}>{currentUser.host_verification_status === 'pending' ? 'Host review pending' : 'Request host verification'}</Text>
            </TouchableOpacity>
          </View>
        )}
        <TouchableOpacity style={styles.deleteButton} onPress={() => Alert.alert('Delete account?', 'You will be signed out immediately. Your data will be anonymized after the retention period.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Schedule deletion', style: 'destructive', onPress: onDeleteAccount }])}>
          <Text style={styles.deleteButtonText}>Delete my account</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { padding: 20, paddingBottom: 80 },
  profileHeader: { alignItems: 'center', marginBottom: 20 },
  profileAvatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 2.5, borderColor: '#8B5CF6', marginBottom: 12 },
  avatarFallback: { backgroundColor: '#241A3A', justifyContent: 'center', alignItems: 'center' },
  avatarLetter: { color: '#FFFFFF', fontSize: 30, fontWeight: '800' },
  profileName: { color: '#FFFFFF', fontSize: 20, fontWeight: '700', marginBottom: 6 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  verifiedBadge: { backgroundColor: 'rgba(16,185,129,.1)', borderColor: 'rgba(16,185,129,.25)' },
  pendingBadge: { backgroundColor: 'rgba(245,158,11,.1)', borderColor: 'rgba(245,158,11,.25)' },
  verifiedText: { color: '#10B981', fontSize: 12, fontWeight: '700' },
  pendingText: { color: '#F59E0B', fontSize: 12, fontWeight: '700' },
  photoButton: { marginTop: 10, paddingVertical: 7, paddingHorizontal: 12 }, photoButtonText: { color: '#A78BFA', fontSize: 12, fontWeight: '700' },
  reviewText: { color: '#6B7280', fontSize: 11 },
  noticeCard: { backgroundColor: 'rgba(245,158,11,.08)', borderColor: 'rgba(245,158,11,.25)', borderWidth: 1, padding: 16, borderRadius: 14, marginBottom: 16 },
  noticeTitle: { color: '#FFFFFF', fontWeight: '700', marginBottom: 6 },
  noticeText: { color: '#9CA3AF', fontSize: 13, lineHeight: 19 },
  secondaryButton: { paddingVertical: 10, marginTop: 10, alignItems: 'center' },
  secondaryButtonText: { color: '#A78BFA', fontWeight: '700' },
  approvalsBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(139,92,246,.1)', borderWidth: 1, borderColor: 'rgba(139,92,246,.25)', borderRadius: 12, padding: 14, marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 }, approvalsText: { color: '#FFFFFF', fontWeight: '600' },
  redDot: { minWidth: 20, height: 20, borderRadius: 10, backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 5 },
  redDotText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  profileBody: { backgroundColor: '#120E22', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(139,92,246,.15)', padding: 20 },
  formTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  completionText: { color: '#9CA3AF', fontSize: 12, marginTop: 4, marginBottom: 18 },
  label: { color: '#D1D5DB', fontSize: 12, fontWeight: '600', marginBottom: 6 },
  input: { backgroundColor: 'rgba(255,255,255,.04)', borderWidth: 1, borderColor: 'rgba(139,92,246,.2)', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, color: '#FFFFFF', marginBottom: 14 },
  textArea: { minHeight: 96, textAlignVertical: 'top' },
  vibeTagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  tagBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,.1)', paddingHorizontal: 10, paddingVertical: 7, borderRadius: 9 },
  tagSelected: { backgroundColor: '#7C3AED', borderColor: '#8B5CF6' }, tagBadgeText: { color: '#FFFFFF', fontSize: 12 },
  saveButton: { backgroundColor: '#8B5CF6', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  saveButtonText: { color: '#FFFFFF', fontWeight: '800' }, disabled: { opacity: .45 },
  hostCard: { marginTop: 20, paddingTop: 18, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,.08)' },
  deleteButton: { marginTop: 24, paddingVertical: 12, borderTopWidth: 1, borderTopColor: 'rgba(239,68,68,.25)', alignItems: 'center' }, deleteButtonText: { color: '#F87171', fontWeight: '700' },
});
