import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  TextInput 
} from 'react-native';
import { Check } from 'lucide-react-native';

interface TrustedContact {
  name: string;
  phone: string;
}

interface SafetyTabProps {
  trustedContact: TrustedContact;
  setTrustedContact: (contact: TrustedContact) => void;
  checkInActive: boolean;
  setCheckInActive: (active: boolean) => void;
}

export default function SafetyTab({
  trustedContact,
  setTrustedContact,
  checkInActive,
  setCheckInActive
}: SafetyTabProps) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Safety Check-In</Text>
      <Text style={styles.sectionSubtitle}>Simple in-app safety timers & alerts</Text>

      <View style={styles.safetyCard}>
        <Text style={styles.safetyCardTitle}>Trusted Emergency Contact</Text>
        
        <View style={{ marginBottom: 12 }}>
          <Text style={styles.label}>Contact Name</Text>
          <TextInput 
            style={styles.input} 
            value={trustedContact.name} 
            onChangeText={text => setTrustedContact({ ...trustedContact, name: text })} 
          />
        </View>
        
        <View style={{ marginBottom: 12 }}>
          <Text style={styles.label}>Contact Mobile Number</Text>
          <TextInput 
            style={styles.input} 
            value={trustedContact.phone} 
            onChangeText={text => setTrustedContact({ ...trustedContact, phone: text })} 
          />
        </View>

        <TouchableOpacity 
          style={[styles.safetyActiveBtn, checkInActive && styles.safetyActiveBtnOn]} 
          onPress={() => setCheckInActive(!checkInActive)}
        >
          <Text style={styles.safetyActiveText}>
            {checkInActive ? 'Monitoring Active (Tap to Stop)' : 'Activate Safe-Timer (2 hrs)'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.checklistCard}>
        <Text style={styles.checklistTitle}>Nightlife Safety Checklist</Text>
        <View style={styles.checkItem}>
          <Check size={14} color="#10B981" />
          <Text style={styles.checkText}>Meet only at the verified public venue.</Text>
        </View>
        <View style={styles.checkItem}>
          <Check size={14} color="#10B981" />
          <Text style={styles.checkText}>Verify the host's profile has a check badge.</Text>
        </View>
        <View style={styles.checkItem}>
          <Check size={14} color="#10B981" />
          <Text style={styles.checkText}>Keep trusted contact informed of plans.</Text>
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
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'left',
  },
  sectionSubtitle: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'left',
  },
  safetyCard: {
    backgroundColor: '#120E22',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.15)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    gap: 8,
  },
  safetyCardTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'left',
  },
  label: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'left',
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
  safetyActiveBtn: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  safetyActiveBtnOn: {
    backgroundColor: '#EC4899',
  },
  safetyActiveText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  checklistCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  checklistTitle: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'left',
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
