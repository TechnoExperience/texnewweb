"use client"

import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { ArrowLeft } from "lucide-react"

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

export default function NewsDetailPage() {
  const { slug } = useParams()
  const [article, setArticle] = useState<NewsArticle | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchArticle() {
      const { data, error } = await supabase.from("news").select("*").eq("slug", slug).single()

      if (error) {
        console.error("[v0] Error fetching article:", error)
      } else {
        setArticle(data)
      }
      setLoading(false)
    }

    fetchArticle()
  }, [slug])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-zinc-400">Cargando artículo...</div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-zinc-400">Artículo no encontrado</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button asChild variant="ghost" className="mb-6 text-zinc-400 hover:text-white">
        <Link to="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Noticias
        </Link>
      </Button>

      <article className="max-w-4xl mx-auto">
        <Badge className="mb-4 bg-white text-black">{article.category}</Badge>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 text-balance">{article.title}</h1>
        <div className="flex items-center gap-4 mb-8 text-zinc-400">
          <span className="font-medium">{article.author}</span>
          <span>•</span>
          <time dateTime={article.published_date}>
            {format(new Date(article.published_date), "d 'de' MMMM, yyyy", { locale: es })}
          </time>
        </div>

        <div className="relative aspect-video mb-8 rounded-lg overflow-hidden">
          <img
            src={article.image_url || "/placeholder.svg"}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="prose prose-invert prose-lg max-w-none">
          <p className="text-xl text-zinc-300 leading-relaxed mb-6 text-pretty">{article.excerpt}</p>
          <div className="text-zinc-400 leading-relaxed whitespace-pre-line">{article.content}</div>
        </div>
      </article>
    </div>
  )
}
