import { Link } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { Play, Clock } from "lucide-react"
import type { Video } from "@/types"

interface VideoCardProps {
  video: Video
  index?: number
}

const formatDuration = (seconds: number): string => {
  if (!seconds || seconds === 0) return "0:00"
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

export function VideoCard({ video, index = 0 }: VideoCardProps) {
  return (
    <Link
      to={`/videos/${video.id}`}
      className="group block w-full"
      style={{
        scrollSnapAlign: "start",
        animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
      }}
    >
      <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors overflow-hidden group h-full">
        <div className="relative aspect-video overflow-hidden">
          <OptimizedImage
            src={video.thumbnail_url || "/placeholder.svg?height=300&width=600"}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading={index < 3 ? "eager" : "lazy"}
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Play className="h-12 w-12 text-white" fill="white" />
          </div>
          <div className="absolute bottom-2 right-2 bg-black/90 px-2 py-1 rounded text-xs text-white flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDuration(video.duration || 0)}
          </div>
          {video.featured && (
            <div className="absolute top-2 left-2 bg-white text-black px-2 py-1 rounded text-xs font-bold">
              Destacado
            </div>
          )}
          {video.status && video.status === "pend" && (
            <Badge className="absolute top-2 right-2 bg-yellow-500/90 text-black text-xs">
              Pendiente
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-white text-base mb-1 line-clamp-2 group-hover:text-zinc-300 transition-colors">
            {video.title}
          </h3>
          <p className="text-sm text-zinc-400 mb-2">{video.artist}</p>
          {video.event_name && <p className="text-xs text-zinc-500 mb-2">{video.event_name}</p>}
          {video.description && (
            <p className="text-xs text-zinc-400 line-clamp-2">{video.description}</p>
          )}
          {video.category && (
            <Badge className="mt-2 bg-zinc-800 text-zinc-300 text-xs">{video.category}</Badge>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

