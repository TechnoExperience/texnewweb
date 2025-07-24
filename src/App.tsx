import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { MusicPlayerProvider } from './contexts/MusicPlayerContext';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import GlobalMusicPlayer from './components/ui/GlobalMusicPlayer';
import { useMusicPlayer } from './contexts/MusicPlayerContext';
import QuickLoader from './components/ui/QuickLoader';

// Páginas principales (no lazy)
import Home from './pages/Home';
import Articles from './pages/Articles';
import Events from './pages/Events';
import Login from './pages/Login';

// Páginas con lazy loading
const EventDetail = lazy(() => import('./pages/EventDetail'));
const ArticleDetail = lazy(() => import('./pages/ArticleDetail'));
const Archive = lazy(() => import('./pages/Archive'));
const Artists = lazy(() => import('./pages/Artists'));
const ArtistDetail = lazy(() => import('./pages/ArtistDetail'));
const Music = lazy(() => import('./pages/Music'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Admin = lazy(() => import('./pages/Admin'));

const AppContent: React.FC = () => {
  const { isPlayerVisible, hidePlayer } = useMusicPlayer();

  return (
    <>
      <Routes>
        {/* Ruta de login fuera del layout principal */}
        <Route path="/login" element={<Login />} />
        
        {/* Rutas principales con layout */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="/eventos" element={<Events />} />
          <Route path="/eventos/:id" element={
            <Suspense fallback={<QuickLoader message="Cargando evento..." />}>
              <EventDetail />
            </Suspense>
          } />
          <Route path="/articulos" element={<Articles />} />
          <Route path="/articulos/:id" element={
            <Suspense fallback={<QuickLoader message="Cargando artículo..." />}>
              <ArticleDetail />
            </Suspense>
          } />
          <Route path="/archivo" element={
            <Suspense fallback={<QuickLoader message="Cargando archivo..." />}>
              <Archive />
            </Suspense>
          } />
          <Route path="/artistas" element={
            <Suspense fallback={<QuickLoader message="Cargando artistas..." />}>
              <Artists />
            </Suspense>
          } />
          <Route path="/artistas/:id" element={
            <Suspense fallback={<QuickLoader message="Cargando artista..." />}>
              <ArtistDetail />
            </Suspense>
          } />
          <Route path="/musica" element={
            <Suspense fallback={<QuickLoader message="Cargando música..." />}>
              <Music />
            </Suspense>
          } />
          <Route path="/nosotros" element={
            <Suspense fallback={<QuickLoader message="Cargando..." />}>
              <About />
            </Suspense>
          } />
          <Route path="/contacto" element={
            <Suspense fallback={<QuickLoader message="Cargando..." />}>
              <Contact />
            </Suspense>
          } />
          
          {/* Ruta protegida del admin */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requiredRole="redactor">
                <Suspense fallback={<QuickLoader message="Cargando panel admin..." />}>
                  <Admin />
                </Suspense>
              </ProtectedRoute>
            } 
          />
        </Route>
      </Routes>
      
      {/* Reproductor global */}
      <GlobalMusicPlayer isVisible={isPlayerVisible} onClose={hidePlayer} />
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <MusicPlayerProvider>
        <Router>
          <AppContent />
        </Router>
      </MusicPlayerProvider>
    </AuthProvider>
  );
}

export default App;
