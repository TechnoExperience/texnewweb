// Tipos para el Sistema CMS Techno Experience

export interface Event {
  id: string;
  title: string;
  subtitle?: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  country: string;
  description: string;
  image: string;
  artists: Artist[];
  genres: string[];
  tickets: {
    price: number;
    currency: string;
    url: string;
    available: boolean;
  };
  featured: boolean;
  category: 'festival' | 'club' | 'underground';
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Artist {
  id: string;
  name: string;
  bio: string;
  image: string;
  genres: string[];
  country: string;
  social: {
    instagram?: string;
    soundcloud?: string;
    spotify?: string;
    twitter?: string;
    website?: string;
  };
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Article {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  excerpt: string;
  author: string;
  image: string;
  category: 'news' | 'interview' | 'review' | 'feature';
  tags: string[];
  published: boolean;
  featured: boolean;
  seo: {
    meta_title: string;
    meta_description: string;
    keywords: string[];
  };
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface MediaItem {
  id: string;
  title: string;
  description?: string;
  type: 'image' | 'video' | 'audio' | 'flyer';
  url: string;
  thumbnail?: string;
  artist?: string;
  event?: string;
  year: number;
  genre?: string;
  location?: string;
  tags: string[];
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Venue {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  capacity: number;
  website?: string;
  social: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
  image: string;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  role: 'visitor' | 'registered' | 'editor' | 'admin';
  profile: {
    first_name: string;
    last_name: string;
    bio?: string;
    avatar?: string;
    preferences: {
      genres: string[];
      cities: string[];
      newsletter: boolean;
    };
  };
  membership: 'free' | 'premium';
  favorites: {
    events: string[];
    articles: string[];
    artists: string[];
  };
  created_at: string;
  updated_at: string;
}

export interface CMSContent {
  id: string;
  type: 'page' | 'component' | 'settings';
  name: string;
  data: any;
  created_at: string;
  updated_at: string;
}

export interface FilterOptions {
  categories?: string[];
  genres?: string[];
  cities?: string[];
  dates?: {
    start: string;
    end: string;
  };
  artists?: string[];
  venues?: string[];
}

export interface SearchResult {
  type: 'event' | 'article' | 'artist' | 'venue';
  id: string;
  title: string;
  description: string;
  image?: string;
  url: string;
  relevance: number;
}

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  color: string;
  icon?: string;
  children?: NavigationItem[];
}

export interface SiteSettings {
  general: {
    site_name: string;
    tagline: string;
    description: string;
    logo: string;
    favicon: string;
  };
  seo: {
    default_title: string;
    default_description: string;
    keywords: string[];
    google_analytics?: string;
  };
  social: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    youtube?: string;
    soundcloud?: string;
  };
  contact: {
    email: string;
    phone?: string;
    address?: string;
  };
  features: {
    newsletter: boolean;
    user_registration: boolean;
    comments: boolean;
    events_calendar: boolean;
    interactive_map: boolean;
  };
}

export interface MusicTrack {
  id: string;
  title: string;
  artist_id?: string;
  artist?: Artist;
  album?: string;
  genre?: string;
  duration?: number; // duración en segundos
  file_url: string; // URL del archivo de audio
  cover_image_url?: string;
  release_date?: string;
  bpm?: number;
  key?: string; // key musical
  description?: string;
  tags?: string[];
  is_featured?: boolean;
  is_active?: boolean;
  play_count?: number;
  download_count?: number;
  created_at: string;
  updated_at: string;
}

export interface MusicUploadOptions {
  maxSize?: number; // MB
  allowedTypes?: string[];
  folder?: string;
}

export interface AudioPlayerState {
  isPlaying: boolean;
  currentTrack?: MusicTrack;
  playlist: MusicTrack[];
  currentTime: number;
  duration: number;
  volume: number;
  repeat: 'none' | 'one' | 'all';
  shuffle: boolean;
}

// Extender UserProfile para gestión admin
export interface UserProfile {
  user_id: string;
  email: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  role: 'user' | 'admin' | 'moderator';
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
  // Campos adicionales para gestión
  login_count?: number;
  favorite_genres?: string[];
  subscription_status?: 'free' | 'premium';
  blocked_until?: string;
  notes?: string; // notas admin
}

export interface UserStats {
  total_users: number;
  active_users: number;
  new_users_this_month: number;
  premium_users: number;
  blocked_users: number;
  top_genres: { genre: string; count: number }[];
}

export interface MusicStats {
  total_tracks: number;
  active_tracks: number;
  total_plays: number;
  total_downloads: number;
  top_genres: { genre: string; count: number }[];
  most_played: MusicTrack[];
  recent_uploads: MusicTrack[];
}
