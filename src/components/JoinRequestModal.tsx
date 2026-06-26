import React from 'react';
import {
  ActivityIndicator,
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  TextInput, 
  Modal 
} from 'react-native';

interface JoinRequestModalProps {
  visible: boolean;
  notes: string;
  setNotes: (notes: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function JoinRequestModal({
  visible,
  notes,
  setNotes,
  onSubmit,
  onCancel,
  isSubmitting,
}: JoinRequestModalProps) {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.modalBg}>
        <View style={[styles.modalPanel, { height: 'auto', padding: 20, marginHorizontal: 20, borderRadius: 16 }]}>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: '700', marginBottom: 6 }}>Introduce yourself</Text>
          <Text style={{ color: '#9CA3AF', fontSize: 12, marginBottom: 16 }}>
            Why do you want to join this group hangout? Hosts select members based on vibe fits.
          </Text>

          <TextInput
            style={[styles.input, styles.textArea, { marginBottom: 16 }]}
            placeholder="Hey Sofia! Would love to join for cocktail crawl. I am into Speakeasy bar-hopping."
            placeholderTextColor="#6B7280"
            multiline
            numberOfLines={3}
            value={notes}
            onChangeText={setNotes}
          />

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity style={[styles.submitBtn, { flex: 1, marginTop: 0 }, isSubmitting && { opacity: .55 }]} onPress={onSubmit} disabled={isSubmitting}>
              {isSubmitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.submitBtnText}>Submit Request</Text>}
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.venueOption, { flex: 0.5, borderStyle: 'solid', borderColor: 'rgba(255,255,255,0.1)' }]} 
              onPress={onCancel}
            >
              <Text style={{ color: '#9CA3AF' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalPanel: {
    backgroundColor: '#07050E',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 15,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  venueOption: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.15)',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
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
});
