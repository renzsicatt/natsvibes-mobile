import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { AppNotification } from '../types';

const labels: Record<string, string> = {
  join_request_received: 'A member requested to join your hangout.',
  join_request_approved: 'Your join request was approved.',
  join_request_declined: 'Your join request was declined.',
  hangout_cancelled: 'A hangout you joined was cancelled.',
  safety_checkin_reminder: 'Time for your safety check-in.',
  profile_verification_updated: 'Your profile verification was updated.',
  host_verification_updated: 'Your host verification was updated.',
};

interface Props {
  visible: boolean;
  notifications: AppNotification[];
  onClose: () => void;
  onRead: (id: string) => void;
  onReadAll: () => void;
}

export default function NotificationsModal({ visible, notifications, onClose, onRead, onReadAll }: Props) {
  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <View style={styles.backdrop}>
      <View style={styles.panel}>
        <View style={styles.header}>
          <Text style={styles.title}>Notifications</Text>
          <TouchableOpacity onPress={onClose}><Text style={styles.close}>✕</Text></TouchableOpacity>
        </View>
        {notifications.some(item => !item.read_at) && <TouchableOpacity style={styles.readAll} onPress={onReadAll}><Text style={styles.readAllText}>Mark all as read</Text></TouchableOpacity>}
        <ScrollView contentContainerStyle={styles.list}>
          {notifications.map(item => <TouchableOpacity key={item.id} style={[styles.item, !item.read_at && styles.unread]} onPress={() => !item.read_at && onRead(item.id)}>
            <Text style={styles.message}>{labels[item.data.event ?? ''] ?? 'You have a new NatsVibe update.'}</Text>
            <Text style={styles.time}>{new Date(item.created_at).toLocaleString()}</Text>
          </TouchableOpacity>)}
          {!notifications.length && <Text style={styles.empty}>No notifications yet.</Text>}
        </ScrollView>
      </View>
    </View>
  </Modal>;
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,.65)', justifyContent: 'flex-end' },
  panel: { backgroundColor: '#07050E', height: '72%', borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, borderColor: 'rgba(139,92,246,.25)' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,.08)' },
  title: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' }, close: { color: '#9CA3AF', fontSize: 18 },
  readAll: { alignSelf: 'flex-end', paddingHorizontal: 20, paddingTop: 14 }, readAllText: { color: '#A78BFA', fontWeight: '700', fontSize: 12 },
  list: { padding: 20, gap: 10 }, item: { backgroundColor: '#120E22', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,.06)' },
  unread: { borderColor: '#8B5CF6', backgroundColor: 'rgba(139,92,246,.13)' }, message: { color: '#FFFFFF', fontSize: 14, lineHeight: 19 },
  time: { color: '#6B7280', fontSize: 11, marginTop: 6 }, empty: { color: '#9CA3AF', textAlign: 'center', marginTop: 40 },
});
