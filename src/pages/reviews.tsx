import { useState, useCallback, useMemo } from "react"
import { Link } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar, Star, User, ArrowRight, Filter, Play, MoreHorizontal, Clock } from "lucide-react"
import { useSupabaseQuery } from "@/hooks/useSupabaseQuery"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorMessage } from "@/components/ui/error-message"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { TABLES } from "@/constants/tables"
import type { Review } from "@/types"
import { AdvancedFilters, type FilterState } from "@/components/advanced-filters"

export default function ReviewsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"newest" | "rating" | "popular">("newest")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [advancedFilters, setAdvancedFilters] = useState<FilterState>({
    search: "",
    datePreset: "all",
  })

  const reviewsQuery = useCallback(
    (query: any) => {
      let q = query.order("published_date", { ascending: false })
      
      if (selectedCategory !== "all") {
        q = q.eq("category", selectedCategory)
      }
      
      if (sortBy === "rating") {
        q = q.order("rating", { ascending: false, nullsLast: true })
      } else if (sortBy === "popular") {
        q = q.order("view_count", { ascending: false })
      }
      
      return q
    },
    [selectedCategory, sortBy]
  )

  const { data: reviews, loading, error } = useSupabaseQuery<Review>(
    TABLES.REVIEWS,
    reviewsQuery
  )

  // Apply advanced filters
  const filteredReviews = useMemo(() => {
    if (!reviews) return []
    
    let filtered = [...reviews]
    
    // Apply date filters
    if (advancedFilters.dateRange?.from) {
      filtered = filtered.filter(review => {
        const reviewDate = new Date(review.published_date || review.created_at)
        return reviewDate >= advancedFilters.dateRange!.from!
      })
    }
    
    if (advancedFilters.dateRange?.to) {
      filtered = filtered.filter(review => {
        const reviewDate = new Date(review.published_date || review.created_at)
        return reviewDate <= advancedFilters.dateRange!.to!
      })
    }
    
    // Apply search filter
    if (advancedFilters.search) {
      const searchLower = advancedFilters.search.toLowerCase()
      filtered = filtered.filter(review =>
        review.title?.toLowerCase().includes(searchLower) ||
        review.excerpt?.toLowerCase().includes(searchLower) ||
        review.author?.toLowerCase().includes(searchLower)
      )
    }
    
    return filtered
  }, [reviews, advancedFilters])

  const categories = [
    { value: "all", label: "Todos" },
    { value: "event", label: "Eventos" },
    { value: "dj", label: "DJs" },
    { value: "club", label: "Clubs" },
    { value: "promoter", label: "Promotoras" },
  ]

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message="Error al cargar las reviews" />

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Header - Spotify Style */}
      <div className="bg-gradient-to-b from-[#00F9FF]/10 via-black to-black pt-20 pb-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00F9FF] to-[#00D9E6] flex items-center justify-center">
              <Star className="w-6 h-6 text-black" />
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold">Reviews</h1>
          </div>
          <p className="text-white/60 text-sm sm:text-base max-w-2xl">
            Análisis y críticas de eventos, lanzamientos y la escena techno
          </p>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AdvancedFilters
          type="reviews"
          onFilterChange={setAdvancedFilters}
        />
      </div>

      {/* Filters - Sticky */}
      <div className="sticky top-16 z-40 bg-black/95 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1 w-full overflow-x-auto scrollbar-hide">
              <div className="flex items-center gap-2 min-w-max">
                <Filter className="w-4 h-4 text-white/60 flex-shrink-0" />
                {categories.map((cat) => (
                  <Button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    variant={selectedCategory === cat.value ? "default" : "outline"}
                    size="sm"
                    className={`whitespace-nowrap ${
                      selectedCategory === cat.value
                        ? "bg-[#00F9FF] text-black hover:bg-[#00D9E6] border-0"
                        : "border-white/20 text-white/70 hover:border-[#00F9FF]/50 hover:text-[#00F9FF] bg-transparent"
                    }`}
                  >
                    {cat.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-white/10 text-white/70 hover:text-white hover:border-white/20 bg-transparent"
                onClick={() => setSortBy(sortBy === "newest" ? "rating" : sortBy === "rating" ? "popular" : "newest")}
              >
                {sortBy === "newest" ? "Más recientes" : sortBy === "rating" ? "Mejor valoradas" : "Más populares"}
              </Button>

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
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredReviews && filteredReviews.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Todas las reviews</h2>
              <span className="text-sm text-white/60 bg-white/5 px-3 py-1 rounded-full">
                {filteredReviews.length} reviews
              </span>
            </div>

            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredReviews.map((review) => {
                  const rating = review.rating || 0
                  
                  return (
                    <Link
                      key={review.id}
                      to={`/reviews/${review.slug}`}
                      className="group block"
                      onMouseEnter={() => setHoveredId(review.id)}
                      onMouseLeave={() => setHoveredId(null)}
                    >
                      <div className="relative bg-zinc-900 rounded-lg overflow-hidden hover:bg-zinc-800 transition-all duration-200 border border-white/10 hover:border-[#00F9FF]/50">
                        <div className="relative aspect-video overflow-hidden">
                          <OptimizedImage
                            src={review.image_url || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600'}
                            alt={review.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                          
                          {rating > 0 && (
                            <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-sm border border-white/20 rounded">
                              <Star className="w-3 h-3 fill-[#00F9FF] text-[#00F9FF]" />
                              <span className="text-white text-xs font-bold">{rating.toFixed(1)}</span>
                            </div>
                          )}

                          {review.featured && (
                            <Badge className="absolute top-3 left-3 bg-[#00F9FF] text-black border-0">
                              Destacado
                            </Badge>
                          )}

                          <div className={`absolute bottom-3 right-3 transition-all duration-200 ${
                            hoveredId === review.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                          }`}>
                            <div className="w-10 h-10 rounded-full bg-[#00F9FF] text-black flex items-center justify-center shadow-lg">
                              <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
                            </div>
                          </div>
                        </div>

                        <div className="p-4">
                          <div className="flex items-center gap-2 text-xs text-white/50 mb-2">
                            <span>{format(new Date(review.published_date), "dd MMM yyyy", { locale: es })}</span>
                            <span>•</span>
                            <span className="text-[#00F9FF] capitalize">{review.category}</span>
                          </div>

                          <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-[#00F9FF] transition-colors">
                            {review.title}
                          </h3>

                          <p className="text-sm text-white/60 line-clamp-2 mb-3">
                            {review.excerpt}
                          </p>

                          <div className="flex items-center justify-between pt-3 border-t border-white/10">
                            <div className="flex items-center gap-2 text-white/50 text-xs">
                              <User className="w-3 h-3" />
                              <span>{review.author}</span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-white/50 group-hover:text-[#00F9FF] group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              /* List View - Spotify Style */
              <div className="space-y-1">
                <div className="grid grid-cols-[16px_1fr_auto] gap-4 px-4 py-2 text-sm text-white/60 border-b border-white/10 mb-2">
                  <div className="text-center">#</div>
                  <div>REVIEW</div>
                  <div className="text-right">
                    <Clock className="w-4 h-4 inline" />
                  </div>
                </div>
                {filteredReviews.map((review, index) => {
                  const rating = review.rating || 0
                  
                  return (
                    <div
                      key={review.id}
                      className="group grid grid-cols-[16px_1fr_auto] gap-4 px-4 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                      onMouseEnter={() => setHoveredId(review.id)}
                      onMouseLeave={() => setHoveredId(null)}
                    >
                      <div className="flex items-center justify-center text-white/60 group-hover:hidden">
                        {index + 1}
                      </div>
                      <div className={`flex items-center justify-center transition-all ${
                        hoveredId === review.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}>
                        <Link to={`/reviews/${review.slug}`} className="w-8 h-8 rounded-full bg-[#00F9FF] text-black flex items-center justify-center">
                          <Play className="w-3 h-3 ml-0.5" fill="currentColor" />
                        </Link>
                      </div>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded flex-shrink-0 overflow-hidden bg-zinc-800">
                          <OptimizedImage
                            src={review.image_url || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600'}
                            alt={review.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <Link to={`/reviews/${review.slug}`}>
                            <div className="font-medium text-white line-clamp-1 group-hover:text-[#00F9FF] transition-colors">
                              {review.title}
                            </div>
                            <div className="text-sm text-white/60 line-clamp-1">
                              {review.excerpt}
                            </div>
                          </Link>
                        </div>
                        {rating > 0 && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-white/5 rounded">
                            <Star className="w-3 h-3 fill-[#00F9FF] text-[#00F9FF]" />
                            <span className="text-xs font-bold text-white">{rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-end gap-4">
                        <div className="text-white/60 text-sm">
                          {format(new Date(review.published_date), "d MMM", { locale: es })}
                        </div>
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity text-white/60 hover:text-white">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <Star className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white/60 mb-2">No hay reviews</h3>
            <p className="text-white/40">
              Aún no hay reviews disponibles.
            </p>
          </div>
        )}
      </div>

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
