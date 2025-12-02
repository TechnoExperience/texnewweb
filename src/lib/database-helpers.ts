/**
 * Helpers para mejorar las consultas a la base de datos
 * Incluye joins y relaciones cuando sea necesario
 */

import { supabase } from "./supabase"

/**
 * Obtiene noticias con información del autor (si existe created_by)
 */
export async function getNewsWithAuthor(newsId?: string) {
  let query = supabase
    .from("news")
    .select(`
      *,
      author_profile:profiles!news_created_by_fkey(
        id,
        name,
        username,
        avatar_url
      )
    `)

  if (newsId) {
    query = query.eq("id", newsId).single()
  }

  return query
}

/**
 * Obtiene eventos con información relacionada
 */
export async function getEventsWithDetails(eventId?: string) {
  let query = supabase
    .from("events")
    .select(`
      *,
      creator_profile:profiles!events_created_by_fkey(
        id,
        name,
        username,
        avatar_url
      )
    `)

  if (eventId) {
    query = query.eq("id", eventId).single()
  }

  return query
}

/**
 * Obtiene releases con información del artista
 */
export async function getReleasesWithArtist(releaseId?: string) {
  let query = supabase
    .from("dj_releases")
    .select(`
      *,
      creator_profile:profiles!dj_releases_created_by_fkey(
        id,
        name,
        username,
        avatar_url
      )
    `)

  if (releaseId) {
    query = query.eq("id", releaseId).single()
  }

  return query
}

/**
 * Obtiene videos con información del creador
 */
export async function getVideosWithCreator(videoId?: string) {
  let query = supabase
    .from("videos")
    .select(`
      *,
      creator_profile:profiles!videos_uploader_id_fkey(
        id,
        name,
        username,
        avatar_url
      )
    `)

  if (videoId) {
    query = query.eq("id", videoId).single()
  }

  return query
}

/**
 * Obtiene reviews con información del autor y relaciones
 */
export async function getReviewsWithDetails(reviewId?: string) {
  let query = supabase
    .from("reviews")
    .select(`
      *,
      author_profile:profiles!reviews_created_by_fkey(
        id,
        name,
        username,
        avatar_url
      ),
      related_event:events!reviews_related_event_id_fkey(
        id,
        title,
        slug,
        image_url
      ),
      related_dj:profiles!reviews_related_dj_id_fkey(
        id,
        name,
        username,
        avatar_url
      )
    `)

  if (reviewId) {
    query = query.eq("id", reviewId).single()
  }

  return query
}

