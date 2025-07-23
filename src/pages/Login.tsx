import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [error, setError] = useState('');
  
  const { login, register, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLoginMode) {
      const success = await login(formData.email, formData.password);
      if (success) {
        navigate(from, { replace: true });
      } else {
        setError('Email o contraseña incorrectos');
      }
    } else {
      if (!formData.name.trim()) {
        setError('El nombre es requerido');
        return;
      }
      const success = await register(formData.email, formData.password, formData.name);
      if (success) {
        navigate(from, { replace: true });
      } else {
        setError('Este email ya está registrado');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const demoCredentials = [
    { role: 'Administrador', email: 'admin@technoexperience.net', password: 'techno2025' },
    { role: 'Editor', email: 'editor@technoexperience.net', password: 'editor123' },
    { role: 'Redactor', email: 'redactor@technoexperience.net', password: 'redactor123' }
  ];

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <div className="w-12 h-12 bg-neon-mint brutal-border border-neon-mint flex items-center justify-center">
              <span className="font-jetbrains font-bold text-black text-lg">TE</span>
            </div>
            <div>
              <h1 className="font-bebas text-2xl tracking-wider text-white">
                TECHNO EXPERIENCE
              </h1>
            </div>
          </Link>
        </div>

        {/* Form */}
        <div className="bg-gray-dark bg-opacity-50 p-8 brutal-border border-gray-dark">
          <div className="mb-6">
            <h2 className="font-bebas text-3xl tracking-wider text-white mb-2">
              {isLoginMode ? 'INICIAR SESIÓN' : 'CREAR CUENTA'}
            </h2>
            <p className="text-gray-light font-space text-sm">
              {isLoginMode 
                ? 'Accede al panel de administración' 
                : 'Únete a la comunidad techno'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-900 bg-opacity-50 border-2 border-red-500 text-red-200 font-space text-sm brutal-border">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLoginMode && (
              <div>
                <label className="block font-space text-sm text-gray-light mb-2">
                  Nombre completo *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required={!isLoginMode}
                    className="w-full bg-black border-2 border-gray-dark text-white px-4 py-3 pl-12 font-space text-sm focus:border-neon-mint focus:outline-none brutal-border"
                    placeholder="Tu nombre"
                  />
                  <User className="absolute left-4 top-3.5 w-4 h-4 text-gray-light" />
                </div>
              </div>
            )}

            <div>
              <label className="block font-space text-sm text-gray-light mb-2">
                Email *
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-black border-2 border-gray-dark text-white px-4 py-3 pl-12 font-space text-sm focus:border-neon-mint focus:outline-none brutal-border"
                  placeholder="tu@email.com"
                />
                <Mail className="absolute left-4 top-3.5 w-4 h-4 text-gray-light" />
              </div>
            </div>

            <div>
              <label className="block font-space text-sm text-gray-light mb-2">
                Contraseña *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full bg-black border-2 border-gray-dark text-white px-4 py-3 pl-12 pr-12 font-space text-sm focus:border-neon-mint focus:outline-none brutal-border"
                  placeholder="••••••••"
                />
                <Lock className="absolute left-4 top-3.5 w-4 h-4 text-gray-light" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 w-4 h-4 text-gray-light hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-4 bg-neon-mint text-black font-bebas text-lg tracking-wider hover:bg-transparent hover:text-neon-mint border-2 border-neon-mint transition-all duration-300 brutal-border disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                isLoginMode ? 'INICIAR SESIÓN' : 'CREAR CUENTA'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLoginMode(!isLoginMode);
                setError('');
                setFormData({ email: '', password: '', name: '' });
              }}
              className="text-gray-light font-space text-sm hover:text-neon-mint transition-colors"
            >
              {isLoginMode 
                ? '¿No tienes cuenta? Regístrate aquí' 
                : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-8 bg-gray-dark bg-opacity-30 p-6 brutal-border border-gray-dark">
          <h3 className="font-bebas text-lg tracking-wider text-neon-yellow mb-4">
            CREDENCIALES DE DEMO
          </h3>
          <div className="space-y-3">
            {demoCredentials.map((cred, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div>
                  <div className="font-space text-white">{cred.role}</div>
                  <div className="font-space text-gray-light text-xs">{cred.email}</div>
                </div>
                <div className="font-space text-neon-mint text-xs">
                  {cred.password}
                </div>
              </div>
            ))}
          </div>
          <p className="text-gray-light font-space text-xs mt-4">
            Usa estas credenciales para probar diferentes niveles de acceso.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
