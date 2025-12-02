import { useParams, Link } from "react-router-dom"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { 
  ArrowLeft,
  Star,
  User,
  Calendar,
  Clock,
  Eye,
  Share2,
  Bookmark,
  ThumbsUp,
  Tag,
  TrendingUp,
  Music,
  MapPin,
  Building
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useSupabaseQuerySingle } from "@/hooks/useSupabaseQuerySingle"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorMessage } from "@/components/ui/error-message"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { TABLES } from "@/constants/tables"
import type { Review } from "@/types"
import { useCallback, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { ROUTES } from "@/constants/routes"
import { useSupabaseQuery } from "@/hooks/useSupabaseQuery"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { FloatingBackButton } from "@/components/floating-back-button"

export default function ReviewDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [relatedEvent, setRelatedEvent] = useState<any>(null)
  const [relatedProfile, setRelatedProfile] = useState<any>(null)

  const queryFn = useCallback(
    (query: any) => query.eq("slug", slug || ""),
    [slug]
  )

  const { data: review, loading, error } = useSupabaseQuerySingle<Review>(
    TABLES.REVIEWS,
    queryFn
  )

  // Fetch related reviews
  const { data: relatedReviews } = useSupabaseQuery<Review>(
    TABLES.REVIEWS,
    useCallback(
      (query: any) => {
        if (!review) return query.limit(0)
        return query
          .neq("id", review.id)
          .eq("category", review.category)
          .order("published_date", { ascending: false })
          .limit(4)
      },
      [review]
    )
  )

  // Fetch related event or profile based on review type
  useEffect(() => {
    const fetchRelatedData = async () => {
      if (!review) return

      if (review.related_event_id) {
        const { data } = await supabase
          .from("events")
          .select("*")
          .eq("id", review.related_event_id)
          .single()
        setRelatedEvent(data)
      } else if (review.related_dj_id || review.related_club_id || review.related_promoter_id) {
        const profileId = review.related_dj_id || review.related_club_id || review.related_promoter_id
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", profileId)
          .single()
        setRelatedProfile(data)
      }
    }

    fetchRelatedData()
  }, [review])

  useEffect(() => {
    if (review?.id) {
      const incrementViewCount = async () => {
        await supabase
          .from("reviews")
          .update({ view_count: (review.view_count || 0) + 1 })
          .eq("id", review.id)
      }
      incrementViewCount()
    }
  }, [review?.id, review?.view_count])

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/reviews/${review?.slug}`
    if (navigator.share) {
      try {
        await navigator.share({
          title: review?.title,
          text: review?.excerpt,
          url: shareUrl,
        })
      } catch (err) {
        console.log("Error sharing:", err)
      }
    } else {
      navigator.clipboard.writeText(shareUrl)
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < Math.floor(rating)
            ? "fill-[#00F9FF] text-[#00F9FF]"
            : i < rating
            ? "fill-[#00F9FF]/50 text-[#00F9FF]/50"
            : "text-white/20"
        }`}
      />
    ))
  }

  if (loading) return <LoadingSpinner />
  if (error || !review) return <ErrorMessage message="No se pudo cargar la review" />

  const publishedDate = new Date(review.published_date)
  const readingTime = Math.ceil((review.content?.split(/\s+/).length || 0) / 200)

  return (
    <div className="min-h-screen bg-black">
      <FloatingBackButton />
      {/* Hero Section */}
      <div className="relative w-full h-[60vh] min-h-[500px] overflow-hidden">
        <div className="absolute inset-0">
          <OptimizedImage
            src={review.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1920'}
            alt={review.title}
            className="w-full h-full object-cover scale-110 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-black/70" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black" />
        </div>

        {/* Navigation */}
        <div className="absolute top-0 left-0 right-0 z-20 p-6">
          <div className="w-full flex items-center justify-between">
            <Link
              to={ROUTES.REVIEWS}
              className="flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-colors rounded-none border border-white/20"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-space text-sm">Volver</span>
            </Link>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 border border-white/20"
              >
                <Share2 className="w-4 h-4" />
              </Button>
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
            <div className="mb-6 flex items-center gap-4 flex-wrap">
              <Badge className="px-4 py-2 bg-[#00F9FF] text-white border-0">
                {review.category}
              </Badge>
              {review.featured && (
                <Badge className="px-4 py-2 bg-gradient-to-r from-[#00D9E6] to-[#00F9FF] border-0 text-white">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Destacado
                </Badge>
              )}
              {review.view_count && review.view_count > 0 && (
                <div className="flex items-center gap-2 text-white/70 text-sm font-space">
                  <Eye className="w-4 h-4" />
                  <span>{review.view_count} vistas</span>
                </div>
              )}
            </div>

            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-heading text-white mb-6 leading-tight"
              style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}
            >
              {review.title}
            </h1>

            <p className="text-white/80 text-lg md:text-xl font-space  mb-6">
              {review.excerpt}
            </p>

            {/* Rating */}
            {review.rating && review.rating > 0 && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {renderStars(review.rating)}
                </div>
                <span className="text-white font-heading text-2xl" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>
                  {review.rating.toFixed(1)}/5.0
                </span>
              </div>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-white/70 text-sm font-space mt-6">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{review.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  {format(publishedDate, "d 'de' MMMM, yyyy", { locale: es })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{readingTime} min de lectura</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12 ">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "Reviews", href: ROUTES.REVIEWS },
            { label: review.title }
          ]}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Review Content */}
            <article className="bg-white/5 border border-white/10 p-8">
              <div 
                className="prose prose-invert  text-white/80 font-space leading-relaxed text-base"
                dangerouslySetInnerHTML={{ __html: review.content || review.excerpt || "No hay contenido disponible." }}
              />
            </article>

            {/* Tags */}
            {review.tags && review.tags.length > 0 && (
              <div className="bg-white/5 border border-white/10 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Tag className="w-5 h-5 text-[#00F9FF]" />
                  <h3 className="text-xl font-heading text-white" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>
                    ETIQUETAS
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {review.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      className="bg-white/10 text-white border-white/20 hover:bg-[#00F9FF]/20 hover:border-[#00F9FF]/50 transition-colors"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Related Entity Info */}
            {(relatedEvent || relatedProfile) && (
              <div className="bg-white/5 border border-white/10 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-12 bg-[#00F9FF]" />
                  <h2 
                    className="text-3xl font-heading text-white"
                    style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}
                  >
                    {relatedEvent ? "SOBRE EL EVENTO" : "SOBRE EL PERFIL"}
                  </h2>
                </div>
                {relatedEvent && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <OptimizedImage
                        src={relatedEvent.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600'}
                        alt={relatedEvent.title}
                        className="w-full h-48 object-cover mb-4"
                      />
                      <h3 className="text-2xl font-heading text-white mb-2" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>
                        {relatedEvent.title}
                      </h3>
                      <div className="space-y-2 text-white/70 font-space text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{relatedEvent.venue}, {relatedEvent.city}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {format(new Date(relatedEvent.event_date), "d 'de' MMMM, yyyy", { locale: es })}
                          </span>
                        </div>
                      </div>
                      <Link
                        to={`/events/${relatedEvent.slug}`}
                        className="inline-block mt-4 text-[#00F9FF] hover:text-[#00D9E6] font-space text-sm uppercase tracking-wider"
                      >
                        Ver evento →
                      </Link>
                    </div>
                  </div>
                )}
                {relatedProfile && (
                  <div className="flex gap-6">
                    {relatedProfile.avatar_url && (
                      <OptimizedImage
                        src={relatedProfile.avatar_url}
                        alt={relatedProfile.name || "Profile"}
                        className="w-32 h-32 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <h3 className="text-2xl font-heading text-white mb-2" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>
                        {relatedProfile.name || "Perfil"}
                      </h3>
                      {relatedProfile.bio && (
                        <p className="text-white/70 font-space text-sm mb-4">
                          {relatedProfile.bio}
                        </p>
                      )}
                      <Link
                        to={`/profiles/${relatedProfile.id}`}
                        className="inline-block text-[#00F9FF] hover:text-[#00D9E6] font-space text-sm uppercase tracking-wider"
                      >
                        Ver perfil →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-4 flex-wrap">
              <Button
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Compartir
              </Button>
              <Button
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <ThumbsUp className="w-4 h-4 mr-2" />
                Me gusta
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Review Info Card */}
            <div className="bg-white/5 border border-white/10 p-6 sticky top-32">
              <h3 
                className="text-2xl font-heading text-white mb-6"
                style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}
              >
                INFORMACIÓN
              </h3>
              
              <div className="space-y-4">
                {review.rating && review.rating > 0 && (
                  <div>
                    <p className="text-white/50 text-xs font-space uppercase mb-2">Valoración</p>
                    <div className="flex items-center gap-2 mb-2">
                      {renderStars(review.rating)}
                    </div>
                    <p className="text-white font-heading text-2xl" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>
                      {review.rating.toFixed(1)}/5.0
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-white/50 text-xs font-space uppercase mb-1">Categoría</p>
                  <Badge className="bg-[#00F9FF]/20 text-[#00F9FF] border-[#00F9FF]/50">
                    {review.category}
                  </Badge>
                </div>
                <div>
                  <p className="text-white/50 text-xs font-space uppercase mb-1">Autor</p>
                  <p className="text-white font-space">{review.author}</p>
                </div>
                <div>
                  <p className="text-white/50 text-xs font-space uppercase mb-1">Fecha</p>
                  <p className="text-white font-space">
                    {format(publishedDate, "d MMM yyyy", { locale: es })}
                  </p>
                </div>
                <div>
                  <p className="text-white/50 text-xs font-space uppercase mb-1">Tiempo de lectura</p>
                  <p className="text-white font-space">{readingTime} min</p>
                </div>
              </div>
            </div>

            {/* Related Reviews */}
            {relatedReviews && relatedReviews.length > 0 && (
              <div className="bg-white/5 border border-white/10 p-6">
                <h3 
                  className="text-2xl font-heading text-white mb-6"
                  style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}
                >
                  REVIEWS RELACIONADAS
                </h3>
                <div className="space-y-4">
                  {relatedReviews.slice(0, 3).map((relatedReview) => (
                    <Link
                      key={relatedReview.id}
                      to={`/reviews/${relatedReview.slug}`}
                      className="block group"
                    >
                      <div className="flex gap-4">
                        <div className="w-20 h-20 flex-shrink-0 overflow-hidden bg-white/5">
                          <OptimizedImage
                            src={relatedReview.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=200'}
                            alt={relatedReview.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-heading text-sm line-clamp-2 group-hover:text-[#00F9FF] transition-colors mb-1" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>
                            {relatedReview.title}
                          </h4>
                          {relatedReview.rating && relatedReview.rating > 0 && (
                            <div className="flex items-center gap-1 mb-1">
                              <Star className="w-3 h-3 fill-[#00F9FF] text-[#00F9FF]" />
                              <span className="text-white/70 text-xs font-space">
                                {relatedReview.rating.toFixed(1)}
                              </span>
                            </div>
                          )}
                          <p className="text-white/50 text-xs font-space">
                            {format(new Date(relatedReview.published_date), "d MMM", { locale: es })}
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
  )
}

