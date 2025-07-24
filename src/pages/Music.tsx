import React, { useState, useEffect } from 'react';
import { Play, Pause, Download, Heart, Clock, Music as MusicIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useMusicPlayer } from '../contexts/MusicPlayerContext';
import type { MusicTrack } from '../data/types';

const Music: React.FC = () => {
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'alphabetical'>('newest');
  
  const { currentTrack, isPlaying, playTrack, isPlayerVisible } = useMusicPlayer();

  useEffect(() => {
    loadTracks();
  }, []);

  const loadTracks = async () => {
    try {
      setLoading(true);
      // Query optimizada - solo campos necesarios
      const { data, error } = await supabase
        .from('music_tracks')
        .select(`
          id,
          title,
          album,
          genre,
          duration,
          file_url,
          cover_image_url,
          play_count,
          is_featured,
          created_at,
          artist:artists(name, id)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(100); // Limitar para mejor rendimiento

      if (error) {
        console.error('Error loading tracks:', error);
        return;
      }

      setTracks(data || []);
    } catch (error) {
      console.error('Error in loadTracks:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTracks = tracks
    .filter(track => {
      const matchesSearch = track.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          track.artist?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          track.album?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesGenre = !genreFilter || track.genre === genreFilter;
      
      return matchesSearch && matchesGenre;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return (b.play_count || 0) - (a.play_count || 0);
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        case 'newest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  const uniqueGenres = [...new Set(tracks.map(track => track.genre).filter(Boolean))];

  const handlePlayTrack = (track: MusicTrack) => {
    playTrack(track, filteredTracks);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const isCurrentTrack = (track: MusicTrack) => currentTrack?.id === track.id;

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-neon-mint border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-light font-space">Cargando música...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-12" style={{ paddingBottom: isPlayerVisible ? '120px' : '48px' }}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-bebas text-6xl tracking-wider text-white mb-4">
            MÚSICA
          </h1>
          <p className="text-gray-light font-space max-w-2xl">
            Descubre los últimos lanzamientos y clásicos del techno underground. 
            Reproduce tu música favorita directamente desde nuestra plataforma.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="Buscar por título, artista o álbum..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-gray-dark border border-gray-600 text-white placeholder-gray-400 font-space focus:outline-none focus:border-neon-mint transition-colors"
            />
          </div>
          
          <select
            value={genreFilter}
            onChange={(e) => setGenreFilter(e.target.value)}
            className="px-4 py-3 bg-gray-dark border border-gray-600 text-white font-space focus:outline-none focus:border-neon-mint transition-colors"
          >
            <option value="">Todos los géneros</option>
            {uniqueGenres.map(genre => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-3 bg-gray-dark border border-gray-600 text-white font-space focus:outline-none focus:border-neon-mint transition-colors"
          >
            <option value="newest">Más recientes</option>
            <option value="popular">Más populares</option>
            <option value="alphabetical">Alfabético</option>
          </select>
        </div>

        {/* Stats */}
        <div className="mb-8 flex gap-6 text-sm font-space">
          <span className="text-gray-light">
            <span className="text-neon-mint">{filteredTracks.length}</span> canciones encontradas
          </span>
          <span className="text-gray-light">
            Total de reproducciones: <span className="text-neon-mint">
              {tracks.reduce((sum, track) => sum + (track.play_count || 0), 0).toLocaleString()}
            </span>
          </span>
        </div>

        {/* Track List */}
        {filteredTracks.length === 0 ? (
          <div className="text-center py-16">
            <MusicIcon size={64} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-light font-space">
              No se encontraron canciones que coincidan con tu búsqueda.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTracks.map((track, index) => (
              <div
                key={track.id}
                className={`group p-4 border border-gray-600 hover:border-neon-mint transition-all duration-300 ${
                  isCurrentTrack(track) ? 'border-neon-mint bg-gray-dark bg-opacity-30' : 'hover:bg-gray-dark hover:bg-opacity-20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    {/* Play Button */}
                    <button
                      onClick={() => handlePlayTrack(track)}
                      className={`w-12 h-12 flex items-center justify-center rounded-full transition-colors ${
                        isCurrentTrack(track) && isPlaying
                          ? 'bg-neon-mint text-black'
                          : 'bg-gray-600 text-white group-hover:bg-neon-mint group-hover:text-black'
                      }`}
                    >
                      {isCurrentTrack(track) && isPlaying ? (
                        <Pause size={20} />
                      ) : (
                        <Play size={20} />
                      )}
                    </button>

                    {/* Track Number */}
                    <span className="text-gray-400 font-mono text-sm w-8">
                      {(index + 1).toString().padStart(2, '0')}
                    </span>

                    {/* Cover Image */}
                    <div className="w-12 h-12 bg-gray-600 brutal-border flex-shrink-0">
                      {track.cover_image_url ? (
                        <img
                          src={track.cover_image_url}
                          alt={track.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <MusicIcon size={16} className="text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Track Info */}
                    <div className="min-w-0 flex-1">
                      <h3 className={`font-space text-sm font-medium truncate ${
                        isCurrentTrack(track) ? 'text-neon-mint' : 'text-white'
                      }`}>
                        {track.title}
                      </h3>
                      <p className="text-gray-light text-xs truncate">
                        {track.artist?.name || 'Artista Desconocido'}
                        {track.album && ` • ${track.album}`}
                      </p>
                    </div>

                    {/* Genre */}
                    {track.genre && (
                      <span className="px-2 py-1 bg-gray-600 text-gray-light text-xs font-space">
                        {track.genre}
                      </span>
                    )}

                    {/* Duration */}
                    <div className="flex items-center space-x-1 text-gray-400 text-xs font-mono">
                      <Clock size={12} />
                      <span>{formatDuration(track.duration || 0)}</span>
                    </div>

                    {/* Play Count */}
                    <span className="text-gray-400 text-xs font-mono min-w-16 text-right">
                      {(track.play_count || 0).toLocaleString()} plays
                    </span>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="text-gray-400 hover:text-neon-mint transition-colors">
                        <Heart size={16} />
                      </button>
                      {track.file_url && (
                        <a
                          href={track.file_url}
                          download
                          className="text-gray-400 hover:text-neon-mint transition-colors"
                        >
                          <Download size={16} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                {track.description && (
                  <div className="mt-2 pl-20">
                    <p className="text-gray-light text-xs font-space">
                      {track.description}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Music; 