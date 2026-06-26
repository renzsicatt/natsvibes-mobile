import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Modal 
} from 'react-native';
import type { JoinRequest } from '../types';

interface ApprovalsModalProps {
  visible: boolean;
  requests: JoinRequest[];
  onClose: () => void;
  onAction: (id: number, status: 'approved' | 'declined') => void;
}

export default function ApprovalsModal({
  visible,
  requests,
  onClose,
  onAction
}: ApprovalsModalProps) {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalBg}>
        <View style={styles.modalPanel}>
          
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Host Approval Dashboard</Text>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={onClose}>
              <Text style={{ color: '#9CA3AF', fontSize: 16 }}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ padding: 20 }}>
            <Text style={{ color: '#9CA3AF', fontSize: 13, marginBottom: 20, textAlign: 'left' }}>
              Select who joins your hosted Poblacion meetups. Small groups ensure high-quality connections.
            </Text>

            {requests.map(req => (
              <View key={req.id} style={styles.approvalCard}>
                <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                  <Image source={{ uri: req.user.avatar_url }} style={styles.approvalAvatar} />
                  <View style={{ alignItems: 'flex-start' }}>
                    <Text style={{ color: 'white', fontWeight: '700', fontSize: 15 }}>{req.user.name}, {req.user.age}</Text>
                    <Text style={{ color: '#10B981', fontSize: 11 }}>✓ Verified Account</Text>
                  </View>
                </View>

                <Text style={{ color: '#9CA3AF', fontSize: 12, marginBottom: 8, textAlign: 'left' }}>
                  Target Hangout: <Text style={{ color: 'white', fontWeight: 'bold' }}>{req.hangout_title}</Text>
                </Text>
                <Text style={{ color: 'white', fontSize: 13, fontStyle: 'italic', backgroundColor: 'rgba(255,255,255,0.02)', padding: 10, borderRadius: 8, marginBottom: 12, width: '100%', textAlign: 'left' }}>
                  "{req.notes}"
                </Text>

                {req.status === 'pending' ? (
                  <View style={{ flexDirection: 'row', gap: 10, width: '100%' }}>
                    <TouchableOpacity 
                      style={[styles.submitBtn, { flex: 1, height: 36, marginTop: 0, justifyContent: 'center' }]} 
                      onPress={() => onAction(req.id, 'approved')}
                    >
                      <Text style={styles.submitBtnText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.venueOption, { flex: 0.5, borderStyle: 'solid', borderColor: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.05)', paddingVertical: 0, justifyContent: 'center' }]} 
                      onPress={() => onAction(req.id, 'declined')}
                    >
                      <Text style={{ color: '#EF4444', fontSize: 12, fontWeight: '700' }}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Text style={{ color: req.status === 'approved' ? '#10B981' : '#EF4444', fontWeight: '600', textTransform: 'capitalize', fontSize: 13 }}>
                    Request Status: {req.status}
                  </Text>
                )}
              </View>
            ))}

            {requests.length === 0 && (
              <Text style={{ color: '#9CA3AF', textAlign: 'center', marginTop: 40 }}>No pending requests.</Text>
            )}
            
            <View style={{ height: 60 }} />
          </ScrollView>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalPanel: {
    height: '85%',
    backgroundColor: '#07050E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  modalTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '800',
  },
  modalCloseBtn: {
    padding: 4,
  },
  approvalCard: {
    backgroundColor: '#120E22',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.15)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    alignItems: 'flex-start',
    width: '100%',
  },
  approvalAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  submitBtn: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  venueOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.15)',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
});
