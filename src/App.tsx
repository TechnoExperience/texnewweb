import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { MusicPlayerProvider } from './contexts/MusicPlayerContext';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import GlobalMusicPlayer from './components/ui/GlobalMusicPlayer';
import { useMusicPlayer } from './contexts/MusicPlayerContext';
import Home from './pages/Home';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import Articles from './pages/Articles';
import ArticleDetail from './pages/ArticleDetail';
import Archive from './pages/Archive';
import Artists from './pages/Artists';
import ArtistDetail from './pages/ArtistDetail';
import Music from './pages/Music';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Admin from './pages/Admin';

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
          <Route path="/eventos/:id" element={<EventDetail />} />
          <Route path="/articulos" element={<Articles />} />
          <Route path="/articulos/:id" element={<ArticleDetail />} />
          <Route path="/archivo" element={<Archive />} />
          <Route path="/artistas" element={<Artists />} />
          <Route path="/artistas/:id" element={<ArtistDetail />} />
          <Route path="/musica" element={<Music />} />
          <Route path="/nosotros" element={<About />} />
          <Route path="/contacto" element={<Contact />} />
          
          {/* Ruta protegida del admin */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requiredRole="redactor">
                <Admin />
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
