"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface NewsArticle {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  author: string
  published_date: string
  image_url: string
  category: string
}

export default function HomePage() {
  const [news, setNews] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchNews() {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("published_date", { ascending: false })
        .limit(7)

      if (error) {
        console.error("[v0] Error fetching news:", error)
      } else {
        setNews(data || [])
      }
      setLoading(false)
    }

    fetchNews()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-zinc-400">Cargando noticias...</div>
      </div>
    )
  }

  const featured = news[0]
  const otherNews = news.slice(1)

  return (
    <div className="container mx-auto px-4 py-8">
      {featured && (
        <Link to={`/news/${featured.slug}`} className="block mb-12 group">
          <div className="relative aspect-[21/9] overflow-hidden rounded-lg mb-4">
            <img
              src={featured.image_url || "/placeholder.svg"}
              alt={featured.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-0 left-0 p-8">
              <Badge className="mb-3 bg-white text-black hover:bg-zinc-200">{featured.category}</Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 text-balance">{featured.title}</h1>
              <p className="text-lg text-zinc-300 max-w-3xl text-pretty">{featured.excerpt}</p>
              <div className="flex items-center gap-4 mt-4 text-sm text-zinc-400">
                <span>{featured.author}</span>
                <span>•</span>
                <time dateTime={featured.published_date}>
                  {format(new Date(featured.published_date), "d 'de' MMMM, yyyy", { locale: es })}
                </time>
              </div>
            </div>
          </div>
        </Link>
      )}

      <h2 className="text-2xl font-bold mb-6">Últimas Noticias</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {otherNews.map((article) => (
          <Link key={article.id} to={`/news/${article.slug}`}>
            <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors overflow-hidden group">
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={article.image_url || "/placeholder.svg"}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-4">
                <Badge className="mb-2 bg-zinc-800 text-white">{article.category}</Badge>
                <h3 className="text-lg font-semibold text-white mb-2 text-balance group-hover:text-zinc-300 transition-colors">
                  {article.title}
                </h3>
                <p className="text-sm text-zinc-400 line-clamp-2 text-pretty">{article.excerpt}</p>
                <div className="flex items-center gap-2 mt-3 text-xs text-zinc-500">
                  <span>{article.author}</span>
                  <span>•</span>
                  <time dateTime={article.published_date}>
                    {format(new Date(article.published_date), "d MMM yyyy", { locale: es })}
                  </time>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
