import React, { useState } from 'react';
import { Search, Users, Play, Instagram, Music, MapPin } from 'lucide-react';

const Artists: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');

  const artists = [
    {
      id: 1,
      name: 'Karretero',
      bio: 'Producer y DJ underground especializado en techno industrial español',
      image: '/images/dj-setup-techno.jpg',
      genres: ['Techno', 'Industrial'],
      country: 'España',
      featured: true,
      social: {
        instagram: '@karretero_official',
        soundcloud: 'karretero-official'
      },
      stats: {
        releases: 25,
        followers: '12K',
        events: 45
      }
    },
    {
      id: 2,
      name: 'Mosha',
      bio: 'Productor anónimo que está revolucionando el minimal techno con su enfoque purista',
      image: '/images/electronic-stage.jpg',
      genres: ['Minimal Techno', 'Deep House'],
      country: 'Alemania',
      featured: true,
      social: {
        soundcloud: 'mosha-minimal'
      },
      stats: {
        releases: 18,
        followers: '8K',
        events: 30
      }
    },
    {
      id: 3,
      name: 'Ana Martínez',
      bio: 'DJ y productora especializada en tech house y techno melódico',
      image: '/images/techno-party-neon.jpg',
      genres: ['Tech House', 'Melodic Techno'],
      country: 'España',
      featured: false,
      social: {
        instagram: '@anamartinez_dj',
        soundcloud: 'ana-martinez-official'
      },
      stats: {
        releases: 12,
        followers: '15K',
        events: 60
      }
    },
    {
      id: 4,
      name: 'VETA Collective',
      bio: 'Colectivo de artistas experimentales enfocado en sonidos underground',
      image: '/images/vinyl-turntable.jpg',
      genres: ['Experimental', 'Ambient Techno'],
      country: 'España',
      featured: false,
      social: {
        instagram: '@veta_collective'
      },
      stats: {
        releases: 8,
        followers: '5K',
        events: 15
      }
    },
    {
      id: 5,
      name: 'Deep Sessions',
      bio: 'Proyecto dedicado a explorar las profundidades del deep house y techno',
      image: '/images/ibiza-techno-club.webp',
      genres: ['Deep House', 'Deep Techno'],
      country: 'España',
      featured: false,
      social: {
        instagram: '@deepsessions_official',
        soundcloud: 'deep-sessions'
      },
      stats: {
        releases: 22,
        followers: '18K',
        events: 35
      }
    },
    {
      id: 6,
      name: 'Industrial Dreams',
      bio: 'Duo especializado en techno industrial y sonidos experimentales oscuros',
      image: '/images/hero-techno-festival.jpg',
      genres: ['Industrial Techno', 'Dark Techno'],
      country: 'Francia',
      featured: false,
      social: {
        instagram: '@industrialdreams',
        soundcloud: 'industrial-dreams'
      },
      stats: {
        releases: 15,
        followers: '9K',
        events: 28
      }
    }
  ];

  const genres = Array.from(new Set(artists.flatMap(artist => artist.genres)));
  const countries = Array.from(new Set(artists.map(artist => artist.country)));

  const filteredArtists = artists.filter(artist => {
    const matchesSearch = artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         artist.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         artist.genres.some(genre => genre.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesGenre = selectedGenre === 'all' || artist.genres.includes(selectedGenre);
    const matchesCountry = selectedCountry === 'all' || artist.country === selectedCountry;

    return matchesSearch && matchesGenre && matchesCountry;
  });

  const featuredArtists = filteredArtists.filter(artist => artist.featured);
  const regularArtists = filteredArtists.filter(artist => !artist.featured);

  return (
    <div className="min-h-screen bg-black pt-8">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="mb-section">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-category-entertainment brutal-border border-category-entertainment flex items-center justify-center">
              <Users className="w-5 h-5 text-black" />
            </div>
            <h1 className="font-bebas text-4xl md:text-6xl tracking-wider text-white">
              ARTISTAS
            </h1>
          </div>
          <p className="text-gray-light font-space text-lg max-w-3xl">
            Descubre los talentos que definen la escena techno contemporánea. 
            Desde productores underground hasta DJs internacionales.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-gray-dark bg-opacity-50 p-6 mb-component brutal-border border-gray-dark">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar artistas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black border-2 border-gray-dark text-white px-4 py-3 pr-10 font-space text-sm focus:border-neon-mint focus:outline-none brutal-border"
                />
                <Search className="absolute right-3 top-3.5 w-4 h-4 text-gray-light" />
              </div>
            </div>

            <div>
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="w-full bg-black border-2 border-gray-dark text-white px-4 py-3 font-space text-sm focus:border-neon-mint focus:outline-none brutal-border"
              >
                <option value="all">Todos los géneros</option>
                {genres.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full bg-black border-2 border-gray-dark text-white px-4 py-3 font-space text-sm focus:border-neon-mint focus:outline-none brutal-border"
              >
                <option value="all">Todos los países</option>
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Featured Artists */}
        {featuredArtists.length > 0 && (
          <section className="mb-component">
            <h2 className="font-bebas text-3xl tracking-wider text-white mb-6">
              ARTISTAS DESTACADOS
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {featuredArtists.map((artist) => (
                <div key={artist.id} className="group">
                  <div className="bg-black border-2 border-gray-dark hover:border-neon-mint transition-all duration-300 brutal-border overflow-hidden">
                    <div className="relative">
                      <img
                        src={artist.image}
                        alt={artist.name}
                        className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      
                      {/* Featured Badge */}
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-neon-pink text-white font-bebas text-xs tracking-wider brutal-border border-neon-pink">
                          DESTACADO
                        </span>
                      </div>

                      {/* Country Badge */}
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 bg-black bg-opacity-80 text-white font-space text-xs brutal-border border-gray-light flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {artist.country}
                        </span>
                      </div>

                      {/* Play Overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center">
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-4 bg-neon-mint text-black hover:bg-white transition-colors brutal-border">
                          <Play className="w-8 h-8" />
                        </button>
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="font-bebas text-2xl tracking-wider text-white mb-2">
                        {artist.name}
                      </h3>
                      
                      <p className="text-gray-light font-space text-sm mb-4 leading-relaxed">
                        {artist.bio}
                      </p>

                      {/* Genres */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {artist.genres.map((genre) => (
                          <span
                            key={genre}
                            className="px-2 py-1 bg-gray-dark text-white font-space text-xs border border-gray-light"
                          >
                            {genre}
                          </span>
                        ))}
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                        <div>
                          <div className="font-bebas text-lg text-neon-mint">{artist.stats.releases}</div>
                          <div className="font-space text-xs text-gray-light">Releases</div>
                        </div>
                        <div>
                          <div className="font-bebas text-lg text-neon-yellow">{artist.stats.followers}</div>
                          <div className="font-space text-xs text-gray-light">Followers</div>
                        </div>
                        <div>
                          <div className="font-bebas text-lg text-neon-pink">{artist.stats.events}</div>
                          <div className="font-space text-xs text-gray-light">Events</div>
                        </div>
                      </div>

                      {/* Social Links */}
                      <div className="flex space-x-2">
                        {artist.social.instagram && (
                          <a
                            href="#"
                            className="p-2 border border-gray-dark hover:border-neon-mint hover:text-neon-mint transition-colors"
                          >
                            <Instagram className="w-4 h-4" />
                          </a>
                        )}
                        {artist.social.soundcloud && (
                          <a
                            href="#"
                            className="p-2 border border-gray-dark hover:border-neon-yellow hover:text-neon-yellow transition-colors"
                          >
                            <Music className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* All Artists Grid */}
        <section>
          <h2 className="font-bebas text-3xl tracking-wider text-white mb-6">
            TODOS LOS ARTISTAS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularArtists.map((artist) => (
              <div key={artist.id} className="group">
                <div className="bg-black border-2 border-gray-dark hover:border-neon-mint transition-all duration-300 brutal-border">
                  <div className="relative overflow-hidden">
                    <img
                      src={artist.image}
                      alt={artist.name}
                      className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    
                    {/* Country Badge */}
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-1 bg-black bg-opacity-80 text-white font-space text-xs brutal-border border-gray-light">
                        {artist.country}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-bebas text-xl tracking-wider text-white mb-2">
                      {artist.name}
                    </h3>
                    
                    <p className="text-gray-light font-space text-sm mb-3 line-clamp-2">
                      {artist.bio}
                    </p>

                    {/* Genres */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {artist.genres.slice(0, 2).map((genre) => (
                        <span
                          key={genre}
                          className="px-2 py-1 bg-gray-dark text-white font-space text-xs"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex space-x-3">
                        <span className="text-gray-light font-space">
                          {artist.stats.releases} releases
                        </span>
                        <span className="text-gray-light font-space">
                          {artist.stats.followers} followers
                        </span>
                      </div>
                      
                      <div className="flex space-x-1">
                        {artist.social.instagram && (
                          <a href="#" className="text-gray-light hover:text-neon-mint transition-colors">
                            <Instagram className="w-3 h-3" />
                          </a>
                        )}
                        {artist.social.soundcloud && (
                          <a href="#" className="text-gray-light hover:text-neon-yellow transition-colors">
                            <Music className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Load More */}
        <div className="text-center mt-12">
          <button className="px-8 py-4 border-2 border-neon-mint text-neon-mint font-bebas text-lg tracking-wider hover:bg-neon-mint hover:text-black transition-all duration-300 brutal-border">
            CARGAR MÁS ARTISTAS
          </button>
        </div>
      </div>
    </div>
  );
};

export default Artists;
