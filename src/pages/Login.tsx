import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isResetMode, setIsResetMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { login, register, resetPassword, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (isResetMode) {
      if (!formData.email.trim()) {
        setError('El email es requerido');
        return;
      }

      const result = await resetPassword(formData.email);
      if (result.success) {
        setSuccess('Se ha enviado un email con las instrucciones para restablecer tu contraseña');
        setFormData({ email: '', password: '', name: '' });
        setIsResetMode(false);
      } else {
        setError(result.error || 'Error al enviar email de recuperación');
      }
      return;
    }

    if (isLoginMode) {
      if (!formData.email.trim() || !formData.password.trim()) {
        setError('Email y contraseña son requeridos');
        return;
      }

      const result = await login(formData.email, formData.password);
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.error || 'Error al iniciar sesión');
      }
    } else {
      if (!formData.name.trim()) {
        setError('El nombre es requerido');
        return;
      }
      if (!formData.email.trim() || !formData.password.trim()) {
        setError('Todos los campos son requeridos');
        return;
      }
      if (formData.password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        return;
      }

      const result = await register(formData.email, formData.password, formData.name);
      if (result.success) {
        if (result.error) {
          // Caso de confirmación de email
          setSuccess(result.error);
          setIsLoginMode(true);
          setFormData({ ...formData, password: '', name: '' });
        } else {
          navigate(from, { replace: true });
        }
      } else {
        setError(result.error || 'Error al registrarse');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Limpiar mensajes al cambiar campos
    setError('');
    setSuccess('');
  };

  const switchMode = () => {
    setIsLoginMode(!isLoginMode);
    setIsResetMode(false);
    setError('');
    setSuccess('');
    setFormData({ email: '', password: '', name: '' });
  };

  const switchToResetMode = () => {
    setIsResetMode(true);
    setIsLoginMode(false);
    setError('');
    setSuccess('');
    setFormData({ email: '', password: '', name: '' });
  };

  const backToLogin = () => {
    setIsResetMode(false);
    setIsLoginMode(true);
    setError('');
    setSuccess('');
    setFormData({ email: '', password: '', name: '' });
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="font-bebas text-4xl text-white tracking-wider hover:text-neon-mint transition-colors">
              TECHNO<span className="text-neon-mint">EXPERIENCE</span>
            </h1>
          </Link>
        </div>

        {/* Form Container */}
        <div className="bg-gray-dark bg-opacity-50 p-8 brutal-border border-gray-600">
          <div className="text-center mb-6">
            <h2 className="font-bebas text-2xl text-white tracking-wider">
              {isResetMode ? 'RECUPERAR CONTRASEÑA' : isLoginMode ? 'INICIAR SESIÓN' : 'REGISTRARSE'}
            </h2>
            <p className="text-gray-light font-space text-sm mt-2">
              {isResetMode 
                ? 'Ingresa tu email para recibir instrucciones'
                : isLoginMode 
                ? 'Accede al panel de administración' 
                : 'Crea tu cuenta de redactor'
              }
            </p>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
              <span className="text-red-300 font-space text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-500 bg-opacity-20 border border-green-500 flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
              <span className="text-green-300 font-space text-sm">{success}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field (only for register) */}
            {!isLoginMode && !isResetMode && (
              <div>
                <label className="block text-white font-space text-sm mb-2">
                  Nombre completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-light w-5 h-5" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-black border-2 border-gray-dark text-white pl-12 pr-4 py-3 font-space text-sm focus:border-neon-mint focus:outline-none brutal-border"
                    placeholder="Tu nombre completo"
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-white font-space text-sm mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-light w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-black border-2 border-gray-dark text-white pl-12 pr-4 py-3 font-space text-sm focus:border-neon-mint focus:outline-none brutal-border"
                  placeholder="tu@email.com"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field (not for reset mode) */}
            {!isResetMode && (
              <div>
                <label className="block text-white font-space text-sm mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-light w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-black border-2 border-gray-dark text-white pl-12 pr-12 py-3 font-space text-sm focus:border-neon-mint focus:outline-none brutal-border"
                    placeholder="••••••••"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-light hover:text-white transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {!isLoginMode && (
                  <p className="text-gray-light font-space text-xs mt-1">
                    Mínimo 6 caracteres
                  </p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-neon-mint text-black py-3 font-bebas text-lg tracking-wider hover:bg-transparent hover:text-neon-mint border-2 border-neon-mint transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  PROCESANDO...
                </>
              ) : (
                isResetMode ? 'ENVIAR EMAIL' : isLoginMode ? 'INICIAR SESIÓN' : 'REGISTRARSE'
              )}
            </button>
          </form>

          {/* Mode Switchers */}
          <div className="mt-6 space-y-3">
            {!isResetMode && (
              <>
                {isLoginMode && (
                  <button
                    onClick={switchToResetMode}
                    className="block w-full text-center text-gray-light hover:text-white transition-colors font-space text-sm"
                    disabled={isLoading}
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                )}
                
                <div className="text-center">
                  <span className="text-gray-light font-space text-sm">
                    {isLoginMode ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
                  </span>
                  <button
                    onClick={switchMode}
                    className="ml-2 text-neon-mint hover:text-white transition-colors font-space text-sm"
                    disabled={isLoading}
                  >
                    {isLoginMode ? 'Regístrate' : 'Inicia sesión'}
                  </button>
                </div>
              </>
            )}

            {isResetMode && (
              <button
                onClick={backToLogin}
                className="block w-full text-center text-gray-light hover:text-white transition-colors font-space text-sm"
                disabled={isLoading}
              >
                Volver al inicio de sesión
              </button>
            )}
          </div>

          {/* Demo Users Info */}
          {isLoginMode && !isResetMode && (
            <div className="mt-8 p-4 bg-gray-dark bg-opacity-30 border border-gray-600">
              <p className="text-gray-light font-space text-xs mb-2">
                Para probar la aplicación, puedes registrarte o contactar al administrador para obtener credenciales.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <Link 
            to="/" 
            className="text-gray-light hover:text-white transition-colors font-space text-sm"
          >
            ← Volver al sitio web
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
