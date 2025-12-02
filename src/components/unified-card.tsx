/**
 * Unified Card Component
 * All cards (events, releases, reviews, videos) use this component for consistency
 * Optimized for SEO and performance
 */

import { Link } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar, MapPin, Users, Clock, Star, Play, Music } from "lucide-react"
import type { Event, Release, Video, Review } from "@/types"

interface UnifiedCardProps {
  type: 'event' | 'release' | 'review' | 'video'
  data: Event | Release | Video | Review
  index?: number
}

export function UnifiedCard({ type, data, index = 0 }: UnifiedCardProps) {
  const baseClasses = "group block flex-shrink-0 w-[280px] sm:w-[320px] md:w-80 relative h-[350px] sm:h-[380px] md:h-[400px] rounded-none overflow-hidden bg-gradient-to-br from-black via-zinc-900 to-black border-2 border-white/10 transition-all duration-700 hover:scale-[1.03] hover:border-[#00F9FF] hover:shadow-2xl hover:shadow-[#00F9FF]/40"
  
  const getImageUrl = () => {
    switch (type) {
      case 'event':
        return (data as Event).image_url
      case 'release':
        return (data as Release).cover_art
      case 'review':
        return (data as Review).image_url
      case 'video':
        return (data as Video).thumbnail_url
      default:
        return null
    }
  }

  const getLink = () => {
    switch (type) {
      case 'event':
        return `/events/${(data as Event).slug}`
      case 'release':
        return `/releases/${(data as Release).id}`
      case 'review':
        return `/reviews/${(data as Review).slug}`
      case 'video':
        return `/videos/${(data as Video).id}`
      default:
        return '#'
    }
  }

  const getTitle = () => {
    return data.title
  }

  const getDate = () => {
    switch (type) {
      case 'event':
        return (data as Event).event_date
      case 'release':
        return (data as Release).release_date
      case 'review':
        return (data as Review).published_date
      case 'video':
        return (data as Video).video_date
      default:
        return null
    }
  }

  const getDescription = () => {
    switch (type) {
      case 'event':
        return (data as Event).description
      case 'release':
        return `${(data as Release).artist} - ${(data as Release).label || ''}`
      case 'review':
        return (data as Review).excerpt
      case 'video':
        return (data as Video).description
      default:
        return null
    }
  }

  const imageUrl = getImageUrl() || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200'
  const link = getLink()
  const title = getTitle()
  const date = getDate()
  const description = getDescription()

  return (
    <Link
      to={link}
      className={baseClasses}
      style={{
        scrollSnapAlign: "start",
        animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
      }}
      aria-label={`Ver ${title}`}
    >
      {/* Large Background Image with Parallax Effect */}
      <div className="absolute inset-0 overflow-hidden">
        <OptimizedImage
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-125"
          loading={index < 3 ? "eager" : "lazy"}
        />
        {/* Multi-layer Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/60 to-black/95" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#00F9FF]/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      </div>

      {/* Content Overlay */}
      <div className="relative h-full flex flex-col justify-between p-8 z-10">
        {/* Top Section - Date Badge & Featured */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-2">
            {date && (
              <div className="inline-flex flex-col items-start px-5 py-3 bg-black/60 backdrop-blur-md border-2 border-[#00F9FF]/50">
                <div className="text-4xl font-heading text-[#00F9FF] leading-none mb-1" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>
                  {format(new Date(date), "d", { locale: es })}
                </div>
                <div className="text-xs font-space text-white/80 uppercase tracking-wider">
                  {format(new Date(date), "MMM", { locale: es })}
                </div>
              </div>
            )}
          </div>

          {/* Type-specific badges */}
          <div className="flex flex-col gap-2 items-end">
            {data.featured && (
              <div className="px-4 py-2 bg-gradient-to-r from-[#00D9E6] to-[#00F9FF] border border-white/30">
                <span className="text-xs font-heading text-black uppercase tracking-wider" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>
                  Destacado
                </span>
              </div>
            )}
            
            {type === 'review' && (data as Review).rating && (
              <div className="flex items-center gap-1 px-3 py-1 bg-black/60 backdrop-blur-sm border border-white/20">
                <Star className="w-4 h-4 fill-[#00F9FF] text-[#00F9FF]" />
                <span className="text-white font-space text-sm font-bold">
                  {(data as Review).rating.toFixed(1)}
                </span>
              </div>
            )}

            {type === 'video' && (
              <div className="flex items-center gap-1 px-3 py-1 bg-black/60 backdrop-blur-sm border border-white/20">
                <Play className="w-4 h-4 text-white" />
                <span className="text-white font-space text-xs">Video</span>
              </div>
            )}

            {type === 'release' && (
              <div className="flex items-center gap-1 px-3 py-1 bg-black/60 backdrop-blur-sm border border-white/20">
                <Music className="w-4 h-4 text-white" />
                <span className="text-white font-space text-xs">Release</span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section - Content Info */}
        <div className="space-y-4">
          {/* Title - Large and Bold */}
          <h3 className="text-3xl md:text-4xl font-heading text-white leading-tight group-hover:text-[#00F9FF] transition-colors duration-500 line-clamp-2" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>
            {title}
          </h3>

          {/* Description */}
          {description && (
            <p className="text-white/80 text-sm font-space line-clamp-2">
              {description}
            </p>
          )}

          {/* Type-specific metadata */}
          <div className="flex flex-col gap-3 pt-4 border-t border-white/20">
            {type === 'event' && (
              <>
                <div className="flex items-center gap-2 text-white/90">
                  <MapPin className="w-4 h-4 text-[#00F9FF]" />
                  <span className="text-sm font-space">
                    {(data as Event).venue || (data as Event).city}, {(data as Event).country}
                  </span>
                </div>
                {(data as Event).lineup && (data as Event).lineup.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <Users className="w-4 h-4 text-[#00F9FF]" />
                    <div className="flex items-center gap-2 flex-wrap">
                      {(data as Event).lineup.slice(0, 2).map((artist: string, idx: number) => (
                        <span key={idx} className="text-xs font-space text-white/70">
                          {artist}
                          {idx < Math.min((data as Event).lineup.length, 2) - 1 && ','}
                        </span>
                      ))}
                      {(data as Event).lineup.length > 2 && (
                        <span className="text-xs font-space text-[#00F9FF]">
                          +{(data as Event).lineup.length - 2} más
                        </span>
                      )}
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2 text-white/90">
                  <Clock className="w-4 h-4 text-[#00F9FF]" />
                  <span className="text-sm font-space">
                    {format(new Date((data as Event).event_date), "HH:mm", { locale: es })}h
                  </span>
                </div>
              </>
            )}

            {type === 'release' && (
              <div className="flex items-center gap-2 text-white/90">
                <Music className="w-4 h-4 text-[#00F9FF]" />
                <span className="text-sm font-space">
                  {(data as Release).artist}
                </span>
              </div>
            )}

            {type === 'review' && (
              <div className="flex items-center gap-2 text-white/90">
                <Star className="w-4 h-4 text-[#00F9FF]" />
                <span className="text-sm font-space">
                  {(data as Review).category}
                </span>
              </div>
            )}

            {type === 'video' && (
              <div className="flex items-center gap-2 text-white/90">
                <Play className="w-4 h-4 text-[#00F9FF]" />
                <span className="text-sm font-space">
                  {(data as Video).artist || 'Video'}
                </span>
              </div>
            )}
          </div>

          {/* CTA Button */}
          <div className="pt-4">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black hover:bg-white/90 transition-all duration-300 group-hover:translate-x-2">
              <span className="text-sm font-heading uppercase tracking-wider" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>
                Ver {type === 'event' ? 'Evento' : type === 'release' ? 'Release' : type === 'review' ? 'Review' : 'Video'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Animated Border Glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <div className="absolute inset-0 border-2 border-[#00F9FF] animate-pulse" />
      </div>

      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-[#00F9FF]/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-[#00F9FF]/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </Link>
  )
}

