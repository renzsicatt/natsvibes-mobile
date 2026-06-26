import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  TextInput 
} from 'react-native';
import type { Venue } from '../types';

interface CreateTabProps {
  venues: Venue[];
  onCreateGroup: (title: string, dateTime: string, venueIndex: number, description: string) => void;
}

export default function CreateTab({
  venues,
  onCreateGroup
}: CreateTabProps) {
  const [newTitle, setNewTitle] = useState('');
  const [newDateTime, setNewDateTime] = useState('');
  const [selectedVenueIndex, setSelectedVenueIndex] = useState(0);
  const [newDesc, setNewDesc] = useState('');

  const handleSubmit = () => {
    onCreateGroup(newTitle, newDateTime, selectedVenueIndex, newDesc);
    // resetting is handled inside parent if succeeded, or we can clear here
    setNewTitle('');
    setNewDateTime('');
    setNewDesc('');
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Host a Group</Text>
      <Text style={styles.sectionSubtitle}>Curate an offline evening at a pre-vetted venue</Text>

      <View style={styles.formContainer}>
        <Text style={styles.label}>Vibe Title</Text>
        <TextInput 
          style={styles.input} 
          placeholder="e.g. Chill Saturday Wine Night" 
          placeholderTextColor="#6B7280"
          value={newTitle}
          onChangeText={setNewTitle}
        />

        <Text style={styles.label}>Date & Time</Text>
        <TextInput 
          style={styles.input} 
          placeholder="e.g. Saturday, 9:00 PM" 
          placeholderTextColor="#6B7280"
          value={newDateTime}
          onChangeText={setNewDateTime}
        />

        <Text style={styles.label}>Choose Venue</Text>
        {venues.length > 0 ? (
          <View style={styles.venuePicker}>
            {venues.map((venue, idx) => (
              <TouchableOpacity 
                key={venue.id} 
                style={[styles.venueOption, selectedVenueIndex === idx && styles.venueOptionSelected]}
                onPress={() => setSelectedVenueIndex(idx)}
              >
                <Text style={[styles.venueOptionText, selectedVenueIndex === idx && styles.venueOptionTextSelected]}>
                  {venue.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <Text style={{ color: '#9CA3AF', fontSize: 13, fontStyle: 'italic' }}>Loading venues from admin...</Text>
        )}

        <Text style={styles.label}>Plan details / Vibe notes</Text>
        <TextInput 
          style={[styles.input, styles.textArea]} 
          placeholder="Where are we meeting? What drinks are we ordering?" 
          placeholderTextColor="#6B7280"
          multiline
          numberOfLines={4}
          value={newDesc}
          onChangeText={setNewDesc}
        />

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitBtnText}>Publish Hangout</Text>
        </TouchableOpacity>
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
  formContainer: {
    gap: 16,
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  venuePicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  venueOption: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.15)',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 4,
  },
  venueOptionSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  venueOptionText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600',
  },
  venueOptionTextSelected: {
    color: '#8B5CF6',
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
