import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Music2, Newspaper, Video, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Evento, Noticia, Lanzamiento } from '../types/database';
import { Loader, ButtonAnimated, GlassCard, Badge } from '../components/ui';

export default function HomePage() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [lanzamientos, setLanzamientos] = useState<Lanzamiento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      // Cargar próximos eventos
      const { data: eventosData } = await supabase
        .from('eventos')
        .select('*')
        .eq('estado', 'publicado')
        .gte('fecha_inicio', new Date().toISOString())
        .order('fecha_inicio', { ascending: true })
        .limit(6);

      // Cargar últimas noticias
      const { data: noticiasData } = await supabase
        .from('noticias')
        .select('*')
        .eq('estado', 'publicado')
        .order('fecha_publicacion', { ascending: false })
        .limit(4);

      // Cargar últimos lanzamientos
      const { data: lanzamientosData } = await supabase
        .from('lanzamientos')
        .select('*')
        .eq('estado', 'publicado')
        .order('fecha_lanzamiento', { ascending: false })
        .limit(4);

      setEventos(eventosData || []);
      setNoticias(noticiasData || []);
      setLanzamientos(lanzamientosData || []);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900">
      {/* Hero Section - Responsive y optimizado */}
      <section className="relative min-h-[70vh] sm:min-h-[80vh] md:h-[600px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-techno-purple/90 via-techno-purple/80 to-techno-azure/90 z-10" />
        <img
          src="/imgs/hero_background.png"
          alt="Techno Experience"
          className="absolute inset-0 w-full h-full object-cover object-center"
          loading="eager"
        />
        <div className="absolute inset-0 bg-black/20 z-10" />
        <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center py-12 sm:py-16 md:py-0">
          <div className="max-w-4xl w-full">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-4 sm:mb-6 animate-fade-in leading-tight">
              Techno Experience
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-techno-neon-green mb-4 sm:mb-6 md:mb-8 font-light">
              La plataforma líder de cultura techno
            </p>
            <p className="text-sm sm:text-base md:text-lg text-gray-200 mb-6 sm:mb-8 md:mb-10 max-w-2xl leading-relaxed">
              Descubre eventos, noticias, lanzamientos y contenido exclusivo de la escena electrónica mundial
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <ButtonAnimated variant="neon" to="/eventos" className="text-sm sm:text-base">
                Explorar Eventos
              </ButtonAnimated>
              <ButtonAnimated variant="glow" to="/noticias" className="text-sm sm:text-base">
                Leer Noticias
              </ButtonAnimated>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid - Responsive mejorado */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <FeatureCard
            icon={<Calendar className="w-8 h-8" />}
            title="Eventos"
            description="Descubre los mejores eventos techno en tu ciudad"
            link="/eventos"
            color="purple"
          />
          <FeatureCard
            icon={<Newspaper className="w-8 h-8" />}
            title="Noticias"
            description="Mantente al día con la escena electrónica"
            link="/noticias"
            color="azure"
          />
          <FeatureCard
            icon={<Music2 className="w-8 h-8" />}
            title="Lanzamientos"
            description="Nuevos tracks, EPs y álbumes"
            link="/lanzamientos"
            color="neon-green"
          />
          <FeatureCard
            icon={<Video className="w-8 h-8" />}
            title="Videos"
            description="Aftermovies, lives y contenido exclusivo"
            link="/videos"
            color="magenta"
          />
        </div>
      </section>

      {/* Próximos Eventos - Responsive mejorado */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white flex items-center gap-2 sm:gap-3">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-techno-neon-green flex-shrink-0" />
            <span>Próximos Eventos</span>
          </h2>
          <Link 
            to="/eventos" 
            className="text-techno-azure hover:text-techno-neon-green transition-colors duration-200 text-sm sm:text-base font-medium inline-flex items-center gap-1"
          >
            Ver todos
            <span>→</span>
          </Link>
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-12 sm:py-16">
            <Loader size="lg" variant="spinner" className="mx-auto" />
            <p className="mt-4 text-sm sm:text-base">Cargando eventos...</p>
          </div>
        ) : eventos.length === 0 ? (
          <div className="text-center text-gray-400 py-12 sm:py-16">
            <Calendar className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-sm sm:text-base">No hay eventos próximos</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {eventos.map((evento) => (
              <EventoCard key={evento.id} evento={evento} />
            ))}
          </div>
        )}
      </section>

      {/* Últimas Noticias - Responsive mejorado */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white flex items-center gap-2 sm:gap-3">
            <Newspaper className="w-5 h-5 sm:w-6 sm:h-6 text-techno-azure flex-shrink-0" />
            <span>Últimas Noticias</span>
          </h2>
          <Link 
            to="/noticias" 
            className="text-techno-azure hover:text-techno-neon-green transition-colors duration-200 text-sm sm:text-base font-medium inline-flex items-center gap-1"
          >
            Ver todas
            <span>→</span>
          </Link>
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-12 sm:py-16">
            <Loader size="lg" variant="pulse" className="mx-auto" />
            <p className="mt-4 text-sm sm:text-base">Cargando noticias...</p>
          </div>
        ) : noticias.length === 0 ? (
          <div className="text-center text-gray-400 py-12 sm:py-16">
            <Newspaper className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-sm sm:text-base">No hay noticias disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {noticias.map((noticia) => (
              <NoticiaCard key={noticia.id} noticia={noticia} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
  color: string;
}

function FeatureCard({ icon, title, description, link, color }: FeatureCardProps) {
  const colorClasses: Record<string, string> = {
    purple: 'from-techno-purple to-techno-magenta',
    azure: 'from-techno-azure to-techno-purple',
    'neon-green': 'from-techno-neon-green to-techno-lime',
    magenta: 'from-techno-magenta to-techno-purple',
  };

  return (
    <Link to={link} className="block h-full">
      <GlassCard hover glow className="h-full min-h-[140px] sm:min-h-[160px]">
        <div className="flex flex-col justify-between h-full">
          <div className="mb-4">
            <div className={`text-white mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 inline-block`}>
              {icon}
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed opacity-80">{description}</p>
          </div>
          <Badge variant="info" size="sm" className="self-start">
            Ver más →
          </Badge>
        </div>
      </GlassCard>
    </Link>
  );
}

function EventoCard({ evento }: { evento: Evento }) {
  const fecha = new Date(evento.fecha_inicio);
  const hoy = new Date();
  const diasRestantes = Math.ceil((fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
  const esProximo = diasRestantes <= 7 && diasRestantes > 0;

  return (
    <Link to={`/eventos/${evento.slug}`} className="block h-full group">
      <GlassCard hover className="h-full overflow-hidden">
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-700 rounded-lg mb-4 -m-2 mt-0">
          {evento.flyer_url ? (
            <img
              src={evento.flyer_url}
              alt={evento.nombre}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-techno-purple/20 to-techno-azure/20">
              <Calendar className="w-12 h-12 text-gray-600" />
            </div>
          )}
          <div className="absolute top-2 right-2 flex gap-2 z-10">
            {esProximo && <Badge variant="success" size="sm">Próximo</Badge>}
            {evento.ra_synced && <Badge variant="neon" size="sm">RA</Badge>}
          </div>
        </div>
        <div>
          <div className="text-techno-azure text-xs sm:text-sm mb-2 font-medium">
            {fecha.toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </div>
          <h3 className="text-white font-bold text-base sm:text-lg mb-2 group-hover:text-techno-neon-green transition-colors duration-200 line-clamp-2">
            {evento.nombre}
          </h3>
          <div className="text-gray-400 text-xs sm:text-sm line-clamp-1">
            {evento.venue_nombre} • {evento.ciudad}
          </div>
        </div>
      </GlassCard>
    </Link>
  );
}

function NoticiaCard({ noticia }: { noticia: Noticia }) {
  return (
    <Link
      to={`/noticias/${noticia.slug}`}
      className="group block h-full"
    >
      <GlassCard hover className="h-full flex flex-col sm:flex-row overflow-hidden">
        {noticia.imagen_portada && (
          <div className="relative w-full sm:w-1/3 h-48 sm:h-auto aspect-[4/3] sm:aspect-auto overflow-hidden bg-gray-700 flex-shrink-0 rounded-lg -m-2 sm:-m-6 sm:mr-4">
            <img
              src={noticia.imagen_portada}
              alt={noticia.titulo}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
            />
          </div>
        )}
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
          <div>
            <Badge variant="success" size="sm" className="mb-3">
              {noticia.categoria || 'Noticias'}
            </Badge>
            <h3 className="text-white font-bold text-base sm:text-lg mb-2 group-hover:text-techno-azure transition-colors duration-200 line-clamp-2">
              {noticia.titulo}
            </h3>
            <p className="text-gray-400 text-xs sm:text-sm line-clamp-2 leading-relaxed">{noticia.resumen}</p>
          </div>
        </div>
      </GlassCard>
    </Link>
  );
}
