"use client"

import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { ArrowLeft, ExternalLink } from "lucide-react"

interface Release {
  id: string
  artist_name: string
  release_title: string
  label: string
  release_date: string
  artwork_url: string
  genre: string
  tracklist: string[]
  spotify_url: string
  beatport_url: string
  soundcloud_url: string
}

export default function ReleaseDetailPage() {
  const { id } = useParams()
  const [release, setRelease] = useState<Release | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRelease() {
      const { data, error } = await supabase.from("dj_releases").select("*").eq("id", id).single()

      if (error) {
        console.error("[v0] Error fetching release:", error)
      } else {
        setRelease(data)
      }
      setLoading(false)
    }

    fetchRelease()
  }, [id])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-zinc-400">Cargando lanzamiento...</div>
      </div>
    )
  }

  if (!release) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-zinc-400">Lanzamiento no encontrado</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button asChild variant="ghost" className="mb-6 text-zinc-400 hover:text-white">
        <Link to="/releases">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Lanzamientos
        </Link>
      </Button>

      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="relative aspect-square rounded-lg overflow-hidden">
            <img
              src={release.artwork_url || "/placeholder.svg"}
              alt={`${release.artist_name} - ${release.release_title}`}
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <Badge className="mb-4 bg-zinc-800 text-white">{release.genre}</Badge>
            <h1 className="text-4xl font-bold text-white mb-2 text-balance">{release.release_title}</h1>
            <p className="text-2xl text-zinc-300 mb-4">{release.artist_name}</p>
            <p className="text-sm text-zinc-500 mb-6">{release.label}</p>
            <p className="text-sm text-zinc-400 mb-8">
              Lanzado el {format(new Date(release.release_date), "d 'de' MMMM, yyyy", { locale: es })}
            </p>

            <div className="space-y-3">
              {release.spotify_url && (
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-zinc-700 text-white hover:bg-zinc-800 bg-transparent"
                >
                  <a href={release.spotify_url} target="_blank" rel="noopener noreferrer">
                    Escuchar en Spotify
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              )}
              {release.beatport_url && (
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-zinc-700 text-white hover:bg-zinc-800 bg-transparent"
                >
                  <a href={release.beatport_url} target="_blank" rel="noopener noreferrer">
                    Comprar en Beatport
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              )}
              {release.soundcloud_url && (
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-zinc-700 text-white hover:bg-zinc-800 bg-transparent"
                >
                  <a href={release.soundcloud_url} target="_blank" rel="noopener noreferrer">
                    Escuchar en SoundCloud
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>

        {release.tracklist && release.tracklist.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Tracklist</h2>
            <ol className="space-y-2">
              {release.tracklist.map((track, index) => (
                <li key={index} className="flex items-center gap-3 text-zinc-300">
                  <span className="text-zinc-500 font-mono text-sm w-6">{index + 1}.</span>
                  <span>{track}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  )
}
