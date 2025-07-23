import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  MapPin, 
  Heart, 
  Share2, 
  Play,
  Pause,
  ExternalLink,
  ChevronLeft,
  Music,
  Calendar,
  Users,
  Award,
  Instagram,
  Globe,
  Youtube,
  Volume2,
  Download
} from 'lucide-react';
import useSupabase from '../hooks/useSupabase';
import { Artist, Track, Event } from '../lib/supabase';

const ArtistDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { supabase } = useSupabase();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'about' | 'music' | 'events' | 'media'>('about');

  useEffect(() => {
    if (id) {
      fetchArtistDetail(id);
    }
  }, [id]);

  const fetchArtistDetail = async (artistId: string) => {
    setLoading(true);
    try {
      // Fetch artist info
      const { data: artistData, error: artistError } = await supabase
        .from('artists')
        .select('*')
        .eq('id', artistId)
        .single();

      if (artistError) {
        console.error('Error fetching artist:', artistError);
        return;
      }

      setArtist(artistData);

      // Fetch artist's tracks
      const { data: tracksData } = await supabase
        .from('tracks')
        .select('*')
        .eq('artist_id', artistId)
        .eq('status', 'published')
        .order('release_date', { ascending: false });

      setTracks(tracksData || []);

      // Fetch artist's upcoming events
      const { data: eventsData } = await supabase
        .from('event_artists')
        .select(`
          event:events(
            *,
            venue:venues(*)
          )
        `)
        .eq('artist_id', artistId)
        .gte('events.date', new Date().toISOString().split('T')[0]);

      setEvents(eventsData?.map(ea => ea.event).filter(Boolean) || []);
    } catch (error) {
      console.error('Error fetching artist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayPause = (trackId: string) => {
    if (currentlyPlaying === trackId) {
      setCurrentlyPlaying(null);
    } else {
      setCurrentlyPlaying(trackId);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return Instagram;
      case 'website': return Globe;
      case 'youtube': return Youtube;
      default: return ExternalLink;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white font-bebas text-2xl">CARGANDO ARTISTA...</div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-white font-bebas text-4xl mb-4">ARTISTA NO ENCONTRADO</h1>
          <Link to="/artists" className="text-neon-mint hover:text-white transition-colors">
            Volver a artistas
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
          to="/artistas" 
          className="inline-flex items-center text-gray-light hover:text-white transition-colors font-space text-sm mb-6"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Volver a artistas
        </Link>
      </div>

      {/* Artist Hero */}
      <div className="relative h-96 md:h-[500px] overflow-hidden">
        <img 
          src={artist.image_url || '/images/default-artist.jpg'} 
          alt={artist.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-60" />
        
        {/* Verified Badge */}
        {artist.verified && (
          <div className="absolute top-6 right-6 px-3 py-1 bg-neon-mint text-black font-bebas text-sm tracking-wider brutal-border flex items-center">
            <Award className="w-4 h-4 mr-1" />
            VERIFICADO
          </div>
        )}

        {/* Artist Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="container mx-auto">
            <h1 className="font-bebas text-4xl md:text-6xl text-white mb-4 tracking-wider">
              {artist.name}
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-white">
              {artist.genre && (
                <div className="flex items-center space-x-2">
                  <Music className="w-5 h-5 text-neon-mint" />
                  <span className="font-space text-sm">{artist.genre}</span>
                </div>
              )}
              
              {artist.country && (
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-neon-pink" />
                  <span className="font-space text-sm">{artist.country}</span>
                </div>
              )}
              
              {artist.followers_count && (
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-neon-yellow" />
                  <span className="font-space text-sm">{artist.followers_count.toLocaleString()} seguidores</span>
                </div>
              )}
              
              {artist.monthly_listeners && (
                <div className="flex items-center space-x-2">
                  <Volume2 className="w-5 h-5 text-white" />
                  <span className="font-space text-sm">{artist.monthly_listeners.toLocaleString()} oyentes/mes</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className={`px-6 py-3 border-2 font-bebas text-lg tracking-wider transition-all duration-300 brutal-border flex items-center ${
              isFavorite 
                ? 'bg-neon-pink text-black border-neon-pink' 
                : 'bg-transparent text-neon-pink border-neon-pink hover:bg-neon-pink hover:text-black'
            }`}
          >
            <Heart className={`mr-2 w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            {isFavorite ? 'SIGUIENDO' : 'SEGUIR'}
          </button>
          
          <button className="px-6 py-3 bg-transparent text-white border-2 border-gray-dark hover:border-white transition-all duration-300 brutal-border flex items-center">
            <Share2 className="mr-2 w-5 h-5" />
            COMPARTIR
          </button>

          {/* Social Links */}
          {artist.social_links && (
            <div className="flex gap-2">
              {Object.entries(artist.social_links).map(([platform, url]) => {
                if (!url) return null;
                const Icon = getSocialIcon(platform);
                return (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-3 bg-transparent border-2 border-gray-dark hover:border-neon-mint hover:text-neon-mint transition-all duration-300 brutal-border flex items-center"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Content Tabs */}
      <div className="container mx-auto px-4">
        <div className="border-b border-gray-dark mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'about', label: 'BIOGRAFÍA', icon: Users },
              { id: 'music', label: 'MÚSICA', icon: Music },
              { id: 'events', label: 'EVENTOS', icon: Calendar },
              { id: 'media', label: 'MULTIMEDIA', icon: Volume2 }
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
          {activeTab === 'about' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Bio */}
              <div className="lg:col-span-2 space-y-8">
                <div>
                  <h2 className="font-bebas text-2xl text-white mb-4 tracking-wider">
                    BIOGRAFÍA
                  </h2>
                  <p className="text-gray-light font-space leading-relaxed">
                    {artist.bio || 'No hay biografía disponible para este artista.'}
                  </p>
                </div>

                {/* Career Stats */}
                <div>
                  <h2 className="font-bebas text-2xl text-white mb-4 tracking-wider">
                    ESTADÍSTICAS
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gray-dark bg-opacity-30 brutal-border border-gray-dark">
                      <div className="text-2xl font-bebas text-neon-mint">{tracks.length}</div>
                      <div className="text-sm font-space text-gray-light">Tracks</div>
                    </div>
                    <div className="text-center p-4 bg-gray-dark bg-opacity-30 brutal-border border-gray-dark">
                      <div className="text-2xl font-bebas text-neon-pink">{events.length}</div>
                      <div className="text-sm font-space text-gray-light">Próximos shows</div>
                    </div>
                    <div className="text-center p-4 bg-gray-dark bg-opacity-30 brutal-border border-gray-dark">
                      <div className="text-2xl font-bebas text-neon-yellow">{artist.followers_count?.toLocaleString() || '0'}</div>
                      <div className="text-sm font-space text-gray-light">Seguidores</div>
                    </div>
                    <div className="text-center p-4 bg-gray-dark bg-opacity-30 brutal-border border-gray-dark">
                      <div className="text-2xl font-bebas text-white">{artist.monthly_listeners?.toLocaleString() || '0'}</div>
                      <div className="text-sm font-space text-gray-light">Oyentes/mes</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Artist Info */}
                <div className="bg-gray-dark bg-opacity-30 p-6 brutal-border border-gray-dark">
                  <h3 className="font-bebas text-xl text-white mb-4 tracking-wider">
                    INFORMACIÓN
                  </h3>
                  <div className="space-y-3">
                    {artist.label && (
                      <div>
                        <span className="text-gray-light font-space text-sm">Sello:</span>
                        <p className="text-white font-space text-sm">{artist.label}</p>
                      </div>
                    )}
                    
                    {artist.booking_email && (
                      <div>
                        <span className="text-gray-light font-space text-sm">Booking:</span>
                        <p className="text-white font-space text-sm">{artist.booking_email}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Latest Release */}
                {tracks.length > 0 && (
                  <div className="bg-gray-dark bg-opacity-30 p-6 brutal-border border-gray-dark">
                    <h3 className="font-bebas text-xl text-white mb-4 tracking-wider">
                      ÚLTIMO LANZAMIENTO
                    </h3>
                    <div className="space-y-3">
                      <h4 className="text-neon-mint font-space text-lg">{tracks[0].title}</h4>
                      <p className="text-gray-light font-space text-sm">{tracks[0].release_date}</p>
                      <button
                        onClick={() => handlePlayPause(tracks[0].id)}
                        className="w-full py-2 bg-neon-mint text-black font-bebas tracking-wider hover:bg-transparent hover:text-neon-mint border-2 border-neon-mint transition-all duration-300 flex items-center justify-center"
                      >
                        {currentlyPlaying === tracks[0].id ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                        {currentlyPlaying === tracks[0].id ? 'PAUSAR' : 'REPRODUCIR'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'music' && (
            <div>
              <h2 className="font-bebas text-3xl text-white mb-8 tracking-wider">
                DISCOGRAFÍA
              </h2>
              <div className="space-y-4">
                {tracks.map((track, index) => (
                  <div key={track.id} className="bg-gray-dark bg-opacity-30 p-4 brutal-border border-gray-dark">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => handlePlayPause(track.id)}
                          className="w-12 h-12 bg-neon-mint text-black rounded-full flex items-center justify-center hover:bg-transparent hover:text-neon-mint border-2 border-neon-mint transition-all duration-300"
                        >
                          {currentlyPlaying === track.id ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                        </button>
                        
                        <div>
                          <h3 className="text-white font-bebas text-lg tracking-wider">{track.title}</h3>
                          <div className="flex items-center space-x-4 text-sm">
                            {track.release_date && (
                              <span className="text-gray-light font-space">{track.release_date}</span>
                            )}
                            {track.duration && (
                              <span className="text-gray-light font-space">{formatDuration(track.duration)}</span>
                            )}
                            {track.genre && (
                              <span className="text-gray-light font-space">{track.genre}</span>
                            )}
                            {track.bpm && (
                              <span className="text-gray-light font-space">{track.bpm} BPM</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {track.downloadable && (
                          <button className="p-2 border border-gray-dark hover:border-neon-mint text-gray-light hover:text-neon-mint transition-all duration-300">
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                        
                        {track.price && (
                          <span className="text-neon-yellow font-space text-sm">€{track.price}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <div>
              <h2 className="font-bebas text-3xl text-white mb-8 tracking-wider">
                PRÓXIMOS EVENTOS
              </h2>
              <div className="space-y-6">
                {events.map((event, index) => (
                  <div key={event.id} className="bg-gray-dark bg-opacity-30 p-6 brutal-border border-gray-dark">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                      <div>
                        <div className="text-neon-mint font-bebas text-lg">
                          {new Date(event.date).toLocaleDateString('es-ES', { 
                            day: '2-digit', 
                            month: 'short' 
                          })}
                        </div>
                        <div className="text-gray-light font-space text-sm">
                          {event.time}
                        </div>
                      </div>
                      
                      <div className="md:col-span-2">
                        <h3 className="text-white font-bebas text-xl tracking-wider mb-1">
                          {event.title}
                        </h3>
                        <p className="text-gray-light font-space text-sm">
                          {event.location}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <Link
                          to={`/eventos/${event.id}`}
                          className="inline-block px-4 py-2 border border-neon-mint text-neon-mint hover:bg-neon-mint hover:text-black transition-all duration-300 font-bebas text-sm tracking-wider"
                        >
                          VER EVENTO
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'media' && (
            <div>
              <h2 className="font-bebas text-3xl text-white mb-8 tracking-wider">
                MULTIMEDIA
              </h2>
              <div className="text-center py-12">
                <Music className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-light font-space">
                  Contenido multimedia próximamente disponible
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtistDetail; 