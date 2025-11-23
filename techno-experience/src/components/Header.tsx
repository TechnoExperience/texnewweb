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
    <header className="bg-techno-cyan-dark/95 backdrop-blur-md border-b-2 border-techno-neon-green sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo - Responsive mejorado */}
          <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-techno-purple to-techno-azure rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <span className="text-xl sm:text-2xl font-bold text-techno-neon-green">TE</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-bold text-white">Techno Experience</h1>
              <p className="text-xs text-techno-neon-green">Magazine</p>
            </div>
          </Link>

          {/* Desktop Navigation - Mejorado */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`font-medium transition-all duration-200 px-2 py-1 rounded-md ${
                  isActive(item.path)
                    ? 'text-techno-neon-green border-b-2 border-techno-neon-green'
                    : 'text-gray-300 hover:text-techno-azure hover:bg-white/5'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User Menu - Touch-friendly */}
          <div className="hidden lg:flex items-center space-x-3 xl:space-x-4">
            {user ? (
              <>
                <Link
                  to="/perfil"
                  className="flex items-center space-x-2 px-3 xl:px-4 py-2 bg-techno-purple text-white rounded-lg hover:bg-techno-purple/80 transition-all duration-200 min-h-[44px]"
                >
                  <User className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm xl:text-base truncate max-w-[120px] xl:max-w-none">{perfil?.nombre_artistico || perfil?.nombre_comercial || 'Perfil'}</span>
                </Link>
                <button
                  onClick={signOut}
                  className="p-2 text-gray-300 hover:text-techno-neon-green transition-colors duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-white/5"
                  aria-label="Cerrar sesión"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-white hover:text-techno-neon-green transition-colors duration-200 min-h-[44px] flex items-center"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/registro"
                  className="px-5 xl:px-6 py-2 bg-gradient-to-r from-techno-purple to-techno-azure text-white rounded-lg hover:opacity-90 transition-all duration-200 min-h-[44px] flex items-center justify-center font-medium"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button - Touch-friendly */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden text-white p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors duration-200"
            aria-label="Menú"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu - Mejorado con animación */}
        {isMenuOpen && (
          <div className="lg:hidden overflow-hidden">
            <nav className="flex flex-col space-y-2 pb-4 pt-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg min-h-[44px] flex items-center transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-techno-purple text-techno-neon-green font-semibold'
                      : 'text-gray-300 hover:bg-techno-purple/50 active:bg-techno-purple/70'
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
