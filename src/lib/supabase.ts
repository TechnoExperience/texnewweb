import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hwwvjqfydtbyuftizumb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3d3ZqcWZ5ZHRieXVmdGl6dW1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MTg3MDgsImV4cCI6MjA2NjA5NDcwOH0.FO03WaPlm4ytlG9B2EFQPvukVrO2CuN2YbZGLerYE04'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos de datos para las tablas
export interface Event {
  id: string
  title: string
  description?: string
  date: string
  time: string
  location: string
  image_url?: string
  artist_id?: string
  genre?: string
  price?: number
  capacity?: number
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
  }
  created_at: string
  updated_at: string
}

export interface Article {
  id: string
  title: string
  content: string
  excerpt?: string
  image_url?: string
  author: string
  category: string
  published: boolean
  created_at: string
  updated_at: string
} 