import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Image 
} from 'react-native';
import { MapPin, Calendar, Users, Map, Heart } from 'lucide-react-native';
import type { Hangout } from '../types';

interface DiscoverTabProps {
  hangouts: Hangout[];
  onSelectHangout: (hangout: Hangout) => void;
  onToggleFavorite: (hangout: Hangout) => void;
}

export default function DiscoverTab({
  hangouts,
  onSelectHangout, onToggleFavorite
}: DiscoverTabProps) {
  const [savedOnly, setSavedOnly] = useState(false);
  const visibleHangouts = savedOnly ? hangouts.filter(item => item.is_favorited) : hangouts;
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Upcoming Vibes</Text>
      <Text style={styles.sectionSubtitle}>Select a verified hangout to view details</Text>
      <TouchableOpacity style={[styles.savedFilter, savedOnly && styles.savedFilterActive]} onPress={() => setSavedOnly(value => !value)}><Heart size={14} color={savedOnly ? '#FFF' : '#A78BFA'} fill={savedOnly ? '#FFF' : 'transparent'} /><Text style={styles.savedFilterText}>{savedOnly ? 'Showing saved' : 'Show saved'}</Text></TouchableOpacity>

      {/* Map Card Preview */}
      <View style={styles.mapCard}>
        <View style={styles.mapHeader}>
          <Map size={16} color="#8B5CF6" />
          <Text style={styles.mapTitle}>Poblacion Active Map</Text>
        </View>
        <View style={styles.mapPlaceholder}>
          <View style={[styles.mapPin, { top: 30, left: 80 }]}>
            <MapPin size={18} color="#EC4899" />
          </View>
          <View style={[styles.mapPin, { top: 60, left: 190 }]}>
            <MapPin size={18} color="#8B5CF6" />
          </View>
          <Text style={styles.mapPlaceholderText}>Active group clusters near Guerrero St.</Text>
        </View>
      </View>

      {/* Hangouts List */}
      {visibleHangouts.map(hangout => (
        <TouchableOpacity 
          key={hangout.id} 
          style={styles.hangoutCard}
          onPress={() => onSelectHangout(hangout)}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{hangout.title}</Text>
            <TouchableOpacity style={styles.favoriteButton} onPress={event => { event.stopPropagation(); onToggleFavorite(hangout); }}><Heart size={18} color="#EC4899" fill={hangout.is_favorited ? '#EC4899' : 'transparent'} /></TouchableOpacity><View style={styles.priceBadge}>
              <Text style={styles.priceText}>{hangout.budget_range}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <MapPin size={14} color="#8B5CF6" />
            <Text style={styles.detailText}>{hangout.venue.name} • {hangout.venue.area}</Text>
          </View>

          <View style={styles.detailRow}>
            <Calendar size={14} color="#8B5CF6" />
            <Text style={styles.detailText}>{hangout.date_time}</Text>
          </View>

          <View style={styles.detailRow}>
            <Users size={14} color="#8B5CF6" />
            <Text style={styles.detailText}>{hangout.members_count} / {hangout.group_size_limit} spots taken</Text>
          </View>

          <View style={styles.cardFooter}>
            <View style={styles.hostInfo}>
              <Image source={{ uri: hangout.host.avatar_url }} style={styles.hostAvatar} />
              <View>
                <Text style={styles.hostName}>{hangout.host.name}, {hangout.host.age}</Text>
                <Text style={styles.hostSubText}>Verified Host</Text>
              </View>
            </View>
            <Text style={styles.viewDetailsLink}>View Details</Text>
          </View>
        </TouchableOpacity>
      ))}

      {visibleHangouts.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hangouts found. Host the first one!</Text>
        </View>
      )}
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
  savedFilter: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(139,92,246,.3)', marginBottom: 14 },
  savedFilterActive: { backgroundColor: '#7C3AED' }, savedFilterText: { color: '#D1D5DB', fontWeight: '700', fontSize: 12 }, favoriteButton: { padding: 5, marginRight: 4 },
  mapCard: {
    backgroundColor: '#120E22',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.15)',
    padding: 12,
    marginBottom: 20,
  },
  mapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  mapTitle: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  mapPlaceholder: {
    height: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  mapPin: {
    position: 'absolute',
  },
  mapPlaceholderText: {
    color: '#6B7280',
    fontSize: 11,
    position: 'absolute',
    bottom: 8,
  },
  hangoutCard: {
    backgroundColor: '#120E22',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.15)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    marginRight: 10,
    textAlign: 'left',
  },
  priceBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priceText: {
    color: '#8B5CF6',
    fontSize: 12,
    fontWeight: '700',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  detailText: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'left',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 16,
    marginTop: 12,
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hostAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#8B5CF6',
  },
  hostName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  hostSubText: {
    color: '#6B7280',
    fontSize: 11,
  },
  viewDetailsLink: {
    color: '#8B5CF6',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 14,
  }
});
