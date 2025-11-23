"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTranslation } from "react-i18next"

interface Release {
  id: string
  title: string
  artist: string
  label: string
  release_date: string
  cover_art: string
  genre: string[]
  techno_style: string
  language: string
  featured: boolean
}

export default function ReleasesPage() {
  const { t, i18n } = useTranslation()
  const [releases, setReleases] = useState<Release[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStyle, setSelectedStyle] = useState<string>("all")

  useEffect(() => {
    async function fetchReleases() {
      let query = supabase
        .from("dj_releases")
        .select("*")
        .eq("language", i18n.language)
        .order("release_date", { ascending: false })

      if (selectedStyle !== "all") {
        query = query.eq("techno_style", selectedStyle)
      }

      const { data, error } = await query

      if (error) {
        console.error("[v0] Error fetching releases:", error)
      } else {
        setReleases(data || [])
      }
      setLoading(false)
    }

    fetchReleases()
  }, [i18n.language, selectedStyle])

  const technoStyles = [
    "all",
    "acid_techno",
    "detroit_techno",
    "minimal_techno",
    "hard_techno",
    "industrial_techno",
    "melodic_techno",
    "progressive_techno",
    "raw_techno",
    "peak_time_techno",
    "dub_techno",
    "ambient_techno",
    "hypnotic_techno",
    "tribal_techno",
    "experimental_techno",
  ]

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-zinc-400">{t("common.loading")}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-white mb-8">{t("releases.title")}</h1>

      <div className="mb-8">
        <h2 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wide">{t("common.filter")}</h2>
        <div className="flex flex-wrap gap-2">
          {technoStyles.map((style) => (
            <Button
              key={style}
              onClick={() => setSelectedStyle(style)}
              variant={selectedStyle === style ? "default" : "outline"}
              size="sm"
              className={
                selectedStyle === style
                  ? "bg-white text-black hover:bg-zinc-200"
                  : "border-zinc-700 text-white hover:bg-zinc-800"
              }
            >
              {t(`releases.styles.${style}`)}
            </Button>
          ))}
        </div>
      </div>

      {selectedStyle === "all" && releases.some((r) => r.featured) && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">{t("cms.featured")}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {releases
              .filter((r) => r.featured)
              .map((release) => (
                <Link key={release.id} to={`/releases/${release.id}`}>
                  <Card className="bg-zinc-900 border-zinc-800 hover:border-white transition-colors overflow-hidden group">
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={release.cover_art || "/placeholder.svg?height=600&width=600"}
                        alt={`${release.artist} - ${release.title}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-2 left-2 bg-white text-black px-2 py-1 rounded text-xs font-bold">
                        {t("cms.featured")}
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <h3 className="font-semibold text-white text-sm mb-1 line-clamp-1 group-hover:text-zinc-300 transition-colors">
                        {release.artist}
                      </h3>
                      <p className="text-xs text-zinc-400 line-clamp-1 mb-2">{release.title}</p>
                      {release.techno_style && (
                        <Badge variant="outline" className="border-zinc-700 text-zinc-400 text-xs">
                          {t(`releases.styles.${release.techno_style}`)}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
          </div>
        </div>
      )}

      <div>
        {selectedStyle === "all" && <h2 className="text-2xl font-bold text-white mb-4">{t("releases.title")}</h2>}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {releases
            .filter((r) => selectedStyle === "all" || !r.featured)
            .map((release) => (
              <Link key={release.id} to={`/releases/${release.id}`}>
                <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors overflow-hidden group">
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={release.cover_art || "/placeholder.svg?height=600&width=600"}
                      alt={`${release.artist} - ${release.title}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-semibold text-white text-sm mb-1 line-clamp-1 group-hover:text-zinc-300 transition-colors">
                      {release.artist}
                    </h3>
                    <p className="text-xs text-zinc-400 line-clamp-1 mb-1">{release.title}</p>
                    <p className="text-xs text-zinc-500 line-clamp-1">{release.label}</p>
                    {release.techno_style && (
                      <Badge variant="outline" className="border-zinc-700 text-zinc-400 text-xs mt-2">
                        {t(`releases.styles.${release.techno_style}`)}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
        </div>
      </div>

      {releases.length === 0 && (
        <div className="text-center text-zinc-400 py-12">No hay lanzamientos disponibles para este estilo</div>
      )}
    </div>
  )
}
