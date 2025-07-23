import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Calendar, MapPin, Users, Grid, List, Map } from 'lucide-react';
import EventCard from '../components/ui/EventCard';
import EventCalendar from '../components/ui/EventCalendar';
import EventMap from '../components/ui/EventMap';
import useSupabase from '../hooks/useSupabase';
import DataManager from '../utils/dataManager';
import { Event } from '../data/types';

const Events: React.FC = () => {
  const { events: supabaseEvents, eventsLoading, fetchEvents } = useSupabase();
  const [events, setEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'calendar' | 'map'>('grid');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'price'>('date');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Cargar eventos al montar el componente
  useEffect(() => {
    const loadEvents = async () => {
      // Intentar cargar desde Supabase primero
      try {
        await fetchEvents();
        
        // Si hay eventos de Supabase, usarlos
        if (supabaseEvents.length > 0) {
          // Mapear eventos de Supabase al formato local
          const mappedEvents: Event[] = supabaseEvents.map(event => ({
            id: event.id,
            title: event.title,
            date: event.date,
            time: event.time,
            venue: event.location,
            city: event.location.split(',')[1]?.trim() || 'Unknown',
            category: event.genre || 'Electronic',
            image: event.image_url || '/images/techno-party-neon.jpg',
            description: event.description || '',
            artists: [{ name: 'TBA', genre: event.genre || 'Electronic' }],
            tickets: {
              price: event.price || 25,
              available: event.capacity || 500,
              total: event.capacity || 500,
              url: '#'
            }
          }));
          setEvents(mappedEvents);
        } else {
          // Si no hay eventos en Supabase, usar datos mock
          const loadedEvents = DataManager.getEvents();
          setEvents(loadedEvents);
        }
      } catch (error) {
        console.error('Error loading events from Supabase:', error);
        // Fallback a datos locales
        const loadedEvents = DataManager.getEvents();
        setEvents(loadedEvents);
      }
    };

    loadEvents();
  }, [supabaseEvents]);

  // Get unique cities and categories for filters
  const cities = Array.from(new Set(events.map(event => event.city)));
  const categories = Array.from(new Set(events.map(event => event.category)));

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    let filtered = events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           event.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           event.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           event.artists.some(artist => artist.name.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
      const matchesCity = selectedCity === 'all' || event.city === selectedCity;

      return matchesSearch && matchesCategory && matchesCity;
    });

    // Sort events
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'name':
          return a.title.localeCompare(b.title);
        case 'price':
          return a.tickets.price - b.tickets.price;
        default:
          return 0;
      }
    });

    return filtered;
  }, [events, searchQuery, selectedCategory, selectedCity, sortBy]);

  const handleEventSelect = (event: Event) => {
    setSelectedEvent(event);
    // Aquí podrías abrir un modal o navegar a la página del evento
    console.log('Evento seleccionado:', event);
  };

  return (
    <div className="min-h-screen bg-black pt-8">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="mb-component">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-category-news brutal-border border-category-news flex items-center justify-center">
              <Calendar className="w-5 h-5 text-black" />
            </div>
            <h1 className="font-bebas text-4xl md:text-6xl tracking-wider text-white">
              EVENTOS TECHNO
            </h1>
          </div>
          <p className="text-gray-light font-space text-lg max-w-3xl">
            Descubre las experiencias techno más intensas en toda España. 
            Desde festivales masivos hasta sesiones underground íntimas.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-gray-dark bg-opacity-50 p-6 mb-component brutal-border border-gray-dark">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar eventos, artistas, venues..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black border-2 border-gray-dark text-white px-4 py-3 pr-10 font-space text-sm focus:border-neon-mint focus:outline-none brutal-border"
                />
                <Search className="absolute right-3 top-3.5 w-4 h-4 text-gray-light" />
              </div>
            </div>

            {/* Category Filter */}
            <div>
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
            </div>

            {/* City Filter */}
            <div>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full bg-black border-2 border-gray-dark text-white px-4 py-3 font-space text-sm focus:border-neon-mint focus:outline-none brutal-border"
              >
                <option value="all">Todas las ciudades</option>
                {cities.map(city => (
                  <option key={city} value={city}>
                    {city}
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
                onChange={(e) => setSortBy(e.target.value as 'date' | 'name' | 'price')}
                className="bg-black border border-gray-dark text-white px-3 py-1 font-space text-sm brutal-border"
              >
                <option value="date">Fecha</option>
                <option value="name">Nombre</option>
                <option value="price">Precio</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-gray-light font-space text-sm">Vista:</span>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 border brutal-border transition-colors ${
                  viewMode === 'grid' 
                    ? 'border-neon-mint text-neon-mint bg-neon-mint bg-opacity-20' 
                    : 'border-gray-dark text-gray-light hover:border-white hover:text-white'
                }`}
                title="Vista Grid"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 border brutal-border transition-colors ${
                  viewMode === 'list' 
                    ? 'border-neon-mint text-neon-mint bg-neon-mint bg-opacity-20' 
                    : 'border-gray-dark text-gray-light hover:border-white hover:text-white'
                }`}
                title="Vista Lista"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`p-2 border brutal-border transition-colors ${
                  viewMode === 'calendar' 
                    ? 'border-neon-pink text-neon-pink bg-neon-pink bg-opacity-20' 
                    : 'border-gray-dark text-gray-light hover:border-white hover:text-white'
                }`}
                title="Vista Calendario"
              >
                <Calendar className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-2 border brutal-border transition-colors ${
                  viewMode === 'map' 
                    ? 'border-neon-yellow text-neon-yellow bg-neon-yellow bg-opacity-20' 
                    : 'border-gray-dark text-gray-light hover:border-white hover:text-white'
                }`}
                title="Vista Mapa"
              >
                <Map className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div className="mb-6">
          <p className="text-gray-light font-space text-sm">
            {filteredEvents.length} eventos encontrados
          </p>
        </div>

        {/* Content based on view mode */}
        {viewMode === 'calendar' ? (
          <EventCalendar 
            events={filteredEvents} 
            onEventSelect={handleEventSelect}
          />
        ) : viewMode === 'map' ? (
          <EventMap 
            events={filteredEvents} 
            onEventSelect={handleEventSelect}
          />
        ) : filteredEvents.length > 0 ? (
          <div className={viewMode === 'grid' ? 'grid-techno' : 'space-y-6'}>
            {filteredEvents.map((event) => (
              <EventCard 
                key={event.id} 
                event={event} 
                featured={event.featured && viewMode === 'grid'} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-dark brutal-border border-gray-dark flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-light" />
            </div>
            <h3 className="font-bebas text-2xl tracking-wider text-white mb-2">
              NO SE ENCONTRARON EVENTOS
            </h3>
            <p className="text-gray-light font-space text-sm max-w-md mx-auto">
              Prueba ajustando los filtros o busca con términos diferentes.
            </p>
          </div>
        )}

        {/* Load More Button (only for grid/list views) */}
        {filteredEvents.length > 0 && (viewMode === 'grid' || viewMode === 'list') && (
          <div className="text-center mt-12">
            <button className="px-8 py-4 border-2 border-neon-mint text-neon-mint font-bebas text-lg tracking-wider hover:bg-neon-mint hover:text-black transition-all duration-300 brutal-border">
              CARGAR MÁS EVENTOS
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
