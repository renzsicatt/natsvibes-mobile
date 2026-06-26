export interface Profile { name: string; age: number; city: string; bio: string; avatar_url: string; is_verified: boolean; vibe_tags: string[] }
export interface VenuePhoto { id: number; photo_url: string; is_primary: boolean }
export interface Venue { id: number; name: string; area: string; address: string; venue_type: string; price_range: string; reservation_required?: boolean; photos?: VenuePhoto[] }
export interface Hangout {
  id: number; host_id?: number; title: string; host: Profile; venue: Venue; date_time: string; area: string;
  group_size_limit: number; members_count: number; budget_range: string; vibe_tags: string[];
  description: string; members: string[]; status?: string; host_notes?: string;
}
export interface JoinRequest { id: number; hangout_id: number; hangout_title: string; user: Profile; notes: string; status: 'pending' | 'approved' | 'declined' }
export interface MyHangout { id: number; title: string; venue_name: string; members_names: string[]; time_summary: string }
export interface Message { id: number; sender: string; text: string; time: string; isMe: boolean }
