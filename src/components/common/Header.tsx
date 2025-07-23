import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Menu, X, User, LogOut } from 'lucide-react';
import { navigationItems } from '../../data/mockData';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  return (
    <header className="bg-black border-b-2 border-gray-dark sticky top-0 z-50">
      {/* Logo y Branding */}
      <div className="border-b border-gray-dark">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-neon-mint brutal-border border-neon-mint flex items-center justify-center">
                <span className="font-jetbrains font-bold text-black text-sm">TE</span>
              </div>
              <div>
                <h1 className="font-bebas text-xl tracking-wider text-white">
                  TECHNO EXPERIENCE
                </h1>
                <p className="text-xs text-gray-light font-space">
                  Portal Cultural Inmersivo
                </p>
              </div>
            </Link>

            {/* Search Bar Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar eventos, artículos, artistas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-black border-2 border-gray-dark text-white px-4 py-2 w-80 font-space text-sm focus:border-neon-mint focus:outline-none brutal-border"
                />
                <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-light" />
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 border-2 border-gray-dark brutal-border hover:border-neon-mint transition-colors"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 text-white" />
              ) : (
                <Menu className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className={`${isMenuOpen ? 'block' : 'hidden'} md:block`}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            {/* Main Navigation */}
            <div className="flex flex-col md:flex-row md:space-x-0">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    className={`
                      px-6 py-4 font-bebas text-lg tracking-wider transition-all duration-200
                      border-r-2 md:border-r border-gray-dark last:border-r-0
                      hover:bg-opacity-20 hover:text-black relative overflow-hidden group
                      ${isActive 
                        ? `bg-white text-black border-b-4` 
                        : 'text-white hover:text-black'
                      }
                    `}
                    style={{
                      backgroundColor: isActive ? item.color : 'transparent',
                      borderBottomColor: isActive ? item.color : 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = item.color;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <span className="relative z-10">{item.label}</span>
                    
                    {/* Glitch Effect Background */}
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-10 animate-glitch"
                      style={{ backgroundColor: item.color }}
                    />
                  </Link>
                );
              })}
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-4 py-4 md:py-0">
              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 px-4 py-2 border-2 border-neon-mint text-neon-mint font-bebas tracking-wider hover:bg-neon-mint hover:text-black transition-colors brutal-border"
                  >
                    <User className="w-4 h-4" />
                    <span>{user.name.split(' ')[0]}</span>
                    <span className="text-xs">({user.role})</span>
                  </button>
                  
                  {showUserMenu && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-black border-2 border-gray-dark brutal-border z-50">
                      <div className="p-4 border-b border-gray-dark">
                        <div className="font-bebas text-white text-sm">{user.name}</div>
                        <div className="font-space text-gray-light text-xs">{user.email}</div>
                        <div className="font-space text-neon-mint text-xs capitalize">{user.role}</div>
                      </div>
                      <div className="p-2">
                        <Link
                          to="/admin"
                          className="block px-3 py-2 font-space text-sm text-white hover:bg-gray-dark transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Panel de Admin
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-3 py-2 font-space text-sm text-red-400 hover:bg-gray-dark transition-colors flex items-center space-x-2"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Cerrar Sesión</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 border-2 border-neon-mint text-neon-mint font-bebas tracking-wider hover:bg-neon-mint hover:text-black transition-colors brutal-border"
                  >
                    LOGIN
                  </Link>
                  <Link
                    to="/login"
                    className="px-4 py-2 bg-neon-pink border-2 border-neon-pink text-white font-bebas tracking-wider hover:bg-transparent hover:text-neon-pink transition-colors brutal-border"
                  >
                    REGISTRO
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden pb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-black border-2 border-gray-dark text-white px-4 py-2 w-full font-space text-sm focus:border-neon-mint focus:outline-none brutal-border"
              />
              <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-light" />
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
