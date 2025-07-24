import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

const MainLayout: React.FC = () => {
  const { isLoading } = useAuth();

  // Mostrar loading minimal para mejor UX
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="w-full h-1 bg-gray-800">
          <div className="h-full bg-neon-mint animate-pulse"></div>
        </div>
        <div className="flex items-center justify-center pt-24">
          <div className="w-6 h-6 border-2 border-neon-mint border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="min-h-screen">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
