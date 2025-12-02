import { supabase } from "@/lib/supabase"
import type { Event } from "@/types"

/**
 * Public API helper to fetch events
 * In a real deployment, this logic would live in a Supabase Edge Function
 * or a server-side API route to provide a clean JSON endpoint for external consumers.
 * 
 * Example usage:
 * import { getPublicEvents } from "@/routes/api/events"
 * const events = await getPublicEvents()
 */

export async function getPublicEvents() {
    const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("featured", true)
        .gte("event_date", new Date().toISOString())
        .order("event_date", { ascending: true })

    if (error) {
        console.error("Error fetching public events API:", error)
        return []
    }

    return data as Event[]
}

export async function getPublicEventBySlug(slug: string) {
    const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("slug", slug)
        .single()

    if (error) {
        console.error(`Error fetching public event API for slug ${slug}:`, error)
        return null
    }

    return data as Event
}
