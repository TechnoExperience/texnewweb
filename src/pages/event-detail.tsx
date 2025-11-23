"use client"

import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { ArrowLeft, Calendar, MapPin, ExternalLink } from "lucide-react"

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

export default function EventDetailPage() {
  const { slug } = useParams()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchEvent() {
      const { data, error } = await supabase.from("events").select("*").eq("slug", slug).single()

      if (error) {
        console.error("[v0] Error fetching event:", error)
      } else {
        setEvent(data)
      }
      setLoading(false)
    }

    fetchEvent()
  }, [slug])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-zinc-400">Cargando evento...</div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-zinc-400">Evento no encontrado</div>
      </div>
    )
  }

  const isPast = new Date(event.event_date) < new Date()

  return (
    <div className="container mx-auto px-4 py-8">
      <Button asChild variant="ghost" className="mb-6 text-zinc-400 hover:text-white">
        <Link to="/events">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Eventos
        </Link>
      </Button>

      <div className="max-w-4xl mx-auto">
        <div className="relative aspect-video mb-8 rounded-lg overflow-hidden">
          <img src={event.image_url || "/placeholder.svg"} alt={event.title} className="w-full h-full object-cover" />
          {!isPast && <Badge className="absolute top-4 right-4 bg-white text-black">Próximo</Badge>}
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 text-balance">{event.title}</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="flex items-center gap-3 text-zinc-300">
            <Calendar className="h-5 w-5 text-zinc-400" />
            <div>
              <div className="text-sm text-zinc-500">Fecha</div>
              <time dateTime={event.event_date} className="font-medium">
                {format(new Date(event.event_date), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
              </time>
            </div>
          </div>

          <div className="flex items-center gap-3 text-zinc-300">
            <MapPin className="h-5 w-5 text-zinc-400" />
            <div>
              <div className="text-sm text-zinc-500">Ubicación</div>
              <div className="font-medium">{event.venue}</div>
              <div className="text-sm text-zinc-400">
                {event.city}, {event.country}
              </div>
            </div>
          </div>
        </div>

        {event.ticket_url && !isPast && (
          <Button asChild className="mb-8 bg-white text-black hover:bg-zinc-200">
            <a href={event.ticket_url} target="_blank" rel="noopener noreferrer">
              Comprar Tickets
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        )}

        <div className="prose prose-invert max-w-none mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Descripción</h2>
          <p className="text-zinc-400 leading-relaxed whitespace-pre-line">{event.description}</p>
        </div>

        {event.lineup && event.lineup.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Line-up</h2>
            <div className="flex flex-wrap gap-2">
              {event.lineup.map((artist, index) => (
                <Badge key={index} className="bg-zinc-800 text-white text-sm px-3 py-1">
                  {artist}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
