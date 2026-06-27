import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Modal, 
  Alert 
} from 'react-native';
import { MapPin } from 'lucide-react-native';
import type { Hangout } from '../types';

interface HangoutDetailsModalProps {
  hangout: Hangout;
  onClose: () => void;
  onRequestJoin: () => void;
  currentUserName?: string;
  showAlert?: (title: string, message: string) => void;
  joinRequestStatus?: 'pending' | 'approved' | 'declined' | 'cancelled' | 'withdrawn';
  canJoin: boolean;
  onReport: () => void;
}

export default function HangoutDetailsModal({
  hangout,
  onClose,
  onRequestJoin,
  currentUserName,
  showAlert,
  joinRequestStatus,
  canJoin,
  onReport,
}: HangoutDetailsModalProps) {
  const isHost = currentUserName && hangout.host.name === currentUserName;
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={hangout !== null}
      onRequestClose={onClose}
    >
      <View style={styles.modalBg}>
        <View style={styles.modalPanel}>
          
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{hangout.title}</Text>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={onClose}>
              <Text style={{ color: '#9CA3AF', fontSize: 16 }}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ padding: 20 }}>
            
            {/* Location Card */}
            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>Meeting Venue</Text>
              <Text style={styles.modalTextBig}>{hangout.venue.name}</Text>
              <Text style={styles.modalTextSub}>{hangout.venue.address} ({hangout.venue.venue_type})</Text>
              <TouchableOpacity onPress={() => showAlert ? showAlert('External Link', 'Redirecting to Google Maps...') : Alert.alert('External Link', 'Redirecting to Google Maps...')} style={styles.mapsLinkBtn}>
                <MapPin size={12} color="#8B5CF6" />
                <Text style={styles.mapsLinkBtnText}>Open in Google Maps</Text>
              </TouchableOpacity>
            </View>

            {/* Vibe notes */}
            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>Vibe Details</Text>
              <Text style={styles.modalText}>{hangout.description || 'No description provided.'}</Text>
            </View>

            {/* Vibe Tags */}
            {hangout.vibe_tags && hangout.vibe_tags.length > 0 && (
              <View style={styles.modalSection}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {hangout.vibe_tags.map(t => (
                    <View key={t} style={styles.tagBadge}><Text style={styles.tagBadgeText}>{t}</Text></View>
                  ))}
                </View>
              </View>
            )}

            {!isHost && <TouchableOpacity style={styles.reportButton} onPress={onReport}><Text style={styles.reportButtonText}>Report this hangout</Text></TouchableOpacity>}

            {/* Host Bio */}
            <View style={[styles.modalSection, styles.hostBioCard]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <Image source={{ uri: hangout.host.avatar_url }} style={styles.modalHostAvatar} />
                <View>
                  <Text style={{ color: 'white', fontWeight: '700' }}>Host: {hangout.host.name}, {hangout.host.age}</Text>
                  <Text style={{ color: '#10B981', fontSize: 12 }}>✓ Verified Identity</Text>
                </View>
              </View>
              {hangout.host.bio ? (
                <Text style={{ color: '#9CA3AF', fontSize: 13, fontStyle: 'italic' }}>"{hangout.host.bio}"</Text>
              ) : null}
            </View>

            {/* Members List */}
            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>Group Members ({hangout.members.length})</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                {hangout.members.map(m => (
                  <View key={m} style={styles.memberChip}>
                    <Text style={{ color: 'white', fontSize: 12 }}>{m}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Action button */}
            {isHost ? (
              <View style={[styles.modalActionBtn, styles.disabledBtn]}>
                <Text style={styles.modalActionBtnText}>You are hosting this hangout</Text>
              </View>
            ) : joinRequestStatus ? (
              <View style={[styles.modalActionBtn, styles.disabledBtn]}>
                <Text style={styles.modalActionBtnText}>Request: {joinRequestStatus.replace('_', ' ')}</Text>
              </View>
            ) : !canJoin ? (
              <View style={[styles.modalActionBtn, styles.disabledBtn]}>
                <Text style={styles.modalActionBtnText}>Complete verification and profile to join</Text>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.modalActionBtn}
                onPress={onRequestJoin}
              >
                <Text style={styles.modalActionBtnText}>Request to Join Group</Text>
              </TouchableOpacity>
            )}

            <View style={{ height: 40 }} />
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
  modalSection: {
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  modalLabel: {
    color: '#8B5CF6',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  modalTextBig: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
  },
  modalTextSub: {
    color: '#9CA3AF',
    fontSize: 13,
  },
  modalText: {
    color: '#D1D5DB',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'left',
  },
  mapsLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  mapsLinkBtnText: {
    color: '#8B5CF6',
    fontSize: 12,
    fontWeight: '600',
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
  hostBioCard: {
    backgroundColor: '#120E22',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.15)',
    borderRadius: 12,
    padding: 12,
    width: '100%',
  },
  modalHostAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  memberChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  modalActionBtn: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledBtn: {
    backgroundColor: '#374151',
    opacity: 0.7,
  },
  modalActionBtnText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
  },
  reportButton: { paddingVertical: 14, alignItems: 'center' }, reportButtonText: { color: '#F87171', fontWeight: '700', fontSize: 13 },
});
