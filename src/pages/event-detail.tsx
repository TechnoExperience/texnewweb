import { useParams, Link } from "react-router-dom"
import { format, isPast, isToday, isTomorrow } from "date-fns"
import { es } from "date-fns/locale"
import { 
  Calendar, 
  MapPin, 
  ExternalLink, 
  Clock, 
  Users, 
  Bookmark,
  ArrowLeft,
  ArrowRight,
  Music,
  Ticket,
  TrendingUp,
  Eye,
  Star
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EventsBackground } from "@/components/backgrounds/events-background"
import { useSupabaseQuerySingle } from "@/hooks/useSupabaseQuerySingle"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorMessage } from "@/components/ui/error-message"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { TABLES } from "@/constants/tables"
import type { Event } from "@/types"
import { useCallback, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { ROUTES } from "@/constants/routes"
import { useSupabaseQuery } from "@/hooks/useSupabaseQuery"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { FloatingBackButton } from "@/components/floating-back-button"
import { SocialShare } from "@/components/social-share"
import { CommentsSection } from "@/components/comments-section"
import { FavoriteButton } from "@/components/favorite-button"

export default function EventDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [shareUrl, setShareUrl] = useState("")

  const queryFn = useCallback(
    (query: any) => query.eq("slug", slug || ""),
    [slug]
  )

  const { data: event, loading, error } = useSupabaseQuerySingle<Event>(
    TABLES.EVENTS,
    queryFn
  )

  // Fetch related events
  const { data: relatedEvents } = useSupabaseQuery<Event>(
    TABLES.EVENTS,
    useCallback(
      (query: any) => {
        if (!event) return query.limit(0)
        return query
          .neq("id", event.id)
          .eq("city", event.city)
          .gte("event_date", new Date().toISOString())
          .order("event_date", { ascending: true })
          .limit(4)
      },
      [event]
    )
  )

  useEffect(() => {
    if (event?.id) {
      setShareUrl(`${window.location.origin}/events/${event.slug}`)
      const incrementViewCount = async () => {
        await supabase
          .from("events")
          .update({ view_count: (event.view_count || 0) + 1 })
          .eq("id", event.id)
      }
      incrementViewCount()
    }
  }, [event?.id, event?.slug, event?.view_count])


  if (loading) return <LoadingSpinner />
  if (error || !event) return <ErrorMessage message="No se pudo cargar el evento" />

  const eventDate = new Date(event.event_date)
  const isEventPast = isPast(eventDate)
  const isEventToday = isToday(eventDate)
  const isEventTomorrow = isTomorrow(eventDate)

  const getDateLabel = () => {
    if (isEventToday) return "HOY"
    if (isEventTomorrow) return "MAÑANA"
    if (isEventPast) return "PASADO"
    return format(eventDate, "EEEE", { locale: es }).toUpperCase()
  }

  return (
    <div className="min-h-screen bg-black relative">
      <FloatingBackButton />
      <EventsBackground />
      <div className="relative z-10">
        {/* Hero Section - Redesigned */}
      <div className="relative w-full h-[85vh] min-h-[700px] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <OptimizedImage
            src={event.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1920'}
            alt={event.title}
            className="w-full h-full object-cover scale-110 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-black/70" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black" />
        </div>

        {/* Navigation Bar */}
        <div className="absolute top-0 left-0 right-0 z-20 p-6">
          <div className="w-full flex items-center justify-between">
            <Link
              to={ROUTES.EVENTS}
              className="flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-colors rounded-none border border-white/20"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-space text-sm">Volver</span>
            </Link>

            <div className="flex items-center gap-2">
              <FavoriteButton resourceType="event" resourceId={event.id} />
              <SocialShare 
                url={`/events/${event.slug}`}
                title={event.title}
                description={event.description}
                image={event.image_url}
                className="bg-black/50 backdrop-blur-sm border border-white/20"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`bg-black/50 backdrop-blur-sm border border-white/20 ${
                  isBookmarked ? "text-[#00F9FF]" : "text-white hover:bg-black/70"
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
              </Button>
            </div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-6 lg:p-12">
          <div className="w-full ">
            {/* Date Badge */}
            <div className="mb-6 flex items-center gap-4 flex-wrap">
              <div className="px-6 py-3 bg-[#00F9FF] border-2 border-white/30 backdrop-blur-sm">
                <div className="text-4xl font-heading text-white leading-none mb-1" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>
                  {format(eventDate, "d", { locale: es })}
                </div>
                <div className="text-xs font-space text-white/90 uppercase tracking-wider">
                  {format(eventDate, "MMM yyyy", { locale: es })}
                </div>
              </div>
              
              <Badge className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white">
                {getDateLabel()}
              </Badge>

              {event.featured && (
                <Badge className="px-4 py-2 bg-gradient-to-r from-[#00D9E6] to-[#00F9FF] border-0 text-black">
                  <Star className="w-3 h-3 mr-1 fill-current" />
                  Destacado
                </Badge>
              )}

              {event.view_count && event.view_count > 0 && (
                <div className="flex items-center gap-2 text-white/70 text-sm font-space">
                  <Eye className="w-4 h-4" />
                  <span>{event.view_count} vistas</span>
                </div>
              )}
            </div>

            {/* Title */}
            <h1 
              className="text-5xl md:text-6xl lg:text-7xl font-heading text-white mb-6 leading-tight"
              style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}
            >
              {event.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-white/90 mb-8">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#00F9FF]" />
                <span className="font-space">
                  {event.venue || event.city}, {event.country}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#00F9FF]" />
                <span className="font-space">
                  {format(eventDate, "HH:mm", { locale: es })}h
                </span>
              </div>
              {event.lineup && event.lineup.length > 0 && (
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#00F9FF]" />
                  <span className="font-space">
                    {event.lineup.length} artista{event.lineup.length > 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>

            {/* CTA Button */}
            {event.ticket_url && (
              <Button
                asChild
                size="lg"
                className="bg-[#00F9FF] hover:bg-[#00D9E6] text-black px-8 py-6 text-lg font-heading uppercase tracking-wider shadow-2xl hover:shadow-[#00F9FF]/50 transition-all duration-300"
                style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}
              >
                <a href={event.ticket_url} target="_blank" rel="noopener noreferrer">
                  <Ticket className="w-5 h-5 mr-2" />
                  Comprar Entradas
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12 ">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "Eventos", href: ROUTES.EVENTS },
            { label: event.title }
          ]}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description Section */}
            <section className="bg-white/5 border border-white/10 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-12 bg-[#00F9FF]" />
                <h2 
                  className="text-3xl font-heading text-white"
                  style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}
                >
                  SOBRE EL EVENTO
                </h2>
              </div>
              <div 
                className="text-white/80 font-space leading-relaxed text-base prose prose-invert "
                dangerouslySetInnerHTML={{ __html: event.description || "No hay descripción disponible." }}
              />
            </section>

            {/* Lineup Section - Enhanced */}
            {event.lineup && event.lineup.length > 0 && (
              <section className="relative bg-gradient-to-br from-black/80 via-white/5 to-black/80 border-2 border-white/10 p-10 backdrop-blur-sm overflow-hidden">
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0, 249, 255, 0.1) 10px, rgba(0, 249, 255, 0.1) 20px)`
                  }} />
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-10">
                    <div className="w-2 h-16 bg-gradient-to-b from-[#00F9FF] to-transparent" />
                    <h2 
                      className="text-4xl md:text-5xl font-heading text-white flex items-center gap-4"
                      style={{ 
                        fontFamily: "'Bebas Neue', system-ui, sans-serif",
                        textShadow: "0 4px 20px rgba(0, 249, 255, 0.3)"
                      }}
                    >
                      <Music className="w-10 h-10 text-[#00F9FF] animate-pulse" />
                      LINE-UP
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {event.lineup.map((artist, index) => (
                      <div
                        key={index}
                        className="group relative flex items-center gap-5 p-6 bg-gradient-to-r from-white/5 via-white/10 to-white/5 hover:from-white/10 hover:via-white/15 hover:to-white/10 border-2 border-white/10 hover:border-[#00F9FF]/70 transition-all duration-500 hover:shadow-2xl hover:shadow-[#00F9FF]/30"
                      >
                        {/* Number Badge - Enhanced */}
                        <div className="relative w-16 h-16 flex-shrink-0">
                          <div className="absolute inset-0 bg-gradient-to-br from-[#00D9E6] via-[#00F9FF] to-[#00D9E6] rounded-full animate-pulse" />
                          <div className="absolute inset-0 flex items-center justify-center text-black font-heading text-2xl z-10" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>
                            {index + 1}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-heading text-2xl group-hover:text-[#00F9FF] transition-colors mb-2" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>
                            {artist}
                          </h3>
                          {index === 0 && (
                            <Badge className="bg-gradient-to-r from-[#00D9E6] to-[#00F9FF] border-0 text-black px-3 py-1 text-xs font-bold">
                              HEADLINER
                            </Badge>
                          )}
                        </div>
                        {/* Hover Arrow */}
                        <ArrowRight className="w-5 h-5 text-white/30 group-hover:text-[#00F9FF] group-hover:translate-x-2 transition-all opacity-0 group-hover:opacity-100" />
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Event Details Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/5 border border-white/10 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="w-6 h-6 text-[#00F9FF]" />
                  <h3 className="text-xl font-heading text-white" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>
                    FECHA Y HORA
                  </h3>
                </div>
                <p className="text-white/80 font-space">
                  {format(eventDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                </p>
                <p className="text-[#00F9FF] font-space font-bold mt-2">
                  {format(eventDate, "HH:mm", { locale: es })}h
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="w-6 h-6 text-[#00F9FF]" />
                  <h3 className="text-xl font-heading text-white" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>
                    UBICACIÓN
                  </h3>
                </div>
                <p className="text-white/80 font-space">
                  {event.venue || "Venue TBA"}
                </p>
                <p className="text-white/60 font-space text-sm mt-2">
                  {event.city}, {event.country}
                </p>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Quick Info Card */}
            <div className="bg-white/5 border border-white/10 p-6 sticky top-24">
              <h3 
                className="text-2xl font-heading text-white mb-6"
                style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}
              >
                INFORMACIÓN
              </h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-white/50 text-xs font-space uppercase mb-1">Fecha</p>
                  <p className="text-white font-space">
                    {format(eventDate, "d MMM yyyy", { locale: es })}
                  </p>
                </div>
                <div>
                  <p className="text-white/50 text-xs font-space uppercase mb-1">Hora</p>
                  <p className="text-white font-space">
                    {format(eventDate, "HH:mm", { locale: es })}h
                  </p>
                </div>
                <div>
                  <p className="text-white/50 text-xs font-space uppercase mb-1">Lugar</p>
                  <p className="text-white font-space">
                    {event.venue || event.city}
                  </p>
                </div>
                {event.event_type && (
                  <div>
                    <p className="text-white/50 text-xs font-space uppercase mb-1">Tipo</p>
                    <Badge className="bg-[#00F9FF]/20 text-[#00F9FF] border-[#00F9FF]/50">
                      {event.event_type}
                    </Badge>
                  </div>
                )}
              </div>

              {event.ticket_url && (
                <Button
                  asChild
                  className="w-full mt-6 bg-[#00F9FF] hover:bg-[#00D9E6] text-black"
                >
                  <a href={event.ticket_url} target="_blank" rel="noopener noreferrer">
                    <Ticket className="w-4 h-4 mr-2" />
                    Comprar Entradas
                  </a>
                </Button>
              )}

              <div className="mt-6 pt-6 border-t border-white/10">
                <SocialShare 
                  url={`/events/${event.slug}`}
                  title={event.title}
                  description={event.description}
                  image={event.image_url}
                  className="w-full"
                />
              </div>
            </div>

            {/* Related Events */}
            {relatedEvents && relatedEvents.length > 0 && (
              <div className="bg-white/5 border border-white/10 p-6">
                <h3 
                  className="text-2xl font-heading text-white mb-6"
                  style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}
                >
                  EVENTOS RELACIONADOS
                </h3>
                <div className="space-y-4">
                  {relatedEvents.slice(0, 3).map((relatedEvent) => (
                    <Link
                      key={relatedEvent.id}
                      to={`/events/${relatedEvent.slug}`}
                      className="block group"
                    >
                      <div className="flex gap-4">
                        <div className="w-20 h-20 flex-shrink-0 overflow-hidden bg-white/5">
                          <OptimizedImage
                            src={relatedEvent.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=200'}
                            alt={relatedEvent.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-heading text-sm line-clamp-2 group-hover:text-[#00F9FF] transition-colors mb-1" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>
                            {relatedEvent.title}
                          </h4>
                          <p className="text-white/50 text-xs font-space">
                            {format(new Date(relatedEvent.event_date), "d MMM", { locale: es })}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
      </div>
    </div>
  )
}
