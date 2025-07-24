import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Users, Play, Instagram, Music, MapPin, ExternalLink, Loader2, Heart, Verified } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Artist } from '../lib/supabase';

const Artists: React.FC = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'followers' | 'recent'>('name');

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('artists')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching artists:', error);
        return;
      }

      setArtists(data || []);
    } catch (error) {
      console.error('Error fetching artists:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar y ordenar artistas
  const filteredArtists = artists.filter(artist => {
    const matchesSearch = artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         artist.bio?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesGenre = selectedGenre === 'all' || 
                        artist.genre?.some(genre => 
                          genre.toLowerCase().includes(selectedGenre.toLowerCase())
                        );
    
    const matchesCountry = selectedCountry === 'all' || 
                          artist.country?.toLowerCase() === selectedCountry.toLowerCase();

    return matchesSearch && matchesGenre && matchesCountry;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'followers':
        return (b.followers_count || 0) - (a.followers_count || 0);
      case 'recent':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'name':
      default:
        return a.name.localeCompare(b.name);
    }
  });

  // Obtener géneros únicos
  const uniqueGenres = Array.from(
    new Set(
      artists.flatMap(artist => artist.genre || [])
    )
  ).sort();

  // Obtener países únicos
  const uniqueCountries = Array.from(
    new Set(
      artists.map(artist => artist.country).filter(Boolean)
    )
  ).sort();

  const formatFollowers = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const handleSocialClick = (url: string, platform: string) => {
    let fullUrl = url;
    
    switch (platform) {
      case 'instagram':
        fullUrl = url.startsWith('@') ? `https://instagram.com/${url.slice(1)}` : url;
        break;
      case 'soundcloud':
        fullUrl = url.startsWith('http') ? url : `https://soundcloud.com/${url}`;
        break;
      case 'website':
        fullUrl = url.startsWith('http') ? url : `https://${url}`;
        break;
    }
    
    window.open(fullUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-neon-mint animate-spin mx-auto mb-4" />
          <div className="text-white font-bebas text-2xl">CARGANDO ARTISTAS...</div>
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
            ARTISTAS
          </h1>
          <p className="text-gray-light font-space text-lg max-w-2xl mx-auto">
            Descubre los talentos que están moldeando el futuro de la música electrónica
          </p>
          <div className="mt-6 flex items-center justify-center space-x-4 text-neon-mint">
            <Users className="w-5 h-5" />
            <span className="font-space text-sm">{artists.length} Artistas</span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-dark bg-opacity-30 p-6 brutal-border border-gray-dark mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-light w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar artistas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black border-2 border-gray-dark text-white pl-12 pr-4 py-3 font-space text-sm focus:border-neon-mint focus:outline-none brutal-border"
              />
            </div>

            {/* Genre Filter */}
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-full bg-black border-2 border-gray-dark text-white px-4 py-3 font-space text-sm focus:border-neon-mint focus:outline-none brutal-border"
            >
              <option value="all">Todos los géneros</option>
              {uniqueGenres.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>

            {/* Country Filter */}
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full bg-black border-2 border-gray-dark text-white px-4 py-3 font-space text-sm focus:border-neon-mint focus:outline-none brutal-border"
            >
              <option value="all">Todos los países</option>
              {uniqueCountries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'followers' | 'recent')}
              className="w-full bg-black border-2 border-gray-dark text-white px-4 py-3 font-space text-sm focus:border-neon-mint focus:outline-none brutal-border"
            >
              <option value="name">Ordenar por nombre</option>
              <option value="followers">Más seguidos</option>
              <option value="recent">Más recientes</option>
            </select>
          </div>

          <div className="mt-4 text-gray-light font-space text-sm">
            {filteredArtists.length} de {artists.length} artistas
          </div>
        </div>

        {/* Featured Artists */}
        {filteredArtists.some(artist => artist.verified) && (
          <div className="mb-12">
            <h2 className="font-bebas text-3xl text-white mb-6 tracking-wider flex items-center">
              <Heart className="w-6 h-6 mr-2 text-neon-pink" />
              ARTISTAS DESTACADOS
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArtists
                .filter(artist => artist.verified)
                .slice(0, 3)
                .map(artist => (
                  <FeaturedArtistCard 
                    key={artist.id} 
                    artist={artist} 
                    onSocialClick={handleSocialClick}
                    formatFollowers={formatFollowers}
                  />
                ))
              }
            </div>
          </div>
        )}

        {/* All Artists Grid */}
        <div className="mb-8">
          <h2 className="font-bebas text-3xl text-white mb-6 tracking-wider">
            TODOS LOS ARTISTAS
          </h2>
          {filteredArtists.length === 0 ? (
            <div className="text-center py-12">
              <Music className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="font-bebas text-xl text-gray-light mb-2">
                NO SE ENCONTRARON ARTISTAS
              </h3>
              <p className="text-gray-light font-space text-sm">
                Prueba con diferentes filtros de búsqueda
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredArtists.map(artist => (
                <ArtistCard 
                  key={artist.id} 
                  artist={artist} 
                  onSocialClick={handleSocialClick}
                  formatFollowers={formatFollowers}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Featured Artist Card Component
const FeaturedArtistCard: React.FC<{
  artist: Artist;
  onSocialClick: (url: string, platform: string) => void;
  formatFollowers: (count: number) => string;
}> = ({ artist, onSocialClick, formatFollowers }) => (
  <Link to={`/artistas/${artist.id}`} className="group">
    <div className="bg-gray-dark bg-opacity-50 brutal-border border-gray-dark overflow-hidden hover:border-neon-mint transition-all duration-300 group-hover:transform group-hover:scale-105">
      {/* Image */}
      <div className="relative overflow-hidden h-64">
        <img
          src={artist.image_url || '/images/default-artist.jpg'}
          alt={artist.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
        
        {/* Featured Badge */}
        <div className="absolute top-4 left-4">
          <div className="bg-neon-pink px-3 py-1 brutal-border text-black font-bebas text-xs tracking-wider">
            DESTACADO
          </div>
        </div>

        {/* Verified Badge */}
        {artist.verified && (
          <div className="absolute top-4 right-4">
            <Verified className="w-6 h-6 text-neon-mint fill-current" />
          </div>
        )}

        {/* Play Button */}
        <div className="absolute bottom-4 right-4">
          <div className="w-12 h-12 bg-neon-mint text-black rounded-full flex items-center justify-center group-hover:bg-white transition-colors">
            <Play className="w-5 h-5 ml-1 fill-current" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="font-bebas text-2xl text-white mb-2 tracking-wider group-hover:text-neon-mint transition-colors">
          {artist.name}
        </h3>
        
        <p className="text-gray-light font-space text-sm mb-4 line-clamp-2">
          {artist.bio}
        </p>

        {/* Genres */}
        <div className="flex flex-wrap gap-2 mb-4">
          {artist.genre?.slice(0, 2).map((genre, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-dark text-gray-light font-space text-xs border border-gray-600"
            >
              {genre}
            </span>
          ))}
        </div>

        {/* Stats & Social */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-gray-light font-space text-xs">
            <div className="flex items-center space-x-1">
              <Users className="w-3 h-3" />
              <span>{formatFollowers(artist.followers_count || 0)}</span>
            </div>
            {artist.country && (
              <div className="flex items-center space-x-1">
                <MapPin className="w-3 h-3" />
                <span>{artist.country}</span>
              </div>
            )}
          </div>

          {/* Social Links */}
          <div className="flex items-center space-x-2">
            {artist.social_links?.instagram && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onSocialClick(artist.social_links.instagram, 'instagram');
                }}
                className="text-gray-light hover:text-neon-pink transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </button>
            )}
            {artist.social_links?.soundcloud && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onSocialClick(artist.social_links.soundcloud, 'soundcloud');
                }}
                className="text-gray-light hover:text-neon-mint transition-colors"
              >
                <Music className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  </Link>
);

// Regular Artist Card Component
const ArtistCard: React.FC<{
  artist: Artist;
  onSocialClick: (url: string, platform: string) => void;
  formatFollowers: (count: number) => string;
}> = ({ artist, onSocialClick, formatFollowers }) => (
  <Link to={`/artistas/${artist.id}`} className="group">
    <div className="bg-gray-dark bg-opacity-30 brutal-border border-gray-dark overflow-hidden hover:border-neon-mint transition-colors">
      {/* Image */}
      <div className="relative overflow-hidden h-48">
        <img
          src={artist.image_url || '/images/default-artist.jpg'}
          alt={artist.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
        
        {/* Verified Badge */}
        {artist.verified && (
          <div className="absolute top-2 right-2">
            <Verified className="w-5 h-5 text-neon-mint fill-current" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bebas text-lg text-white mb-1 tracking-wider group-hover:text-neon-mint transition-colors">
          {artist.name}
        </h3>
        
        <p className="text-gray-light font-space text-xs mb-3 line-clamp-2">
          {artist.bio}
        </p>

        {/* Primary Genre */}
        {artist.genre && artist.genre.length > 0 && (
          <div className="mb-3">
            <span className="px-2 py-1 bg-gray-dark text-gray-light font-space text-xs border border-gray-600">
              {artist.genre[0]}
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 text-gray-light font-space text-xs">
            <Users className="w-3 h-3" />
            <span>{formatFollowers(artist.followers_count || 0)}</span>
          </div>

          <div className="flex items-center space-x-2">
            {artist.social_links?.instagram && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onSocialClick(artist.social_links.instagram, 'instagram');
                }}
                className="text-gray-light hover:text-neon-pink transition-colors"
              >
                <Instagram className="w-3 h-3" />
              </button>
            )}
            {artist.social_links?.soundcloud && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onSocialClick(artist.social_links.soundcloud, 'soundcloud');
                }}
                className="text-gray-light hover:text-neon-mint transition-colors"
              >
                <Music className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  </Link>
);

export default Artists;
