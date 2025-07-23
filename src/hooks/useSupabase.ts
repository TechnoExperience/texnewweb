import { useState, useEffect } from 'react'
import { supabase, Event, Artist, Article } from '../lib/supabase'

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

  // Función para obtener eventos
  const fetchEvents = async () => {
    setEventsLoading(true)
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
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

      // Actualizar la lista local
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

      // Actualizar la lista local
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

      // Actualizar la lista local
      await fetchArticles()
      return data
    } catch (error) {
      console.error('Error creating article:', error)
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
    
    // Métodos
    fetchEvents,
    fetchArtists,
    fetchArticles,
    createEvent,
    createArtist,
    createArticle,
    
    // Cliente directo para operaciones avanzadas
    supabase
  }
}

export default useSupabase 