import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import EventosPage from './pages/EventosPage';
import NoticiasPage from './pages/NoticiasPage';
import LanzamientosPage from './pages/LanzamientosPage';
import VideosPage from './pages/VideosPage';
import LoginPage from './pages/LoginPage';
import RegistroPage from './pages/RegistroPage';
import PerfilPage from './pages/PerfilPage';
import CrearNoticiaPage from './pages/CrearNoticiaPage';
import MisContenidosPage from './pages/MisContenidosPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/eventos" element={<EventosPage />} />
              <Route path="/noticias" element={<NoticiasPage />} />
              <Route path="/lanzamientos" element={<LanzamientosPage />} />
              <Route path="/videos" element={<VideosPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/registro" element={<RegistroPage />} />
              <Route path="/perfil" element={<PerfilPage />} />
              <Route path="/crear-noticia" element={<CrearNoticiaPage />} />
              <Route path="/mis-contenidos" element={<MisContenidosPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
