import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, Clock, ArrowRight } from 'lucide-react';
import { Article } from '../../data/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, featured = false }) => {
  const publishedDate = article.published_at ? new Date(article.published_at) : new Date(article.created_at);
  const formattedDate = format(publishedDate, 'dd MMM yyyy', { locale: es });
  
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
      news: 'NOTICIA',
      interview: 'ENTREVISTA',
      review: 'RESEÑA', 
      feature: 'ESPECIAL'
    };
    return labels[category as keyof typeof labels] || category.toUpperCase();
  };

  return (
    <Link 
      to={`/articulos/${article.id}`}
      className={`
        group block overflow-hidden transition-all duration-300 hover:scale-105
        ${featured ? 'col-span-full lg:col-span-2' : ''}
      `}
    >
      <article className="bg-black border-2 border-gray-dark hover:border-neon-mint transition-all duration-300 h-full flex flex-col brutal-border">
        {/* Image Section */}
        <div className="relative overflow-hidden">
          <img
            src={article.image}
            alt={article.title}
            className={`
              w-full object-cover transition-transform duration-500 group-hover:scale-110
              ${featured ? 'h-64 md:h-80' : 'h-48'}
            `}
          />
          
          {/* Category Badge */}
          <div className="absolute top-4 left-4">
            <span 
              className="px-3 py-1 font-bebas text-xs tracking-wider text-black brutal-border border-2"
              style={{ 
                backgroundColor: getCategoryColor(article.category),
                borderColor: getCategoryColor(article.category)
              }}
            >
              {getCategoryLabel(article.category)}
            </span>
          </div>

          {/* Featured Badge */}
          {article.featured && (
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1 bg-neon-pink text-white font-bebas text-xs tracking-wider brutal-border border-2 border-neon-pink">
                DESTACADO
              </span>
            </div>
          )}

          {/* Reading Time Overlay */}
          <div className="absolute bottom-4 right-4 bg-black bg-opacity-90 p-2 brutal-border border-white border">
            <div className="flex items-center space-x-1 text-white">
              <Clock className="w-4 h-4" />
              <span className="font-space text-xs">
                {Math.ceil(article.content.length / 1000)} min
              </span>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 flex-1 flex flex-col">
          {/* Meta Information */}
          <div className="flex items-center space-x-4 mb-3 text-gray-light font-space text-xs">
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center space-x-1">
              <User className="w-3 h-3" />
              <span>{article.author}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className={`
            font-bebas tracking-wider text-white group-hover:text-neon-mint transition-colors duration-300 mb-2 line-clamp-2
            ${featured ? 'text-2xl md:text-3xl' : 'text-xl'}
          `}>
            {article.title}
          </h3>

          {/* Subtitle */}
          {article.subtitle && (
            <p className="text-neon-yellow font-space text-sm mb-3 line-clamp-1">
              {article.subtitle}
            </p>
          )}

          {/* Excerpt */}
          <p className="text-gray-light font-space text-sm mb-4 flex-1 line-clamp-3">
            {article.excerpt}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {article.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-dark text-white font-space text-xs border border-gray-light hover:border-white transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Read More CTA */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-gray-light font-space text-xs">
              <span>Artículo completo</span>
            </div>
            
            <div className="flex items-center space-x-2 text-neon-mint font-bebas text-sm tracking-wider group-hover:text-white transition-colors">
              <span>LEER MÁS</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default ArticleCard;
