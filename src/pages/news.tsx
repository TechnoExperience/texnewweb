import { useState } from "react"
import { Link } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { ArrowRight, Search, Filter, TrendingUp, Calendar, User, Play, MoreHorizontal, Clock } from "lucide-react"
import { useSupabaseQuery } from "@/hooks/useSupabaseQuery"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ErrorMessage } from "@/components/ui/error-message"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { TABLES } from "@/constants/tables"
import type { NewsArticle, ArticleCategory } from "@/types"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { ROUTES } from "@/constants/routes"
import { CategoryTemplate } from "@/components/news-category-templates"
import { AdvancedFilters, type FilterState } from "@/components/advanced-filters"

export default function NewsPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedCategory, setSelectedCategory] = useState<string>("all")
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
    const [hoveredId, setHoveredId] = useState<string | null>(null)
    const [advancedFilters, setAdvancedFilters] = useState<FilterState>({
        search: "",
        datePreset: "all",
    })

    const { data: allNews, loading, error } = useSupabaseQuery<NewsArticle>(
        TABLES.NEWS,
        (query) => query.order("published_date", { ascending: false })
    )

    if (loading && (!allNews || allNews.length === 0)) {
        return <LoadingSpinner />
    }
    
    if (error && (!allNews || allNews.length === 0)) {
        return <ErrorMessage message="Error al cargar las noticias" />
    }

    // Extraer datos únicos para filtros
    const availableAuthors = Array.from(new Set(allNews.map(n => n.author).filter(Boolean))) as string[]
    const availableTags = Array.from(new Set(allNews.flatMap(n => n.tags || []))) as string[]

    const filteredNews = allNews.filter((article) => {
        // Búsqueda básica
        const search = advancedFilters.search || searchTerm
        const matchesSearch = !search || 
            article.title.toLowerCase().includes(search.toLowerCase()) ||
            article.excerpt.toLowerCase().includes(search.toLowerCase())
        
        // Categoría
        const matchesCategory = selectedCategory === "all" || article.category === selectedCategory
        
        // Filtros avanzados - Fecha
        let matchesDate = true
        if (advancedFilters.dateFrom || advancedFilters.dateTo) {
            const articleDate = new Date(article.published_date)
            if (advancedFilters.dateFrom) {
                const fromDate = new Date(advancedFilters.dateFrom)
                fromDate.setHours(0, 0, 0, 0)
                if (articleDate < fromDate) matchesDate = false
            }
            if (advancedFilters.dateTo) {
                const toDate = new Date(advancedFilters.dateTo)
                toDate.setHours(23, 59, 59, 999)
                if (articleDate > toDate) matchesDate = false
            }
        }
        
        // Filtros avanzados - Autores
        const matchesAuthors = !advancedFilters.authors || 
            advancedFilters.authors.length === 0 ||
            advancedFilters.authors.includes(article.author)
        
        // Filtros avanzados - Tags
        const matchesTags = !advancedFilters.tags ||
            advancedFilters.tags.length === 0 ||
            advancedFilters.tags.some(tag => article.tags?.includes(tag))
        
        return matchesSearch && matchesCategory && matchesDate && matchesAuthors && matchesTags
    })

    const categories = ["all", ...Array.from(new Set(allNews.map(n => n.category)))]
    const featured = filteredNews.find(n => n.featured) || filteredNews[0]
    const regularNews = filteredNews.filter(n => n.id !== featured?.id)

    // Si hay una categoría seleccionada y no hay búsqueda, usar el template de categoría
    const shouldUseCategoryTemplate = selectedCategory !== "all" && !searchTerm && filteredNews.length > 0

    // Si se debe usar el template de categoría, renderizarlo
    if (shouldUseCategoryTemplate) {
        return (
            <CategoryTemplate 
                articles={filteredNews} 
                category={selectedCategory as ArticleCategory}
            />
        )
    }

    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00F9FF]/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
            </div>

            {/* Hero Header - Modern Design */}
            <div className="relative bg-gradient-to-b from-[#00F9FF]/10 via-black/50 to-black pt-24 pb-12 border-b border-white/5">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    {/* Breadcrumbs */}
                    <Breadcrumbs items={[{ text: "Inicio", link: "/" }, { text: "Noticias" }]} />
                    
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
                        <div className="flex-1">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00F9FF] to-[#00D9E6] flex items-center justify-center shadow-lg shadow-[#00F9FF]/20">
                                    <TrendingUp className="w-8 h-8 text-black" />
                                </div>
                                <div>
                                    <h1 
                                        className="text-5xl sm:text-6xl md:text-7xl font-bold mb-2"
                                        style={{ 
                                            fontFamily: "'Bebas Neue', system-ui, sans-serif",
                                            textShadow: "0 4px 20px rgba(0, 249, 255, 0.3)"
                                        }}
                                    >
                                        NOTICIAS
                                    </h1>
                                    <p className="text-white/60 text-lg max-w-2xl">
                                        Mantente al día con las últimas novedades, lanzamientos y entrevistas del mundo techno
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Search Bar - Modern */}
                        <div className="relative w-full md:w-auto md:min-w-[400px]">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60 z-10" />
                            <Input
                                type="search"
                                placeholder="Buscar noticias, artistas, sellos..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-12 pr-4 h-14 bg-white/5 backdrop-blur-md border-white/10 text-white placeholder:text-white/40 focus:bg-white/10 focus:border-[#00F9FF]/50 rounded-xl transition-all duration-300"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters - Sticky Modern */}
            <div className="sticky top-16 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5 shadow-lg">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-5">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex-1 w-full overflow-x-auto scrollbar-hide pb-2">
                            <div className="flex items-center gap-3 min-w-max">
                                <Filter className="w-5 h-5 text-white/60 flex-shrink-0" />
                                {categories.map((category) => (
                                    <Button
                                        key={category}
                                        onClick={() => setSelectedCategory(category)}
                                        variant={selectedCategory === category ? "default" : "outline"}
                                        size="sm"
                                        className={`whitespace-nowrap transition-all duration-300 ${
                                            selectedCategory === category
                                                ? "bg-gradient-to-r from-[#00F9FF] to-[#00D9E6] text-black hover:from-[#00D9E6] hover:to-[#00F9FF] border-0 shadow-lg shadow-[#00F9FF]/30"
                                                : "border-white/10 text-white/70 hover:border-[#00F9FF]/50 hover:text-[#00F9FF] bg-white/5 backdrop-blur-sm hover:bg-white/10"
                                        }`}
                                    >
                                        {category === "all" ? "Todas" : category}
                                        {category !== "all" && (
                                            <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                                                selectedCategory === category 
                                                    ? "bg-black/20" 
                                                    : "bg-white/10"
                                            }`}>
                                                {allNews.filter(n => n.category === category).length}
                                            </span>
                                        )}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-1.5">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setViewMode("grid")}
                                className={`transition-all ${
                                    viewMode === "grid" 
                                        ? "bg-[#00F9FF]/20 text-[#00F9FF] shadow-md" 
                                        : "text-white/60 hover:text-white hover:bg-white/5"
                                }`}
                            >
                                Grid
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setViewMode("list")}
                                className={`transition-all ${
                                    viewMode === "list" 
                                        ? "bg-[#00F9FF]/20 text-[#00F9FF] shadow-md" 
                                        : "text-white/60 hover:text-white hover:bg-white/5"
                                }`}
                            >
                                Lista
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
                {/* Featured Article - Enhanced */}
                {featured && !searchTerm && selectedCategory === "all" && (
                    <div className="mb-16">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-1 h-8 bg-gradient-to-b from-[#00F9FF] to-transparent" />
                            <h2 className="text-3xl font-bold">Artículo Destacado</h2>
                        </div>
                        <Link to={`/news/${featured.slug}`} className="group block">
                            <div className="relative bg-gradient-to-br from-zinc-900/50 to-black/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-[#00F9FF]/50 transition-all duration-500 shadow-2xl hover:shadow-[#00F9FF]/20">
                                <div className="grid lg:grid-cols-2 gap-0">
                                    <div className="relative aspect-video lg:aspect-auto lg:h-[500px] overflow-hidden">
                                        <OptimizedImage
                                            src={featured.image_url}
                                            alt={featured.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                                        <div className="absolute top-6 left-6 flex gap-2">
                                            <Badge className="bg-gradient-to-r from-[#00F9FF] to-[#00D9E6] text-black border-0 shadow-lg">
                                                ⭐ Destacado
                                            </Badge>
                                            <Badge className="bg-black/60 backdrop-blur-md text-white border-white/20">
                                                {featured.category}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="p-8 lg:p-12 flex flex-col justify-center relative">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#00F9FF]/10 to-transparent rounded-bl-full" />
                                        <div className="relative z-10">
                                            <Badge variant="outline" className="w-fit mb-6 border-white/20 text-white/70 bg-white/5">
                                                {featured.category}
                                            </Badge>
                                            <h3 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight group-hover:text-[#00F9FF] transition-colors">
                                                {featured.title}
                                            </h3>
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
                                            <div className="flex items-center text-[#00F9FF] font-semibold text-lg group-hover:gap-4 gap-2 transition-all">
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

                {/* News Grid/List */}
                {regularNews.length > 0 && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold">
                                {searchTerm || selectedCategory !== "all" ? "Resultados" : "Más Noticias"}
                            </h2>
                            <span className="text-sm text-white/60 bg-white/5 px-3 py-1 rounded-full">
                                {regularNews.length} artículos
                            </span>
                        </div>

                        {viewMode === "grid" ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                                {regularNews.map((article, index) => (
                                    <Link
                                        key={article.id}
                                        to={`/news/${article.slug}`}
                                        className="group block"
                                        onMouseEnter={() => setHoveredId(article.id)}
                                        onMouseLeave={() => setHoveredId(null)}
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <article className="h-full bg-gradient-to-br from-zinc-900/80 to-black/80 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 hover:border-[#00F9FF]/50 transition-all duration-300 hover:shadow-2xl hover:shadow-[#00F9FF]/10 hover:-translate-y-1">
                                            <div className="relative aspect-video overflow-hidden">
                                                <OptimizedImage
                                                    src={article.image_url}
                                                    alt={article.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                                                <Badge className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white capitalize border-white/20">
                                                    {article.category}
                                                </Badge>
                                                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <div className="w-12 h-12 rounded-full bg-[#00F9FF] flex items-center justify-center shadow-lg">
                                                        <ArrowRight className="w-6 h-6 text-black" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-6">
                                                <div className="flex items-center gap-3 text-xs text-white/60 mb-3">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="w-3.5 h-3.5" />
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
                                                <div className="flex items-center text-[#00F9FF] text-sm font-medium group-hover:gap-2 gap-1 transition-all">
                                                    Leer más
                                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                </div>
                                            </div>
                                        </article>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            /* List View - Spotify Style */
                            <div className="space-y-1">
                                <div className="grid grid-cols-[16px_1fr_auto] gap-4 px-4 py-2 text-sm text-white/60 border-b border-white/10 mb-2">
                                    <div className="text-center">#</div>
                                    <div>TÍTULO</div>
                                    <div className="text-right">
                                        <Clock className="w-4 h-4 inline" />
                                    </div>
                                </div>
                                {regularNews.map((article, index) => (
                                    <div
                                        key={article.id}
                                        className="group grid grid-cols-[16px_1fr_auto] gap-4 px-4 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                                        onMouseEnter={() => setHoveredId(article.id)}
                                        onMouseLeave={() => setHoveredId(null)}
                                    >
                                        <div className="flex items-center justify-center text-white/60 group-hover:hidden">
                                            {index + 1}
                                        </div>
                                        <div className={`flex items-center justify-center transition-all ${
                                            hoveredId === article.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                        }`}>
                                            <Link to={`/news/${article.slug}`} className="w-8 h-8 rounded-full bg-[#00F9FF] text-black flex items-center justify-center">
                                                <Play className="w-3 h-3 ml-0.5" fill="currentColor" />
                                            </Link>
                                        </div>
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-12 h-12 rounded flex-shrink-0 overflow-hidden bg-zinc-800">
                                                <OptimizedImage
                                                    src={article.image_url}
                                                    alt={article.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <Link to={`/news/${article.slug}`}>
                                                    <div className="font-medium text-white line-clamp-1 group-hover:text-[#00F9FF] transition-colors">
                                                        {article.title}
                                                    </div>
                                                    <div className="text-sm text-white/60 line-clamp-1">
                                                        {article.excerpt}
                                                    </div>
                                                </Link>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-end gap-4">
                                            <div className="text-white/60 text-sm">
                                                {format(new Date(article.published_date), "d MMM", { locale: es })}
                                            </div>
                                            <button className="opacity-0 group-hover:opacity-100 transition-opacity text-white/60 hover:text-white">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {filteredNews.length === 0 && (
                    <div className="text-center py-20">
                        <Search className="w-16 h-16 text-white/20 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold mb-2">No se encontraron noticias</h3>
                        <p className="text-white/60 mb-4">
                            Intenta con otros términos de búsqueda o categorías
                        </p>
                        <Button
                            variant="outline"
                            onClick={() => { setSearchTerm(""); setSelectedCategory("all"); }}
                            className="border-white/20 text-white hover:bg-white/10"
                        >
                            Limpiar filtros
                        </Button>
                    </div>
                )}
            </div>

            <style>{`
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    )
}
