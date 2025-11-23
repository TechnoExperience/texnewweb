import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface Noticia {
  id: string;
  titulo: string;
  slug: string;
  resumen: string;
  categoria: string;
  estado: string;
  fecha_publicacion: string;
  created_at: string;
  imagen_portada: string;
}

export default function MisContenidosPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchNoticias();
  }, [user, navigate]);

  async function fetchNoticias() {
    try {
      const { data, error } = await supabase
        .from('noticias')
        .select('*')
        .eq('autor_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNoticias(data || []);
    } catch (error) {
      console.error('Error al cargar noticias:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Estás seguro de eliminar esta noticia?')) return;

    try {
      const { error } = await supabase.from('noticias').delete().eq('id', id);
      if (error) throw error;
      setNoticias(noticias.filter((n) => n.id !== id));
    } catch (error) {
      console.error('Error al eliminar:', error);
    }
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">Mis Contenidos</h1>
          <button
            onClick={() => navigate('/crear-noticia')}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-techno-purple to-techno-azure text-white rounded-lg hover:opacity-90 transition"
          >
            <Plus className="w-5 h-5" />
            Nueva Noticia
          </button>
        </div>

        {loading ? (
          <div className="text-center text-white text-xl">Cargando...</div>
        ) : noticias.length === 0 ? (
          <div className="bg-gray-800 rounded-xl p-12 text-center">
            <p className="text-gray-400 text-xl mb-6">
              Aún no has creado ninguna noticia
            </p>
            <button
              onClick={() => navigate('/crear-noticia')}
              className="px-6 py-3 bg-techno-purple text-white rounded-lg hover:bg-opacity-90"
            >
              Crear mi primera noticia
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {noticias.map((noticia) => (
              <div
                key={noticia.id}
                className="bg-gray-800 rounded-xl overflow-hidden hover:shadow-2xl transition flex"
              >
                {noticia.imagen_portada && (
                  <img
                    src={noticia.imagen_portada}
                    alt={noticia.titulo}
                    className="w-48 h-48 object-cover"
                  />
                )}
                <div className="flex-1 p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">
                        {noticia.titulo}
                      </h2>
                      <div className="flex gap-3 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full ${
                            noticia.estado === 'publicado'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}
                        >
                          {noticia.estado === 'publicado' ? 'Publicado' : 'Borrador'}
                        </span>
                        <span className="px-3 py-1 bg-techno-purple/20 text-techno-purple rounded-full">
                          {noticia.categoria}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-400 mb-4">{noticia.resumen}</p>

                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate(`/noticias/${noticia.slug}`)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                    >
                      <Eye className="w-4 h-4" />
                      Ver
                    </button>
                    <button
                      onClick={() => navigate(`/editar-noticia/${noticia.id}`)}
                      className="flex items-center gap-2 px-4 py-2 bg-techno-azure text-white rounded-lg hover:bg-opacity-90"
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(noticia.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
