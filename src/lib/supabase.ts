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
  created_at: string
  updated_at: string
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
  }
  country?: string
  verified?: boolean
  created_at: string
  updated_at: string
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
  created_at: string
  updated_at: string
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
  created_at: string
  updated_at: string
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
  created_at: string
  updated_at: string
}

export interface EventArtist {
  event_id: string
  artist_id: string
  performance_order?: number
  set_time?: string
  created_at: string
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
  created_at: string
  updated_at: string
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
  item_type: 'event' | 'artist' | 'article' | 'venue'
  item_id: string
  created_at: string
}

export interface Comment {
  id: string
  content: string
  author_id: string
  item_type: 'event' | 'article'
  item_id: string
  parent_id?: string
  status: 'approved' | 'pending' | 'rejected'
  created_at: string
  updated_at: string
}

export interface Review {
  id: string
  rating: number
  comment?: string
  author_id: string
  item_type: 'event' | 'venue' | 'club'
  item_id: string
  created_at: string
  updated_at: string
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
  type: 'event' | 'article' | 'system' | 'reminder'
  read: boolean
  action_url?: string
  created_at: string
} 