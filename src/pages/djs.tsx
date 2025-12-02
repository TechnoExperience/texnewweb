/**
 * DJs Page
 * Displays all DJ profiles with their custom cards
 */

import { useState, useCallback } from "react"
import { useSupabaseQuery } from "@/hooks/useSupabaseQuery"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorMessage } from "@/components/ui/error-message"
import { DJProfileCard } from "@/components/dj-profile-card"
import { Input } from "@/components/ui/input"
import { Search, Music2 } from "lucide-react"
import { TABLES } from "@/constants/tables"
import { AnimatedBackground } from "@/components/animated-background"

export default function DJsPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const queryFn = useCallback(
    (query: any) => {
      let q = query.eq("profile_type", "dj").order("created_at", { ascending: false })
      return q
    },
    []
  )

  const { data: djs, loading, error } = useSupabaseQuery<any>(
    TABLES.PROFILES,
    queryFn
  )

  const filteredDJs = djs.filter((dj: any) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      dj.nombre_artistico?.toLowerCase().includes(searchLower) ||
      dj.name?.toLowerCase().includes(searchLower) ||
      dj.city?.toLowerCase().includes(searchLower) ||
      dj.country?.toLowerCase().includes(searchLower)
    )
  })

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message="Error al cargar los DJs" />

  return (
    <div className="min-h-screen bg-black relative">
      <AnimatedBackground />
      <div className="relative z-10">
        {/* Hero Header */}
        <div className="relative py-20 md:py-28 overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00F9FF]/5 via-transparent to-transparent" />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-1 bg-[#00F9FF] transform rotate-12" />
              <Music2 className="w-12 h-12 text-[#00F9FF]" />
            </div>
            <h1
              className="text-6xl md:text-8xl font-heading text-white mb-6 leading-none"
              style={{
                fontFamily: "'Bebas Neue', system-ui, sans-serif",
                textShadow: "0 4px 20px rgba(0, 249, 255, 0.3), 0 2px 10px rgba(0, 0, 0, 0.8)",
              }}
            >
              DJS
            </h1>
            <p className="text-white/60 font-space text-lg md:text-xl max-w-2xl" style={{ textShadow: "0 2px 8px rgba(0, 0, 0, 0.6)" }}>
              Descubre los artistas de la escena techno
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="sticky top-16 z-40 bg-black/95 backdrop-blur-md border-b border-white/10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="relative max-w-xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
              <Input
                placeholder="Buscar DJs por nombre, ciudad o país..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white"
              />
            </div>
          </div>
        </div>

        {/* DJs Grid */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {filteredDJs.length === 0 ? (
            <div className="text-center py-20">
              <Music2 className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/60 font-space text-lg">
                {searchTerm ? "No se encontraron DJs con ese criterio" : "No hay DJs registrados"}
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6 text-white/70 font-space text-sm">
                {filteredDJs.length} {filteredDJs.length === 1 ? "DJ encontrado" : "DJs encontrados"}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredDJs.map((dj: any) => (
                  <DJProfileCard
                    key={dj.id}
                    id={dj.id}
                    nombre_artistico={dj.nombre_artistico}
                    name={dj.name}
                    avatar_url={dj.avatar_url}
                    bio={dj.bio}
                    city={dj.city}
                    country={dj.country}
                    profile_type={dj.profile_type}
                    card_color={dj.card_color}
                    badge_text={dj.badge_text}
                    description={dj.short_description}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

