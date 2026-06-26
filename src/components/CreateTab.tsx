import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Image 
} from 'react-native';
import { MapPin, Check, Search } from 'lucide-react-native';
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
  const [selectedVenueId, setSelectedVenueId] = useState<number>(venues[0]?.id || 1);
  const [newDesc, setNewDesc] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVenues = venues.filter(venue => 
    venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    venue.venue_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    venue.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
    venue.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = () => {
    const originalIndex = venues.findIndex(v => v.id === selectedVenueId);
    onCreateGroup(newTitle, newDateTime, originalIndex >= 0 ? originalIndex : 0, newDesc);
    setNewTitle('');
    setNewDateTime('');
    setNewDesc('');
    setSearchQuery('');
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
        
        {/* Search Input Bar */}
        <View style={styles.searchBarContainer}>
          <Search size={16} color="#6B7280" style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput} 
            placeholder="Search by name, area, or type..." 
            placeholderTextColor="#6B7280"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {filteredVenues.length > 0 ? (
          <View style={styles.venuePicker}>
            {filteredVenues.map((venue) => {
              const isSelected = selectedVenueId === venue.id;
              const imageUrl = venue.photos && venue.photos.length > 0 
                ? venue.photos[0].photo_url 
                : 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80';
              
              return (
                <TouchableOpacity 
                  key={venue.id} 
                  style={[styles.venueCard, isSelected && styles.venueCardSelected]}
                  onPress={() => setSelectedVenueId(venue.id)}
                >
                  <Image source={{ uri: imageUrl }} style={styles.venueImage} />
                  
                  <View style={styles.venueDetails}>
                    <View style={styles.venueHeaderRow}>
                      <Text style={[styles.venueName, isSelected && styles.venueNameSelected]} numberOfLines={1}>
                        {venue.name}
                      </Text>
                      {isSelected && (
                        <View style={styles.checkBadge}>
                          <Check size={10} color="#FFFFFF" strokeWidth={3} />
                        </View>
                      )}
                    </View>
                    
                    <View style={styles.venueMetaRow}>
                      <Text style={styles.venueType}>{venue.venue_type}</Text>
                      <Text style={styles.venueDot}>•</Text>
                      <Text style={styles.venuePrice}>{venue.price_range}</Text>
                    </View>

                    <View style={styles.venueLocationRow}>
                      <MapPin size={12} color="#9CA3AF" />
                      <Text style={styles.venueAddress} numberOfLines={1}>
                        {venue.address}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : venues.length > 0 ? (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>No venues match "{searchQuery}"</Text>
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
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 4,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
  },
  venuePicker: {
    gap: 12,
    flexDirection: 'column',
  },
  venueCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.15)',
    borderRadius: 14,
    overflow: 'hidden',
    padding: 10,
    gap: 12,
  },
  venueCardSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
  },
  venueImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: '#120E22',
  },
  venueDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  venueHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  venueName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
    paddingRight: 8,
  },
  venueNameSelected: {
    color: '#8B5CF6',
  },
  checkBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  venueMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  venueType: {
    color: '#A78BFA',
    fontSize: 11,
    fontWeight: '600',
  },
  venueDot: {
    color: '#6B7280',
    fontSize: 11,
  },
  venuePrice: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
  },
  venueLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  venueAddress: {
    color: '#9CA3AF',
    fontSize: 11,
    flex: 1,
  },
  noResultsContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
  },
  noResultsText: {
    color: '#6B7280',
    fontSize: 13,
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
