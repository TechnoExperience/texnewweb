import { Link } from "react-router-dom"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar, MapPin, Users, Clock, ArrowRight, Building } from "lucide-react"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import type { Event } from "@/types"

interface EventCardHomeProps {
  event: Event
  index?: number
}

export function EventCardHome({ event, index = 0 }: EventCardHomeProps) {
  const eventDate = new Date(event.event_date)
  const [clubProfile, setClubProfile] = useState<any>(null)
  const [promoterProfile, setPromoterProfile] = useState<any>(null)

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        if (event.related_club_id) {
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", event.related_club_id)
            .maybeSingle()
          if (data && !error) setClubProfile(data)
        }
        if (event.related_promoter_id) {
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", event.related_promoter_id)
            .maybeSingle()
          if (data && !error) setPromoterProfile(data)
        }
        // Si no hay relación pero el venue coincide con un perfil de club
        if (!event.related_club_id && event.venue) {
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .ilike("name", `%${event.venue}%`)
            .eq("profile_type", "club")
            .limit(1)
            .maybeSingle()
          if (data && !error) setClubProfile(data)
          // Silently handle errors - this is optional
          if (error && !error.message.includes('PGRST116')) {
            console.debug("[EventCardHome] Profile search error:", error)
          }
        }
      } catch (err) {
        // Silently handle errors - profiles are optional
        console.debug("[EventCardHome] Profile fetch error:", err)
      }
    }
    fetchProfiles()
  }, [event.related_club_id, event.related_promoter_id, event.venue])
  
  return (
    <Link
      to={`/events/${event.slug}`}
      className="group block w-full relative h-[480px] rounded-none overflow-hidden bg-gradient-to-br from-black via-zinc-900 to-black border-2 border-white/10 transition-all duration-700 hover:scale-[1.02] hover:border-[#00F9FF] hover:shadow-2xl hover:shadow-[#00F9FF]/50"
      style={{
        scrollSnapAlign: "start",
        animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
      }}
    >
      {/* Background Image */}
      <div className="absolute inset-0 overflow-hidden">
        <OptimizedImage
          src={event.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200'}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-125"
          loading={index < 3 ? "eager" : "lazy"}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/70 to-black/95" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#00F9FF]/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-between p-6 z-10">
        {/* Top Section */}
        <div className="flex items-start justify-between">
          {/* Date Badge */}
          <div className="flex flex-col items-start">
            <div className="px-6 py-4 bg-[#00F9FF] border-2 border-white/30 backdrop-blur-sm shadow-2xl">
              <div className="text-5xl font-heading text-black leading-none mb-2" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>
                {format(eventDate, "d", { locale: es })}
              </div>
              <div className="text-sm font-space text-black/90 uppercase tracking-wider">
                {format(eventDate, "MMM", { locale: es })}
              </div>
              <div className="text-xs font-space text-black/70 mt-1">
                {format(eventDate, "yyyy", { locale: es })}
              </div>
            </div>
          </div>

          {/* Featured Badge */}
          {event.featured && (
            <Badge className="bg-gradient-to-r from-[#00D9E6] to-[#00F9FF] text-black border-0 px-4 py-2">
              Destacado
            </Badge>
          )}
        </div>

        {/* Bottom Section */}
        <div className="space-y-4">
          {/* Title */}
          <h3 className="text-3xl md:text-4xl font-heading text-white leading-tight group-hover:text-[#00F9FF] transition-colors duration-500 line-clamp-2" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>
            {event.title}
          </h3>

          {/* Location & Club/Promoter Tags */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white/90">
              <MapPin className="w-5 h-5 text-[#00F9FF] flex-shrink-0" />
              <span className="text-sm font-space line-clamp-1">
                {event.venue || event.city}, {event.country}
              </span>
            </div>
            {(clubProfile || promoterProfile) && (
              <div className="flex items-center gap-2 flex-wrap">
                {clubProfile && (
                  <Link
                    to={`/profiles/${clubProfile.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#00F9FF]/20 hover:bg-[#00F9FF]/30 border border-[#00F9FF]/50 text-[#00F9FF] transition-all duration-300 group/tag"
                  >
                    <Building className="w-3.5 h-3.5" />
                    <span className="text-xs font-space font-bold uppercase tracking-wider">
                      {clubProfile.name || event.venue}
                    </span>
                  </Link>
                )}
                {promoterProfile && (
                  <Link
                    to={`/profiles/${promoterProfile.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#00F9FF]/20 hover:bg-[#00F9FF]/30 border border-[#00F9FF]/50 text-[#00F9FF] transition-all duration-300 group/tag"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span className="text-xs font-space font-bold uppercase tracking-wider">
                      {promoterProfile.name}
                    </span>
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Lineup Preview */}
          {event.lineup && event.lineup.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Users className="w-5 h-5 text-[#00F9FF] flex-shrink-0" />
              <div className="flex items-center gap-2 flex-wrap">
                {event.lineup.slice(0, 2).map((artist: string, idx: number) => (
                  <span key={idx} className="text-sm font-space text-white/80">
                    {artist}
                    {idx < Math.min(event.lineup.length, 2) - 1 && ','}
                  </span>
                ))}
                {event.lineup.length > 2 && (
                  <span className="text-sm font-space text-[#00F9FF]">
                    +{event.lineup.length - 2} más
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Time */}
          <div className="flex items-center gap-2 text-white/90">
            <Clock className="w-5 h-5 text-[#00F9FF] flex-shrink-0" />
            <span className="text-sm font-space">
              {format(eventDate, "HH:mm", { locale: es })}h
            </span>
          </div>

          {/* CTA */}
          <div className="pt-4 border-t border-white/20">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-[#00F9FF] text-black hover:bg-[#00D9E6] transition-all duration-300 group-hover:translate-x-2">
              <span className="text-sm font-heading uppercase tracking-wider" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>
                Ver Evento
              </span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </div>

      {/* Animated Border Glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <div className="absolute inset-0 border-2 border-[#00F9FF] animate-pulse" />
      </div>
    </Link>
  )
}

