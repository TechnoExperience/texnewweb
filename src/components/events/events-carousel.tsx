import { useState, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { EventCardHome } from "@/components/event-card-home"
import type { Event } from "@/types"
import { motion } from "framer-motion"

interface EventsCarouselProps {
  events: Event[]
}

export function EventsCarousel({ events }: EventsCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [currentSlide, setCurrentSlide] = useState(0)

  const checkScrollButtons = () => {
    if (!scrollContainerRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    
    // Calculate current slide based on scroll position
    const slideWidth = scrollContainerRef.current.clientWidth * 0.8 || 450
    const newSlide = Math.round(scrollLeft / slideWidth)
    setCurrentSlide(newSlide)
  }

  useEffect(() => {
    checkScrollButtons()
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener("scroll", checkScrollButtons)
      window.addEventListener("resize", checkScrollButtons)
      return () => {
        container.removeEventListener("scroll", checkScrollButtons)
        window.removeEventListener("resize", checkScrollButtons)
      }
    }
  }, [events])

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return
    const container = scrollContainerRef.current
    const scrollAmount = container.clientWidth * 0.8
    const targetScroll = direction === "left" 
      ? container.scrollLeft - scrollAmount 
      : container.scrollLeft + scrollAmount
    
    container.scrollTo({
      left: targetScroll,
      behavior: "smooth"
    })
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return
    setIsDragging(true)
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft)
    setScrollLeft(scrollContainerRef.current.scrollLeft)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollContainerRef.current.offsetLeft
    const walk = (x - startX) * 2
    scrollContainerRef.current.scrollLeft = scrollLeft - walk
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  if (events.length === 0) {
    return (
      <div className="w-full h-[480px] bg-black border border-white/10 flex items-center justify-center">
        <p className="text-white/60 font-space">No hay eventos próximos disponibles</p>
      </div>
    )
  }

  return (
    <div className="relative w-full group">
      {/* Navigation Buttons */}
      {canScrollLeft && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => scroll("left")}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-black/80 backdrop-blur-md text-white hover:bg-[#00F9FF] hover:text-black border border-white/20 hover:border-[#00F9FF] transition-all duration-300 flex items-center justify-center rounded-full shadow-lg opacity-0 group-hover:opacity-100"
          aria-label="Anterior"
        >
          <ChevronLeft className="w-6 h-6" />
        </motion.button>
      )}

      {canScrollRight && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => scroll("right")}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-black/80 backdrop-blur-md text-white hover:bg-[#00F9FF] hover:text-black border border-white/20 hover:border-[#00F9FF] transition-all duration-300 flex items-center justify-center rounded-full shadow-lg opacity-0 group-hover:opacity-100"
          aria-label="Siguiente"
        >
          <ChevronRight className="w-6 h-6" />
        </motion.button>
      )}

      {/* Scroll Container */}
      <div
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
        style={{
          cursor: isDragging ? "grabbing" : "grab",
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch"
        }}
      >
        {events.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="flex-shrink-0 w-full sm:w-[450px] lg:w-[500px]"
            style={{ scrollSnapAlign: "start" }}
          >
            <EventCardHome event={event} index={index} />
          </motion.div>
        ))}
      </div>

      {/* Scroll Indicator */}
      {events.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          {events.slice(0, Math.min(events.length, 8)).map((_, index) => (
            <div
              key={index}
              className={`h-1 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "bg-[#00F9FF] w-8"
                  : "bg-white/20 w-2 hover:bg-white/40"
              }`}
              onClick={() => {
                if (!scrollContainerRef.current) return
                const slideWidth = scrollContainerRef.current.clientWidth * 0.8 || 450
                scrollContainerRef.current.scrollTo({
                  left: index * slideWidth,
                  behavior: "smooth"
                })
              }}
              style={{ cursor: "pointer" }}
            />
          ))}
        </div>
      )}

      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}

