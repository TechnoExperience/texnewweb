import { useState, useCallback, useMemo } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useTranslation } from "react-i18next"
import { useSupabaseQuery } from "@/hooks/useSupabaseQuery"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorMessage } from "@/components/ui/error-message"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { Filter, Grid, List, Music2, Play, MoreHorizontal, Clock, Sparkles } from "lucide-react"
import { TABLES } from "@/constants/tables"
import type { Release } from "@/types"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { motion, AnimatePresence } from "framer-motion"
import { AdvancedFilters, type FilterState } from "@/components/advanced-filters"

export default function ReleasesPage() {
  const { t } = useTranslation()
  const [selectedStyle, setSelectedStyle] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [advancedFilters, setAdvancedFilters] = useState<FilterState>({
    search: "",
    datePreset: "all",
  })

  const allReleasesQuery = useCallback(
    (query: any) => query.order("release_date", { ascending: false }),
    []
  )

  const queryFn = useCallback(
    (query: any) => {
      let q = query.order("release_date", { ascending: false })
      if (selectedStyle !== "all") {
        q = q.eq("techno_style", selectedStyle)
      }
      return q
    },
    [selectedStyle]
  )

  const { data: allReleases, loading: loadingAll } = useSupabaseQuery<Release>(
    TABLES.DJ_RELEASES,
    allReleasesQuery
  )

  const { data: releases, loading, error } = useSupabaseQuery<Release>(
    TABLES.DJ_RELEASES,
    queryFn
  )

  // Extraer datos únicos para filtros
  const availableArtists = Array.from(new Set(
    (allReleases || []).map(r => r.artist).filter(Boolean)
  )) as string[]
  const availableLabels = Array.from(new Set(
    (allReleases || []).map(r => r.label).filter(Boolean)
  )) as string[]

  const releasesToShow = useMemo(() => {
    let releasesList = releases && releases.length > 0 ? releases : []
    if (releasesList.length === 0 && allReleases && allReleases.length > 0) {
      releasesList = allReleases
    }

    return releasesList.filter(release => {
      // Filtro por estilo
      if (selectedStyle !== "all" && release.techno_style !== selectedStyle) {
        return false
      }

      // Filtros avanzados - Fecha
      let matchesDate = true
      if (advancedFilters.dateFrom || advancedFilters.dateTo) {
        const releaseDate = new Date(release.release_date)
        if (advancedFilters.dateFrom) {
          const fromDate = new Date(advancedFilters.dateFrom)
          fromDate.setHours(0, 0, 0, 0)
          if (releaseDate < fromDate) matchesDate = false
        }
        if (advancedFilters.dateTo) {
          const toDate = new Date(advancedFilters.dateTo)
          toDate.setHours(23, 59, 59, 999)
          if (releaseDate > toDate) matchesDate = false
        }
      }

      // Filtros avanzados - Artistas
      const matchesArtists = !advancedFilters.artists ||
        advancedFilters.artists.length === 0 ||
        advancedFilters.artists.includes(release.artist)

      // Filtros avanzados - Sellos
      const matchesLabels = !advancedFilters.labels ||
        advancedFilters.labels.length === 0 ||
        advancedFilters.labels.includes(release.label)

      // Búsqueda avanzada
      const search = advancedFilters.search || ""
      const matchesSearch = !search ||
        release.title.toLowerCase().includes(search.toLowerCase()) ||
        release.artist.toLowerCase().includes(search.toLowerCase()) ||
        release.label.toLowerCase().includes(search.toLowerCase())

      return matchesDate && matchesArtists && matchesLabels && matchesSearch
    })
  }, [releases, allReleases, selectedStyle, advancedFilters])

  const technoStyles = [
    "all", "acid_techno", "detroit_techno", "minimal_techno", "hard_techno",
    "industrial_techno", "melodic_techno", "progressive_techno", "raw_techno",
    "peak_time_techno", "dub_techno", "ambient_techno", "hypnotic_techno", "tribal_techno", "experimental_techno",
  ]

  if ((loading || loadingAll) && (!releasesToShow || releasesToShow.length === 0) && (!allReleases || allReleases.length === 0)) {
    return <LoadingSpinner />
  }
  
  if (error && (!releasesToShow || releasesToShow.length === 0) && (!allReleases || allReleases.length === 0)) {
    return <ErrorMessage message="Error al cargar los lanzamientos" />
  }

  const featuredReleases = releasesToShow.filter((r) => r.featured).slice(0, 6)
  const regularReleases = releasesToShow.filter((r) => !r.featured || selectedStyle !== "all")

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Hero Header - Modern & Animated */}
      <div className="relative bg-gradient-to-b from-[#00F9FF]/20 via-black to-black pt-24 pb-12 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#00F9FF]/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-40 right-20 w-96 h-96 bg-[#00D9E6]/5 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-[#00F9FF]/5 rounded-full blur-3xl animate-pulse delay-2000" />
        </div>
        
        <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Advanced Filters */}
          <div className="mb-6">
            <AdvancedFilters
              type="releases"
              onFilterChange={setAdvancedFilters}
              availableArtists={availableArtists}
              availableLabels={availableLabels}
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-4 mb-6"
          >
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00F9FF] via-[#00D9E6] to-[#00F9FF] flex items-center justify-center shadow-lg shadow-[#00F9FF]/50"
            >
              <Sparkles className="w-8 h-8 text-black" />
            </motion.div>
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-5xl sm:text-6xl md:text-7xl font-bold bg-gradient-to-r from-white via-[#00F9FF] to-white bg-clip-text text-transparent"
              >
                Nuevos Lanzamientos
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-white/70 text-base sm:text-lg mt-2 max-w-2xl"
              >
                Descubre los últimos lanzamientos de la escena techno underground
              </motion.p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Filters - Sticky with Animations */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="sticky top-16 z-40 bg-black/95 backdrop-blur-md border-b border-white/10"
      >
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1 w-full overflow-x-auto scrollbar-hide">
              <div className="flex items-center gap-2 min-w-max">
                <motion.div
                  whileHover={{ rotate: 180 }}
                  transition={{ duration: 0.3 }}
                >
                  <Filter className="w-4 h-4 text-white/60 flex-shrink-0" />
                </motion.div>
                {technoStyles.map((style, index) => (
                  <motion.div
                    key={style}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                  >
                    <Button
                      onClick={() => setSelectedStyle(style)}
                      variant={selectedStyle === style ? "default" : "outline"}
                      size="sm"
                      className={`whitespace-nowrap transition-all duration-300 ${
                        selectedStyle === style
                          ? "bg-gradient-to-r from-[#00F9FF] to-[#00D9E6] text-black hover:from-[#00D9E6] hover:to-[#00F9FF] border-0 shadow-lg shadow-[#00F9FF]/30"
                          : "border-white/20 text-white/70 hover:border-[#00F9FF]/50 hover:text-[#00F9FF] bg-transparent hover:bg-white/5"
                      }`}
                    >
                      {t(`releases.styles.${style}`)}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg p-1"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("grid")}
                className={`transition-all duration-300 ${
                  viewMode === "grid" 
                    ? "bg-gradient-to-r from-[#00F9FF]/20 to-[#00D9E6]/20 text-white border border-[#00F9FF]/30" 
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("list")}
                className={`transition-all duration-300 ${
                  viewMode === "list" 
                    ? "bg-gradient-to-r from-[#00F9FF]/20 to-[#00D9E6]/20 text-white border border-[#00F9FF]/30" 
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <List className="w-4 h-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Featured Section - Enhanced with Animations */}
        {selectedStyle === "all" && featuredReleases.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#00F9FF]/50 to-transparent" />
              <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-[#00F9FF] bg-clip-text text-transparent">
                Destacados
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#00F9FF]/50 to-transparent" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-6">
              <AnimatePresence>
                {featuredReleases.map((release, index) => (
                  <motion.div
                    key={release.id}
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ 
                      duration: 0.4, 
                      delay: index * 0.1,
                      type: "spring",
                      stiffness: 100
                    }}
                    className="group cursor-pointer"
                    onMouseEnter={() => setHoveredId(release.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <Link to={`/releases/${release.id}`}>
                      <motion.div
                        whileHover={{ y: -8, scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="relative bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 backdrop-blur-sm rounded-2xl p-4 border border-white/5 hover:border-[#00F9FF]/30 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-[#00F9FF]/20"
                      >
                        <div className="relative mb-4">
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.3 }}
                            className="aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-900 shadow-2xl group-hover:shadow-[#00F9FF]/30 transition-shadow duration-300"
                          >
                            <OptimizedImage
                              src={release.cover_art || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400'}
                              alt={`${release.artist} - ${release.title}`}
                              className="w-full h-full object-cover"
                            />
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </motion.div>
                          {/* Animated Play Button */}
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{
                              opacity: hoveredId === release.id ? 1 : 0,
                              scale: hoveredId === release.id ? 1 : 0.8,
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="absolute bottom-3 right-3"
                          >
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              className="w-14 h-14 rounded-full bg-gradient-to-br from-[#00F9FF] to-[#00D9E6] text-black flex items-center justify-center shadow-lg shadow-[#00F9FF]/50"
                              onClick={(e) => {
                                e.preventDefault()
                                // Aquí puedes agregar lógica de reproducción
                              }}
                            >
                              <Play className="w-6 h-6 ml-1" fill="currentColor" />
                            </motion.button>
                          </motion.div>
                          {/* Shine Effect */}
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-bold text-white mb-1 line-clamp-1 group-hover:text-[#00F9FF] transition-colors duration-300">
                            {release.title}
                          </h3>
                          <p className="text-sm text-white/60 line-clamp-1 group-hover:text-white/80 transition-colors">
                            {release.artist}
                          </p>
                          {release.label && (
                            <p className="text-xs text-white/40 line-clamp-1">
                              {release.label}
                            </p>
                          )}
                        </div>
                        {/* Glow Effect */}
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#00F9FF]/0 to-[#00D9E6]/0 group-hover:from-[#00F9FF]/10 group-hover:to-[#00D9E6]/5 transition-all duration-300 pointer-events-none" />
                      </motion.div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* All Releases */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {selectedStyle === "all" && (
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-[#00F9FF] bg-clip-text text-transparent">
                Todos los lanzamientos
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>
          )}
          
          {viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6">
              <AnimatePresence>
                {regularReleases.map((release, index) => (
                  <motion.div
                    key={release.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ 
                      duration: 0.3, 
                      delay: index * 0.05,
                      type: "spring",
                      stiffness: 100
                    }}
                    className="group cursor-pointer"
                    onMouseEnter={() => setHoveredId(release.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <Link to={`/releases/${release.id}`}>
                      <motion.div
                        whileHover={{ y: -6, scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="relative bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 backdrop-blur-sm rounded-xl p-3 border border-white/5 hover:border-[#00F9FF]/30 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-[#00F9FF]/10"
                      >
                        <div className="relative mb-3">
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.3 }}
                            className="aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-900 shadow-xl"
                          >
                            <OptimizedImage
                              src={release.cover_art || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400'}
                              alt={`${release.artist} - ${release.title}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </motion.div>
                          {/* Animated Play Button */}
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{
                              opacity: hoveredId === release.id ? 1 : 0,
                              scale: hoveredId === release.id ? 1 : 0.8,
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="absolute bottom-2 right-2"
                          >
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00F9FF] to-[#00D9E6] text-black flex items-center justify-center shadow-lg shadow-[#00F9FF]/50"
                              onClick={(e) => {
                                e.preventDefault()
                                // Aquí puedes agregar lógica de reproducción
                              }}
                            >
                              <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
                            </motion.button>
                          </motion.div>
                          {/* Shine Effect */}
                          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-semibold text-white mb-1 line-clamp-1 group-hover:text-[#00F9FF] transition-colors duration-300 text-sm">
                            {release.title}
                          </h3>
                          <p className="text-xs text-white/60 line-clamp-1 group-hover:text-white/80 transition-colors">
                            {release.artist}
                          </p>
                        </div>
                        {/* Glow Effect */}
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#00F9FF]/0 to-[#00D9E6]/0 group-hover:from-[#00F9FF]/5 group-hover:to-[#00D9E6]/0 transition-all duration-300 pointer-events-none" />
                      </motion.div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            /* List View - Spotify Style */
            <div className="space-y-1">
              <div className="grid grid-cols-[16px_1fr_1fr_1fr_auto] gap-4 px-4 py-2 text-sm text-white/60 border-b border-white/10 mb-2">
                <div className="text-center">#</div>
                <div>TÍTULO</div>
                <div className="hidden md:block">ARTISTA</div>
                <div className="hidden lg:block">FECHA</div>
                <div className="text-right">
                  <Clock className="w-4 h-4 inline" />
                </div>
              </div>
              {regularReleases.map((release, index) => (
                <div
                  key={release.id}
                  className="group grid grid-cols-[16px_1fr_1fr_1fr_auto] gap-4 px-4 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                  onMouseEnter={() => setHoveredId(release.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <div className="flex items-center justify-center text-white/60 group-hover:hidden">
                    {index + 1}
                  </div>
                  <div className={`flex items-center justify-center transition-all ${
                    hoveredId === release.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}>
                    <button className="w-8 h-8 rounded-full bg-[#00F9FF] text-black flex items-center justify-center">
                      <Play className="w-3 h-3 ml-0.5" fill="currentColor" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded flex-shrink-0 overflow-hidden bg-zinc-800">
                      <OptimizedImage
                        src={release.cover_art || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400'}
                        alt={release.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link to={`/releases/${release.id}`}>
                        <div className="font-medium text-white line-clamp-1 group-hover:text-[#00F9FF] transition-colors">
                          {release.title}
                        </div>
                      </Link>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center text-white/60 text-sm">
                    <Link to={`/releases/${release.id}`} className="line-clamp-1 hover:underline">
                      {release.artist}
                    </Link>
                  </div>
                  <div className="hidden lg:flex items-center text-white/60 text-sm">
                    {format(new Date(release.release_date), "d MMM yyyy", { locale: es })}
                  </div>
                  <div className="flex items-center justify-end gap-4">
                    <div className="text-white/60 text-sm">--:--</div>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity text-white/60 hover:text-white">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {releasesToShow.length === 0 && (
            <div className="text-center py-20">
              <Music2 className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/60 text-lg">
                {selectedStyle !== "all" 
                  ? "No hay lanzamientos disponibles para este estilo"
                  : "No hay lanzamientos disponibles"}
              </p>
            </div>
          )}
        </motion.div>
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
