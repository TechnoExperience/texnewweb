import { useEffect, useState, useRef } from "react"
import { useParams, Link } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { 
  ExternalLink, 
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Download,
  TrendingUp,
  Sparkles
} from "lucide-react"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { getEmbedFromUrl, detectPlayerType } from "@/lib/embeds"
import { ROUTES } from "@/constants/routes"
import { useSupabaseQuery } from "@/hooks/useSupabaseQuery"
import { TABLES } from "@/constants/tables"
import type { Release } from "@/types"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { FloatingBackButton } from "@/components/floating-back-button"
import { SocialShare } from "@/components/social-share"
import { CommentsSection } from "@/components/comments-section"
import { FavoriteButton } from "@/components/favorite-button"

export default function ReleaseDetailPage() {
  const { id } = useParams()
  const [release, setRelease] = useState<Release | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(0)
  const [selectedPlayerType, setSelectedPlayerType] = useState<"tracklist" | "embed" | null>(null)
  const vinylRef = useRef<HTMLDivElement>(null)

  // Fetch related releases by artist and label
  const { data: relatedReleases } = useSupabaseQuery<Release>(
    TABLES.RELEASES,
    (query: any) => {
      if (!release) return query.limit(0)
      return query
        .neq("id", release.id)
        .or(`artist.eq.${release.artist},label.eq.${release.label}`)
        .order("release_date", { ascending: false })
        .limit(8)
    }
  )

  useEffect(() => {
    async function fetchRelease() {
      // Intentar obtener con join a profiles si existe created_by
      let query = supabase
        .from("dj_releases")
        .select(`
          *,
          creator_profile:profiles!dj_releases_created_by_fkey(
            id,
            name,
            username,
            avatar_url
          )
        `)
        .eq("id", id)
        .single()
      
      const { data, error } = await query

      if (error) {
        console.error("Error fetching release:", error)
      } else {
        setRelease(data)
      }
      setLoading(false)
    }

    if (id) {
    fetchRelease()
    }
  }, [id])

  // Animate vinyl when playing
  useEffect(() => {
    if (vinylRef.current) {
      if (isPlaying) {
        vinylRef.current.style.animation = "spin 3s linear infinite"
      } else {
        vinylRef.current.style.animation = "none"
      }
    }
  }, [isPlaying])


  const handleTrackChange = (direction: "next" | "prev") => {
    if (!release?.tracklist || release.tracklist.length === 0) return
    
    if (direction === "next") {
      setCurrentTrack((prev) => (prev + 1) % release.tracklist!.length)
    } else {
      setCurrentTrack((prev) => (prev - 1 + release.tracklist!.length) % release.tracklist!.length)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#00F9FF] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <div className="text-white/60 font-space">Cargando lanzamiento...</div>
        </div>
      </div>
    )
  }

  if (!release) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-white/60 font-space text-lg mb-4">Lanzamiento no encontrado</div>
          <Button asChild variant="outline" className="border-white/20 text-white">
            <Link to={ROUTES.RELEASES}>Volver a Lanzamientos</Link>
          </Button>
        </div>
      </div>
    )
  }

  const releaseDate = new Date(release.release_date)
  const genres = Array.isArray(release.genre) ? release.genre : [release.genre || "Techno"]
  const tracklist = release.tracklist || []
  const hasTracks = tracklist.length > 0
  
  // Detectar tipo de reproductor (usar selección manual si existe, sino detectar automáticamente)
  const detectedPlayerType = detectPlayerType(release)
  const playerType = selectedPlayerType || detectedPlayerType
  const hasEmbed = !!(release.embed_html || release.player_url)
  
  // Obtener embed data si hay player_url
  const embedData = release.player_url ? getEmbedFromUrl(release.player_url) : null
  const embedHtml = release.embed_html || embedData?.embed_html || null

  return (
    <div className="min-h-screen bg-black relative">
      {/* Floating Back Button */}
      <FloatingBackButton />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "Lanzamientos", href: ROUTES.RELEASES },
            { label: release.title }
          ]}
        />

        {/* Vinyl Player Section */}
        <div className="mb-12">
          <div className="bg-white/5 border border-white/10 rounded-lg p-8 backdrop-blur-sm">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              {/* Vinyl Disc */}
              <div className="relative flex-shrink-0">
                <div 
                  ref={vinylRef}
                  className="relative w-64 h-64 md:w-80 md:h-80 rounded-full bg-gradient-to-br from-zinc-900 via-black to-zinc-900 border-4 border-white/30 shadow-[0_40px_100px_rgba(0,0,0,0.9),0_20px_50px_rgba(0,249,255,0.4)] overflow-hidden"
                    style={{
                    transition: "transform 0.3s ease"
                      }}
                    >
                      {/* Vinyl Grooves */}
                      <div className="absolute inset-0">
                    {[...Array(20)].map((_, i) => {
                      const radius = 50 - (i * 2.2)
                          return (
                            <div
                              key={i}
                              className="absolute rounded-full border border-white/10"
                              style={{
                                width: `${radius}%`,
                                height: `${radius}%`,
                                top: `${50 - radius/2}%`,
                                left: `${50 - radius/2}%`,
                                boxShadow: i % 2 === 0 
                              ? "inset 0 0 2px rgba(255,255,255,0.1)" 
                              : "0 0 1px rgba(255,255,255,0.05)"
                              }}
                            />
                          )
                        })}
                      </div>

                  {/* Center Label with Cover Art */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[45%] h-[45%] rounded-full bg-gradient-to-br from-zinc-800 to-black border-4 border-white/50 overflow-hidden shadow-[inset_0_0_60px_rgba(0,0,0,0.95),0_0_40px_rgba(0,249,255,0.3)]">
                        <OptimizedImage
                          src={release.cover_art || "/placeholder.svg"}
                          alt={`${release.artist} - ${release.title}`}
                          className="w-full h-full object-cover"
                          style={{
                            filter: "brightness(0.95) contrast(1.1)"
                          }}
                        />
                        
                        {/* Center Hole */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black border-2 border-white/40 shadow-[inset_0_0_20px_rgba(0,0,0,1)]" />
                  </div>

                  {/* Reflection Effect */}
                  <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/15 via-white/5 to-transparent opacity-60 rounded-t-full pointer-events-none" />
                </div>

                {/* CSS Animation for Vinyl Rotation */}
                <style>{`
                  @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                  }
                `}</style>
              </div>

              {/* Player Controls */}
              <div className="flex-1 w-full lg:w-auto">
                <div className="space-y-6">
                  {/* Track Info */}
                  <div>
                    <h1 
                      className="text-4xl md:text-5xl font-heading text-white mb-2"
                      style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}
                    >
                      {release.title}
                    </h1>
                    <h2 className="text-2xl md:text-3xl font-heading text-[#00F9FF] mb-4" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>
                      {release.artist}
                    </h2>
                    {hasTracks && (
                      <p className="text-white/70 text-sm mb-1">
                        Track {currentTrack + 1} de {tracklist.length}
                      </p>
                    )}
                    {hasTracks && (
                      <p className="text-white text-lg font-medium">
                        {tracklist[currentTrack]}
                      </p>
                    )}
                      </div>

                  {/* Player Controls */}
                  <div className="flex items-center gap-4">
                    {hasTracks && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleTrackChange("prev")}
                        className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20"
                        disabled={tracklist.length <= 1}
                      >
                        <SkipBack className="w-5 h-5" />
                      </Button>
                    )}
                    <Button
                        onClick={() => setIsPlaying(!isPlaying)}
                      className="w-16 h-16 rounded-full bg-[#00F9FF] hover:bg-[#00D9E6] text-black border-0 shadow-lg shadow-[#00F9FF]/50"
                    >
                      {isPlaying ? (
                        <Pause className="w-8 h-8" fill="currentColor" />
                      ) : (
                        <Play className="w-8 h-8 ml-1" fill="currentColor" />
                      )}
                    </Button>
                    {hasTracks && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleTrackChange("next")}
                        className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20"
                        disabled={tracklist.length <= 1}
                      >
                        <SkipForward className="w-5 h-5" />
                      </Button>
                          )}
                        </div>

                  {/* Tracklist Dropdown */}
                  {hasTracks && tracklist.length > 1 && (
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4 max-h-48 overflow-y-auto">
                      <p className="text-white/60 text-xs uppercase mb-2 font-space tracking-wider">Tracklist</p>
                      <div className="space-y-1">
                        {tracklist.map((track, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setCurrentTrack(index)
                              setIsPlaying(true)
                            }}
                            className={`w-full text-left px-3 py-2 rounded transition-colors ${
                              index === currentTrack
                                ? "bg-[#00F9FF]/20 text-[#00F9FF] border border-[#00F9FF]/50"
                                : "text-white/70 hover:text-white hover:bg-white/5"
                            }`}
                          >
                            <span className="text-sm font-space">
                              {index + 1}. {track}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="flex items-center gap-3 flex-wrap">
                    {release && (
                      <>
                        <FavoriteButton resourceType="release" resourceId={release.id} />
                        <SocialShare 
                          url={`/releases/${release.id}`}
                          title={`${release.artist} - ${release.title}`}
                          description={release.label || ""}
                          image={release.cover_art || ""}
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>
                  </div>
                </div>
              </div>

        {/* Release Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2 space-y-6">
            {/* Meta Info */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-8 bg-[#00F9FF]" />
                <h2 className="text-2xl font-heading text-white" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>
                  INFORMACIÓN
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-white/50 font-space text-xs uppercase mb-2">Sello</p>
                  <p className="text-white font-space text-lg">{release.label}</p>
                </div>
                <div>
                  <p className="text-white/50 font-space text-xs uppercase mb-2">Fecha</p>
                  <p className="text-white font-space text-lg">
                    {format(releaseDate, "d MMM yyyy", { locale: es })}
                  </p>
                </div>
                <div>
                  <p className="text-white/50 font-space text-xs uppercase mb-2">Tipo</p>
                  <p className="text-white font-space text-lg">{release.release_type || "Single"}</p>
                </div>
                <div>
                  <p className="text-white/50 font-space text-xs uppercase mb-2">Géneros</p>
                  <div className="flex flex-wrap gap-2">
                    {genres.map((genre, idx) => (
                      <Badge key={idx} className="bg-[#00F9FF]/20 text-[#00F9FF] border-[#00F9FF]/50">
                      {genre}
                    </Badge>
                  ))}
                  </div>
                </div>
              </div>
                </div>

            {/* Reproductor: Tracklist o Embed */}
            {(hasTracks || hasEmbed) && (
              <div className="bg-white/5 border border-white/10 rounded-lg p-6 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-8 bg-[#00F9FF]" />
                  <h2 className="text-2xl font-heading text-white" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>
                    REPRODUCTOR
                  </h2>
                </div>
                
                {/* Opción 1: Reproductor de Tracks (si hay tracklist y player_type es 'tracklist' o 'auto') */}
                {playerType === "tracklist" && hasTracks && (
                  <div className="space-y-4">
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <p className="text-white/60 text-xs uppercase mb-3 font-space tracking-wider">Reproducir desde Tracklist</p>
                      <div className="space-y-2">
                        {tracklist.map((track, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setCurrentTrack(index)
                              setIsPlaying(true)
                            }}
                            className={`w-full text-left px-4 py-3 rounded transition-all ${
                              index === currentTrack && isPlaying
                                ? "bg-[#00F9FF]/20 text-[#00F9FF] border border-[#00F9FF]/50"
                                : "text-white/70 hover:text-white hover:bg-white/5 border border-transparent"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {index === currentTrack && isPlaying ? (
                                <Pause className="w-4 h-4" />
                              ) : (
                                <Play className="w-4 h-4" />
                              )}
                              <span className="text-sm font-space">
                                {index + 1}. {track}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Opción 2: Embed/Iframe (si hay embed_html o player_url) */}
                {playerType === "embed" && embedHtml && (
                  <div className="space-y-4">
                    <p className="text-white/60 text-xs uppercase mb-3 font-space tracking-wider">Reproductor Embebido</p>
                    <div className="w-full aspect-video bg-black/50 rounded-lg overflow-hidden">
                      <div
                        className="w-full h-full"
                        dangerouslySetInnerHTML={{ __html: embedHtml }}
                      />
                    </div>
                  </div>
                )}

                {/* Si hay ambos, mostrar tabs para elegir */}
                {hasTracks && hasEmbed && (
                  <div className="mt-4 flex gap-2 border-b border-white/10">
                    <button
                      onClick={() => setSelectedPlayerType("tracklist")}
                      className={`px-4 py-2 text-sm font-space transition-colors ${
                        playerType === "tracklist"
                          ? "text-[#00F9FF] border-b-2 border-[#00F9FF]"
                          : "text-white/60 hover:text-white"
                      }`}
                    >
                      Tracklist
                    </button>
                    <button
                      onClick={() => setSelectedPlayerType("embed")}
                      className={`px-4 py-2 text-sm font-space transition-colors ${
                        playerType === "embed"
                          ? "text-[#00F9FF] border-b-2 border-[#00F9FF]"
                          : "text-white/60 hover:text-white"
                      }`}
                    >
                      Reproductor
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Streaming Links */}
            {(release.links?.spotify || release.links?.beatport || release.links?.soundcloud) && (
              <div className="bg-white/5 border border-white/10 rounded-lg p-6 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-[#00F9FF]" />
                  <h2 className="text-2xl font-heading text-white" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>
                    ESCUCHAR / COMPRAR
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {release.links?.spotify && (
                    <Button
                      asChild
                      className="bg-[#1DB954] hover:bg-[#1ed760] text-white h-14"
                    >
                      <a href={release.links.spotify} target="_blank" rel="noopener noreferrer">
                        <Play className="w-5 h-5 mr-2" />
                        Spotify
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </a>
                    </Button>
                  )}
                  {release.links?.beatport && (
                    <Button
                      asChild
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10 h-14"
                    >
                      <a href={release.links.beatport} target="_blank" rel="noopener noreferrer">
                        <Download className="w-5 h-5 mr-2" />
                        Beatport
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </a>
                    </Button>
                  )}
                  {release.links?.soundcloud && (
                    <Button
                      asChild
                      variant="outline"
                      className="border-[#ff7700] text-[#ff7700] hover:bg-[#ff7700]/10 h-14"
                    >
                      <a href={release.links.soundcloud} target="_blank" rel="noopener noreferrer">
                        <Play className="w-5 h-5 mr-2" />
                        SoundCloud
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-lg p-6 backdrop-blur-sm sticky top-24">
                <div className="flex items-center gap-3 mb-6">
                  <Sparkles className="w-6 h-6 text-[#00F9FF]" />
                <h3 className="text-xl font-heading text-white" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>
                  DETALLES
                  </h3>
                </div>
                <div className="space-y-4">
                {release.techno_style && (
                    <div>
                      <p className="text-white/50 font-space text-xs uppercase mb-2">Estilo</p>
                      <Badge className="bg-white/10 text-white border-white/20">
                        {release.techno_style}
                      </Badge>
                    </div>
                  )}
                {release.featured && (
                  <div>
                    <Badge className="bg-[#00F9FF] text-black">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Destacado
                    </Badge>
                  </div>
                )}
                </div>
              </div>
            </aside>
          </div>

          {/* Related Releases */}
          {relatedReleases && relatedReleases.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-1 bg-[#00F9FF]" />
              <h2 
                className="text-4xl font-heading text-white"
                style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}
                >
                  LANZAMIENTOS RELACIONADOS
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {relatedReleases.map((relatedRelease) => (
                  <Link
                    key={relatedRelease.id}
                    to={`/releases/${relatedRelease.id}`}
                    className="group block"
                  >
                  <div className="relative aspect-square bg-white/5 border border-white/10 hover:border-[#00F9FF]/50 transition-all duration-300 overflow-hidden rounded-lg">
                      <OptimizedImage
                        src={relatedRelease.cover_art || "/placeholder.svg"}
                        alt={`${relatedRelease.artist} - ${relatedRelease.title}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <h3 className="text-white font-heading text-sm line-clamp-1 mb-1" style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}>
                          {relatedRelease.title}
                        </h3>
                        <p className="text-white/80 font-space text-xs line-clamp-1">
                          {relatedRelease.artist}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

      {/* Comments Section */}
      {release && (
        <div className="border-t border-white/10 mt-16 pt-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
            <CommentsSection resourceType="release" resourceId={release.id} />
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
