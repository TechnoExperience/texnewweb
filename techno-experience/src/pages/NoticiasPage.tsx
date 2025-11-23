import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Newspaper, Tag, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Noticia } from '../types/database';

export default function NoticiasPage() {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNoticias();
  }, []);

  async function loadNoticias() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('noticias')
        .select('*')
        .eq('estado', 'publicado')
        .order('fecha_publicacion', { ascending: false });

      if (!error && data) {
        setNoticias(data);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Header */}
      <section className="bg-gradient-to-r from-techno-azure to-techno-purple py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold text-white mb-4 flex items-center gap-4">
            <Newspaper className="w-12 h-12 text-techno-neon-green" />
            Noticias
          </h1>
          <p className="text-xl text-gray-200">
            Lo último de la escena electrónica mundial
          </p>
        </div>
      </section>

      {/* Noticias */}
      <section className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center text-gray-400 py-20">Cargando noticias...</div>
        ) : noticias.length === 0 ? (
          <div className="text-center text-gray-400 py-20">
            <Newspaper className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-lg">No hay noticias disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {noticias.map((noticia) => (
              <NoticiaCard key={noticia.id} noticia={noticia} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function NoticiaCard({ noticia }: { noticia: Noticia }) {
  return (
    <Link
      to={`/noticias/${noticia.slug}`}
      className="group bg-gray-800 rounded-xl overflow-hidden hover:ring-2 hover:ring-techno-azure transition"
    >
      {noticia.imagen_portada && (
        <img
          src={noticia.imagen_portada}
          alt={noticia.titulo}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
      )}
      <div className="p-6">
        {noticia.categoria && (
          <div className="flex items-center gap-2 text-techno-neon-green mb-3">
            <Tag className="w-4 h-4" />
            <span className="text-sm font-medium">{noticia.categoria}</span>
          </div>
        )}
        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-techno-azure transition line-clamp-2">
          {noticia.titulo}
        </h3>
        {noticia.resumen && (
          <p className="text-gray-400 text-sm mb-4 line-clamp-3">{noticia.resumen}</p>
        )}
        {noticia.fecha_publicacion && (
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Calendar className="w-4 h-4" />
            <span>
              {new Date(noticia.fecha_publicacion).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
