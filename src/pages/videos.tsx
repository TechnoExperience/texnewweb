"use client"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Clock } from "lucide-react"
import { useTranslation } from "react-i18next"

interface Video {
  id: string
  title: string
  description: string
  youtube_url: string
  thumbnail_url: string
  artist: string
  event_name: string
  video_date: string
  duration: number
  category: string
  language: string
  featured: boolean
  view_count: number
}

export default function VideosPage() {
  const { t, i18n } = useTranslation()
  const [djSets, setDjSets] = useState<Video[]>([])
  const [shortVideos, setShortVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchVideos() {
      const { data: djSetData } = await supabase
        .from("videos")
        .select("*")
        .eq("category", "dj_set")
        .eq("language", i18n.language)
        .order("video_date", { ascending: false })

      const { data: shortVideoData } = await supabase
        .from("videos")
        .select("*")
        .eq("category", "short_video")
        .eq("language", i18n.language)
        .order("video_date", { ascending: false })

      setDjSets(djSetData || [])
      setShortVideos(shortVideoData || [])
      setLoading(false)
    }

    fetchVideos()
  }, [i18n.language])

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:00`
    }
    return `${minutes}:${(seconds % 60).toString().padStart(2, "0")}`
  }

  const VideoCard = ({ video }: { video: Video }) => (
    <Link key={video.id} to={`/videos/${video.id}`}>
      <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors overflow-hidden group">
        <div className="relative aspect-video overflow-hidden">
          <img
            src={video.thumbnail_url || "/placeholder.svg?height=480&width=854"}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Play className="h-12 w-12 text-white" fill="white" />
          </div>
          <div className="absolute bottom-2 right-2 bg-black/90 px-2 py-1 rounded text-xs text-white flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDuration(video.duration)}
          </div>
          {video.featured && (
            <div className="absolute top-2 left-2 bg-white text-black px-2 py-1 rounded text-xs font-bold">
              {t("cms.featured")}
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-white text-base mb-1 line-clamp-2 group-hover:text-zinc-300 transition-colors">
            {video.title}
          </h3>
          <p className="text-sm text-zinc-400 mb-2">{video.artist}</p>
          {video.event_name && <p className="text-xs text-zinc-500 mb-2">{video.event_name}</p>}
          <p className="text-xs text-zinc-400 line-clamp-2">{video.description}</p>
        </CardContent>
      </Card>
    </Link>
  )

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-zinc-400">{t("common.loading")}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-white mb-8">{t("videos.title")}</h1>

      <Tabs defaultValue="dj-sets" className="w-full">
        <TabsList className="bg-zinc-900 border border-zinc-800 mb-8">
          <TabsTrigger value="dj-sets" className="data-[state=active]:bg-white data-[state=active]:text-black">
            {t("videos.djSets")} ({djSets.length})
          </TabsTrigger>
          <TabsTrigger value="short-videos" className="data-[state=active]:bg-white data-[state=active]:text-black">
            {t("videos.shortVideos")} ({shortVideos.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dj-sets">
          {djSets.length === 0 ? (
            <div className="text-center text-zinc-400 py-12">No hay DJ sets disponibles</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {djSets.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="short-videos">
          {shortVideos.length === 0 ? (
            <div className="text-center text-zinc-400 py-12">No hay videos cortos disponibles</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {shortVideos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
