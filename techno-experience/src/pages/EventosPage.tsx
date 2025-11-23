import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Filter, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Evento } from '../types/database';
import { Loader, InputAnimated } from '../components/ui';

export default function EventosPage() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [ciudadFiltro, setCiudadFiltro] = useState('');
  const [ciudades, setCiudades] = useState<string[]>([]);

  useEffect(() => {
    loadEventos();
    loadCiudades();
  }, []);

  async function loadEventos() {
    setLoading(true);
    try {
      let query = supabase
        .from('eventos')
        .select('*')
        .eq('estado', 'publicado')
        .gte('fecha_inicio', new Date().toISOString())
        .order('fecha_inicio', { ascending: true });

      if (ciudadFiltro) {
        query = query.eq('ciudad', ciudadFiltro);
      }

      const { data, error } = await query;

      if (!error && data) {
        let filtered = data;
        if (searchTerm) {
          filtered = data.filter(
            (e) =>
              e.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
              e.venue_nombre.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        setEventos(filtered);
      }
    } finally {
      setLoading(false);
    }
  }

  async function loadCiudades() {
    const { data } = await supabase
      .from('eventos')
      .select('ciudad')
      .eq('estado', 'publicado');

    if (data) {
      const uniqueCiudades = Array.from(new Set(data.map((e) => e.ciudad).filter(Boolean)));
      setCiudades(uniqueCiudades as string[]);
    }
  }

  useEffect(() => {
    loadEventos();
  }, [searchTerm, ciudadFiltro]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Header - Responsive mejorado */}
      <section className="bg-gradient-to-r from-techno-purple to-techno-azure py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2 sm:gap-4">
            <Calendar className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-techno-neon-green flex-shrink-0" />
            <span>Eventos</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-200">
            Descubre los mejores eventos techno en tu ciudad
          </p>
        </div>
      </section>

      {/* Filtros y búsqueda - Responsive mejorado */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="bg-gray-800/90 backdrop-blur-sm rounded-xl p-4 sm:p-6 space-y-4 shadow-lg">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Búsqueda */}
            <div className="flex-1 relative">
              <InputAnimated
                type="text"
                label="Buscar eventos, venues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Filtro por ciudad */}
            <div className="w-full sm:w-auto sm:min-w-[200px] relative">
              <Filter className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5 pointer-events-none z-10" />
              <select
                value={ciudadFiltro}
                onChange={(e) => setCiudadFiltro(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-8 sm:pr-10 py-3 sm:py-3.5 bg-gray-700/50 text-white rounded-lg focus:ring-2 focus:ring-techno-azure focus:bg-gray-700 outline-none appearance-none transition-all duration-200 text-sm sm:text-base min-h-[44px] border border-gray-600 focus:border-techno-azure cursor-pointer"
              >
                <option value="">Todas las ciudades</option>
                {ciudades.map((ciudad) => (
                  <option key={ciudad} value={ciudad}>
                    {ciudad}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Lista de eventos - Responsive mejorado */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
        {loading ? (
          <div className="text-center text-gray-400 py-12 sm:py-16 md:py-20">
            <Loader size="lg" variant="spinner" className="mx-auto" />
            <p className="mt-4 text-sm sm:text-base">Cargando eventos...</p>
          </div>
        ) : eventos.length === 0 ? (
          <div className="text-center text-gray-400 py-12 sm:py-16 md:py-20">
            <Calendar className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-sm sm:text-base md:text-lg">No se encontraron eventos</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {eventos.map((evento) => (
              <EventoCard key={evento.id} evento={evento} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function EventoCard({ evento }: { evento: Evento }) {
  const fecha = new Date(evento.fecha_inicio);

  return (
    <Link
      to={`/eventos/${evento.slug}`}
      className="group bg-gray-800/90 backdrop-blur-sm rounded-xl overflow-hidden hover:ring-2 hover:ring-techno-neon-green/50 transition-all duration-300 hover:shadow-lg hover:shadow-techno-neon-green/20 transform hover:-translate-y-1"
    >
      {/* Imagen */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-700">
        {evento.flyer_url ? (
          <img
            src={evento.flyer_url}
            alt={evento.nombre}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-techno-purple/20 to-techno-azure/20">
            <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-gray-600" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {/* Badge de sincronización RA */}
        {evento.ra_synced && (
          <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-techno-neon-green text-black px-2 sm:px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
            RA
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4 sm:p-5 md:p-6">
        {/* Fecha */}
        <div className="flex items-center gap-2 text-techno-azure mb-2 sm:mb-3">
          <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
          <span className="text-xs sm:text-sm font-medium">
            {fecha.toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </span>
        </div>

        {/* Título */}
        <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 group-hover:text-techno-neon-green transition-colors duration-200 line-clamp-2">
          {evento.nombre}
        </h3>

        {/* Venue y ciudad */}
        <div className="flex items-center gap-2 text-gray-400 mb-1 sm:mb-2">
          <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
          <span className="text-xs sm:text-sm truncate">{evento.venue_nombre}</span>
        </div>

        <div className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">{evento.ciudad}</div>

        {/* Artistas */}
        {evento.artistas && evento.artistas.length > 0 && (
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-700">
            <div className="flex items-start gap-2 text-gray-400">
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5" />
              <span className="text-xs sm:text-sm line-clamp-2">
                {evento.artistas.slice(0, 3).join(', ')}
                {evento.artistas.length > 3 && ' ...'}
              </span>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
