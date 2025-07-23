import React, { useState, useMemo } from 'react';
import { Search, Filter, BookOpen, Grid, List, Tag } from 'lucide-react';
import ArticleCard from '../components/ui/ArticleCard';
import { mockArticles } from '../data/mockData';

const Articles: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'author'>('date');

  // Get unique categories and tags for filters
  const categories = Array.from(new Set(mockArticles.map(article => article.category)));
  const allTags = Array.from(new Set(mockArticles.flatMap(article => article.tags)));

  // Filter and sort articles
  const filteredArticles = useMemo(() => {
    let filtered = mockArticles.filter(article => {
      const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           article.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
      const matchesTag = selectedTag === 'all' || article.tags.includes(selectedTag);

      return matchesSearch && matchesCategory && matchesTag && article.published;
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
        case 'author':
          return a.author.localeCompare(b.author);
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchQuery, selectedCategory, selectedTag, sortBy]);

  const getCategoryColor = (category: string) => {
    const colors = {
      news: '#00CED1',
      interview: '#8A2BE2',
      review: '#00FF00',
      feature: '#F2FF00'
    };
    return colors[category as keyof typeof colors] || '#FFFFFF';
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      news: 'NOTICIAS',
      interview: 'ENTREVISTAS',
      review: 'RESEÑAS',
      feature: 'ESPECIALES'
    };
    return labels[category as keyof typeof labels] || category.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-black pt-8">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="mb-component">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-category-music brutal-border border-category-music flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-bebas text-4xl md:text-6xl tracking-wider text-white">
              CONTENIDO EDITORIAL
            </h1>
          </div>
          <p className="text-gray-light font-space text-lg max-w-3xl">
            Análisis profundo de la cultura techno, entrevistas exclusivas con artistas 
            y las últimas novedades de la escena underground global.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-component">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 font-bebas text-sm tracking-wider brutal-border transition-all duration-300 ${
              selectedCategory === 'all'
                ? 'bg-white text-black border-white'
                : 'bg-transparent text-white border-gray-dark hover:border-white'
            }`}
          >
            TODOS
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 font-bebas text-sm tracking-wider brutal-border transition-all duration-300 ${
                selectedCategory === category
                  ? 'text-black border-2'
                  : 'bg-transparent text-white border-gray-dark hover:border-white'
              }`}
              style={{
                backgroundColor: selectedCategory === category ? getCategoryColor(category) : 'transparent',
                borderColor: selectedCategory === category ? getCategoryColor(category) : ''
              }}
            >
              {getCategoryLabel(category)}
            </button>
          ))}
        </div>

        {/* Filters and Search */}
        <div className="bg-gray-dark bg-opacity-50 p-6 mb-component brutal-border border-gray-dark">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar artículos, autores, contenido..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black border-2 border-gray-dark text-white px-4 py-3 pr-10 font-space text-sm focus:border-neon-mint focus:outline-none brutal-border"
                />
                <Search className="absolute right-3 top-3.5 w-4 h-4 text-gray-light" />
              </div>
            </div>

            {/* Tag Filter */}
            <div>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full bg-black border-2 border-gray-dark text-white px-4 py-3 font-space text-sm focus:border-neon-mint focus:outline-none brutal-border"
              >
                <option value="all">Todos los tags</option>
                {allTags.slice(0, 10).map(tag => (
                  <option key={tag} value={tag}>
                    #{tag}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sort and View Options */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <span className="text-gray-light font-space text-sm">Ordenar por:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'title' | 'author')}
                className="bg-black border border-gray-dark text-white px-3 py-1 font-space text-sm brutal-border"
              >
                <option value="date">Fecha</option>
                <option value="title">Título</option>
                <option value="author">Autor</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-gray-light font-space text-sm">Vista:</span>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 border brutal-border transition-colors ${
                  viewMode === 'grid' 
                    ? 'border-neon-mint text-neon-mint' 
                    : 'border-gray-dark text-gray-light hover:border-white hover:text-white'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 border brutal-border transition-colors ${
                  viewMode === 'list' 
                    ? 'border-neon-mint text-neon-mint' 
                    : 'border-gray-dark text-gray-light hover:border-white hover:text-white'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div className="mb-6">
          <p className="text-gray-light font-space text-sm">
            {filteredArticles.length} artículos encontrados
          </p>
        </div>

        {/* Articles Grid/List */}
        {filteredArticles.length > 0 ? (
          <div className={viewMode === 'grid' ? 'grid-techno' : 'space-y-6'}>
            {filteredArticles.map((article) => (
              <ArticleCard 
                key={article.id} 
                article={article} 
                featured={article.featured && viewMode === 'grid'} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-dark brutal-border border-gray-dark flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-gray-light" />
            </div>
            <h3 className="font-bebas text-2xl tracking-wider text-white mb-2">
              NO SE ENCONTRARON ARTÍCULOS
            </h3>
            <p className="text-gray-light font-space text-sm max-w-md mx-auto">
              Prueba ajustando los filtros o busca con términos diferentes.
            </p>
          </div>
        )}

        {/* Popular Tags Section */}
        <section className="mt-section py-component bg-gray-dark bg-opacity-30">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-neon-pink brutal-border border-neon-pink flex items-center justify-center">
              <Tag className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-bebas text-2xl tracking-wider text-white">
              TAGS POPULARES
            </h3>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {allTags.slice(0, 15).map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1 font-space text-sm brutal-border transition-colors ${
                  selectedTag === tag
                    ? 'bg-neon-pink text-white border-neon-pink'
                    : 'bg-transparent text-gray-light border-gray-dark hover:border-white hover:text-white'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </section>

        {/* Load More Button */}
        {filteredArticles.length > 0 && (
          <div className="text-center mt-12">
            <button className="px-8 py-4 border-2 border-neon-mint text-neon-mint font-bebas text-lg tracking-wider hover:bg-neon-mint hover:text-black transition-all duration-300 brutal-border">
              CARGAR MÁS ARTÍCULOS
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Articles;
