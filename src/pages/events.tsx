import { useState, useCallback, useMemo } from "react"
import { Link } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format, parseISO, startOfDay } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar, MapPin, Clock, ChevronRight, Filter, X, Users, Play, MoreHorizontal } from "lucide-react"
import { useSupabaseQuery } from "@/hooks/useSupabaseQuery"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorMessage } from "@/components/ui/error-message"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { TABLES } from "@/constants/tables"
import type { Event } from "@/types"
import { AdvancedFilters, type FilterState } from "@/components/advanced-filters"

type FilterType = "all" | "for-you" | "new" | "picks"
type EventType = "all" | "dj" | "promoter_festival" | "record_label" | "club"

const CITIES = [
  "Madrid", "Barcelona", "Valencia", "Bilbao", "Sevilla", 
  "Málaga", "Zaragoza", "Murcia", "Palma", "Las Palmas"
]

export default function EventsPage() {
  const [selectedLocation, setSelectedLocation] = useState<string>("Madrid")
  const [isLocationSidebarOpen, setIsLocationSidebarOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState<FilterType>("all")
  const [selectedEventType] = useState<EventType>("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [advancedFilters, setAdvancedFilters] = useState<FilterState>({
    search: "",
    datePreset: "all",
  })

  const allEventsQuery = useCallback(
    (query: any) => query.order("event_date", { ascending: false }),
    []
  )

  const upcomingQuery = useCallback(
    (query: any) => {
      let q = query
        .gte("event_date", new Date().toISOString())
        .order("event_date", { ascending: true })

      if (selectedLocation && selectedLocation !== "all") {
        q = q.eq("city", selectedLocation)
      }

      if (selectedEventType !== "all") {
        q = q.eq("event_type", selectedEventType)
      }

      return q
    },
    [selectedLocation, selectedEventType]
  )

  const { data: allEventsData, loading: loadingAll } = useSupabaseQuery<Event>(
    TABLES.EVENTS,
    allEventsQuery
  )

  const { data: upcomingEvents, loading, error } = useSupabaseQuery<Event>(
    TABLES.EVENTS,
    upcomingQuery
  )

  const eventsToShow = useMemo(() => {
    // Primero intentar usar upcomingEvents si están disponibles
    let events = upcomingEvents && upcomingEvents.length > 0 ? upcomingEvents : []
    
    // Si no hay upcomingEvents, usar allEventsData como fallback
    if (events.length === 0 && allEventsData && allEventsData.length > 0) {
      events = allEventsData
    }
    
    // Aplicar todos los filtros (fecha, ubicación, tipo) a todos los eventos
    if (events.length > 0) {
      return events.filter(event => {
        // Filtrar por fecha
        const eventDate = new Date(event.event_date)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        if (eventDate < today) {
          return false
        }
        
        // Filtrar por ubicación
        if (selectedLocation && selectedLocation !== "all") {
          if (event.city !== selectedLocation) {
            return false
          }
        }
        
        // Filtrar por tipo de evento
        if (selectedEventType !== "all") {
          if (event.event_type !== selectedEventType) {
            return false
          }
        }
        
        return true
      })
    }
    
    return []
  }, [upcomingEvents, allEventsData, selectedLocation, selectedEventType])

  const headerEventsQuery = useCallback(
    (query: any) => {
      return query
        .eq("header_featured", true)
        .gte("event_date", new Date().toISOString())
        .order("event_date", { ascending: true })
        .limit(20)
    },
    []
  )

  const { data: headerEvents } = useSupabaseQuery<Event>(
    TABLES.EVENTS,
    headerEventsQuery
  )

  const eventsByDate = useMemo(() => {
    if (!eventsToShow) return {}
    const grouped: Record<string, Event[]> = {}
    eventsToShow.forEach((event: Event) => {
      const dateKey = format(startOfDay(parseISO(event.event_date)), "yyyy-MM-dd")
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(event)
    })
    return grouped
  }, [eventsToShow])

  const popularEvents = useMemo(() => {
    if (!eventsToShow) return []
    return eventsToShow
      .filter(e => e.featured)
      .slice(0, 6)
      .concat(eventsToShow.filter(e => !e.featured).slice(0, 6 - eventsToShow.filter(e => e.featured).length))
      .slice(0, 6)
  }, [eventsToShow])

  const sortedDates = useMemo(() => {
    return Object.keys(eventsByDate).sort()
  }, [eventsByDate])

  if ((loading || loadingAll) && (!eventsToShow || eventsToShow.length === 0) && (!allEventsData || allEventsData.length === 0)) {
    return <LoadingSpinner />
  }
  
  if (error && (!eventsToShow || eventsToShow.length === 0) && (!allEventsData || allEventsData.length === 0)) {
    return <ErrorMessage message="Error al cargar los eventos" />
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Header - Spotify Style */}
      <div className="bg-gradient-to-b from-[#00F9FF]/10 via-black to-black pt-20 pb-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00F9FF] to-[#00D9E6] flex items-center justify-center">
              <Calendar className="w-6 h-6 text-black" />
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold">Eventos</h1>
          </div>
          <p className="text-white/60 text-sm sm:text-base max-w-2xl">
            Descubre los próximos eventos de techno en tu ciudad y alrededor del mundo
          </p>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AdvancedFilters
          type="events"
          onFilterChange={setAdvancedFilters}
          availableLocations={CITIES}
        />
      </div>

      {/* Filters - Sticky */}
      <div className="sticky top-16 z-40 bg-black/95 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <button
                onClick={() => setIsLocationSidebarOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white text-sm rounded-lg"
              >
                <span>📍</span>
                <span>{selectedLocation}</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1 border border-white/10 rounded-lg overflow-hidden">
                {[
                  { value: "all" as FilterType, label: "Todos" },
                  { value: "for-you" as FilterType, label: "Para ti" },
                  { value: "new" as FilterType, label: "Nuevo" },
                  { value: "picks" as FilterType, label: "TE Picks" }
                ].map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setActiveFilter(filter.value)}
                    className={`px-4 py-2 text-sm transition-colors ${
                      activeFilter === filter.value
                        ? "bg-[#00F9FF] text-black"
                        : "text-white/70 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("grid")}
                className={`${viewMode === "grid" ? "bg-white/10 text-white" : "text-white/60 hover:text-white"}`}
              >
                Grid
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("list")}
                className={`${viewMode === "list" ? "bg-white/10 text-white" : "text-white/60 hover:text-white"}`}
              >
                Lista
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Popular Events */}
        {popularEvents.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Populares</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-6">
              {popularEvents.map((event) => (
                <div
                  key={event.id}
                  className="group cursor-pointer"
                  onMouseEnter={() => setHoveredId(event.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <div className="relative bg-zinc-900 rounded-lg p-4 hover:bg-zinc-800 transition-all duration-200">
                    <div className="relative mb-4">
                      <div className="aspect-square rounded-lg overflow-hidden bg-zinc-800 shadow-lg">
                        <OptimizedImage
                          src={event.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600'}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className={`absolute bottom-2 right-2 transition-all duration-200 ${
                        hoveredId === event.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                      }`}>
                        <Link to={`/events/${event.slug}`} className="w-12 h-12 rounded-full bg-[#00F9FF] text-black flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
                        </Link>
                      </div>
                    </div>
                    <div>
                      <Link to={`/events/${event.slug}`}>
                        <h3 className="font-semibold text-white mb-1 line-clamp-1 group-hover:text-[#00F9FF] transition-colors">
                          {event.title}
                        </h3>
                        <p className="text-sm text-white/60 line-clamp-1">
                          {event.venue || event.city}
                        </p>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Events */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Próximos eventos</h2>
            <span className="text-sm text-white/60 bg-white/5 px-3 py-1 rounded-full">
              {eventsToShow?.length || 0} eventos
            </span>
          </div>

          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {sortedDates.map((dateKey) => {
                const date = new Date(dateKey)
                const events = eventsByDate[dateKey] || []
                
                return (
                  <div key={dateKey} className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-0.5 bg-[#00F9FF]" />
                      <h3 className="text-lg font-semibold text-white/80">
                        {format(date, "EEE, d MMM", { locale: es })}
                      </h3>
                    </div>
                    {events.map((event) => {
                      const eventDate = parseISO(event.event_date)
                      const timeStr = format(eventDate, "HH:mm", { locale: es })
                      
                      return (
                        <Link
                          key={event.id}
                          to={`/events/${event.slug}`}
                          className="group block bg-zinc-900 rounded-lg overflow-hidden hover:bg-zinc-800 transition-all duration-200 border border-white/10 hover:border-[#00F9FF]/50"
                        >
                          <div className="flex gap-4 p-4">
                            <div className="relative w-24 h-24 flex-shrink-0 rounded overflow-hidden bg-zinc-800">
                              <OptimizedImage
                                src={event.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600'}
                                alt={event.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-white mb-1 line-clamp-1 group-hover:text-[#00F9FF] transition-colors">
                                {event.title}
                              </h3>
                              <div className="flex items-center gap-2 text-xs text-white/60 mb-2">
                                <MapPin className="w-3 h-3" />
                                <span className="line-clamp-1">{event.venue || event.city}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-white/60">
                                <Clock className="w-3 h-3" />
                                <span>{timeStr}h</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          ) : (
            /* List View - Spotify Style */
            <div className="space-y-1">
              <div className="grid grid-cols-[16px_1fr_1fr_auto] gap-4 px-4 py-2 text-sm text-white/60 border-b border-white/10 mb-2">
                <div className="text-center">#</div>
                <div>EVENTO</div>
                <div className="hidden md:block">UBICACIÓN</div>
                <div className="text-right">
                  <Clock className="w-4 h-4 inline" />
                </div>
              </div>
              {eventsToShow.map((event, index) => {
                const eventDate = parseISO(event.event_date)
                const timeStr = format(eventDate, "HH:mm", { locale: es })
                
                return (
                  <div
                    key={event.id}
                    className="group grid grid-cols-[16px_1fr_1fr_auto] gap-4 px-4 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                    onMouseEnter={() => setHoveredId(event.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <div className="flex items-center justify-center text-white/60 group-hover:hidden">
                      {index + 1}
                    </div>
                    <div className={`flex items-center justify-center transition-all ${
                      hoveredId === event.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}>
                      <Link to={`/events/${event.slug}`} className="w-8 h-8 rounded-full bg-[#00F9FF] text-black flex items-center justify-center">
                        <Play className="w-3 h-3 ml-0.5" fill="currentColor" />
                      </Link>
                    </div>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded flex-shrink-0 overflow-hidden bg-zinc-800">
                        <OptimizedImage
                          src={event.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600'}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link to={`/events/${event.slug}`}>
                          <div className="font-medium text-white line-clamp-1 group-hover:text-[#00F9FF] transition-colors">
                            {event.title}
                          </div>
                          <div className="text-sm text-white/60 line-clamp-1">
                            {format(eventDate, "EEE, d MMM", { locale: es })}
                          </div>
                        </Link>
                      </div>
                    </div>
                    <div className="hidden md:flex items-center text-white/60 text-sm">
                      <span className="line-clamp-1">{event.venue || event.city}</span>
                    </div>
                    <div className="flex items-center justify-end gap-4">
                      <div className="text-white/60 text-sm">{timeStr}</div>
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity text-white/60 hover:text-white">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {eventsToShow.length === 0 && (
          <div className="text-center py-20">
            <Calendar className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white/60 mb-2">No hay eventos</h3>
            <p className="text-white/40">
              No hay eventos programados en este momento.
            </p>
          </div>
        )}
      </div>

      {/* Location Sidebar */}
      {isLocationSidebarOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setIsLocationSidebarOpen(false)}
          />
          <aside className="fixed right-0 top-0 h-full w-80 bg-black border-l border-white/10 z-50 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Ubicación</h3>
                <button
                  onClick={() => setIsLocationSidebarOpen(false)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <input
                type="text"
                placeholder="Buscar ciudad..."
                className="w-full px-4 py-2 bg-white/5 border border-white/10 text-white placeholder:text-white/40 rounded-lg mb-6 focus:outline-none focus:border-[#00F9FF] transition-colors"
              />

              <div className="space-y-2">
                <button
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors rounded-lg"
                >
                  <div className="w-2 h-2 rounded-full bg-[#00F9FF]" />
                  <span className="text-white">Cerca de ti</span>
                </button>
                
                {CITIES.map((city) => (
                  <button
                    key={city}
                    onClick={() => {
                      setSelectedLocation(city)
                      setIsLocationSidebarOpen(false)
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors rounded-lg ${
                      selectedLocation === city ? "bg-white/5" : ""
                    }`}
                  >
                    <span>🇪🇸</span>
                    <span className={`${selectedLocation === city ? "text-white" : "text-white/70"}`}>
                      {city}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </>
      )}
    </div>
  )
}
