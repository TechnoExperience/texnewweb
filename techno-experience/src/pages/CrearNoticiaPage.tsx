import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Upload, Eye, Tag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import RichTextEditor from '../components/RichTextEditor';

export default function CrearNoticiaPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    titulo: '',
    slug: '',
    resumen: '',
    contenido: '',
    categoria: 'Noticias',
    etiquetas: '',
    imagen_portada: '',
    meta_title: '',
    meta_description: '',
    og_title: '',
    og_description: '',
    og_image: '',
    og_type: 'article',
    h1_tag: '',
    h2_tags: '',
    h3_tags: '',
    estado: 'borrador' as 'borrador' | 'publicado',
  });

  const generateSlug = (titulo: string) => {
    return titulo
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTituloChange = (titulo: string) => {
    setFormData({
      ...formData,
      titulo,
      slug: generateSlug(titulo),
      meta_title: titulo.slice(0, 60),
      og_title: titulo.slice(0, 60),
      h1_tag: titulo,
    });
  };

  const handleResumenChange = (resumen: string) => {
    setFormData({
      ...formData,
      resumen,
      meta_description: resumen.slice(0, 160),
      og_description: resumen.slice(0, 200),
    });
  };

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const fileData = event.target?.result as string;

        const { data, error } = await supabase.functions.invoke('upload-media', {
          body: {
            fileData,
            fileName: file.name,
            folder: 'noticias',
          },
        });

        if (error) throw error;

        if (data?.data?.publicUrl) {
          setFormData({ ...formData, imagen_portada: data.data.publicUrl, og_image: data.data.publicUrl });
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error al subir imagen:', err);
      setError('Error al subir la imagen');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      setError('Debes iniciar sesión');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const etiquetasArray = formData.etiquetas
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);

      const h2TagsArray = formData.h2_tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);

      const h3TagsArray = formData.h3_tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);

      const { error: insertError } = await supabase.from('noticias').insert({
        ...formData,
        etiquetas: etiquetasArray,
        h2_tags: h2TagsArray.length > 0 ? h2TagsArray : null,
        h3_tags: h3TagsArray.length > 0 ? h3TagsArray : null,
        autor_id: user.id,
        fecha_publicacion: formData.estado === 'publicado' ? new Date().toISOString() : null,
      });

      if (insertError) throw insertError;

      navigate('/mis-contenidos');
    } catch (err: any) {
      console.error('Error al crear noticia:', err);
      setError(err.message || 'Error al crear la noticia');
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-xl mb-4">Debes iniciar sesión para crear contenido</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-techno-purple rounded-lg hover:bg-opacity-90"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-gray-800 rounded-xl shadow-2xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-white">Crear Noticia</h1>
            <button
              onClick={() => navigate(-1)}
              className="text-gray-400 hover:text-white"
            >
              Cancelar
            </button>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Título */}
            <div>
              <label className="block text-gray-300 mb-2 font-medium">Título *</label>
              <input
                type="text"
                value={formData.titulo}
                onChange={(e) => handleTituloChange(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-techno-neon-green outline-none"
                placeholder="Título de la noticia"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-gray-300 mb-2 font-medium">Slug (URL)</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-techno-azure outline-none"
                placeholder="slug-de-la-noticia"
              />
              <p className="text-gray-500 text-sm mt-1">
                Se genera automáticamente desde el título
              </p>
            </div>

            {/* Resumen */}
            <div>
              <label className="block text-gray-300 mb-2 font-medium">Resumen *</label>
              <textarea
                value={formData.resumen}
                onChange={(e) => handleResumenChange(e.target.value)}
                required
                rows={3}
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-techno-neon-green outline-none resize-none"
                placeholder="Breve resumen de la noticia (140-300 caracteres)"
                maxLength={300}
              />
              <p className="text-gray-500 text-sm mt-1">
                {formData.resumen.length}/300 caracteres
              </p>
            </div>

            {/* Contenido con Editor WYSIWYG */}
            <div>
              <label className="block text-gray-300 mb-2 font-medium">Contenido *</label>
              <RichTextEditor
                content={formData.contenido}
                onChange={(content) => setFormData({ ...formData, contenido: content })}
                placeholder="Escribe el contenido de la noticia aquí..."
              />
            </div>

            {/* Categoría y Etiquetas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-300 mb-2 font-medium flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Categoría
                </label>
                <select
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-techno-azure outline-none"
                >
                  <option value="Noticias">Noticias</option>
                  <option value="Entrevistas">Entrevistas</option>
                  <option value="Reseñas">Reseñas</option>
                  <option value="Reportajes">Reportajes</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 mb-2 font-medium">Etiquetas</label>
                <input
                  type="text"
                  value={formData.etiquetas}
                  onChange={(e) => setFormData({ ...formData, etiquetas: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-techno-azure outline-none"
                  placeholder="techno, berlin, festival (separadas por comas)"
                />
              </div>
            </div>

            {/* Imagen de portada */}
            <div>
              <label className="block text-gray-300 mb-2 font-medium flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Imagen de Portada
              </label>
              {formData.imagen_portada && (
                <img
                  src={formData.imagen_portada}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-techno-azure outline-none"
              />
            </div>

            {/* SEO */}
            <div className="bg-gray-700/50 p-6 rounded-lg space-y-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-techno-neon-green" />
                SEO y Metadatos
              </h3>

              {/* Heading Tags */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-techno-neon-green">
                  Etiquetas de Encabezado
                </h4>
                
                <div>
                  <label className="block text-gray-300 mb-2 font-medium">H1 Tag (Principal)</label>
                  <input
                    type="text"
                    value={formData.h1_tag}
                    onChange={(e) => setFormData({ ...formData, h1_tag: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-techno-azure outline-none"
                    placeholder="Encabezado principal (se genera automáticamente)"
                  />
                  <p className="text-gray-500 text-sm mt-1">
                    Solo debe haber un H1 por página
                  </p>
                </div>

                <div>
                  <label className="block text-gray-300 mb-2 font-medium">H2 Tags (Secciones)</label>
                  <input
                    type="text"
                    value={formData.h2_tags}
                    onChange={(e) => setFormData({ ...formData, h2_tags: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-techno-azure outline-none"
                    placeholder="Sección 1, Sección 2, Sección 3 (separadas por comas)"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2 font-medium">H3 Tags (Subsecciones)</label>
                  <input
                    type="text"
                    value={formData.h3_tags}
                    onChange={(e) => setFormData({ ...formData, h3_tags: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-techno-azure outline-none"
                    placeholder="Subsección A, Subsección B (separadas por comas)"
                  />
                </div>
              </div>

              {/* Meta Tags */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-techno-neon-green">
                  Meta Tags
                </h4>

                <div>
                  <label className="block text-gray-300 mb-2 font-medium">Meta Title</label>
                  <input
                    type="text"
                    value={formData.meta_title}
                    onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                    maxLength={60}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-techno-azure outline-none"
                    placeholder="Título para SEO (60 caracteres)"
                  />
                  <p className="text-gray-500 text-sm mt-1">
                    {formData.meta_title.length}/60 caracteres
                  </p>
                </div>

                <div>
                  <label className="block text-gray-300 mb-2 font-medium">Meta Description</label>
                  <textarea
                    value={formData.meta_description}
                    onChange={(e) =>
                      setFormData({ ...formData, meta_description: e.target.value })
                    }
                    maxLength={160}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-techno-azure outline-none resize-none"
                    placeholder="Descripción para motores de búsqueda (160 caracteres)"
                  />
                  <p className="text-gray-500 text-sm mt-1">
                    {formData.meta_description.length}/160 caracteres
                  </p>
                </div>
              </div>

              {/* Open Graph */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-techno-neon-green">
                  Open Graph (Redes Sociales)
                </h4>

                <div>
                  <label className="block text-gray-300 mb-2 font-medium">OG Title</label>
                  <input
                    type="text"
                    value={formData.og_title}
                    onChange={(e) => setFormData({ ...formData, og_title: e.target.value })}
                    maxLength={60}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-techno-azure outline-none"
                    placeholder="Título para compartir en redes sociales"
                  />
                  <p className="text-gray-500 text-sm mt-1">
                    {formData.og_title.length}/60 caracteres
                  </p>
                </div>

                <div>
                  <label className="block text-gray-300 mb-2 font-medium">OG Description</label>
                  <textarea
                    value={formData.og_description}
                    onChange={(e) =>
                      setFormData({ ...formData, og_description: e.target.value })
                    }
                    maxLength={200}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-techno-azure outline-none resize-none"
                    placeholder="Descripción al compartir en redes sociales (200 caracteres)"
                  />
                  <p className="text-gray-500 text-sm mt-1">
                    {formData.og_description.length}/200 caracteres
                  </p>
                </div>

                <div>
                  <label className="block text-gray-300 mb-2 font-medium">OG Image URL</label>
                  <input
                    type="text"
                    value={formData.og_image}
                    onChange={(e) => setFormData({ ...formData, og_image: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-techno-azure outline-none"
                    placeholder="URL de imagen para compartir (se usa la portada automáticamente)"
                    disabled
                  />
                  <p className="text-gray-500 text-sm mt-1">
                    Se sincroniza automáticamente con la imagen de portada
                  </p>
                </div>

                <div>
                  <label className="block text-gray-300 mb-2 font-medium">OG Type</label>
                  <select
                    value={formData.og_type}
                    onChange={(e) => setFormData({ ...formData, og_type: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-techno-azure outline-none"
                  >
                    <option value="article">Artículo</option>
                    <option value="website">Sitio Web</option>
                    <option value="music.song">Música</option>
                    <option value="video.other">Video</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-4">
              <button
                type="submit"
                onClick={() => setFormData({ ...formData, estado: 'borrador' })}
                disabled={loading}
                className="flex-1 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {loading ? 'Guardando...' : 'Guardar Borrador'}
              </button>
              <button
                type="submit"
                onClick={() => setFormData({ ...formData, estado: 'publicado' })}
                disabled={loading}
                className="flex-1 py-3 bg-gradient-to-r from-techno-purple to-techno-azure text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {loading ? 'Publicando...' : 'Publicar Ahora'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
