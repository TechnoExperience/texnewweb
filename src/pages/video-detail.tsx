import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { 
  ArrowLeft, 
  ExternalLink, 
  Clock, 
  Eye, 
  Calendar,
  Play,
  ThumbsUp,
  Maximize2,
  TrendingUp
} from "lucide-react"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { AnimatedBackground } from "@/components/animated-background"
import { ROUTES } from "@/constants/routes"
import { getEmbedFromUrl } from "@/lib/embeds"
import { EmbeddedPlayer } from "@/components/embedded-player"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { FloatingBackButton } from "@/components/floating-back-button"
import { SocialShare } from "@/components/social-share"
import { CommentsSection } from "@/components/comments-section"
import { FavoriteButton } from "@/components/favorite-button"

interface Video {
  id: string
  title: string
  description: string
  youtube_url: string
  thumbnail_url: string
  category: string
  duration: string
  published_date: string
  artist?: string
  event_name?: string
  view_count?: number
  video_type?: string
  // Nuevos campos para embeds unificados
  video_url?: string
  provider?: string
  embed_data?: any
}

export default function VideoDetailPage() {
  const { id } = useParams()
  const [video, setVideo] = useState<Video | null>(null)
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    async function fetchVideo() {
      const { data, error } = await supabase.from("videos").select("*").eq("id", id).single()

      if (error) {
        console.error("Error fetching video:", error)
      } else {
        setVideo(data)

        // Increment view count
        if (data.view_count !== undefined) {
          await supabase
            .from("videos")
            .update({ view_count: (data.view_count || 0) + 1 })
            .eq("id", id)
        }

        // Fetch related videos
        const { data: related } = await supabase
          .from("videos")
          .select("*")
          .eq("category", data.category)
          .neq("id", id)
          .order("published_date", { ascending: false })
          .limit(4)

        setRelatedVideos(related || [])
      }
      setLoading(false)
    }

    fetchVideo()
  }, [id])

  const formatDuration = (duration: string | number): string => {
    if (typeof duration === "number") {
      const hours = Math.floor(duration / 3600)
      const minutes = Math.floor((duration % 3600) / 60)
      const seconds = duration % 60
      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      }
      return `${minutes}:${seconds.toString().padStart(2, "0")}`
    }
    return duration
  }

  const extractVideoId = (url: string): string => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : ""
  }

  // const handleShareOld = async () => {
  //   const shareUrl = `${window.location.origin}/videos/${id}`
  //   if (navigator.share) {
  //     try {
  //       await navigator.share({
  //         title: video?.title,
  //         text: video?.description,
  //         url: shareUrl,
  //       })
  //     } catch (err) {
  //       console.log("Error sharing:", err)
  //     }
  //   } else {
  //     navigator.clipboard.writeText(shareUrl)
  //   }
  // }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#00F9FF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <div className="text-white/60 font-space">Cargando video...</div>
        </div>
      </div>
    )
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-white/60 font-space text-lg mb-4">Video no encontrado</div>
          <Button asChild variant="outline" className="border-white/20 text-white">
            <Link to={ROUTES.VIDEOS}>Volver a Videos</Link>
          </Button>
        </div>
      </div>
    )
  }

  const effectiveUrl = video.video_url || video.youtube_url
  const videoId = extractVideoId(video.youtube_url || "")
  const embedFromUrl = effectiveUrl ? getEmbedFromUrl(effectiveUrl) : null

  return (
    <div className="min-h-screen bg-black relative">
      <FloatingBackButton />
      <AnimatedBackground />
      <div className="relative z-10">
      {/* Navigation Bar */}
      <div className="sticky top-16 z-30 bg-black/98 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <Button asChild variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10">
              <Link to={ROUTES.VIDEOS}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a Videos
              </Link>
            </Button>

            <div className="flex items-center gap-2">
              {video && <FavoriteButton resourceType="video" resourceId={video.id} />}
              {video && (
                <SocialShare 
                  url={`/videos/${video.id}`}
                  title={video.title}
                  description={video.description}
                  image={video.thumbnail_url}
                />
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "Videos", href: ROUTES.VIDEOS },
            { label: video.title }
          ]}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Video Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <div className="relative aspect-video bg-black rounded-none overflow-hidden border border-white/10 group">
              {embedFromUrl && embedFromUrl.embed_html ? (
                <EmbeddedPlayer embed={embedFromUrl} />
              ) : (
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
              )}
              
              {/* Overlay Info */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex items-center gap-4 text-white text-sm font-space">
                  {video.duration && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{formatDuration(video.duration)}</span>
                    </div>
                  )}
                  {video.view_count && video.view_count > 0 && (
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      <span>{video.view_count.toLocaleString()} vistas</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Video Info */}
            <div className="space-y-6">
              {/* Title and Meta */}
              <div>
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <Badge className="bg-[#00F9FF] text-black border-0 px-4 py-1.5">
                    {video.category}
                  </Badge>
                  {video.video_type && (
                    <Badge className="bg-white/10 text-white border-white/20">
                      {video.video_type}
                    </Badge>
                  )}
                  {video.featured && (
                    <Badge className="bg-gradient-to-r from-[#00D9E6] to-[#00F9FF] text-black border-0">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Destacado
                    </Badge>
                  )}
                </div>

                <h1 
                  className="text-4xl md:text-5xl font-heading text-white mb-4 leading-tight"
                  style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}
                >
                  {video.title}
                </h1>

                <div className="flex items-center gap-6 text-white/60 text-sm font-space flex-wrap">
                  {video.artist && (
                    <div className="flex items-center gap-2">
                      <span className="text-white/40">Artista:</span>
                      <span className="text-white/80">{video.artist}</span>
                    </div>
                  )}
                  {video.event_name && (
                    <div className="flex items-center gap-2">
                      <span className="text-white/40">Evento:</span>
                      <span className="text-white/80">{video.event_name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {format(new Date(video.published_date), "d 'de' MMMM, yyyy", { locale: es })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white/5 border border-white/10 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-8 bg-[#00F9FF]" />
                  <h2 
                    className="text-2xl font-heading text-white"
                    style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}
                  >
                    DESCRIPCIÓN
                  </h2>
                </div>
                <p className="text-white/80 font-space leading-relaxed text-base">
                  {video.description || "No hay descripción disponible."}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 flex-wrap">
                <Button
                  asChild
                  className="bg-[#00F9FF] hover:bg-[#00D9E6] text-black"
                >
                  <a 
                    href={video.youtube_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Ver en YouTube
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </Button>
                {video && (
                  <SocialShare 
                    url={`/videos/${video.id}`}
                    title={video.title}
                    description={video.description}
                    image={video.thumbnail_url}
                  />
                )}
                <Button
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  Me gusta
                </Button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Video Stats Card */}
            <div className="bg-white/5 border border-white/10 p-6 sticky top-32">
              <h3 
                className="text-2xl font-heading text-white mb-6"
                style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}
              >
                ESTADÍSTICAS
              </h3>
              
              <div className="space-y-4">
                {video.duration && (
                  <div>
                    <p className="text-white/50 text-xs font-space uppercase mb-1">Duración</p>
                    <p className="text-white font-space text-lg">
                      {formatDuration(video.duration)}
                    </p>
                  </div>
                )}
                {video.view_count !== undefined && (
                  <div>
                    <p className="text-white/50 text-xs font-space uppercase mb-1">Visualizaciones</p>
                    <p className="text-white font-space text-lg">
                      {video.view_count.toLocaleString()}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-white/50 text-xs font-space uppercase mb-1">Categoría</p>
                  <Badge className="bg-[#00F9FF]/20 text-[#00F9FF] border-[#00F9FF]/50">
                    {video.category}
                  </Badge>
                </div>
                {video.video_type && (
                  <div>
                    <p className="text-white/50 text-xs font-space uppercase mb-1">Tipo</p>
                    <Badge className="bg-white/10 text-white border-white/20">
                      {video.video_type}
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Related Videos */}
            {relatedVideos.length > 0 && (
              <div className="bg-white/5 border border-white/10 p-6">
                <h3 
                  className="text-2xl font-heading text-white mb-6"
                  style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}
                >
                  VIDEOS RELACIONADOS
                </h3>
                <div className="space-y-4">
                  {relatedVideos.map((relatedVideo) => {
                    const relatedVideoId = extractVideoId(relatedVideo.youtube_url)
                    return (
                      <Link
                        key={relatedVideo.id}
                        to={`/videos/${relatedVideo.id}`}
                        className="block group"
                      >
                        <div className="flex gap-4">
                          <div className="relative w-32 h-20 flex-shrink-0 overflow-hidden bg-white/5 group-hover:border-[#00F9FF]/50 border border-white/10 transition-colors">
                            <OptimizedImage
                              src={relatedVideo.thumbnail_url || `https://img.youtube.com/vi/${relatedVideoId}/mqdefault.jpg`}
                              alt={relatedVideo.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                              <Play className="w-6 h-6 text-white opacity-80" />
                            </div>
                            {relatedVideo.duration && (
                              <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-xs text-white font-space">
                                {formatDuration(relatedVideo.duration)}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-heading text-sm line-clamp-2 group-hover:text-[#00F9FF] transition-colors mb-1" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>
                              {relatedVideo.title}
                            </h4>
                            <p className="text-white/50 text-xs font-space line-clamp-1">
                              {relatedVideo.artist || "TECHNO EXPERIENCE"}
                            </p>
                            {relatedVideo.view_count !== undefined && (
                              <p className="text-white/40 text-xs font-space mt-1">
                                {relatedVideo.view_count.toLocaleString()} vistas
                              </p>
                            )}
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* Comments Section */}
      {video && (
        <div className="border-t border-white/10 mt-16 pt-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
            <CommentsSection resourceType="video" resourceId={video.id} />
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
