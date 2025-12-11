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
  Star,
  Plus,
  ChevronDown,
  ChevronUp,
  Navigation
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
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  const [promoter, setPromoter] = useState<any>(null)

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

  // Fetch promoter/organization info
  useEffect(() => {
    const fetchPromoter = async () => {
      if (event?.promoter_id) {
        const { data } = await supabase
          .from("profiles")
          .select("id, name, profile_type, avatar_url, city, country")
          .eq("id", event.promoter_id)
          .single()
        if (data) setPromoter(data)
      }
    }
    fetchPromoter()
  }, [event?.promoter_id])

  // Generate calendar link
  const generateCalendarLink = () => {
    if (!event) return ""
    const startDate = new Date(event.event_date)
    const endDate = event.end_datetime ? new Date(event.end_datetime) : new Date(startDate.getTime() + 6 * 60 * 60 * 1000) // Default 6 hours
    
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    }
    
    const title = encodeURIComponent(event.title)
    const location = encodeURIComponent(`${event.venue || event.city}, ${event.country}`)
    const details = encodeURIComponent(event.description?.replace(/<[^>]*>/g, '').substring(0, 500) || '')
    
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatDate(startDate)}/${formatDate(endDate)}&details=${details}&location=${location}`
  }

  // Generate map link
  const generateMapLink = () => {
    if (!event) return ""
    const location = encodeURIComponent(`${event.venue || event.city}, ${event.country}`)
    return `https://www.google.com/maps/search/?api=1&query=${location}`
  }

  // Get event type label
  const getEventTypeLabel = (type?: string) => {
    const labels: Record<string, string> = {
      'dj': 'DJ SET',
      'promoter_festival': 'FESTIVAL',
      'record_label': 'LABEL',
      'club': 'CLUB'
    }
    return labels[type || ''] || 'TECHNO'
  }


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

        {/* Hero Content - Redesigned like xsmusic.es */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-6 lg:p-12">
          <div className="w-full max-w-7xl mx-auto">
            {/* Location Badge - Top */}
            <div className="mb-4">
              <Badge className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-space uppercase tracking-wider">
                {event.city?.toUpperCase() || 'CIUDAD'}, {event.country?.toUpperCase() || 'ESPAÑA'}
              </Badge>
            </div>

            {/* Title */}
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-heading text-white mb-4 leading-tight"
              style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}
            >
              {event.title}
            </h1>

            {/* Venue */}
            {event.venue && (
              <div className="mb-6">
                <p className="text-2xl md:text-3xl font-heading text-white/90" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>
                  {event.venue}
                </p>
              </div>
            )}

            {/* Date and Time - Enhanced format like xsmusic.es */}
            <div className="mb-6 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-white/90">
                <Calendar className="w-5 h-5 text-[#00F9FF]" />
                <span className="font-space text-lg">
                  {format(eventDate, "d 'DE' MMMM 'DE' yyyy", { locale: es }).toUpperCase()}
                </span>
              </div>
              <span className="text-white/50">/</span>
              <div className="flex items-center gap-2 text-white/90">
                <Clock className="w-5 h-5 text-[#00F9FF]" />
                <span className="font-space text-lg">
                  {format(eventDate, "HH:mm", { locale: es })}
                  {event.end_datetime && ` - ${format(new Date(event.end_datetime), "HH:mm", { locale: es })}`}
                </span>
              </div>
            </div>

            {/* Genre/Event Type Badge */}
            {event.event_type && (
              <div className="mb-6">
                <Badge className="px-4 py-2 bg-[#00F9FF] text-black text-sm font-bold uppercase tracking-wider">
                  {getEventTypeLabel(event.event_type)}
                </Badge>
              </div>
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
            {/* Description Section - Expandable like xsmusic.es */}
            <section className="bg-white/5 border border-white/10 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-12 bg-[#00F9FF]" />
                <h2 
                  className="text-3xl font-heading text-white"
                  style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}
                >
                  INFO
                </h2>
              </div>
              <div 
                className={`text-white/80 font-space leading-relaxed text-base prose prose-invert transition-all duration-300 ${
                  !isDescriptionExpanded ? 'line-clamp-4' : ''
                }`}
                dangerouslySetInnerHTML={{ __html: event.description || "No hay descripción disponible." }}
              />
              {event.description && event.description.length > 200 && (
                <button
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  className="mt-4 flex items-center gap-2 text-[#00F9FF] hover:text-[#00D9E6] transition-colors font-space text-sm uppercase tracking-wider"
                >
                  {isDescriptionExpanded ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      Ver menos información
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Ver mas información
                    </>
                  )}
                </button>
              )}
            </section>

            {/* Artists Section - Enhanced like xsmusic.es */}
            {event.lineup && event.lineup.length > 0 && (
              <section className="bg-white/5 border border-white/10 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-12 bg-[#00F9FF]" />
                  <h2 
                    className="text-3xl font-heading text-white"
                    style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}
                  >
                    ARTISTAS ({event.lineup.length})
                  </h2>
                </div>
                <div className="space-y-4">
                  {event.lineup.map((artist, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#00F9FF]/50 transition-all group"
                    >
                      <div className="flex-1">
                        <h3 className="text-white font-heading text-xl group-hover:text-[#00F9FF] transition-colors" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>
                          {artist}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs border-white/20 text-white/70">
                            {getEventTypeLabel(event.event_type) || 'TECHNO'}
                          </Badge>
                          <span className="text-white/50 text-xs font-space">|</span>
                          <span className="text-white/50 text-xs font-space">{event.country || 'España'}</span>
                        </div>
                      </div>
                      {index === 0 && (
                        <Badge className="bg-[#00F9FF] text-black px-3 py-1 text-xs font-bold">
                          HEADLINER
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Organizations/Promoters Section - Like xsmusic.es */}
            {promoter && (
              <section className="bg-white/5 border border-white/10 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-12 bg-[#00F9FF]" />
                  <h2 
                    className="text-3xl font-heading text-white"
                    style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}
                  >
                    ORGANIZACIONES (1)
                  </h2>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#00F9FF]/50 transition-all group">
                  {promoter.avatar_url && (
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10">
                      <OptimizedImage
                        src={promoter.avatar_url}
                        alt={promoter.name || 'Organizador'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-white font-heading text-xl group-hover:text-[#00F9FF] transition-colors" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>
                      {promoter.name || 'Organizador'}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs border-white/20 text-white/70">
                        {promoter.profile_type?.toUpperCase() || 'PROMOTER'}
                      </Badge>
                      {promoter.city && (
                        <>
                          <span className="text-white/50 text-xs font-space">|</span>
                          <span className="text-white/50 text-xs font-space">{promoter.city}, {promoter.country || 'España'}</span>
                        </>
                      )}
                    </div>
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

              {/* Action Buttons - Like xsmusic.es */}
              <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10 hover:border-[#00F9FF]/50"
                >
                  <a href={generateCalendarLink()} target="_blank" rel="noopener noreferrer">
                    <Calendar className="w-4 h-4 mr-2" />
                    Añadir a tu calendario
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10 hover:border-[#00F9FF]/50"
                >
                  <a href={generateMapLink()} target="_blank" rel="noopener noreferrer">
                    <Navigation className="w-4 h-4 mr-2" />
                    Ver mapa
                  </a>
                </Button>
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

        {/* Comments Section - Like xsmusic.es */}
        <div className="mt-12">
          <CommentsSection 
            resourceType="event"
            resourceId={event.id}
          />
        </div>
      </div>
      </div>
    </div>
  )
}
