"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar, MapPin } from "lucide-react"

interface Event {
  id: string
  title: string
  slug: string
  description: string
  event_date: string
  venue: string
  city: string
  country: string
  lineup: string[]
  image_url: string
  ticket_url: string
}

export default function EventsPage() {
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
  const [pastEvents, setPastEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchEvents() {
      const now = new Date().toISOString()

      const { data: upcoming, error: upcomingError } = await supabase
        .from("events")
        .select("*")
        .gte("event_date", now)
        .order("event_date", { ascending: true })

      const { data: past, error: pastError } = await supabase
        .from("events")
        .select("*")
        .lt("event_date", now)
        .order("event_date", { ascending: false })
        .limit(6)

      if (upcomingError) console.error("[v0] Error fetching upcoming events:", upcomingError)
      if (pastError) console.error("[v0] Error fetching past events:", pastError)

      setUpcomingEvents(upcoming || [])
      setPastEvents(past || [])
      setLoading(false)
    }

    fetchEvents()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-zinc-400">Cargando eventos...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-white mb-8">Eventos</h1>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Próximos Eventos</h2>
        {upcomingEvents.length === 0 ? (
          <p className="text-zinc-400">No hay próximos eventos programados.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <Link key={event.id} to={`/events/${event.slug}`}>
                <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors overflow-hidden group">
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={event.image_url || "/placeholder.svg"}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-4 right-4 bg-white text-black">Próximo</Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold text-white mb-2 text-balance group-hover:text-zinc-300 transition-colors">
                      {event.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
                      <Calendar className="h-4 w-4" />
                      <time dateTime={event.event_date}>
                        {format(new Date(event.event_date), "d 'de' MMMM, yyyy", { locale: es })}
                      </time>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {event.venue}, {event.city}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-6">Eventos Pasados</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pastEvents.map((event) => (
            <Link key={event.id} to={`/events/${event.slug}`}>
              <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors overflow-hidden group">
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={event.image_url || "/placeholder.svg"}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-2 text-balance group-hover:text-zinc-300 transition-colors">
                    {event.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
                    <Calendar className="h-4 w-4" />
                    <time dateTime={event.event_date}>
                      {format(new Date(event.event_date), "d 'de' MMMM, yyyy", { locale: es })}
                    </time>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {event.venue}, {event.city}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
