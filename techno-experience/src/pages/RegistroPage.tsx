import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegistroPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tipoPerfil, setTipoPerfil] = useState<string>('clubber');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const tiposPerfil = [
    { value: 'clubber', label: 'Clubber', description: 'Asistente a eventos' },
    { value: 'dj', label: 'DJ', description: 'Artista / DJ' },
    { value: 'promotor', label: 'Promotor/Festival', description: 'Organizador de eventos' },
    { value: 'sello', label: 'Sello Discográfico', description: 'Label musical' },
    { value: 'agencia', label: 'Agencia', description: 'Management de artistas' },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signUp(email, password, tipoPerfil);
      navigate('/perfil');
    } catch (err: any) {
      setError(err.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-800 rounded-xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-techno-purple to-techno-azure rounded-full mb-4">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Crear Cuenta</h2>
            <p className="text-gray-400">Únete a la comunidad Techno Experience</p>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-300 mb-2 font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-techno-neon-green outline-none"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 mb-2 font-medium">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-techno-neon-green outline-none"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 mb-3 font-medium flex items-center gap-2">
                <User className="w-5 h-5" />
                Tipo de Perfil
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {tiposPerfil.map((tipo) => (
                  <label
                    key={tipo.value}
                    className={`relative flex items-start p-4 border-2 rounded-lg cursor-pointer transition ${
                      tipoPerfil === tipo.value
                        ? 'border-techno-neon-green bg-techno-neon-green/10'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <input
                      type="radio"
                      name="tipoPerfil"
                      value={tipo.value}
                      checked={tipoPerfil === tipo.value}
                      onChange={(e) => setTipoPerfil(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <div className="text-white font-semibold mb-1">{tipo.label}</div>
                      <div className="text-gray-400 text-sm">{tipo.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-techno-purple to-techno-azure text-white font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </form>

          <div className="mt-6 text-center text-gray-400">
            <p>
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-techno-neon-green hover:underline">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
