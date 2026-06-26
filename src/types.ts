export interface Profile {
  name: string;
  age: number;
  city: string;
  bio: string;
  avatar_url: string;
  is_verified: boolean;
  vibe_tags: string[];
}

export interface Venue {
  id: number;
  name: string;
  area: string;
  address: string;
  venue_type: string;
  price_range: string;
}

export interface Hangout {
  id: number;
  title: string;
  host: Profile;
  venue: Venue;
  date_time: string;
  area: string;
  group_size_limit: number;
  members_count: number;
  budget_range: string;
  vibe_tags: string[];
  description: string;
  members: string[];
}

export interface JoinRequest {
  id: number;
  hangout_id: number;
  hangout_title: string;
  user: Profile;
  notes: string;
  status: 'pending' | 'approved' | 'declined';
}
