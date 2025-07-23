import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Heart, 
  Share2, 
  Ticket, 
  Star,
  Music,
  Camera,
  MessageCircle,
  ChevronLeft,
  ExternalLink,
  User,
  Building
} from 'lucide-react';
import useSupabase from '../hooks/useSupabase';
import { Event } from '../lib/supabase';

const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { supabase } = useSupabase();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'artists' | 'media' | 'reviews'>('info');

  useEffect(() => {
    if (id) {
      fetchEventDetail(id);
    }
  }, [id]);

  const fetchEventDetail = async (eventId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          venue:venues(*),
          event_artists(
            performance_order,
            set_time,
            set_duration,
            stage,
            performance_type,
            artist:artists(*)
          ),
          media_gallery(*),
          reviews(
            *,
            author:user_profiles(*)
          ),
          comments(
            *,
            author:user_profiles(*),
            replies:comments(
              *,
              author:user_profiles(*)
            )
          )
        `)
        .eq('id', eventId)
        .single();

      if (error) {
        console.error('Error fetching event:', error);
        return;
      }

      setEvent(data);
    } catch (error) {
      console.error('Error fetching event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.title,
        text: event?.description,
        url: window.location.href,
      });
    } else {
      setShowShareModal(true);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowShareModal(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventTypeColor = (type: string) => {
    const colors = {
      'club': 'bg-neon-pink',
      'festival': 'bg-neon-yellow',
      'warehouse': 'bg-neon-mint',
      'outdoor': 'bg-green-500',
      'boat': 'bg-blue-500'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white font-bebas text-2xl">CARGANDO EVENTO...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-white font-bebas text-4xl mb-4">EVENTO NO ENCONTRADO</h1>
          <Link to="/events" className="text-neon-mint hover:text-white transition-colors">
            Volver a eventos
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
          to="/events" 
          className="inline-flex items-center text-gray-light hover:text-white transition-colors font-space text-sm mb-6"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Volver a eventos
        </Link>
      </div>

      {/* Hero Section */}
      <div className="relative h-96 md:h-[500px] overflow-hidden">
        <img 
          src={event.image_url || '/images/techno-party-neon.jpg'} 
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-60" />
        
        {/* Event Type Badge */}
        {event.event_type && (
          <div className={`absolute top-6 left-6 px-3 py-1 ${getEventTypeColor(event.event_type)} text-black font-bebas text-sm tracking-wider brutal-border`}>
            {event.event_type.toUpperCase()}
          </div>
        )}

        {/* Featured Badge */}
        {event.featured && (
          <div className="absolute top-6 right-6 px-3 py-1 bg-neon-yellow text-black font-bebas text-sm tracking-wider brutal-border">
            DESTACADO
          </div>
        )}

        {/* Event Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="container mx-auto">
            <h1 className="font-bebas text-4xl md:text-6xl text-white mb-4 tracking-wider">
              {event.title}
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-white">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-neon-mint" />
                <span className="font-space text-sm">{formatDate(event.date)}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-neon-pink" />
                <span className="font-space text-sm">{formatTime(event.time)}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-neon-yellow" />
                <span className="font-space text-sm">{event.location}</span>
              </div>
              
              {event.capacity && (
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-white" />
                  <span className="font-space text-sm">{event.capacity} personas</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-4">
          {event.ticket_url && (
            <a
              href={event.ticket_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-neon-mint text-black font-bebas text-lg tracking-wider hover:bg-transparent hover:text-neon-mint border-2 border-neon-mint transition-all duration-300 brutal-border flex items-center"
            >
              <Ticket className="mr-2 w-5 h-5" />
              COMPRAR ENTRADAS
              <ExternalLink className="ml-2 w-4 h-4" />
            </a>
          )}
          
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className={`px-6 py-3 border-2 font-bebas text-lg tracking-wider transition-all duration-300 brutal-border flex items-center ${
              isFavorite 
                ? 'bg-neon-pink text-black border-neon-pink' 
                : 'bg-transparent text-neon-pink border-neon-pink hover:bg-neon-pink hover:text-black'
            }`}
          >
            <Heart className={`mr-2 w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            {isFavorite ? 'EN FAVORITOS' : 'AGREGAR A FAVORITOS'}
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

      {/* Content Tabs */}
      <div className="container mx-auto px-4">
        <div className="border-b border-gray-dark mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'info', label: 'INFORMACIÓN', icon: Building },
              { id: 'artists', label: 'ARTISTAS', icon: User },
              { id: 'media', label: 'MULTIMEDIA', icon: Camera },
              { id: 'reviews', label: 'RESEÑAS', icon: Star }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 border-b-2 transition-colors font-bebas tracking-wider ${
                  activeTab === tab.id
                    ? 'border-neon-mint text-neon-mint'
                    : 'border-transparent text-gray-light hover:text-white'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="pb-12">
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Info */}
              <div className="lg:col-span-2 space-y-8">
                {/* Description */}
                <div>
                  <h2 className="font-bebas text-2xl text-white mb-4 tracking-wider">
                    DESCRIPCIÓN
                  </h2>
                  <p className="text-gray-light font-space leading-relaxed">
                    {event.description || 'No hay descripción disponible para este evento.'}
                  </p>
                </div>

                {/* Event Details */}
                <div>
                  <h2 className="font-bebas text-2xl text-white mb-4 tracking-wider">
                    DETALLES DEL EVENTO
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {event.genre && (
                      <div className="flex items-center space-x-3">
                        <Music className="w-5 h-5 text-neon-mint" />
                        <div>
                          <span className="text-gray-light font-space text-sm">Género:</span>
                          <span className="text-white font-space text-sm ml-2">{event.genre}</span>
                        </div>
                      </div>
                    )}
                    
                    {event.age_restriction && (
                      <div className="flex items-center space-x-3">
                        <Users className="w-5 h-5 text-neon-yellow" />
                        <div>
                          <span className="text-gray-light font-space text-sm">Edad mínima:</span>
                          <span className="text-white font-space text-sm ml-2">{event.age_restriction}+</span>
                        </div>
                      </div>
                    )}
                    
                    {event.dress_code && (
                      <div className="flex items-center space-x-3">
                        <Star className="w-5 h-5 text-neon-pink" />
                        <div>
                          <span className="text-gray-light font-space text-sm">Dress code:</span>
                          <span className="text-white font-space text-sm ml-2">{event.dress_code}</span>
                        </div>
                      </div>
                    )}
                    
                    {event.price && (
                      <div className="flex items-center space-x-3">
                        <Ticket className="w-5 h-5 text-green-500" />
                        <div>
                          <span className="text-gray-light font-space text-sm">Precio:</span>
                          <span className="text-white font-space text-sm ml-2">€{event.price}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Venue Info */}
                {event.venue && (
                  <div className="bg-gray-dark bg-opacity-30 p-6 brutal-border border-gray-dark">
                    <h3 className="font-bebas text-xl text-white mb-4 tracking-wider">
                      VENUE
                    </h3>
                    <div className="space-y-3">
                      <h4 className="text-neon-mint font-space text-lg">{event.venue.name}</h4>
                      <p className="text-gray-light font-space text-sm">{event.venue.address}</p>
                      <p className="text-gray-light font-space text-sm">{event.venue.city}, {event.venue.country}</p>
                      
                      {event.venue.capacity && (
                        <div className="flex items-center space-x-2 pt-2">
                          <Users className="w-4 h-4 text-neon-mint" />
                          <span className="text-gray-light font-space text-sm">
                            Capacidad: {event.venue.capacity} personas
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Quick Stats */}
                <div className="bg-gray-dark bg-opacity-30 p-6 brutal-border border-gray-dark">
                  <h3 className="font-bebas text-xl text-white mb-4 tracking-wider">
                    ESTADÍSTICAS
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-light font-space text-sm">Interesados:</span>
                      <span className="text-white font-space text-sm">1,234</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-light font-space text-sm">Asistirán:</span>
                      <span className="text-white font-space text-sm">892</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-light font-space text-sm">Reseñas:</span>
                      <span className="text-white font-space text-sm">{event.reviews?.length || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'artists' && (
            <div>
              <h2 className="font-bebas text-3xl text-white mb-8 tracking-wider">
                LINEUP
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {event.event_artists?.map((eventArtist, index) => (
                  <div key={index} className="bg-gray-dark bg-opacity-30 p-6 brutal-border border-gray-dark">
                    <div className="flex items-center space-x-4 mb-4">
                      <img
                        src={eventArtist.artist?.image_url || '/images/default-artist.jpg'}
                        alt={eventArtist.artist?.name}
                        className="w-16 h-16 object-cover brutal-border border-gray-dark"
                      />
                      <div>
                        <h3 className="text-white font-bebas text-lg tracking-wider">
                          {eventArtist.artist?.name}
                        </h3>
                        <p className="text-gray-light font-space text-sm">
                          {eventArtist.artist?.genre}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      {eventArtist.set_time && (
                        <div className="flex justify-between">
                          <span className="text-gray-light font-space">Horario:</span>
                          <span className="text-white font-space">{formatTime(eventArtist.set_time)}</span>
                        </div>
                      )}
                      
                      {eventArtist.stage && (
                        <div className="flex justify-between">
                          <span className="text-gray-light font-space">Escenario:</span>
                          <span className="text-white font-space">{eventArtist.stage}</span>
                        </div>
                      )}
                      
                      {eventArtist.performance_type && (
                        <div className="flex justify-between">
                          <span className="text-gray-light font-space">Tipo:</span>
                          <span className="text-white font-space">{eventArtist.performance_type}</span>
                        </div>
                      )}
                    </div>
                    
                    <Link
                      to={`/artists/${eventArtist.artist?.id}`}
                      className="mt-4 inline-block w-full text-center py-2 border border-neon-mint text-neon-mint hover:bg-neon-mint hover:text-black transition-all duration-300 font-bebas text-sm tracking-wider"
                    >
                      VER PERFIL
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'media' && (
            <div>
              <h2 className="font-bebas text-3xl text-white mb-8 tracking-wider">
                GALERÍA MULTIMEDIA
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {event.media_gallery?.map((media, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={media.media_url}
                      alt={media.title || `Media ${index + 1}`}
                      className="w-full h-64 object-cover brutal-border border-gray-dark"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button className="text-white font-bebas tracking-wider">
                        VER COMPLETA
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              <h2 className="font-bebas text-3xl text-white mb-8 tracking-wider">
                RESEÑAS Y COMENTARIOS
              </h2>
              <div className="space-y-6">
                {event.reviews?.map((review, index) => (
                  <div key={index} className="bg-gray-dark bg-opacity-30 p-6 brutal-border border-gray-dark">
                    <div className="flex items-center space-x-4 mb-4">
                      <img
                        src={review.author?.avatar_url || '/images/default-avatar.jpg'}
                        alt={review.author?.username}
                        className="w-10 h-10 object-cover rounded-full"
                      />
                      <div>
                        <h4 className="text-white font-space font-medium">
                          {review.author?.username}
                        </h4>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-light font-space text-sm leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-dark p-6 brutal-border border-gray-light max-w-md w-full mx-4">
            <h3 className="font-bebas text-xl text-white mb-4 tracking-wider">
              COMPARTIR EVENTO
            </h3>
            <div className="space-y-4">
              <button
                onClick={copyToClipboard}
                className="w-full p-3 bg-neon-mint text-black font-bebas tracking-wider hover:bg-transparent hover:text-neon-mint border-2 border-neon-mint transition-all duration-300"
              >
                COPIAR ENLACE
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

export default EventDetail; 