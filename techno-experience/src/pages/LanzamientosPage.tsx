import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Music2, Disc, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Lanzamiento } from '../types/database';

export default function LanzamientosPage() {
  const [lanzamientos, setLanzamientos] = useState<Lanzamiento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLanzamientos();
  }, []);

  async function loadLanzamientos() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('lanzamientos')
        .select('*')
        .eq('estado', 'publicado')
        .order('fecha_lanzamiento', { ascending: false });

      if (!error && data) {
        setLanzamientos(data);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <section className="bg-gradient-to-r from-techno-magenta to-techno-purple py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold text-white mb-4 flex items-center gap-4">
            <Music2 className="w-12 h-12 text-techno-neon-green" />
            Lanzamientos
          </h1>
          <p className="text-xl text-gray-200">
            Nuevos tracks, EPs y álbumes de la escena techno
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center text-gray-400 py-20">Cargando lanzamientos...</div>
        ) : lanzamientos.length === 0 ? (
          <div className="text-center text-gray-400 py-20">
            <Music2 className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-lg">No hay lanzamientos disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {lanzamientos.map((lanzamiento) => (
              <LanzamientoCard key={lanzamiento.id} lanzamiento={lanzamiento} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function LanzamientoCard({ lanzamiento }: { lanzamiento: Lanzamiento }) {
  const tipoLabels: Record<string, string> = {
    single: 'Single',
    ep: 'EP',
    album: 'Álbum',
    remix: 'Remix',
    compilacion: 'Compilación',
  };

  return (
    <Link
      to={`/lanzamientos/${lanzamiento.slug}`}
      className="group bg-gray-800 rounded-xl overflow-hidden hover:ring-2 hover:ring-techno-magenta transition"
    >
      <div className="relative aspect-square bg-gray-700">
        {lanzamiento.artwork_url ? (
          <img
            src={lanzamiento.artwork_url}
            alt={lanzamiento.titulo}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Disc className="w-16 h-16 text-gray-600" />
          </div>
        )}
        <div className="absolute top-3 right-3 bg-techno-neon-green text-black px-3 py-1 rounded-full text-xs font-semibold">
          {tipoLabels[lanzamiento.tipo_lanzamiento] || lanzamiento.tipo_lanzamiento}
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-white font-bold text-lg mb-2 group-hover:text-techno-magenta transition line-clamp-2">
          {lanzamiento.titulo}
        </h3>
        {lanzamiento.genero && (
          <div className="text-gray-400 text-sm mb-2">{lanzamiento.genero}</div>
        )}
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <Calendar className="w-4 h-4" />
          <span>
            {new Date(lanzamiento.fecha_lanzamiento).toLocaleDateString('es-ES', {
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>
      </div>
    </Link>
  );
}
