import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hwwvjqfydtbyuftizumb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3d3ZqcWZ5ZHRieXVmdGl6dW1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MTg3MDgsImV4cCI6MjA2NjA5NDcwOH0.FO03WaPlm4ytlG9B2EFQPvukVrO2CuN2YbZGLerYE04'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos basados en las tablas existentes en Supabase
export interface Event {
  id: string
  title: string
  description?: string
  date: string
  time: string
  location: string
  image_url?: string
  artist_id?: string
  venue_id?: string
  genre?: string
  price?: number
  capacity?: number
  status?: string
  featured?: boolean
  ticket_url?: string
  age_restriction?: number
  dress_code?: string
  event_type?: 'club' | 'festival' | 'warehouse' | 'outdoor' | 'boat'
  created_at: string
  updated_at: string
  
  // Relaciones que se pueden incluir en queries
  artists?: Artist[]
  venue?: Venue
  event_artists?: EventArtist[]
  media_gallery?: MediaGallery[]
  reviews?: Review[]
  comments?: Comment[]
}

export interface Artist {
  id: string
  name: string
  bio?: string
  image_url?: string
  genre?: string
  social_links?: {
    instagram?: string
    soundcloud?: string
    spotify?: string
    website?: string
    youtube?: string
    beatport?: string
    bandcamp?: string
  }
  country?: string
  verified?: boolean
  followers_count?: number
  monthly_listeners?: number
  label?: string
  booking_email?: string
  press_kit_url?: string
  created_at: string
  updated_at: string

  // Relaciones
  tracks?: Track[]
  events?: Event[]
  albums?: Album[]
}

export interface Article {
  id: string
  title: string
  content: string
  excerpt?: string
  image_url?: string
  author_id?: string
  category: string
  tags?: string[]
  published: boolean
  featured?: boolean
  slug?: string
  seo_title?: string
  seo_description?: string
  reading_time?: number
  views_count?: number
  likes_count?: number
  created_at: string
  updated_at: string

  // Relaciones
  author?: UserProfile
  comments?: Comment[]
}

export interface Track {
  id: string
  title: string
  artist_id: string
  album_id?: string
  duration?: number // en segundos
  file_url?: string // URL del archivo de audio
  preview_url?: string // URL de preview (30 segundos)
  waveform_url?: string // URL de la imagen del waveform
  bpm?: number
  key?: string
  genre?: string
  release_date?: string
  label?: string
  catalog_number?: string
  isrc?: string
  lyrics?: string
  explicit?: boolean
  downloadable?: boolean
  streamable?: boolean
  price?: number
  currency?: string
  status: 'draft' | 'published' | 'private'
  created_at: string
  updated_at: string

  // Relaciones
  artist?: Artist
  album?: Album
  playlists?: Playlist[]
}

export interface Album {
  id: string
  title: string
  artist_id: string
  description?: string
  cover_image_url?: string
  release_date: string
  album_type: 'single' | 'ep' | 'album' | 'compilation'
  label?: string
  catalog_number?: string
  total_tracks?: number
  total_duration?: number
  genre?: string
  price?: number
  currency?: string
  status: 'draft' | 'published' | 'private'
  created_at: string
  updated_at: string

  // Relaciones
  artist?: Artist
  tracks?: Track[]
}

export interface Playlist {
  id: string
  title: string
  description?: string
  cover_image_url?: string
  creator_id: string
  is_public: boolean
  is_collaborative?: boolean
  total_tracks?: number
  total_duration?: number
  created_at: string
  updated_at: string

  // Relaciones
  creator?: UserProfile
  tracks?: PlaylistTrack[]
}

export interface PlaylistTrack {
  id: string
  playlist_id: string
  track_id: string
  position: number
  added_by?: string
  added_at: string

  // Relaciones
  track?: Track
  playlist?: Playlist
}

export interface Venue {
  id: string
  name: string
  address: string
  city: string
  country: string
  capacity?: number
  description?: string
  image_url?: string
  contact_info?: {
    phone?: string
    email?: string
    website?: string
  }
  coordinates?: {
    lat: number
    lng: number
  }
  amenities?: string[]
  sound_system?: string
  opening_hours?: {
    [key: string]: string
  }
  created_at: string
  updated_at: string

  // Relaciones
  events?: Event[]
  reviews?: Review[]
}

export interface Club {
  id: string
  name: string
  description?: string
  location: string
  image_url?: string
  website?: string
  social_links?: {
    instagram?: string
    facebook?: string
    twitter?: string
  }
  rating?: number
  price_range?: '$' | '$$' | '$$$' | '$$$$'
  music_style?: string[]
  dress_code?: string
  age_restriction?: number
  created_at: string
  updated_at: string

  // Relaciones
  events?: Event[]
  reviews?: Review[]
}

export interface EventArtist {
  event_id: string
  artist_id: string
  performance_order?: number
  set_time?: string
  set_duration?: number
  stage?: string
  performance_type?: 'dj_set' | 'live' | 'live_pa' | 'b2b'
  created_at: string

  // Relaciones
  event?: Event
  artist?: Artist
}

export interface UserProfile {
  id: string
  username?: string
  full_name?: string
  avatar_url?: string
  bio?: string
  location?: string
  website?: string
  social_links?: {
    instagram?: string
    twitter?: string
    soundcloud?: string
  }
  preferences?: {
    favorite_genres?: string[]
    notifications_enabled?: boolean
  }
  is_artist?: boolean
  is_promoter?: boolean
  is_verified?: boolean
  created_at: string
  updated_at: string

  // Relaciones
  articles?: Article[]
  playlists?: Playlist[]
  favorites?: UserFavorite[]
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  subject?: string
  message: string
  status?: 'unread' | 'read' | 'replied'
  created_at: string
}

export interface NewsletterSubscription {
  id: string
  email: string
  status: 'active' | 'unsubscribed'
  subscribed_at: string
  unsubscribed_at?: string
}

export interface UserFavorite {
  id: string
  user_id: string
  item_type: 'event' | 'artist' | 'article' | 'venue' | 'track' | 'album'
  item_id: string
  created_at: string
}

export interface Comment {
  id: string
  content: string
  author_id: string
  item_type: 'event' | 'article' | 'track' | 'album'
  item_id: string
  parent_id?: string
  status: 'approved' | 'pending' | 'rejected'
  likes_count?: number
  created_at: string
  updated_at: string

  // Relaciones
  author?: UserProfile
  replies?: Comment[]
}

export interface Review {
  id: string
  rating: number
  comment?: string
  author_id: string
  item_type: 'event' | 'venue' | 'club'
  item_id: string
  helpful_count?: number
  created_at: string
  updated_at: string

  // Relaciones
  author?: UserProfile
}

export interface MediaGallery {
  id: string
  title?: string
  description?: string
  media_type: 'image' | 'video'
  media_url: string
  thumbnail_url?: string
  event_id?: string
  artist_id?: string
  venue_id?: string
  uploaded_by?: string
  tags?: string[]
  created_at: string
}

export interface Promoter {
  id: string
  name: string
  description?: string
  contact_email?: string
  contact_phone?: string
  website?: string
  social_links?: {
    instagram?: string
    facebook?: string
    twitter?: string
  }
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'event' | 'article' | 'system' | 'reminder' | 'track' | 'follow'
  read: boolean
  action_url?: string
  created_at: string
} 