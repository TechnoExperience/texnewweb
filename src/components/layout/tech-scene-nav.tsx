import { Link } from "react-router-dom"
import { useState, useEffect, useMemo } from "react"
import { useSupabaseQuery } from "@/hooks/useSupabaseQuery"
import { TABLES } from "@/constants/tables"
import type { Event, UserProfile } from "@/types"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface TechSceneNavProps {
  className?: string
}

export function TechSceneNav({ className = "" }: TechSceneNavProps) {
  const [isScrolling, setIsScrolling] = useState(false)

  // Obtener festivales desde events
  const { data: festivalsData, loading: festivalsLoading } = useSupabaseQuery<Event>(
    TABLES.EVENTS,
    (query) => 
      query
        .eq("event_type", "promoter_festival")
        .eq("featured", true)
        .order("event_date", { ascending: false })
        .limit(10)
  )

  // Obtener clubs desde tech_scene_entities
  const { data: clubsData, loading: clubsLoading } = useSupabaseQuery<any>(
    "tech_scene_entities",
    (query) => 
      query
        .eq("entity_type", "club")
        .eq("is_featured", true)
        .order("display_order", { ascending: true })
        .limit(15)
  )


  // Procesar datos
  const festivals = useMemo(() => {
    if (!festivalsData || festivalsData.length === 0) return []
    return festivalsData
      .filter((e) => e.title && e.slug)
      .map((e) => ({
        name: e.title,
        slug: e.slug || e.id,
      }))
  }, [festivalsData])

  const clubs = useMemo(() => {
    if (!clubsData || clubsData.length === 0) return []
    return clubsData
      .filter((c) => c.name)
      .map((c) => ({
        name: c.name,
        slug: c.slug || c.id,
      }))
  }, [clubsData])

  const loading = festivalsLoading || clubsLoading

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(window.scrollY > 100)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Si está cargando, mostrar skeleton o nada
  if (loading && festivals.length === 0 && clubs.length === 0) {
    return (
      <nav className={`w-full bg-black/80 backdrop-blur-md border-b border-white/10 ${className}`}>
        <div className="container mx-auto px-2 sm:px-4 md:px-6 py-3">
          <div className="flex items-center justify-center">
            <LoadingSpinner />
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className={`w-full bg-black/80 backdrop-blur-md border-b border-white/10 ${className}`}>
      <div className="container mx-auto px-2 sm:px-4 md:px-6">
        {/* Desktop: Horizontal scroll con categorías */}
        <div className="hidden md:flex items-center gap-6 py-3 overflow-x-auto scrollbar-hide">
          {/* Festivals */}
          {festivals.length > 0 && (
            <>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-[#00F9FF] font-heading uppercase text-xs tracking-wider whitespace-nowrap" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>
                  FESTIVALES
                </span>
                <div className="h-4 w-px bg-white/20" />
                <div className="flex items-center gap-4">
                  {festivals.map((festival) => (
                    <Link
                      key={festival.slug}
                      to={`/events?search=${encodeURIComponent(festival.name)}`}
                      className="text-white/70 hover:text-[#00F9FF] transition-colors text-xs font-space whitespace-nowrap"
                    >
                      {festival.name}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="h-4 w-px bg-white/20" />
            </>
          )}

          {/* Clubs */}
          {clubs.length > 0 && (
            <>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-[#00F9FF] font-heading uppercase text-xs tracking-wider whitespace-nowrap" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>
                  CLUBS
                </span>
                <div className="h-4 w-px bg-white/20" />
                <div className="flex items-center gap-4">
                  {clubs.map((club) => (
                    <Link
                      key={club.slug}
                      to={`/events?search=${encodeURIComponent(club.name)}`}
                      className="text-white/70 hover:text-[#00F9FF] transition-colors text-xs font-space whitespace-nowrap"
                    >
                      {club.name}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="h-4 w-px bg-white/20" />
            </>
          )}
        </div>

        {/* Mobile: Scroll horizontal compacto */}
        <div className="md:hidden py-2">
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
            {/* Festivals */}
            {festivals.length > 0 && (
              <>
                <div className="flex items-center gap-2 flex-shrink-0 snap-center">
                  <span className="text-[#00F9FF] font-heading uppercase text-[10px] tracking-wider" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>
                    FESTIVALES
                  </span>
                  <div className="flex items-center gap-2">
                    {festivals.slice(0, 3).map((festival) => (
                      <Link
                        key={festival.slug}
                        to={`/events?search=${encodeURIComponent(festival.name)}`}
                        className="text-white/70 hover:text-[#00F9FF] transition-colors text-[10px] font-space whitespace-nowrap px-1"
                      >
                        {festival.name}
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="h-3 w-px bg-white/20 flex-shrink-0" />
              </>
            )}

            {/* Clubs */}
            {clubs.length > 0 && (
              <>
                <div className="flex items-center gap-2 flex-shrink-0 snap-center">
                  <span className="text-[#00F9FF] font-heading uppercase text-[10px] tracking-wider" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>
                    CLUBS
                  </span>
                  <div className="flex items-center gap-2">
                    {clubs.slice(0, 4).map((club) => (
                      <Link
                        key={club.slug}
                        to={`/events?search=${encodeURIComponent(club.name)}`}
                        className="text-white/70 hover:text-[#00F9FF] transition-colors text-[10px] font-space whitespace-nowrap px-1"
                      >
                        {club.name}
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="h-3 w-px bg-white/20 flex-shrink-0" />
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

