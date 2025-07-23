import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'editor' | 'redactor';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();
  const [timeoutReached, setTimeoutReached] = useState(false);

  // Timeout para evitar carga infinita
  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeoutReached(true);
    }, 10000); // 10 segundos timeout

    return () => clearTimeout(timer);
  }, []);

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading && !timeoutReached) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-neon-mint border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-light font-space text-sm">Verificando acceso...</p>
          <p className="text-gray-400 font-space text-xs mt-2">
            Si esto tarda mucho, recarga la página
          </p>
        </div>
      </div>
    );
  }

  // Si se alcanzó el timeout y aún está cargando, asumir que no está autenticado
  if (timeoutReached && isLoading) {
    console.warn('Auth timeout reached, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si se requiere un rol específico, verificar permisos
  if (requiredRole && user) {
    const roleHierarchy = { 'redactor': 1, 'editor': 2, 'admin': 3 };
    const userLevel = roleHierarchy[user.role];
    const requiredLevel = roleHierarchy[requiredRole];

    if (userLevel < requiredLevel) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-500 bg-opacity-20 brutal-border border-red-500 flex items-center justify-center mx-auto mb-6">
              <span className="text-red-500 text-2xl">⚠</span>
            </div>
            <h2 className="font-bebas text-2xl tracking-wider text-white mb-4">
              ACCESO DENEGADO
            </h2>
            <p className="text-gray-light font-space text-sm mb-6">
              No tienes permisos suficientes para acceder a esta sección. 
              Se requiere rol de {requiredRole} o superior.
            </p>
            <p className="text-gray-light font-space text-xs">
              Tu rol actual: <span className="text-neon-mint">{user.role}</span>
            </p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
