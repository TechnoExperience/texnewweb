"use client"

import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { ArrowLeft } from "lucide-react"

interface Video {
  id: string
  title: string
  description: string
  youtube_url: string
  thumbnail_url: string
  category: string
  duration: string
  published_date: string
}

export default function VideoDetailPage() {
  const { id } = useParams()
  const [video, setVideo] = useState<Video | null>(null)
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchVideo() {
      const { data, error } = await supabase.from("videos").select("*").eq("id", id).single()

      if (error) {
        console.error("[v0] Error fetching video:", error)
      } else {
        setVideo(data)

        // Fetch related videos
        const { data: related } = await supabase
          .from("videos")
          .select("*")
          .eq("category", data.category)
          .neq("id", id)
          .limit(3)

        setRelatedVideos(related || [])
      }
      setLoading(false)
    }

    fetchVideo()
  }, [id])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-zinc-400">Cargando video...</div>
      </div>
    )
  }

  if (!video) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-zinc-400">Video no encontrado</div>
      </div>
    )
  }

  const videoId = video.youtube_url.split("v=")[1] || video.youtube_url.split("/").pop()

  return (
    <div className="container mx-auto px-4 py-8">
      <Button asChild variant="ghost" className="mb-6 text-zinc-400 hover:text-white">
        <Link to="/videos">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Videos
        </Link>
      </Button>

      <div className="max-w-5xl mx-auto">
        <div className="relative aspect-video mb-6 rounded-lg overflow-hidden bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>

        <Badge className="mb-4 bg-zinc-800 text-white">{video.category}</Badge>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 text-balance">{video.title}</h1>
        <p className="text-sm text-zinc-500 mb-6">
          Publicado el {format(new Date(video.published_date), "d 'de' MMMM, yyyy", { locale: es })}
        </p>
        <p className="text-zinc-300 leading-relaxed mb-8 text-pretty">{video.description}</p>

        {relatedVideos.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Videos Relacionados</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedVideos.map((relatedVideo) => (
                <Link key={relatedVideo.id} to={`/videos/${relatedVideo.id}`}>
                  <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors overflow-hidden group">
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={relatedVideo.thumbnail_url || "/placeholder.svg"}
                        alt={relatedVideo.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs text-white">
                        {relatedVideo.duration}
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <h3 className="font-semibold text-white text-sm line-clamp-2 group-hover:text-zinc-300 transition-colors">
                        {relatedVideo.title}
                      </h3>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
