import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Filter, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Evento } from '../types/database';

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
      {/* Header */}
      <section className="bg-gradient-to-r from-techno-purple to-techno-azure py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold text-white mb-4 flex items-center gap-4">
            <Calendar className="w-12 h-12 text-techno-neon-green" />
            Eventos
          </h1>
          <p className="text-xl text-gray-200">
            Descubre los mejores eventos techno en tu ciudad
          </p>
        </div>
      </section>

      {/* Filtros y búsqueda */}
      <section className="container mx-auto px-4 py-8">
        <div className="bg-gray-800 rounded-lg p-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar eventos, venues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-techno-neon-green outline-none"
              />
            </div>

            {/* Filtro por ciudad */}
            <div className="w-full md:w-64 relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={ciudadFiltro}
                onChange={(e) => setCiudadFiltro(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-techno-azure outline-none appearance-none"
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

      {/* Lista de eventos */}
      <section className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center text-gray-400 py-20">Cargando eventos...</div>
        ) : eventos.length === 0 ? (
          <div className="text-center text-gray-400 py-20">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-lg">No se encontraron eventos</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      className="group bg-gray-800 rounded-xl overflow-hidden hover:ring-2 hover:ring-techno-neon-green transition"
    >
      {/* Imagen */}
      <div className="relative h-64 overflow-hidden bg-gray-700">
        {evento.flyer_url ? (
          <img
            src={evento.flyer_url}
            alt={evento.nombre}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Calendar className="w-16 h-16 text-gray-600" />
          </div>
        )}
        {/* Badge de sincronización RA */}
        {evento.ra_synced && (
          <div className="absolute top-3 right-3 bg-techno-neon-green text-black px-3 py-1 rounded-full text-xs font-semibold">
            Resident Advisor
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-6">
        {/* Fecha */}
        <div className="flex items-center gap-2 text-techno-azure mb-3">
          <Calendar className="w-4 h-4" />
          <span className="text-sm font-medium">
            {fecha.toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </span>
        </div>

        {/* Título */}
        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-techno-neon-green transition line-clamp-2">
          {evento.nombre}
        </h3>

        {/* Venue y ciudad */}
        <div className="flex items-center gap-2 text-gray-400 mb-2">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{evento.venue_nombre}</span>
        </div>

        <div className="text-sm text-gray-500">{evento.ciudad}</div>

        {/* Artistas */}
        {evento.artistas && evento.artistas.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="flex items-center gap-2 text-gray-400">
              <Users className="w-4 h-4" />
              <span className="text-sm">
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
