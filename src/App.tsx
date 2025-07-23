import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import Home from './pages/Home';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import Articles from './pages/Articles';
import ArticleDetail from './pages/ArticleDetail';
import Archive from './pages/Archive';
import Artists from './pages/Artists';
import ArtistDetail from './pages/ArtistDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Admin from './pages/Admin';

function App() {
  return (
    <AuthProvider>
      <Router>
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
      </Router>
    </AuthProvider>
  );
}

export default App;
