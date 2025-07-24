import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Calendar,
  Clock,
  User,
  Heart,
  Share2,
  Eye,
  MessageCircle,
  ChevronLeft,
  Tag,
  BookOpen,
  ThumbsUp,
  ExternalLink,
  Facebook,
  Twitter,
  Instagram,
  Copy,
  Check
} from 'lucide-react';
import useSupabase from '../hooks/useSupabase';
import QuickLoader from '../components/ui/QuickLoader';
import { Article, Comment } from '../lib/supabase';

const ArticleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { supabase } = useSupabase();
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (id) {
      fetchArticleDetail(id);
      updateViews(id);
    }
  }, [id]);

  const fetchArticleDetail = async (articleId: string) => {
    setLoading(true);
    try {
      // Fetch article details
      const { data: articleData, error: articleError } = await supabase
        .from('articles')
        .select(`
          *,
          author:user_profiles(*)
        `)
        .eq('id', articleId)
        .eq('published', true)
        .single();

      if (articleError) {
        console.error('Error fetching article:', articleError);
        return;
      }

      setArticle(articleData);

      // Fetch related articles
      const { data: relatedData } = await supabase
        .from('articles')
        .select('*')
        .eq('category', articleData.category)
        .eq('published', true)
        .neq('id', articleId)
        .limit(3)
        .order('created_at', { ascending: false });

      setRelatedArticles(relatedData || []);

      // Fetch comments
      const { data: commentsData } = await supabase
        .from('comments')
        .select(`
          *,
          author:user_profiles(*),
          replies:comments(
            *,
            author:user_profiles(*)
          )
        `)
        .eq('item_type', 'article')
        .eq('item_id', articleId)
        .eq('status', 'approved')
        .is('parent_id', null)
        .order('created_at', { ascending: false });

      setComments(commentsData || []);
    } catch (error) {
      console.error('Error fetching article:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateViews = async (articleId: string) => {
    try {
      await supabase.rpc('increment_article_views', { article_id: articleId });
    } catch (error) {
      console.error('Error updating views:', error);
    }
  };

  const handleLike = async () => {
    if (!article) return;
    
    try {
      const newLikesCount = isLiked ? (article.likes_count || 0) - 1 : (article.likes_count || 0) + 1;
      
      await supabase
        .from('articles')
        .update({ likes_count: newLikesCount })
        .eq('id', article.id);

      setArticle({ ...article, likes_count: newLikesCount });
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error updating likes:', error);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article?.title,
        text: article?.excerpt,
        url: window.location.href,
      });
    } else {
      setShowShareModal(true);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);
      setTimeout(() => {
        setCopySuccess(false);
        setShowShareModal(false);
      }, 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const shareToSocial = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(article?.title || '');
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`
    };

    window.open(shareUrls[platform as keyof typeof shareUrls], '_blank');
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !article) return;

    setIsSubmittingComment(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([{
          content: newComment,
          item_type: 'article',
          item_id: article.id,
          author_id: 'guest', // TODO: Implement auth
          status: 'pending'
        }])
        .select()
        .single();

      if (error) throw error;

      setNewComment('');
      // Note: Comment will appear after approval
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.split(' ').length;
    return Math.ceil(words / wordsPerMinute);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'news': 'bg-neon-mint',
      'reviews': 'bg-neon-pink',
      'interviews': 'bg-neon-yellow',
      'culture': 'bg-purple-500',
      'technology': 'bg-blue-500'
    };
    return colors[category.toLowerCase() as keyof typeof colors] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-24">
        <div className="container mx-auto px-4">
          <QuickLoader message="Cargando artículo..." size="lg" />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-white font-bebas text-4xl mb-4">ARTÍCULO NO ENCONTRADO</h1>
          <Link to="/articulos" className="text-neon-mint hover:text-white transition-colors">
            Volver a artículos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Back Button */}
      <div className="container mx-auto px-4 pt-8">
        <Link 
          to="/articulos" 
          className="inline-flex items-center text-gray-light hover:text-white transition-colors font-space text-sm mb-6"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Volver a artículos
        </Link>
      </div>

      {/* Article Header */}
      <div className="container mx-auto px-4 mb-8">
        <div className="max-w-4xl mx-auto">
          {/* Category Badge */}
          <div className={`inline-block px-3 py-1 ${getCategoryColor(article.category)} text-black font-bebas text-sm tracking-wider brutal-border mb-4`}>
            {article.category.toUpperCase()}
          </div>

          {/* Featured Badge */}
          {article.featured && (
            <div className="inline-block px-3 py-1 bg-neon-yellow text-black font-bebas text-sm tracking-wider brutal-border mb-4 ml-2">
              DESTACADO
            </div>
          )}

          <h1 className="font-bebas text-4xl md:text-6xl text-white mb-6 tracking-wider leading-tight">
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="text-xl text-gray-light font-space leading-relaxed mb-6">
              {article.excerpt}
            </p>
          )}

          {/* Article Meta */}
          <div className="flex flex-wrap items-center gap-6 text-gray-light mb-8">
            {article.author && (
              <div className="flex items-center space-x-2">
                <img
                  src={article.author.avatar_url || '/images/default-avatar.jpg'}
                  alt={article.author.username}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="font-space text-sm">{article.author.username}</span>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span className="font-space text-sm">{formatDate(article.created_at)}</span>
            </div>

            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span className="font-space text-sm">
                {article.reading_time || getReadingTime(article.content)} min lectura
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4" />
              <span className="font-space text-sm">{article.views_count || 0} vistas</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-8">
            <button
              onClick={handleLike}
              className={`px-6 py-3 border-2 font-bebas text-lg tracking-wider transition-all duration-300 brutal-border flex items-center ${
                isLiked 
                  ? 'bg-neon-pink text-black border-neon-pink' 
                  : 'bg-transparent text-neon-pink border-neon-pink hover:bg-neon-pink hover:text-black'
              }`}
            >
              <Heart className={`mr-2 w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              {article.likes_count || 0} LIKES
            </button>
            
            <button
              onClick={handleShare}
              className="px-6 py-3 bg-transparent text-white border-2 border-gray-dark hover:border-white transition-all duration-300 brutal-border flex items-center"
            >
              <Share2 className="mr-2 w-5 h-5" />
              COMPARTIR
            </button>
          </div>
        </div>
      </div>

      {/* Featured Image */}
      {article.image_url && (
        <div className="container mx-auto px-4 mb-12">
          <div className="max-w-4xl mx-auto">
            <img
              src={article.image_url}
              alt={article.title}
              className="w-full h-64 md:h-96 object-cover brutal-border border-gray-dark"
            />
          </div>
        </div>
      )}

      {/* Article Content */}
      <div className="container mx-auto px-4 mb-12">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-invert prose-lg max-w-none">
            <div 
              className="text-gray-light font-space leading-relaxed text-lg"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>
        </div>
      </div>

      {/* Tags */}
      {article.tags && article.tags.length > 0 && (
        <div className="container mx-auto px-4 mb-12">
          <div className="max-w-4xl mx-auto">
            <h3 className="font-bebas text-xl text-white mb-4 tracking-wider flex items-center">
              <Tag className="w-5 h-5 mr-2" />
              TAGS
            </h3>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-dark text-gray-light font-space text-sm border border-gray-600 hover:border-neon-mint transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Comments Section */}
      <div className="container mx-auto px-4 mb-12">
        <div className="max-w-4xl mx-auto">
          <h3 className="font-bebas text-2xl text-white mb-6 tracking-wider flex items-center">
            <MessageCircle className="w-6 h-6 mr-2" />
            COMENTARIOS ({comments.length})
          </h3>

          {/* Comment Form */}
          <form onSubmit={handleCommentSubmit} className="mb-8">
            <div className="bg-gray-dark bg-opacity-30 p-6 brutal-border border-gray-dark">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escribe tu comentario..."
                rows={4}
                className="w-full bg-black border-2 border-gray-dark text-white px-4 py-3 font-space text-sm focus:border-neon-mint focus:outline-none brutal-border resize-none mb-4"
              />
              <button
                type="submit"
                disabled={isSubmittingComment || !newComment.trim()}
                className="px-6 py-3 bg-neon-mint text-black font-bebas tracking-wider hover:bg-transparent hover:text-neon-mint border-2 border-neon-mint transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingComment ? 'ENVIANDO...' : 'ENVIAR COMENTARIO'}
              </button>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-gray-dark bg-opacity-30 p-6 brutal-border border-gray-dark">
                <div className="flex items-start space-x-4">
                  <img
                    src={comment.author?.avatar_url || '/images/default-avatar.jpg'}
                    alt={comment.author?.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="text-white font-space font-medium">
                        {comment.author?.username || 'Usuario'}
                      </h4>
                      <span className="text-gray-light font-space text-sm">
                        {formatDate(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-gray-light font-space text-sm leading-relaxed mb-3">
                      {comment.content}
                    </p>
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center space-x-1 text-gray-light hover:text-neon-mint transition-colors">
                        <ThumbsUp className="w-4 h-4" />
                        <span className="font-space text-sm">{comment.likes_count || 0}</span>
                      </button>
                      <button className="text-gray-light hover:text-white transition-colors font-space text-sm">
                        Responder
                      </button>
                    </div>

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-4 pl-6 border-l-2 border-gray-600 space-y-4">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex items-start space-x-3">
                            <img
                              src={reply.author?.avatar_url || '/images/default-avatar.jpg'}
                              alt={reply.author?.username}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <div>
                              <div className="flex items-center space-x-2 mb-1">
                                <h5 className="text-white font-space text-sm font-medium">
                                  {reply.author?.username || 'Usuario'}
                                </h5>
                                <span className="text-gray-light font-space text-xs">
                                  {formatDate(reply.created_at)}
                                </span>
                              </div>
                              <p className="text-gray-light font-space text-sm">
                                {reply.content}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <div className="container mx-auto px-4 mb-12">
          <div className="max-w-4xl mx-auto">
            <h3 className="font-bebas text-2xl text-white mb-6 tracking-wider flex items-center">
              <BookOpen className="w-6 h-6 mr-2" />
              ARTÍCULOS RELACIONADOS
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((relatedArticle) => (
                <Link
                  key={relatedArticle.id}
                  to={`/articulos/${relatedArticle.id}`}
                  className="group"
                >
                  <div className="bg-gray-dark bg-opacity-30 brutal-border border-gray-dark overflow-hidden hover:border-neon-mint transition-colors">
                    {relatedArticle.image_url && (
                      <img
                        src={relatedArticle.image_url}
                        alt={relatedArticle.title}
                        className="w-full h-32 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <div className={`inline-block px-2 py-1 ${getCategoryColor(relatedArticle.category)} text-black font-bebas text-xs tracking-wider mb-2`}>
                        {relatedArticle.category.toUpperCase()}
                      </div>
                      <h4 className="text-white font-bebas text-lg tracking-wider mb-2 group-hover:text-neon-mint transition-colors">
                        {relatedArticle.title}
                      </h4>
                      {relatedArticle.excerpt && (
                        <p className="text-gray-light font-space text-sm line-clamp-2">
                          {relatedArticle.excerpt}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-dark p-6 brutal-border border-gray-light max-w-md w-full mx-4">
            <h3 className="font-bebas text-xl text-white mb-4 tracking-wider">
              COMPARTIR ARTÍCULO
            </h3>
            <div className="space-y-4">
              <button
                onClick={() => shareToSocial('twitter')}
                className="w-full p-3 bg-blue-500 text-white font-bebas tracking-wider hover:bg-blue-600 transition-colors flex items-center justify-center"
              >
                <Twitter className="w-4 h-4 mr-2" />
                COMPARTIR EN TWITTER
              </button>
              
              <button
                onClick={() => shareToSocial('facebook')}
                className="w-full p-3 bg-blue-600 text-white font-bebas tracking-wider hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <Facebook className="w-4 h-4 mr-2" />
                COMPARTIR EN FACEBOOK
              </button>
              
              <button
                onClick={copyToClipboard}
                className="w-full p-3 bg-neon-mint text-black font-bebas tracking-wider hover:bg-transparent hover:text-neon-mint border-2 border-neon-mint transition-all duration-300 flex items-center justify-center"
              >
                {copySuccess ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {copySuccess ? 'COPIADO!' : 'COPIAR ENLACE'}
              </button>
              
              <button
                onClick={() => setShowShareModal(false)}
                className="w-full p-3 border-2 border-gray-light text-white hover:bg-white hover:text-black transition-all duration-300"
              >
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleDetail; 