/**
 * Events Header Carousel Component
 * Displays rotating recommended events in the header
 */

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar, MapPin, ArrowRight } from "lucide-react"
import { OptimizedImage } from "@/components/ui/optimized-image"
import type { Event } from "@/types"

interface EventsHeaderCarouselProps {
  events: Event[]
}

export function EventsHeaderCarousel({ events }: EventsHeaderCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Rotate events every 5 seconds
  useEffect(() => {
    if (events.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % events.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [events.length])

  if (events.length === 0) {
    return null
  }

  const currentEvent = events[currentIndex]

  return (
    <div className="relative w-full h-32 md:h-40 overflow-hidden bg-black/50 border-b border-white/10">
      {/* Background Image */}
      <div className="absolute inset-0">
        <OptimizedImage
          src={currentEvent.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1920'}
          alt={currentEvent.title}
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            {/* Label */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="w-1 h-12 bg-[#00F9FF]" />
              <span 
                className="text-lg md:text-2xl font-heading text-white uppercase tracking-wider"
                style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}
              >
                Eventos Recomendados
              </span>
            </div>

            {/* Event Card */}
            <Link
              to={`/events/${currentEvent.slug}`}
              className="flex-1 group"
            >
              <div className="flex items-center gap-4">
                {/* Event Image */}
                <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 overflow-hidden border-2 border-white/20 group-hover:border-[#00F9FF] transition-colors">
                  <OptimizedImage
                    src={currentEvent.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=200'}
                    alt={currentEvent.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>

                {/* Event Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-heading text-sm md:text-lg mb-1 line-clamp-1 group-hover:text-[#00F9FF] transition-colors" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>
                    {currentEvent.title}
                  </h3>
                  <div className="flex items-center gap-3 text-white/70 text-xs md:text-sm font-space">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                      <span>{format(new Date(currentEvent.event_date), "d MMM", { locale: es })}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="line-clamp-1">{currentEvent.city}</span>
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                <ArrowRight className="w-5 h-5 md:w-6 md:h-6 text-white/50 group-hover:text-[#00F9FF] group-hover:translate-x-1 transition-all flex-shrink-0" />
              </div>
            </Link>

            {/* Navigation Dots */}
            {events.length > 1 && (
              <div className="flex items-center gap-2 flex-shrink-0">
                {events.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentIndex
                        ? "bg-[#00F9FF] w-8"
                        : "bg-white/30 hover:bg-white/50"
                    }`}
                    aria-label={`Ver evento ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

