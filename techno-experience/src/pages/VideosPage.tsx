import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Video, Play, Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Video as VideoType } from '../types/database';

export default function VideosPage() {
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVideos();
  }, []);

  async function loadVideos() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('estado', 'publicado')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setVideos(data);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <section className="bg-gradient-to-r from-techno-azure to-techno-magenta py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold text-white mb-4 flex items-center gap-4">
            <Video className="w-12 h-12 text-techno-neon-green" />
            Videos
          </h1>
          <p className="text-xl text-gray-200">
            Aftermovies, lives y contenido exclusivo
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center text-gray-400 py-20">Cargando videos...</div>
        ) : videos.length === 0 ? (
          <div className="text-center text-gray-400 py-20">
            <Video className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-lg">No hay videos disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function VideoCard({ video }: { video: VideoType }) {
  const tipoLabels: Record<string, string> = {
    aftermovie: 'Aftermovie',
    live_set: 'Live Set',
    videoclip: 'Videoclip',
    dj_mix: 'DJ Mix',
    documental: 'Documental',
  };

  return (
    <Link
      to={`/videos/${video.slug}`}
      className="group bg-gray-800 rounded-xl overflow-hidden hover:ring-2 hover:ring-techno-azure transition"
    >
      <div className="relative h-48 bg-gray-700">
        {video.thumbnail_url ? (
          <img
            src={video.thumbnail_url}
            alt={video.titulo}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Video className="w-16 h-16 text-gray-600" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-16 h-16 bg-techno-neon-green rounded-full flex items-center justify-center">
            <Play className="w-8 h-8 text-black fill-black ml-1" />
          </div>
        </div>
        <div className="absolute top-3 right-3 bg-techno-azure text-white px-3 py-1 rounded-full text-xs font-semibold">
          {tipoLabels[video.tipo_video] || video.tipo_video}
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-white font-bold text-lg mb-2 group-hover:text-techno-azure transition line-clamp-2">
          {video.titulo}
        </h3>
        {video.descripcion && (
          <p className="text-gray-400 text-sm mb-3 line-clamp-2">{video.descripcion}</p>
        )}
        <div className="flex items-center gap-4 text-gray-500 text-sm">
          {video.duracion_segundos && (
            <span>{Math.floor(video.duracion_segundos / 60)}:{String(video.duracion_segundos % 60).padStart(2, '0')}</span>
          )}
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{video.vistas.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
