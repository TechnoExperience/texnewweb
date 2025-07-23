import { useState, useEffect } from 'react'
import { 
  supabase, 
  Event, 
  Artist, 
  Article, 
  Venue, 
  Club, 
  EventArtist, 
  UserProfile, 
  ContactMessage, 
  NewsletterSubscription, 
  UserFavorite, 
  Comment, 
  Review, 
  MediaGallery, 
  Promoter, 
  Notification 
} from '../lib/supabase'

export const useSupabase = () => {
  // Estados para eventos
  const [events, setEvents] = useState<Event[]>([])
  const [eventsLoading, setEventsLoading] = useState(false)

  // Estados para artistas
  const [artists, setArtists] = useState<Artist[]>([])
  const [artistsLoading, setArtistsLoading] = useState(false)

  // Estados para artículos
  const [articles, setArticles] = useState<Article[]>([])
  const [articlesLoading, setArticlesLoading] = useState(false)

  // Estados para venues
  const [venues, setVenues] = useState<Venue[]>([])
  const [venuesLoading, setVenuesLoading] = useState(false)

  // Estados para clubs
  const [clubs, setClubs] = useState<Club[]>([])
  const [clubsLoading, setClubsLoading] = useState(false)

  // Estados para mensajes de contacto
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([])
  const [contactLoading, setContactLoading] = useState(false)

  // Función para obtener eventos con artistas y venues
  const fetchEvents = async () => {
    setEventsLoading(true)
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          event_artists (
            artists (*)
          ),
          venues (*)
        `)
        .order('date', { ascending: true })

      if (error) {
        console.error('Error fetching events:', error)
        return []
      }

      setEvents(data || [])
      return data || []
    } catch (error) {
      console.error('Error fetching events:', error)
      return []
    } finally {
      setEventsLoading(false)
    }
  }

  // Función para obtener artistas
  const fetchArtists = async () => {
    setArtistsLoading(true)
    try {
      const { data, error } = await supabase
        .from('artists')
        .select('*')
        .order('name', { ascending: true })

      if (error) {
        console.error('Error fetching artists:', error)
        return []
      }

      setArtists(data || [])
      return data || []
    } catch (error) {
      console.error('Error fetching artists:', error)
      return []
    } finally {
      setArtistsLoading(false)
    }
  }

  // Función para obtener artículos
  const fetchArticles = async () => {
    setArticlesLoading(true)
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching articles:', error)
        return []
      }

      setArticles(data || [])
      return data || []
    } catch (error) {
      console.error('Error fetching articles:', error)
      return []
    } finally {
      setArticlesLoading(false)
    }
  }

  // Función para obtener venues
  const fetchVenues = async () => {
    setVenuesLoading(true)
    try {
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .order('name', { ascending: true })

      if (error) {
        console.error('Error fetching venues:', error)
        return []
      }

      setVenues(data || [])
      return data || []
    } catch (error) {
      console.error('Error fetching venues:', error)
      return []
    } finally {
      setVenuesLoading(false)
    }
  }

  // Función para obtener clubs
  const fetchClubs = async () => {
    setClubsLoading(true)
    try {
      const { data, error } = await supabase
        .from('clubs')
        .select('*')
        .order('name', { ascending: true })

      if (error) {
        console.error('Error fetching clubs:', error)
        return []
      }

      setClubs(data || [])
      return data || []
    } catch (error) {
      console.error('Error fetching clubs:', error)
      return []
    } finally {
      setClubsLoading(false)
    }
  }

  // Función para obtener mensajes de contacto
  const fetchContactMessages = async () => {
    setContactLoading(true)
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching contact messages:', error)
        return []
      }

      setContactMessages(data || [])
      return data || []
    } catch (error) {
      console.error('Error fetching contact messages:', error)
      return []
    } finally {
      setContactLoading(false)
    }
  }

  // Función para crear un evento
  const createEvent = async (eventData: Omit<Event, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('events')
        .insert([eventData])
        .select()
        .single()

      if (error) {
        console.error('Error creating event:', error)
        return null
      }

      await fetchEvents()
      return data
    } catch (error) {
      console.error('Error creating event:', error)
      return null
    }
  }

  // Función para crear un artista
  const createArtist = async (artistData: Omit<Artist, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('artists')
        .insert([artistData])
        .select()
        .single()

      if (error) {
        console.error('Error creating artist:', error)
        return null
      }

      await fetchArtists()
      return data
    } catch (error) {
      console.error('Error creating artist:', error)
      return null
    }
  }

  // Función para crear un artículo
  const createArticle = async (articleData: Omit<Article, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .insert([articleData])
        .select()
        .single()

      if (error) {
        console.error('Error creating article:', error)
        return null
      }

      await fetchArticles()
      return data
    } catch (error) {
      console.error('Error creating article:', error)
      return null
    }
  }

  // Función para crear un venue
  const createVenue = async (venueData: Omit<Venue, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('venues')
        .insert([venueData])
        .select()
        .single()

      if (error) {
        console.error('Error creating venue:', error)
        return null
      }

      await fetchVenues()
      return data
    } catch (error) {
      console.error('Error creating venue:', error)
      return null
    }
  }

  // Función para enviar mensaje de contacto
  const createContactMessage = async (messageData: Omit<ContactMessage, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .insert([{ ...messageData, status: 'unread' }])
        .select()
        .single()

      if (error) {
        console.error('Error creating contact message:', error)
        return null
      }

      await fetchContactMessages()
      return data
    } catch (error) {
      console.error('Error creating contact message:', error)
      return null
    }
  }

  // Función para suscribirse al newsletter
  const subscribeNewsletter = async (email: string) => {
    try {
      const { data, error } = await supabase
        .from('newsletter_subscriptions')
        .insert([{ 
          email, 
          status: 'active',
          subscribed_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) {
        console.error('Error subscribing to newsletter:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error subscribing to newsletter:', error)
      return null
    }
  }

  // Función para agregar/quitar favoritos
  const toggleFavorite = async (userId: string, itemType: string, itemId: string) => {
    try {
      // Verificar si ya existe
      const { data: existing } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('item_type', itemType)
        .eq('item_id', itemId)
        .single()

      if (existing) {
        // Remover favorito
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('id', existing.id)

        if (error) throw error
        return { action: 'removed' }
      } else {
        // Agregar favorito
        const { data, error } = await supabase
          .from('user_favorites')
          .insert([{
            user_id: userId,
            item_type: itemType,
            item_id: itemId
          }])
          .select()
          .single()

        if (error) throw error
        return { action: 'added', data }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      return null
    }
  }

  return {
    // Estados
    events,
    eventsLoading,
    artists,
    artistsLoading,
    articles,
    articlesLoading,
    venues,
    venuesLoading,
    clubs,
    clubsLoading,
    contactMessages,
    contactLoading,
    
    // Métodos de fetch
    fetchEvents,
    fetchArtists,
    fetchArticles,
    fetchVenues,
    fetchClubs,
    fetchContactMessages,
    
    // Métodos de creación
    createEvent,
    createArtist,
    createArticle,
    createVenue,
    createContactMessage,
    subscribeNewsletter,
    toggleFavorite,
    
    // Cliente directo para operaciones avanzadas
    supabase
  }
}

export default useSupabase 