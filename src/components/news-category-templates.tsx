import { Link } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { 
  ArrowRight, 
  Calendar, 
  User, 
  Mic, 
  Star, 
  MapPin, 
  Music, 
  TrendingUp,
  Building2,
  Sparkles,
  Play,
  Clock
} from "lucide-react"
import type { NewsArticle, ArticleCategory } from "@/types"

interface CategoryTemplateProps {
  articles: NewsArticle[]
  category: ArticleCategory
}

// Configuración de iconos y colores por categoría
const categoryConfig: Record<ArticleCategory, {
  icon: typeof Mic
  gradient: string
  accentColor: string
  accentColorHex: string
  description: string
}> = {
  "Entrevistas": {
    icon: Mic,
    gradient: "from-purple-600/20 via-pink-600/20 to-rose-600/20",
    accentColor: "text-purple-400",
    accentColorHex: "#a78bfa",
    description: "Conversaciones profundas con los artistas más influyentes del techno"
  },
  "Críticas": {
    icon: Star,
    gradient: "from-amber-600/20 via-orange-600/20 to-red-600/20",
    accentColor: "text-amber-400",
    accentColorHex: "#fbbf24",
    description: "Análisis detallados de lanzamientos, sets y eventos"
  },
  "Crónicas": {
    icon: MapPin,
    gradient: "from-blue-600/20 via-cyan-600/20 to-teal-600/20",
    accentColor: "text-cyan-400",
    accentColorHex: "#22d3ee",
    description: "Relatos en primera persona de los eventos más importantes"
  },
  "Tendencias": {
    icon: TrendingUp,
    gradient: "from-green-600/20 via-emerald-600/20 to-lime-600/20",
    accentColor: "text-green-400",
    accentColorHex: "#4ade80",
    description: "Lo que está marcando el futuro de la escena techno"
  },
  "Editoriales": {
    icon: Sparkles,
    gradient: "from-indigo-600/20 via-purple-600/20 to-pink-600/20",
    accentColor: "text-indigo-400",
    accentColorHex: "#818cf8",
    description: "Opiniones y reflexiones sobre la industria y la cultura"
  },
  "Festivales": {
    icon: Music,
    gradient: "from-violet-600/20 via-purple-600/20 to-fuchsia-600/20",
    accentColor: "text-violet-400",
    accentColorHex: "#a78bfa",
    description: "Cobertura completa de los festivales más importantes"
  },
  "Clubs": {
    icon: Building2,
    gradient: "from-slate-600/20 via-gray-600/20 to-zinc-600/20",
    accentColor: "text-slate-400",
    accentColorHex: "#94a3b8",
    description: "Los mejores clubs y sus historias"
  },
  "Lanzamientos": {
    icon: Play,
    gradient: "from-rose-600/20 via-pink-600/20 to-fuchsia-600/20",
    accentColor: "text-rose-400",
    accentColorHex: "#fb7185",
    description: "Los últimos lanzamientos que no te puedes perder"
  },
  "Industria": {
    icon: Building2,
    gradient: "from-sky-600/20 via-blue-600/20 to-indigo-600/20",
    accentColor: "text-sky-400",
    accentColorHex: "#38bdf8",
    description: "Noticias sobre la industria musical y tecnológica"
  },
  "Otros": {
    icon: Sparkles,
    gradient: "from-zinc-600/20 via-gray-600/20 to-slate-600/20",
    accentColor: "text-zinc-400",
    accentColorHex: "#a1a1aa",
    description: "Todo lo demás que necesitas saber"
  }
}

export function CategoryTemplate({ articles, category }: CategoryTemplateProps) {
  const config = categoryConfig[category]
  const Icon = config.icon
  const featured = articles.find(a => a.featured) || articles[0]
  const regular = articles.filter(a => a.id !== featured?.id)

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Header con gradiente específico de categoría */}
      <div className={`bg-gradient-to-b ${config.gradient} from-black via-black to-black pt-20 pb-12 relative overflow-hidden`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,249,255,0.1),transparent_50%)]" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${config.gradient} border-2 border-white/20 flex items-center justify-center backdrop-blur-sm`}>
              <Icon className={`w-8 h-8 ${config.accentColor}`} />
            </div>
            <div>
              <h1 
                className="text-5xl sm:text-6xl md:text-7xl font-bold mb-2"
                style={{ fontFamily: "'Bebas Neue', system-ui, sans-serif" }}
              >
                {category.toUpperCase()}
              </h1>
              <p className={`text-lg ${config.accentColor} font-medium`}>
                {config.description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-white/60">
            <Badge className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              {articles.length} {articles.length === 1 ? 'artículo' : 'artículos'}
            </Badge>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Actualizado recientemente</span>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Article - Diseño destacado */}
      {featured && (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 mb-12">
          <Link to={`/news/${featured.slug}`} className="group block">
            <div className={`relative rounded-2xl overflow-hidden border-2 border-white/10 hover:border-${config.accentColor.split('-')[1]}-400/50 transition-all duration-500 bg-gradient-to-br from-zinc-900 to-black shadow-2xl`}>
              <div className="grid lg:grid-cols-2 gap-0">
                <div className="relative aspect-video lg:aspect-auto lg:h-[500px] overflow-hidden">
                  <OptimizedImage
                    src={featured.image_url}
                    alt={featured.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                    <div className="absolute top-6 left-6 flex gap-2">
                    <Badge className="text-white border-0" style={{ backgroundColor: config.accentColorHex }}>
                      Destacado
                    </Badge>
                    <Badge className="bg-black/60 backdrop-blur-sm text-white border-white/20">
                      {category}
                    </Badge>
                  </div>
                </div>
                <div className="p-8 lg:p-12 flex flex-col justify-center relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${config.accentColor}`} />
                      </div>
                      <span className={`text-sm font-semibold ${config.accentColor} uppercase tracking-wider`}>
                        {category}
                      </span>
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight group-hover:text-[#00F9FF] transition-colors">
                      {featured.title}
                    </h2>
                    <p className="text-white/70 text-lg mb-8 line-clamp-4 leading-relaxed">
                      {featured.excerpt}
                    </p>
                    <div className="flex items-center gap-6 text-sm text-white/60 mb-8 pb-8 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{featured.author}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <time dateTime={featured.published_date}>
                          {format(new Date(featured.published_date), "d 'de' MMMM, yyyy", { locale: es })}
                        </time>
                      </div>
                    </div>
                    <div className="flex items-center font-semibold text-lg group-hover:gap-4 gap-2 transition-all" style={{ color: config.accentColorHex }}>
                      Leer artículo completo
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Grid de artículos */}
      {regular.length > 0 && (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <div className={`w-1 h-8 bg-gradient-to-b ${config.gradient}`} />
              Más {category}
            </h2>
            <Badge className="bg-white/5 border-white/10 text-white/70">
              {regular.length} artículos
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {regular.map((article, index) => (
              <Link
                key={article.id}
                to={`/news/${article.slug}`}
                className="group block"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <article className="h-full bg-gradient-to-br from-zinc-900 to-black rounded-xl overflow-hidden border border-white/10 hover:border-white/30 transition-all duration-300 hover:shadow-2xl hover:shadow-[#00F9FF]/10 hover:-translate-y-1">
                  <div className="relative aspect-video overflow-hidden">
                    <OptimizedImage
                      src={article.image_url}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <Badge className="backdrop-blur-sm text-white border-0" style={{ backgroundColor: `${config.accentColorHex}E6` }}>
                        {category}
                      </Badge>
                    </div>
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: config.accentColorHex }}>
                        <ArrowRight className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 text-xs text-white/60 mb-3">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        <time dateTime={article.published_date}>
                          {format(new Date(article.published_date), "d MMM yyyy", { locale: es })}
                        </time>
                      </div>
                      <span>•</span>
                      <span>Por {article.author}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-[#00F9FF] transition-colors leading-tight">
                      {article.title}
                    </h3>
                    <p className="text-sm text-white/60 line-clamp-3 mb-4 leading-relaxed">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center text-sm font-medium group-hover:gap-2 gap-1 transition-all" style={{ color: config.accentColorHex }}>
                      Leer más
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      )}

      {articles.length === 0 && (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className={`w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
            <Icon className={`w-12 h-12 ${config.accentColor}`} />
          </div>
          <h3 className="text-3xl font-bold mb-4">No hay artículos en esta categoría</h3>
          <p className="text-white/60 text-lg">
            Pronto publicaremos contenido en {category.toLowerCase()}
          </p>
        </div>
      )}
    </div>
  )
}

