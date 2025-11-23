import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Music2, Newspaper, Video, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Evento, Noticia, Lanzamiento } from '../types/database';

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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Hero Section */}
      <section className="relative h-[600px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-techno-purple/90 to-techno-azure/90 z-10" />
        <img
          src="/imgs/hero_background.png"
          alt="Techno Experience"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 container mx-auto px-4 h-full flex items-center">
          <div className="max-w-3xl">
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 animate-fade-in">
              Techno Experience
            </h1>
            <p className="text-2xl md:text-3xl text-techno-neon-green mb-8 font-light">
              La plataforma líder de cultura techno
            </p>
            <p className="text-lg text-gray-200 mb-10 max-w-2xl">
              Descubre eventos, noticias, lanzamientos y contenido exclusivo de la escena electrónica mundial
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/eventos"
                className="px-8 py-4 bg-techno-neon-green text-black font-semibold rounded-lg hover:bg-opacity-90 transition transform hover:scale-105"
              >
                Explorar Eventos
              </Link>
              <Link
                to="/noticias"
                className="px-8 py-4 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition backdrop-blur-sm"
              >
                Leer Noticias
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Próximos Eventos */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-4xl font-bold text-white flex items-center gap-3">
            <TrendingUp className="text-techno-neon-green" />
            Próximos Eventos
          </h2>
          <Link to="/eventos" className="text-techno-azure hover:text-techno-neon-green transition">
            Ver todos
          </Link>
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-12">Cargando eventos...</div>
        ) : eventos.length === 0 ? (
          <div className="text-center text-gray-400 py-12">No hay eventos próximos</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventos.map((evento) => (
              <EventoCard key={evento.id} evento={evento} />
            ))}
          </div>
        )}
      </section>

      {/* Últimas Noticias */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-4xl font-bold text-white flex items-center gap-3">
            <Newspaper className="text-techno-azure" />
            Últimas Noticias
          </h2>
          <Link to="/noticias" className="text-techno-azure hover:text-techno-neon-green transition">
            Ver todas
          </Link>
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-12">Cargando noticias...</div>
        ) : noticias.length === 0 ? (
          <div className="text-center text-gray-400 py-12">No hay noticias disponibles</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
    <Link
      to={link}
      className={`group p-6 rounded-xl bg-gradient-to-br ${colorClasses[color]} hover:scale-105 transition-transform duration-300`}
    >
      <div className="text-white mb-4 group-hover:scale-110 transition-transform">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-100 text-sm">{description}</p>
    </Link>
  );
}

function EventoCard({ evento }: { evento: Evento }) {
  return (
    <Link
      to={`/eventos/${evento.slug}`}
      className="group bg-gray-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-techno-neon-green transition"
    >
      {evento.flyer_url && (
        <img
          src={evento.flyer_url}
          alt={evento.nombre}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
      )}
      <div className="p-4">
        <div className="text-techno-azure text-sm mb-2">
          {new Date(evento.fecha_inicio).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </div>
        <h3 className="text-white font-bold text-lg mb-2 group-hover:text-techno-neon-green transition">
          {evento.nombre}
        </h3>
        <div className="text-gray-400 text-sm">
          {evento.venue_nombre} • {evento.ciudad}
        </div>
      </div>
    </Link>
  );
}

function NoticiaCard({ noticia }: { noticia: Noticia }) {
  return (
    <Link
      to={`/noticias/${noticia.slug}`}
      className="group bg-gray-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-techno-azure transition flex"
    >
      {noticia.imagen_portada && (
        <img
          src={noticia.imagen_portada}
          alt={noticia.titulo}
          className="w-1/3 object-cover group-hover:scale-105 transition-transform duration-300"
        />
      )}
      <div className="p-4 flex-1">
        <div className="text-techno-neon-green text-sm mb-2">{noticia.categoria || 'Noticias'}</div>
        <h3 className="text-white font-bold text-lg mb-2 group-hover:text-techno-azure transition line-clamp-2">
          {noticia.titulo}
        </h3>
        <p className="text-gray-400 text-sm line-clamp-2">{noticia.resumen}</p>
      </div>
    </Link>
  );
}
