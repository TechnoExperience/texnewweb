import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, perfil, signOut } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Inicio' },
    { path: '/noticias', label: 'Noticias' },
    { path: '/eventos', label: 'Eventos' },
    { path: '/lanzamientos', label: 'Lanzamientos' },
    { path: '/videos', label: 'Videos' },
  ];

  return (
    <header className="bg-techno-cyan-dark border-b-2 border-techno-neon-green sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-techno-purple to-techno-azure rounded-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-techno-neon-green">TE</span>
            </div>
            <div className="hidden md:block">
              <h1 className="text-xl font-bold text-white">Techno Experience</h1>
              <p className="text-xs text-techno-neon-green">Magazine</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`font-medium transition-colors ${
                  isActive(item.path)
                    ? 'text-techno-neon-green border-b-2 border-techno-neon-green'
                    : 'text-gray-300 hover:text-techno-azure'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User Menu */}
          <div className="hidden lg:flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/perfil"
                  className="flex items-center space-x-2 px-4 py-2 bg-techno-purple text-white rounded-lg hover:bg-opacity-80 transition"
                >
                  <User className="w-4 h-4" />
                  <span>{perfil?.nombre_artistico || perfil?.nombre_comercial || 'Perfil'}</span>
                </Link>
                <button
                  onClick={signOut}
                  className="p-2 text-gray-300 hover:text-techno-neon-green transition"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-white hover:text-techno-neon-green transition"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/registro"
                  className="px-6 py-2 bg-gradient-to-r from-techno-purple to-techno-azure text-white rounded-lg hover:opacity-90 transition"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden text-white p-2"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden pb-4">
            <nav className="flex flex-col space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-4 py-2 rounded ${
                    isActive(item.path)
                      ? 'bg-techno-purple text-techno-neon-green'
                      : 'text-gray-300 hover:bg-techno-purple/50'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-gray-700">
                {user ? (
                  <>
                    <Link
                      to="/perfil"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-4 py-2 text-white hover:bg-techno-purple/50 rounded"
                    >
                      Mi Perfil
                    </Link>
                    <button
                      onClick={() => {
                        signOut();
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-gray-300 hover:bg-techno-purple/50 rounded"
                    >
                      Cerrar Sesión
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-4 py-2 text-white hover:bg-techno-purple/50 rounded"
                    >
                      Iniciar Sesión
                    </Link>
                    <Link
                      to="/registro"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-4 py-2 bg-techno-purple text-white rounded mt-2"
                    >
                      Registrarse
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
