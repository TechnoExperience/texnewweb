import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { ChevronLeft, ChevronRight, Calendar, User, Clock, ArrowRight } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { Badge } from "@/components/ui/badge"
import type { NewsArticle } from "@/types"

interface NewsSliderProps {
  articles: NewsArticle[]
}

export function NewsSlider({ articles }: NewsSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying || articles.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % articles.length)
    }, 8000) // Change every 8 seconds

    return () => clearInterval(interval)
  }, [isAutoPlaying, articles.length])

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + articles.length) % articles.length)
    setIsAutoPlaying(false)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % articles.length)
    setIsAutoPlaying(false)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    setIsAutoPlaying(false)
  }

  if (articles.length === 0) {
    return (
      <div className="w-full h-[600px] bg-black border border-white/10 flex items-center justify-center">
        <p className="text-white/60 font-space">No hay noticias disponibles</p>
      </div>
    )
  }

  const currentArticle = articles[currentIndex]

  return (
    <div className="relative w-full h-[600px] md:h-[700px] overflow-hidden bg-black border border-white/10">
      {/* Background Image */}
      <div className="absolute inset-0">
        <OptimizedImage
          src={currentArticle.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1920'}
          alt={currentArticle.title}
          className="w-full h-full object-cover transition-opacity duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050315] via-[#050315]/80 to-[#050315]/60" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050315]" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-end p-8 md:p-12 z-10">
        <div className="max-w-4xl">
          {/* Category Badge */}
          <div className="mb-4">
            <Badge className="bg-[#00F9FF] text-black border-0 px-4 py-2">
              {currentArticle.category}
            </Badge>
          </div>

          {/* Title */}
          <h2 
            className="text-4xl md:text-5xl lg:text-6xl font-heading text-white mb-6 leading-tight"
            style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}
          >
            {currentArticle.title}
          </h2>

          {/* Excerpt */}
          <p className="text-white/90 text-lg md:text-xl font-space mb-6 line-clamp-3 max-w-3xl">
            {currentArticle.excerpt}
          </p>

          {/* Meta Info */}
          <div className="flex items-center gap-6 text-white/70 text-sm font-space mb-8 flex-wrap">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{currentArticle.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                {format(new Date(currentArticle.published_date), "d 'de' MMMM, yyyy", { locale: es })}
              </span>
            </div>
            {currentArticle.reading_time && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{currentArticle.reading_time} min de lectura</span>
              </div>
            )}
          </div>

          {/* CTA */}
          <Link
            to={`/news/${currentArticle.slug}`}
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#00F9FF] text-black hover:bg-[#00D9E6] transition-all duration-300 group"
          >
            <span className="font-heading uppercase tracking-wider" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>
              Leer más
            </span>
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 border border-white/20 transition-all duration-300 flex items-center justify-center"
        aria-label="Noticia anterior"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 border border-white/20 transition-all duration-300 flex items-center justify-center"
        aria-label="Siguiente noticia"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {articles.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? "bg-[#00F9FF] w-8"
                : "bg-white/30 hover:bg-white/50"
            }`}
            aria-label={`Ir a noticia ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

