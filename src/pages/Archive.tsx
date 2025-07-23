import React, { useState } from 'react';
import { Search, Filter, Archive as ArchiveIcon, Play, Download, Image as ImageIcon } from 'lucide-react';
// import { mockMediaItems } from '../data/mockData';

const Archive: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');

  // Get unique values for filters
  const types = ['flyer', 'audio', 'video', 'image'];
  const years = [2025, 2024, 2023, 2022, 2021, 2020];
  const genres = ['Techno', 'Minimal Techno', 'Industrial', 'Deep House'];

  return (
    <div className="min-h-screen bg-black pt-8">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="mb-section">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-category-techno brutal-border border-category-techno flex items-center justify-center">
              <ArchiveIcon className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-bebas text-4xl md:text-6xl tracking-wider text-white">
              ARCHIVO DIGITAL TECHNO
            </h1>
          </div>
          <p className="text-gray-light font-space text-lg max-w-3xl">
            Explora la historia visual y sonora de la cultura techno. Sets históricos, 
            flyers icónicos, fotografías underground y momentos que definieron la escena.
          </p>
        </div>

        {/* Featured Showcase */}
        <section className="mb-component">
          <div className="relative h-96 overflow-hidden">
            <img
              src="/images/hero-techno-festival.jpg"
              alt="Archive Featured"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
              <div className="text-center">
                <h2 className="font-bebas text-4xl md:text-6xl text-white mb-4 text-glitch" data-text="PRESERVANDO LA CULTURA">
                  PRESERVANDO LA CULTURA
                </h2>
                <p className="text-neon-mint font-space text-lg mb-6">
                  Cada flyer cuenta una historia, cada set preserva un momento
                </p>
                <button className="px-6 py-3 bg-neon-mint text-black font-bebas tracking-wider hover:bg-transparent hover:text-neon-mint border-2 border-neon-mint transition-all duration-300 brutal-border">
                  EXPLORAR COLECCIÓN
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Content Type Tabs */}
        <div className="flex flex-wrap gap-2 mb-component">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-4 py-2 font-bebas text-sm tracking-wider brutal-border transition-all duration-300 ${
              selectedType === 'all'
                ? 'bg-white text-black border-white'
                : 'bg-transparent text-white border-gray-dark hover:border-white'
            }`}
          >
            TODO
          </button>
          {types.map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 font-bebas text-sm tracking-wider brutal-border transition-all duration-300 ${
                selectedType === type
                  ? 'bg-neon-mint text-black border-neon-mint'
                  : 'bg-transparent text-white border-gray-dark hover:border-white'
              }`}
            >
              {type.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-gray-dark bg-opacity-50 p-6 mb-component brutal-border border-gray-dark">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar en archivo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black border-2 border-gray-dark text-white px-4 py-3 pr-10 font-space text-sm focus:border-neon-mint focus:outline-none brutal-border"
                />
                <Search className="absolute right-3 top-3.5 w-4 h-4 text-gray-light" />
              </div>
            </div>

            <div>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full bg-black border-2 border-gray-dark text-white px-4 py-3 font-space text-sm focus:border-neon-mint focus:outline-none brutal-border"
              >
                <option value="all">Todos los años</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
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

            <button className="px-4 py-3 border-2 border-neon-pink text-neon-pink font-bebas text-sm tracking-wider hover:bg-neon-pink hover:text-white transition-all duration-300 brutal-border">
              LIMPIAR FILTROS
            </button>
          </div>
        </div>

        {/* Archive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Sample Archive Items */}
          {[
            {
              id: 1,
              title: 'Monegros Desert Festival 1998',
              type: 'flyer',
              year: 1998,
              image: '/images/electronic-stage.jpg',
              description: 'Flyer original del primer Monegros'
            },
            {
              id: 2,
              title: 'Underground Session #047',
              type: 'audio',
              year: 2024,
              image: '/images/dj-setup-techno.jpg',
              description: 'Set exclusivo minimal techno'
            },
            {
              id: 3,
              title: 'Pacha Ibiza Opening 2000',
              type: 'image',
              year: 2000,
              image: '/images/ibiza-techno-club.webp',
              description: 'Fotografía histórica de apertura'
            },
            {
              id: 4,
              title: 'Techno Documentary Clips',
              type: 'video',
              year: 2023,
              image: '/images/techno-party-neon.jpg',
              description: 'Clips exclusivos del underground'
            },
            {
              id: 5,
              title: 'Sonar Barcelona 2010',
              type: 'flyer',
              year: 2010,
              image: '/images/vinyl-turntable.jpg',
              description: 'Colección completa de flyers'
            },
            {
              id: 6,
              title: 'Industrial Techno Set',
              type: 'audio',
              year: 2025,
              image: '/images/hero-techno-festival.jpg',
              description: 'Live set from underground venue'
            }
          ].map((item) => (
            <div key={item.id} className="group">
              <div className="bg-black border-2 border-gray-dark hover:border-neon-mint transition-all duration-300 brutal-border overflow-hidden">
                {/* Image */}
                <div className="relative overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  
                  {/* Type Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 bg-black bg-opacity-80 text-neon-mint font-bebas text-xs tracking-wider brutal-border border-neon-mint">
                      {item.type.toUpperCase()}
                    </span>
                  </div>

                  {/* Year Badge */}
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-1 bg-black bg-opacity-80 text-white font-space text-xs brutal-border border-gray-light">
                      {item.year}
                    </span>
                  </div>

                  {/* Play/Download Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                      {item.type === 'audio' || item.type === 'video' ? (
                        <button className="p-3 bg-neon-mint text-black hover:bg-white transition-colors brutal-border">
                          <Play className="w-5 h-5" />
                        </button>
                      ) : (
                        <button className="p-3 bg-neon-mint text-black hover:bg-white transition-colors brutal-border">
                          <ImageIcon className="w-5 h-5" />
                        </button>
                      )}
                      <button className="p-3 bg-gray-dark text-white hover:bg-white hover:text-black transition-colors brutal-border">
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bebas text-lg tracking-wider text-white mb-2 line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-gray-light font-space text-sm line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <button className="px-8 py-4 border-2 border-neon-mint text-neon-mint font-bebas text-lg tracking-wider hover:bg-neon-mint hover:text-black transition-all duration-300 brutal-border">
            CARGAR MÁS CONTENIDO
          </button>
        </div>

        {/* Archive Stats */}
        <section className="mt-section py-component bg-gray-dark bg-opacity-30">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="font-bebas text-3xl text-neon-mint mb-2">2,500+</div>
              <div className="font-space text-sm text-gray-light">Flyers Digitalizados</div>
            </div>
            <div>
              <div className="font-bebas text-3xl text-neon-yellow mb-2">500+</div>
              <div className="font-space text-sm text-gray-light">Sets Históricos</div>
            </div>
            <div>
              <div className="font-bebas text-3xl text-neon-pink mb-2">1,200+</div>
              <div className="font-space text-sm text-gray-light">Fotografías</div>
            </div>
            <div>
              <div className="font-bebas text-3xl text-white mb-2">25</div>
              <div className="font-space text-sm text-gray-light">Años de Historia</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Archive;
