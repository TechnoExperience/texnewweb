import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, BookOpen, Grid, List, Tag, Calendar, User, Eye, Clock } from 'lucide-react';
import useSupabase from '../hooks/useSupabase';
import QuickLoader from '../components/ui/QuickLoader';
import type { Article } from '../lib/supabase';

const Articles: React.FC = () => {
  const { supabase } = useSupabase();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'views'>('date');

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      // Query optimizada - solo campos necesarios
      const { data, error } = await supabase
        .from('articles')
        .select(`
          id,
          title,
          excerpt,
          image_url,
          category,
          tags,
          featured,
          reading_time,
          views_count,
          likes_count,
          created_at,
          published_at
        `)
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(50); // Limitar resultados para mejor rendimiento

      if (error) {
        console.error('Error fetching articles:', error);
        return;
      }

      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories and tags for filters
  const categories = Array.from(new Set(articles.map(article => article.category)));
  const allTags = Array.from(new Set(articles.flatMap(article => article.tags || [])));

  // Filter and sort articles
  const filteredArticles = useMemo(() => {
    let filtered = articles.filter(article => {
      const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           article.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           article.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
      const matchesTag = selectedTag === 'all' || article.tags?.includes(selectedTag);

      return matchesSearch && matchesCategory && matchesTag;
    });

    // Sort articles
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          const dateA = new Date(a.published_at || a.created_at);
          const dateB = new Date(b.published_at || b.created_at);
          return dateB.getTime() - dateA.getTime(); // Newest first
        case 'title':
          return a.title.localeCompare(b.title);
        case 'views':
          return (b.views_count || 0) - (a.views_count || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchQuery, selectedCategory, selectedTag, sortBy, articles]);

  const getCategoryColor = (category: string) => {
    const colors = {
      'news': 'bg-neon-mint',
      'reviews': 'bg-neon-pink',
      'interviews': 'bg-neon-yellow',
      'culture': 'bg-purple-500',
      'technology': 'bg-blue-500',
      'feature': 'bg-green-500'
    };
    return colors[category.toLowerCase() as keyof typeof colors] || 'bg-gray-500';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getReadingTime = (readingTime?: number) => {
    return readingTime || 5; // Valor por defecto si no hay reading_time
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-24">
        <div className="container mx-auto px-4">
          <QuickLoader message="Cargando artículos..." size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-bebas text-5xl md:text-7xl text-white mb-6 tracking-wider">
            ARTÍCULOS
          </h1>
          <p className="text-gray-light font-space text-lg max-w-2xl mx-auto">
            Explora las últimas noticias, reseñas y análisis del mundo de la música electrónica
          </p>
          <div className="mt-6 flex items-center justify-center space-x-4 text-neon-mint">
            <BookOpen className="w-5 h-5" />
            <span className="font-space text-sm">{articles.length} Artículos Publicados</span>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-gray-dark bg-opacity-30 p-6 brutal-border border-gray-dark mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-light w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar artículos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black border-2 border-gray-dark text-white pl-12 pr-4 py-3 font-space text-sm focus:border-neon-mint focus:outline-none brutal-border"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-black border-2 border-gray-dark text-white px-4 py-3 font-space text-sm focus:border-neon-mint focus:outline-none brutal-border"
            >
              <option value="all">Todas las categorías</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>

            {/* Tag Filter */}
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="w-full bg-black border-2 border-gray-dark text-white px-4 py-3 font-space text-sm focus:border-neon-mint focus:outline-none brutal-border"
            >
              <option value="all">Todos los tags</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'title' | 'views')}
              className="w-full bg-black border-2 border-gray-dark text-white px-4 py-3 font-space text-sm focus:border-neon-mint focus:outline-none brutal-border"
            >
              <option value="date">Más recientes</option>
              <option value="title">Por título</option>
              <option value="views">Más leídos</option>
            </select>

            {/* View Mode */}
            <div className="flex border-2 border-gray-dark brutal-border">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex-1 py-3 px-4 font-space text-sm transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-neon-mint text-black' 
                    : 'bg-black text-white hover:bg-gray-dark'
                }`}
              >
                <Grid className="w-4 h-4 mx-auto" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex-1 py-3 px-4 font-space text-sm transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-neon-mint text-black' 
                    : 'bg-black text-white hover:bg-gray-dark'
                }`}
              >
                <List className="w-4 h-4 mx-auto" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-gray-light font-space text-sm">
            <span>{filteredArticles.length} de {articles.length} artículos</span>
            {filteredArticles.some(article => article.featured) && (
              <span className="text-neon-pink">
                {filteredArticles.filter(article => article.featured).length} destacados
              </span>
            )}
          </div>
        </div>

        {/* Featured Articles */}
        {filteredArticles.some(article => article.featured) && (
          <div className="mb-12">
            <h2 className="font-bebas text-3xl text-white mb-6 tracking-wider flex items-center">
              <BookOpen className="w-6 h-6 mr-2 text-neon-pink" />
              ARTÍCULOS DESTACADOS
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArticles
                .filter(article => article.featured)
                .slice(0, 3)
                .map(article => (
                  <FeaturedArticleCard 
                    key={article.id} 
                    article={article}
                    getCategoryColor={getCategoryColor}
                    formatDate={formatDate}
                    getReadingTime={getReadingTime}
                  />
                ))
              }
            </div>
          </div>
        )}

        {/* Articles Grid/List */}
        <div className="mb-8">
          <h2 className="font-bebas text-3xl text-white mb-6 tracking-wider">
            TODOS LOS ARTÍCULOS
          </h2>
          
          {filteredArticles.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="font-bebas text-xl text-gray-light mb-2">
                NO SE ENCONTRARON ARTÍCULOS
              </h3>
              <p className="text-gray-light font-space text-sm">
                Prueba con diferentes filtros de búsqueda
              </p>
            </div>
          ) : (
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-6'
            }>
              {filteredArticles.map(article => (
                viewMode === 'grid' ? (
                  <ArticleGridCard 
                    key={article.id} 
                    article={article}
                    getCategoryColor={getCategoryColor}
                    formatDate={formatDate}
                    getReadingTime={getReadingTime}
                  />
                ) : (
                  <ArticleListCard 
                    key={article.id} 
                    article={article}
                    getCategoryColor={getCategoryColor}
                    formatDate={formatDate}
                    getReadingTime={getReadingTime}
                  />
                )
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Featured Article Card Component
const FeaturedArticleCard: React.FC<{
  article: Article;
  getCategoryColor: (category: string) => string;
  formatDate: (date: string) => string;
  getReadingTime: (content: string, readingTime?: number) => number;
}> = ({ article, getCategoryColor, formatDate, getReadingTime }) => (
  <Link to={`/articulos/${article.id}`} className="group">
    <div className="bg-gray-dark bg-opacity-50 brutal-border border-gray-dark overflow-hidden hover:border-neon-mint transition-all duration-300 group-hover:transform group-hover:scale-105">
      {/* Image */}
      <div className="relative overflow-hidden h-64">
        <img
          src={article.image_url || '/images/default-article.jpg'}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <div className={`${getCategoryColor(article.category)} px-3 py-1 brutal-border text-black font-bebas text-xs tracking-wider`}>
            {article.category.toUpperCase()}
          </div>
        </div>

        {/* Featured Badge */}
        <div className="absolute top-4 right-4">
          <div className="bg-neon-pink px-3 py-1 brutal-border text-black font-bebas text-xs tracking-wider">
            DESTACADO
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="font-bebas text-2xl text-white mb-2 tracking-wider group-hover:text-neon-mint transition-colors line-clamp-2">
          {article.title}
        </h3>
        
        {article.excerpt && (
          <p className="text-gray-light font-space text-sm mb-4 line-clamp-2">
            {article.excerpt}
          </p>
        )}

        {/* Meta */}
        <div className="flex items-center space-x-4 text-gray-light font-space text-xs mb-4">
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(article.published_at || article.created_at)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{getReadingTime(article.reading_time)} min</span>
          </div>
          <div className="flex items-center space-x-1">
            <Eye className="w-3 h-3" />
            <span>{article.views_count || 0}</span>
          </div>
        </div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {article.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-dark text-gray-light font-space text-xs border border-gray-600"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  </Link>
);

// Grid Article Card Component
const ArticleGridCard: React.FC<{
  article: Article;
  getCategoryColor: (category: string) => string;
  formatDate: (date: string) => string;
  getReadingTime: (readingTime?: number) => number;
}> = ({ article, getCategoryColor, formatDate, getReadingTime }) => (
  <Link to={`/articulos/${article.id}`} className="group">
    <div className="bg-gray-dark bg-opacity-30 brutal-border border-gray-dark overflow-hidden hover:border-neon-mint transition-colors">
      {/* Image */}
      <div className="relative overflow-hidden h-48">
        <img
          src={article.image_url || '/images/default-article.jpg'}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
        
        {/* Category Badge */}
        <div className="absolute top-2 left-2">
          <div className={`${getCategoryColor(article.category)} px-2 py-1 text-black font-bebas text-xs tracking-wider`}>
            {article.category.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bebas text-lg text-white mb-1 tracking-wider group-hover:text-neon-mint transition-colors line-clamp-2">
          {article.title}
        </h3>
        
        {article.excerpt && (
          <p className="text-gray-light font-space text-xs mb-3 line-clamp-2">
            {article.excerpt}
          </p>
        )}

        {/* Meta */}
        <div className="flex items-center justify-between text-gray-light font-space text-xs">
          <div className="flex items-center space-x-2">
            <span>{formatDate(article.published_at || article.created_at)}</span>
            <span>•</span>
            <span>{getReadingTime(article.reading_time)} min</span>
          </div>
          <div className="flex items-center space-x-1">
            <Eye className="w-3 h-3" />
            <span>{article.views_count || 0}</span>
          </div>
        </div>
      </div>
    </div>
  </Link>
);

// List Article Card Component
const ArticleListCard: React.FC<{
  article: Article;
  getCategoryColor: (category: string) => string;
  formatDate: (date: string) => string;
  getReadingTime: (readingTime?: number) => number;
}> = ({ article, getCategoryColor, formatDate, getReadingTime }) => (
  <Link to={`/articulos/${article.id}`} className="group">
    <div className="bg-gray-dark bg-opacity-30 brutal-border border-gray-dark p-6 hover:border-neon-mint transition-colors flex items-center space-x-6">
      {/* Image */}
      <div className="relative overflow-hidden w-48 h-32 flex-shrink-0">
        <img
          src={article.image_url || '/images/default-article.jpg'}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        
        {/* Category Badge */}
        <div className="absolute top-2 left-2">
          <div className={`${getCategoryColor(article.category)} px-2 py-1 text-black font-bebas text-xs tracking-wider`}>
            {article.category.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        <h3 className="font-bebas text-2xl text-white mb-2 tracking-wider group-hover:text-neon-mint transition-colors">
          {article.title}
        </h3>
        
        {article.excerpt && (
          <p className="text-gray-light font-space text-sm mb-4 line-clamp-3">
            {article.excerpt}
          </p>
        )}

        {/* Meta */}
        <div className="flex items-center space-x-4 text-gray-light font-space text-xs mb-3">
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(article.published_at || article.created_at)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{getReadingTime(article.reading_time)} min</span>
          </div>
          <div className="flex items-center space-x-1">
            <Eye className="w-3 h-3" />
            <span>{article.views_count || 0}</span>
          </div>
        </div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {article.tags.slice(0, 4).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-dark text-gray-light font-space text-xs border border-gray-600"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  </Link>
);

export default Articles;
