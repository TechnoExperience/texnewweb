import { useState, useCallback, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTranslation } from "react-i18next"
import { useSupabaseQuery } from "@/hooks/useSupabaseQuery"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorMessage } from "@/components/ui/error-message"
import { VideoCard } from "@/components/video-card"
import { EmptyState } from "@/components/ui/empty-state"
import { VideosBackground } from "@/components/backgrounds/videos-background"
import { Video } from "lucide-react"
import { TABLES } from "@/constants/tables"
import type { Video as VideoType } from "@/types"
import { AdvancedFilters, type FilterState } from "@/components/advanced-filters"

export default function VideosPage() {
  const { t } = useTranslation()
  const [advancedFilters, setAdvancedFilters] = useState<FilterState>({
    search: "",
    datePreset: "all",
  })

  // Cargar TODOS los videos sin filtros restrictivos de categoría/lenguaje
  const allVideosQuery = useCallback(
    (query: any) => query.order("video_date", { ascending: false }),
    []
  )

  const djSetsQuery = useCallback(
    (query: any) =>
      query
        .eq("category", "dj_set")
        .order("video_date", { ascending: false }),
    []
  )

  const shortVideosQuery = useCallback(
    (query: any) =>
      query
        .eq("category", "short_video")
        .order("video_date", { ascending: false }),
    []
  )

  // Cargar TODOS los videos primero (sin filtros)
  const { data: allVideos, loading: loadingAll } = useSupabaseQuery<VideoType>(
    TABLES.VIDEOS,
    allVideosQuery
  )

  // Cargar videos filtrados por categoría
  const { data: djSets, loading: loadingDj, error: errorDj } = useSupabaseQuery<VideoType>(
    TABLES.VIDEOS,
    djSetsQuery
  )

  const { data: shortVideos, loading: loadingShort, error: errorShort } = useSupabaseQuery<VideoType>(
    TABLES.VIDEOS,
    shortVideosQuery
  )

  // Función para aplicar filtros avanzados
  const applyAdvancedFilters = (videos: VideoType[]) => {
    return videos.filter(video => {
      // Filtros avanzados - Fecha
      let matchesDate = true
      if (advancedFilters.dateFrom || advancedFilters.dateTo) {
        const videoDate = new Date(video.video_date || video.published_date || new Date())
        if (advancedFilters.dateFrom) {
          const fromDate = new Date(advancedFilters.dateFrom)
          fromDate.setHours(0, 0, 0, 0)
          if (videoDate < fromDate) matchesDate = false
        }
        if (advancedFilters.dateTo) {
          const toDate = new Date(advancedFilters.dateTo)
          toDate.setHours(23, 59, 59, 999)
          if (videoDate > toDate) matchesDate = false
        }
      }

      // Búsqueda avanzada
      const search = advancedFilters.search || ""
      const matchesSearch = !search ||
        video.title.toLowerCase().includes(search.toLowerCase()) ||
        video.description?.toLowerCase().includes(search.toLowerCase()) ||
        video.artist?.toLowerCase().includes(search.toLowerCase())

      return matchesDate && matchesSearch
    })
  }

  // Usar todos los videos si no hay datos filtrados, pero aplicar filtros en frontend
  const djSetsToShow = useMemo(() => {
    let videos: VideoType[] = []
    if (djSets && djSets.length > 0) {
      videos = djSets
    } else if (allVideos && allVideos.length > 0) {
      videos = allVideos.filter(v => v.category === "dj_set" || v.video_type === "dj_mix" || v.video_type === "live_set")
    }
    return applyAdvancedFilters(videos)
  }, [djSets, allVideos, advancedFilters])

  const shortVideosToShow = useMemo(() => {
    let videos: VideoType[] = []
    if (shortVideos && shortVideos.length > 0) {
      videos = shortVideos
    } else if (allVideos && allVideos.length > 0) {
      videos = allVideos.filter(v => v.category === "short_video" || v.video_type === "music_video" || v.video_type === "aftermovie")
    }
    return applyAdvancedFilters(videos)
  }, [shortVideos, allVideos, advancedFilters])

  const loading = loadingDj || loadingShort || loadingAll
  const error = errorDj || errorShort

  // Mostrar loading solo si realmente está cargando y no hay datos en cache
  if (loading && ((!djSetsToShow || djSetsToShow.length === 0) && (!shortVideosToShow || shortVideosToShow.length === 0) && (!allVideos || allVideos.length === 0))) {
    return <LoadingSpinner />
  }
  
  // Mostrar error solo si no hay datos disponibles en absoluto
  if (error && ((!djSetsToShow || djSetsToShow.length === 0) && (!shortVideosToShow || shortVideosToShow.length === 0) && (!allVideos || allVideos.length === 0))) {
    return <ErrorMessage message="Error al cargar los videos" />
  }

  return (
    <div className="min-h-screen bg-black relative">
      <VideosBackground />
      <div className="relative z-10 w-full px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-8">{t("videos.title")}</h1>

        {/* Advanced Filters */}
        <div className="mb-8">
          <AdvancedFilters
            type="videos"
            onFilterChange={setAdvancedFilters}
          />
        </div>

      <Tabs defaultValue="dj-sets" className="w-full">
        <TabsList className="bg-zinc-900 border border-zinc-800 mb-8">
          <TabsTrigger value="dj-sets" className="data-[state=active]:bg-white data-[state=active]:text-black">
            {t("videos.djSets")} ({djSetsToShow.length})
          </TabsTrigger>
          <TabsTrigger value="short-videos" className="data-[state=active]:bg-white data-[state=active]:text-black">
            {t("videos.shortVideos")} ({shortVideosToShow.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dj-sets">
          {!djSetsToShow || djSetsToShow.length === 0 ? (
            <EmptyState
              icon={Video}
              title="No hay DJ sets disponibles"
              description="Próximamente habrá más contenido disponible"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {djSetsToShow.map((video, index) => (
                <VideoCard key={video.id} video={video} index={index} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="short-videos">
          {!shortVideosToShow || shortVideosToShow.length === 0 ? (
            <EmptyState
              icon={Video}
              title="No hay videos cortos disponibles"
              description="Próximamente habrá más contenido disponible"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {shortVideosToShow.map((video, index) => (
                <VideoCard key={video.id} video={video} index={index} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      </div>
    </div>
  )
}
