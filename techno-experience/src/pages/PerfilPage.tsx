import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, MapPin, Tag, Save, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function PerfilPage() {
  const { user, perfil, updatePerfil } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre_artistico: '',
    nombre_comercial: '',
    biografia: '',
    ciudad: '',
    pais: '',
    avatar_url: '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (perfil) {
      setFormData({
        nombre_artistico: perfil.nombre_artistico || '',
        nombre_comercial: perfil.nombre_comercial || '',
        biografia: perfil.biografia || '',
        ciudad: perfil.ciudad || '',
        pais: perfil.pais || '',
        avatar_url: perfil.avatar_url || '',
      });
    }
  }, [user, perfil, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await updatePerfil(formData);
      setEditing(false);
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
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
            folder: 'avatars',
          },
        });

        if (error) throw error;

        if (data?.data?.publicUrl) {
          setFormData({ ...formData, avatar_url: data.data.publicUrl });
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error al subir imagen:', error);
    }
  }

  if (!user || !perfil) {
    return null;
  }

  const tipoPerfilLabels: Record<string, string> = {
    dj: 'DJ / Artista',
    promotor: 'Promotor / Festival',
    clubber: 'Clubber',
    sello: 'Sello Discográfico',
    agencia: 'Agencia',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
          {/* Header del perfil */}
          <div className="h-48 bg-gradient-to-r from-techno-purple to-techno-azure relative">
            {perfil.cover_url && (
              <img src={perfil.cover_url} alt="Cover" className="w-full h-full object-cover" />
            )}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex items-end gap-6">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-gray-700 border-4 border-gray-800 overflow-hidden">
                    {formData.avatar_url ? (
                      <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-16 h-16 text-gray-500" />
                      </div>
                    )}
                  </div>
                  {editing && (
                    <label className="absolute bottom-0 right-0 bg-techno-neon-green text-black p-2 rounded-full cursor-pointer hover:bg-opacity-90">
                      <Upload className="w-5 h-5" />
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {perfil.nombre_artistico || perfil.nombre_comercial || 'Sin nombre'}
                  </h1>
                  <div className="flex items-center gap-2 text-techno-neon-green">
                    <Tag className="w-4 h-4" />
                    <span>{tipoPerfilLabels[perfil.tipo_perfil]}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contenido del perfil */}
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Información del Perfil</h2>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="px-6 py-2 bg-techno-purple text-white rounded-lg hover:bg-opacity-90 transition"
                >
                  Editar Perfil
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={() => setEditing(false)}
                    className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-6 py-2 bg-techno-neon-green text-black rounded-lg hover:bg-opacity-90 transition disabled:opacity-50 flex items-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    {loading ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 mb-2 font-medium">Nombre Artístico</label>
                  <input
                    type="text"
                    value={formData.nombre_artistico}
                    onChange={(e) => setFormData({ ...formData, nombre_artistico: e.target.value })}
                    disabled={!editing}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-techno-neon-green outline-none disabled:opacity-50"
                    placeholder="Tu nombre artístico"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2 font-medium">Nombre Comercial</label>
                  <input
                    type="text"
                    value={formData.nombre_comercial}
                    onChange={(e) => setFormData({ ...formData, nombre_comercial: e.target.value })}
                    disabled={!editing}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-techno-neon-green outline-none disabled:opacity-50"
                    placeholder="Nombre comercial"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2 font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Ciudad
                  </label>
                  <input
                    type="text"
                    value={formData.ciudad}
                    onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                    disabled={!editing}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-techno-neon-green outline-none disabled:opacity-50"
                    placeholder="Tu ciudad"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2 font-medium">País</label>
                  <input
                    type="text"
                    value={formData.pais}
                    onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
                    disabled={!editing}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-techno-neon-green outline-none disabled:opacity-50"
                    placeholder="Tu país"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 mb-2 font-medium">Biografía</label>
                <textarea
                  value={formData.biografia}
                  onChange={(e) => setFormData({ ...formData, biografia: e.target.value })}
                  disabled={!editing}
                  rows={6}
                  className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-techno-neon-green outline-none disabled:opacity-50 resize-none"
                  placeholder="Cuéntanos sobre ti..."
                />
              </div>

              <div className="bg-gray-700/50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-gray-300 mb-2">
                  <Mail className="w-4 h-4" />
                  <span className="font-medium">Email:</span>
                </div>
                <p className="text-white">{user.email}</p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
