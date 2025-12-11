import { Link } from "react-router-dom"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar, ArrowRight } from "lucide-react"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { Badge } from "@/components/ui/badge"
import type { NewsArticle } from "@/types"

interface RelatedArticlesProps {
  articles: NewsArticle[]
  currentArticleId?: string
  limit?: number
  className?: string
}

export function RelatedArticles({ articles, currentArticleId, limit = 3, className = "" }: RelatedArticlesProps) {
  const filteredArticles = articles
    .filter((article) => article.id !== currentArticleId)
    .slice(0, limit)

  if (filteredArticles.length === 0) return null

  return (
    <div className={`${className}`}>
      <h3 className="text-2xl font-bold text-white mb-6">Artículos Relacionados</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map((article) => (
          <Link
            key={article.id}
            to={`/news/${article.slug}`}
            className="group block bg-zinc-900/50 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 hover:border-[#00F9FF]/50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-[#00F9FF]/20"
          >
            <div className="relative aspect-video overflow-hidden">
              <OptimizedImage
                src={article.image_url}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <Badge className="absolute top-3 right-3 bg-[#00F9FF]/20 text-[#00F9FF] border-[#00F9FF]/30">
                {article.category}
              </Badge>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-2 text-xs text-white/60 mb-3">
                <Calendar className="w-3 h-3" />
                <time dateTime={article.published_date}>
                  {format(new Date(article.published_date), "d MMM yyyy", { locale: es })}
                </time>
              </div>
              <h4 className="text-lg font-semibold mb-3 line-clamp-2 group-hover:text-[#00F9FF] transition-colors">
                {article.title}
              </h4>
              <p className="text-sm text-white/60 line-clamp-2 mb-4">{article.excerpt}</p>
              <div className="flex items-center text-sm text-[#00F9FF] font-medium group-hover:gap-2 gap-1 transition-all">
                Leer más
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

