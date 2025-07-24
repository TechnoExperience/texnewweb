import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  Upload, 
  BarChart3, 
  Users, 
  Calendar,
  FileText,
  Image,
  Music,
  X,
  Eye,
  EyeOff,
  Star,
  MapPin,
  Tag as TagIcon,
  Loader2,
  Check,
  AlertCircle,
  UserCheck,
  UserX,
  Shield,
  Play,
  Pause,
  Volume2,
  Ban,
  UnlockKeyhole
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import ImageUpload from '../components/ui/ImageUpload';
import AudioUpload from '../components/ui/AudioUpload';
import { createSampleArticles, createSampleEvents } from '../utils/createSampleData';
import type { Event, Artist, Article, Venue, MusicTrack, UserProfile } from '../data/types';

const Admin: React.FC = () => {
  const { user } = useAuth();

  // Estados para las diferentes secciones
  const [activeTab, setActiveTab] = useState<'dashboard' | 'events' | 'artists' | 'articles' | 'venues' | 'music' | 'users'>('dashboard');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [modalType, setModalType] = useState<'event' | 'artist' | 'article' | 'venue' | 'music' | 'user'>('event');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para datos
  const [data, setData] = useState<{
    events?: Event[];
    artists?: Artist[];
    articles?: Article[];
    venues?: Venue[];
  }>({});

  // Estados para estadísticas
  const [stats, setStats] = useState({
    events: 0,
    artists: 0,
    articles: 0,
    venues: 0,
    music: 0,
    users: 0,
    activeUsers: 0,
    totalPlays: 0
  });

  // Estados para música
  const [musicTracks, setMusicTracks] = useState<MusicTrack[]>([]);
  const [currentPlaying, setCurrentPlaying] = useState<string | null>(null);

  // Estados para usuarios
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [creatingData, setCreatingData] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
      loadStats();
    }
  }, [user, activeTab]);

  const fetchData = async (table: string) => {
    try {
      setLoading(true);
      const { data: tableData, error } = await supabase
        .from(table)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setData(prev => ({ ...prev, [table]: tableData || [] }));
    } catch (error: any) {
      setError(error.message);
      console.error(`Error loading ${table}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    try {
      switch (activeTab) {
        case 'events':
          await fetchData('events');
          break;
        case 'artists':
          await fetchData('artists');
          break;
        case 'articles':
          await fetchData('articles');
          break;
        case 'venues':
          await fetchData('venues');
          break;
        case 'music':
          await loadMusicTracks();
          break;
        case 'users':
          await loadUsers();
          break;
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadMusicTracks = async () => {
    try {
      const { data: tracks, error } = await supabase
        .from('music_tracks')
        .select(`
          *,
          artist:artists(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMusicTracks(tracks || []);
    } catch (error) {
      console.error('Error loading music tracks:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const { data: userProfiles, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(userProfiles || []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadStats = async () => {
    try {
      // Cargar estadísticas solo cuando se necesiten (dashboard activo)
      if (activeTab !== 'dashboard') return;
      
      const [
        { count: eventsCount },
        { count: artistsCount },
        { count: articlesCount },
        { count: venuesCount },
        { count: musicCount },
        { count: usersCount }
      ] = await Promise.all([
        supabase.from('events').select('id', { count: 'exact', head: true }),
        supabase.from('artists').select('id', { count: 'exact', head: true }),
        supabase.from('articles').select('id', { count: 'exact', head: true }),
        supabase.from('venues').select('id', { count: 'exact', head: true }),
        supabase.from('music_tracks').select('id', { count: 'exact', head: true }),
        supabase.from('user_profiles').select('id', { count: 'exact', head: true })
      ]);

      setStats({
        events: eventsCount || 0,
        artists: artistsCount || 0,
        articles: articlesCount || 0,
        venues: venuesCount || 0,
        music: musicCount || 0,
        users: usersCount || 0,
        activeUsers: 0, // Calcular solo si se necesita
        totalPlays: 0  // Calcular solo si se necesita
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleCreateSampleData = async () => {
    setCreatingData(true);
    try {
      const articlesSuccess = await createSampleArticles();
      const eventsSuccess = await createSampleEvents();
      
      if (articlesSuccess && eventsSuccess) {
        alert('Datos de muestra creados exitosamente');
        // Recargar datos
        await loadData();
        await loadStats();
      } else {
        alert('Error al crear algunos datos de muestra');
      }
    } catch (error) {
      console.error('Error creating sample data:', error);
      alert('Error al crear datos de muestra');
    } finally {
      setCreatingData(false);
    }
  };

  const handleCreateMusic = async (formData: any) => {
    try {
      const { data, error } = await supabase
        .from('music_tracks')
        .insert([{
          title: formData.title,
          artist_id: formData.artist_id,
          album: formData.album,
          genre: formData.genre,
          duration: formData.duration,
          file_url: formData.file_url,
          cover_image_url: formData.cover_image_url,
          release_date: formData.release_date,
          bpm: formData.bpm,
          key: formData.key,
          description: formData.description,
          tags: formData.tags,
          is_featured: formData.is_featured || false,
          is_active: formData.is_active !== false
        }])
        .select()
        .single();

      if (error) throw error;
      await loadMusicTracks();
      setShowModal(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error creating music track:', error);
    }
  };

  const handleUpdateMusic = async (id: string, formData: any) => {
    try {
      const { error } = await supabase
        .from('music_tracks')
        .update({
          title: formData.title,
          artist_id: formData.artist_id,
          album: formData.album,
          genre: formData.genre,
          duration: formData.duration,
          file_url: formData.file_url,
          cover_image_url: formData.cover_image_url,
          release_date: formData.release_date,
          bpm: formData.bpm,
          key: formData.key,
          description: formData.description,
          tags: formData.tags,
          is_featured: formData.is_featured || false,
          is_active: formData.is_active !== false,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      await loadMusicTracks();
      setShowModal(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error updating music track:', error);
    }
  };

  const handleDeleteMusic = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este track?')) return;

    try {
      const { error } = await supabase
        .from('music_tracks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadMusicTracks();
    } catch (error) {
      console.error('Error deleting music track:', error);
    }
  };

  const handleUpdateUser = async (userId: string, updates: Partial<UserProfile>) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;
      await loadUsers();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    await handleUpdateUser(userId, { is_active: !currentStatus });
  };

  const changeUserRole = async (userId: string, newRole: 'user' | 'admin' | 'moderator') => {
    await handleUpdateUser(userId, { role: newRole });
  };

  const blockUser = async (userId: string, days: number = 7) => {
    const blockedUntil = new Date();
    blockedUntil.setDate(blockedUntil.getDate() + days);
    
    await handleUpdateUser(userId, { 
      blocked_until: blockedUntil.toISOString(),
      is_active: false 
    });
  };

  const unblockUser = async (userId: string) => {
    await handleUpdateUser(userId, { 
      blocked_until: null,
      is_active: true 
    });
  };

  const playMusic = (trackId: string) => {
    if (currentPlaying === trackId) {
      setCurrentPlaying(null);
    } else {
      setCurrentPlaying(trackId);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const deleteItem = async (table: string, id: string) => {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Recargar datos después de eliminar
      loadData();
    } catch (error: any) {
      setError(error.message);
      console.error(`Error deleting from ${table}:`, error);
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-dark p-6 brutal-border border-gray-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-light font-space text-sm">Eventos</p>
              <p className="text-2xl font-bold text-white">{stats.events}</p>
            </div>
            <Calendar className="w-8 h-8 text-neon-mint" />
          </div>
        </div>

        <div className="bg-gray-dark p-6 brutal-border border-gray-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-light font-space text-sm">Artistas</p>
              <p className="text-2xl font-bold text-white">{stats.artists}</p>
            </div>
            <Users className="w-8 h-8 text-neon-mint" />
          </div>
        </div>

        <div className="bg-gray-dark p-6 brutal-border border-gray-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-light font-space text-sm">Tracks</p>
              <p className="text-2xl font-bold text-white">{stats.music}</p>
            </div>
            <Music className="w-8 h-8 text-neon-mint" />
          </div>
        </div>

        <div className="bg-gray-dark p-6 brutal-border border-gray-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-light font-space text-sm">Usuarios Activos</p>
              <p className="text-2xl font-bold text-white">{stats.activeUsers}</p>
            </div>
            <UserCheck className="w-8 h-8 text-neon-mint" />
          </div>
        </div>
      </div>

      {/* Estadísticas adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-dark p-6 brutal-border border-gray-600">
          <h3 className="text-white font-space text-lg mb-4">Reproducciones Totales</h3>
          <p className="text-3xl font-bold text-neon-mint">{stats.totalPlays.toLocaleString()}</p>
        </div>

        <div className="bg-gray-dark p-6 brutal-border border-gray-600">
          <h3 className="text-white font-space text-lg mb-4">Total Usuarios</h3>
          <p className="text-3xl font-bold text-neon-cyan">{stats.users}</p>
        </div>

        <div className="bg-gray-dark p-6 brutal-border border-gray-600">
          <h3 className="text-white font-space text-lg mb-4">Artículos</h3>
          <p className="text-3xl font-bold text-neon-pink">{stats.articles}</p>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="bg-gray-dark p-6 brutal-border border-gray-600">
        <h3 className="text-white font-space text-lg mb-4">Acciones Rápidas</h3>
        <button
          onClick={handleCreateSampleData}
          disabled={creatingData}
          className="bg-neon-cyan text-black px-6 py-3 font-space font-bold hover:bg-neon-mint transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {creatingData ? (
            <>
              <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
              Creando datos...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 inline mr-2" />
              Crear Datos de Muestra
            </>
          )}
        </button>
        <p className="text-gray-light font-space text-sm mt-2">
          Crea artículos y eventos de ejemplo para probar la aplicación
        </p>
      </div>
    </div>
  );

  const renderMusicSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white font-space">Gestión de Música</h2>
        <button
          onClick={() => {
            setModalType('music');
            setEditingItem(null);
            setShowModal(true);
          }}
          className="bg-neon-mint text-black px-4 py-2 font-space font-bold hover:bg-neon-cyan transition-colors"
        >
          <Plus className="w-4 h-4 inline mr-2" />
          Nuevo Track
        </button>
      </div>

      <div className="grid gap-4">
        {musicTracks.map((track) => (
          <div key={track.id} className="bg-gray-dark p-4 brutal-border border-gray-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                {/* Play Button */}
                <button
                  onClick={() => playMusic(track.id)}
                  className="w-10 h-10 bg-neon-mint text-black rounded-full flex items-center justify-center hover:bg-neon-cyan transition-colors"
                >
                  {currentPlaying === track.id ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5 ml-0.5" />
                  )}
                </button>

                {/* Track Info */}
                <div className="flex-1">
                  <h3 className="text-white font-space font-bold">{track.title}</h3>
                  <p className="text-gray-light text-sm">{track.artist?.name || 'Artista desconocido'}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-light mt-1">
                    {track.genre && <span>{track.genre}</span>}
                    {track.duration && <span>{formatTime(track.duration)}</span>}
                    {track.bpm && <span>{track.bpm} BPM</span>}
                    <span>{track.play_count || 0} reproducciones</span>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex items-center space-x-2">
                  {track.is_featured && (
                    <span className="bg-neon-mint text-black px-2 py-1 text-xs font-space">
                      DESTACADO
                    </span>
                  )}
                  <span className={`px-2 py-1 text-xs font-space ${
                    track.is_active ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                  }`}>
                    {track.is_active ? 'ACTIVO' : 'INACTIVO'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setModalType('music');
                    setEditingItem(track);
                    setShowModal(true);
                  }}
                  className="p-2 text-gray-light hover:text-neon-mint transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteMusic(track.id)}
                  className="p-2 text-gray-light hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderUsersSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white font-space">Gestión de Usuarios</h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-dark text-white border border-gray-600 px-4 py-2 font-space text-sm w-64 focus:outline-none focus:border-neon-mint"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredUsers.map((user) => (
          <div key={user.user_id} className="bg-gray-dark p-4 brutal-border border-gray-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                {/* Avatar */}
                <div className="w-12 h-12 bg-neon-mint rounded-full flex items-center justify-center">
                  {user.avatar_url ? (
                    <img 
                      src={user.avatar_url} 
                      alt={user.full_name || user.email}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <Users className="w-6 h-6 text-black" />
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-white font-space font-bold">
                      {user.full_name || user.username || 'Usuario sin nombre'}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-space ${
                      user.role === 'admin' ? 'bg-red-500 text-white' :
                      user.role === 'moderator' ? 'bg-yellow-500 text-black' :
                      'bg-blue-500 text-white'
                    }`}>
                      {user.role?.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-light text-sm">{user.email}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-light mt-1">
                    <span>Registro: {new Date(user.created_at).toLocaleDateString()}</span>
                    {user.last_login && (
                      <span>Último acceso: {new Date(user.last_login).toLocaleDateString()}</span>
                    )}
                    {user.subscription_status && (
                      <span className="capitalize">{user.subscription_status}</span>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-space ${
                    user.is_active ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                  }`}>
                    {user.is_active ? 'ACTIVO' : 'INACTIVO'}
                  </span>
                  {user.blocked_until && new Date(user.blocked_until) > new Date() && (
                    <span className="bg-red-600 text-white px-2 py-1 text-xs font-space">
                      BLOQUEADO
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                {/* Toggle Active Status */}
                <button
                  onClick={() => toggleUserStatus(user.user_id, user.is_active)}
                  className={`p-2 ${
                    user.is_active ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'
                  } transition-colors`}
                  title={user.is_active ? 'Desactivar usuario' : 'Activar usuario'}
                >
                  {user.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                </button>

                {/* Role Management */}
                <select
                  value={user.role}
                  onChange={(e) => changeUserRole(user.user_id, e.target.value as any)}
                  className="bg-gray-800 text-white border border-gray-600 px-2 py-1 text-xs font-space"
                >
                  <option value="user">Usuario</option>
                  <option value="moderator">Moderador</option>
                  <option value="admin">Admin</option>
                </select>

                {/* Block/Unblock */}
                {user.blocked_until && new Date(user.blocked_until) > new Date() ? (
                  <button
                    onClick={() => unblockUser(user.user_id)}
                    className="p-2 text-yellow-400 hover:text-yellow-300 transition-colors"
                    title="Desbloquear usuario"
                  >
                    <UnlockKeyhole className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => blockUser(user.user_id)}
                    className="p-2 text-red-400 hover:text-red-300 transition-colors"
                    title="Bloquear usuario (7 días)"
                  >
                    <Ban className="w-4 h-4" />
                  </button>
                )}

                {/* Edit User */}
                <button
                  onClick={() => {
                    setModalType('user');
                    setEditingItem(user);
                    setShowModal(true);
                  }}
                  className="p-2 text-gray-light hover:text-neon-mint transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderEventsSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white font-space">Gestión de Eventos</h2>
        <button
          onClick={() => {
            setModalType('event');
            setEditingItem(null);
            setShowModal(true);
          }}
          className="bg-neon-mint text-black px-4 py-2 font-space font-bold hover:bg-neon-cyan transition-colors"
        >
          <Plus className="w-4 h-4 inline mr-2" />
          Nuevo Evento
        </button>
      </div>

      <div className="grid gap-4">
        {(data.events || []).map((event) => (
          <div key={event.id} className="bg-gray-dark p-4 brutal-border border-gray-600">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-white font-space font-bold">{event.title}</h3>
                                 <p className="text-gray-light text-sm">{event.venue} • {new Date(event.date).toLocaleDateString()}</p>
                 <div className="flex items-center space-x-4 text-xs text-gray-light mt-1">
                   <span>Precio: €{event.tickets?.price || 0}</span>
                   <span className={`px-2 py-1 ${event.featured ? 'bg-yellow-500 text-black' : 'bg-gray-600 text-white'}`}>
                     {event.featured ? 'DESTACADO' : 'NORMAL'}
                   </span>
                 </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setEditingItem(event);
                    setModalType('event');
                    setShowModal(true);
                  }}
                  className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteItem('events', event.id)}
                  className="p-2 text-red-400 hover:text-red-300 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderArtistsSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white font-space">Gestión de Artistas</h2>
        <button
          onClick={() => {
            setModalType('artist');
            setEditingItem(null);
            setShowModal(true);
          }}
          className="bg-neon-mint text-black px-4 py-2 font-space font-bold hover:bg-neon-cyan transition-colors"
        >
          <Plus className="w-4 h-4 inline mr-2" />
          Nuevo Artista
        </button>
      </div>

      <div className="grid gap-4">
        {(data.artists || []).map((artist) => (
          <div key={artist.id} className="bg-gray-dark p-4 brutal-border border-gray-600">
                         <div className="flex items-center justify-between">
               <div className="flex items-center space-x-4 flex-1">
                 {artist.image && (
                   <img 
                     src={artist.image} 
                     alt={artist.name}
                     className="w-16 h-16 object-cover brutal-border border-gray-600"
                   />
                 )}
                 <div className="flex-1">
                   <h3 className="text-white font-space font-bold">{artist.name}</h3>
                   <p className="text-gray-light text-sm">{artist.genres?.join(', ')}</p>
                   <div className="flex items-center space-x-4 text-xs text-gray-light mt-1">
                     <span>{artist.country}</span>
                     <span className={`px-2 py-1 ${artist.featured ? 'bg-green-500 text-white' : 'bg-gray-600 text-white'}`}>
                       {artist.featured ? 'DESTACADO' : 'NORMAL'}
                     </span>
                   </div>
                 </div>
               </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setEditingItem(artist);
                    setModalType('artist');
                    setShowModal(true);
                  }}
                  className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteItem('artists', artist.id)}
                  className="p-2 text-red-400 hover:text-red-300 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderArticlesSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white font-space">Gestión de Artículos</h2>
        <button
          onClick={() => {
            setModalType('article');
            setEditingItem(null);
            setShowModal(true);
          }}
          className="bg-neon-mint text-black px-4 py-2 font-space font-bold hover:bg-neon-cyan transition-colors"
        >
          <Plus className="w-4 h-4 inline mr-2" />
          Nuevo Artículo
        </button>
      </div>

      <div className="grid gap-4">
        {(data.articles || []).map((article) => (
          <div key={article.id} className="bg-gray-dark p-4 brutal-border border-gray-600">
                         <div className="flex items-center justify-between">
               <div className="flex items-center space-x-4 flex-1">
                 {article.image && (
                   <img 
                     src={article.image} 
                     alt={article.title}
                     className="w-16 h-16 object-cover brutal-border border-gray-600"
                   />
                 )}
                 <div className="flex-1">
                   <h3 className="text-white font-space font-bold">{article.title}</h3>
                   <p className="text-gray-light text-sm">{article.excerpt}</p>
                   <div className="flex items-center space-x-4 text-xs text-gray-light mt-1">
                     <span>{article.category}</span>
                     <span>{article.published_at ? new Date(article.published_at).toLocaleDateString() : 'No publicado'}</span>
                     <span className={`px-2 py-1 ${article.featured ? 'bg-yellow-500 text-black' : 'bg-gray-600 text-white'}`}>
                       {article.featured ? 'DESTACADO' : 'NORMAL'}
                     </span>
                   </div>
                 </div>
               </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setEditingItem(article);
                    setModalType('article');
                    setShowModal(true);
                  }}
                  className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteItem('articles', article.id)}
                  className="p-2 text-red-400 hover:text-red-300 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderVenuesSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white font-space">Gestión de Venues</h2>
        <button
          onClick={() => {
            setModalType('venue');
            setEditingItem(null);
            setShowModal(true);
          }}
          className="bg-neon-mint text-black px-4 py-2 font-space font-bold hover:bg-neon-cyan transition-colors"
        >
          <Plus className="w-4 h-4 inline mr-2" />
          Nuevo Venue
        </button>
      </div>

      <div className="grid gap-4">
        {(data.venues || []).map((venue) => (
          <div key={venue.id} className="bg-gray-dark p-4 brutal-border border-gray-600">
                         <div className="flex items-center justify-between">
               <div className="flex items-center space-x-4 flex-1">
                 {venue.image && (
                   <img 
                     src={venue.image} 
                     alt={venue.name}
                     className="w-16 h-16 object-cover brutal-border border-gray-600"
                   />
                 )}
                 <div className="flex-1">
                   <h3 className="text-white font-space font-bold">{venue.name}</h3>
                   <p className="text-gray-light text-sm">{venue.address}, {venue.city}</p>
                   <div className="flex items-center space-x-4 text-xs text-gray-light mt-1">
                     <span>Capacidad: {venue.capacity}</span>
                     <span>{venue.featured ? 'DESTACADO' : 'NORMAL'}</span>
                   </div>
                 </div>
               </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setEditingItem(venue);
                    setModalType('venue');
                    setShowModal(true);
                  }}
                  className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteItem('venues', venue.id)}
                  className="p-2 text-red-400 hover:text-red-300 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderModal = () => {
    if (!showModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-dark brutal-border border-gray-600 max-w-2xl w-full max-h-screen overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white font-space">
                {editingItem ? 'Editar' : 'Crear'} {
                  modalType === 'music' ? 'Track Musical' :
                  modalType === 'user' ? 'Usuario' :
                  modalType.charAt(0).toUpperCase() + modalType.slice(1)
                }
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingItem(null);
                }}
                className="text-gray-light hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {modalType === 'event' && <EventForm />}
            {modalType === 'artist' && <ArtistForm />}
            {modalType === 'article' && <ArticleForm />}
            {modalType === 'venue' && <VenueForm />}
            {modalType === 'music' && <MusicForm />}
            {modalType === 'user' && <UserForm />}
          </div>
        </div>
      </div>
    );
  };

  const MusicForm = () => {
    const [formData, setFormData] = useState({
      title: editingItem?.title || '',
      artist_id: editingItem?.artist_id || '',
      album: editingItem?.album || '',
      genre: editingItem?.genre || '',
      duration: editingItem?.duration || 0,
      file_url: editingItem?.file_url || '',
      cover_image_url: editingItem?.cover_image_url || '',
      release_date: editingItem?.release_date || '',
      bpm: editingItem?.bpm || '',
      key: editingItem?.key || '',
      description: editingItem?.description || '',
      tags: editingItem?.tags?.join(', ') || '',
      is_featured: editingItem?.is_featured || false,
      is_active: editingItem?.is_active !== false
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      const submitData = {
        ...formData,
        bpm: formData.bpm ? parseInt(formData.bpm) : null,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
      };

      if (editingItem) {
        await handleUpdateMusic(editingItem.id, submitData);
      } else {
        await handleCreateMusic(submitData);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white font-space text-sm mb-2">Título *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full bg-gray-800 text-white border border-gray-600 px-3 py-2 font-space"
              required
            />
          </div>

          <div>
            <label className="block text-white font-space text-sm mb-2">Artista</label>
            <select
              value={formData.artist_id}
              onChange={(e) => setFormData({...formData, artist_id: e.target.value})}
              className="w-full bg-gray-800 text-white border border-gray-600 px-3 py-2 font-space"
            >
              <option value="">Seleccionar artista</option>
              {data.artists?.map((artist: Artist) => (
                <option key={artist.id} value={artist.id}>
                  {artist.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-white font-space text-sm mb-2">Álbum</label>
            <input
              type="text"
              value={formData.album}
              onChange={(e) => setFormData({...formData, album: e.target.value})}
              className="w-full bg-gray-800 text-white border border-gray-600 px-3 py-2 font-space"
            />
          </div>

          <div>
            <label className="block text-white font-space text-sm mb-2">Género</label>
            <input
              type="text"
              value={formData.genre}
              onChange={(e) => setFormData({...formData, genre: e.target.value})}
              className="w-full bg-gray-800 text-white border border-gray-600 px-3 py-2 font-space"
            />
          </div>

          <div>
            <label className="block text-white font-space text-sm mb-2">BPM</label>
            <input
              type="number"
              value={formData.bpm}
              onChange={(e) => setFormData({...formData, bpm: e.target.value})}
              className="w-full bg-gray-800 text-white border border-gray-600 px-3 py-2 font-space"
            />
          </div>

          <div>
            <label className="block text-white font-space text-sm mb-2">Key Musical</label>
            <input
              type="text"
              value={formData.key}
              onChange={(e) => setFormData({...formData, key: e.target.value})}
              placeholder="Ej: Am, C#, F"
              className="w-full bg-gray-800 text-white border border-gray-600 px-3 py-2 font-space"
            />
          </div>
        </div>

        <div>
          <label className="block text-white font-space text-sm mb-2">Fecha de Lanzamiento</label>
          <input
            type="date"
            value={formData.release_date}
            onChange={(e) => setFormData({...formData, release_date: e.target.value})}
            className="w-full bg-gray-800 text-white border border-gray-600 px-3 py-2 font-space"
          />
        </div>

        <div>
          <label className="block text-white font-space text-sm mb-2">Tags (separados por comas)</label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData({...formData, tags: e.target.value})}
            placeholder="techno, underground, dark"
            className="w-full bg-gray-800 text-white border border-gray-600 px-3 py-2 font-space"
          />
        </div>

        <div>
          <label className="block text-white font-space text-sm mb-2">Descripción</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            rows={3}
            className="w-full bg-gray-800 text-white border border-gray-600 px-3 py-2 font-space"
          />
        </div>

        <AudioUpload
          onUpload={(url, duration) => setFormData({...formData, file_url: url, duration})}
          currentAudio={formData.file_url}
          label="Archivo de Audio *"
        />

        <ImageUpload
          onUpload={(url) => setFormData({...formData, cover_image_url: url})}
          currentImage={formData.cover_image_url}
          label="Imagen de Portada"
          resize={{ width: 800, height: 800 }}
        />

        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.is_featured}
              onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
              className="form-checkbox text-neon-mint"
            />
            <span className="text-white font-space text-sm">Track Destacado</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
              className="form-checkbox text-neon-mint"
            />
            <span className="text-white font-space text-sm">Activo</span>
          </label>
        </div>

        <div className="flex items-center justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={() => setShowModal(false)}
            className="px-6 py-2 bg-gray-600 text-white font-space hover:bg-gray-500 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-neon-mint text-black font-space font-bold hover:bg-neon-cyan transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingItem ? 'Actualizar' : 'Crear')}
          </button>
        </div>
      </form>
    );
  };

  const VenueForm = () => {
    const [formData, setFormData] = useState({
      name: editingItem?.name || '',
      address: editingItem?.address || '',
      city: editingItem?.city || '',
      country: editingItem?.country || 'España',
      capacity: editingItem?.capacity || '',
      description: editingItem?.description || '',
      image: editingItem?.image || '',
      website: editingItem?.website || '',
      phone: editingItem?.phone || '',
      email: editingItem?.email || '',
      featured: editingItem?.featured || false,
      venue_type: editingItem?.venue_type || 'club'
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      const submitData = {
        ...formData,
        capacity: formData.capacity ? parseInt(formData.capacity) : null
      };

      try {
        if (editingItem) {
          const { error } = await supabase
            .from('venues')
            .update(submitData)
            .eq('id', editingItem.id);
          
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('venues')
            .insert([submitData]);
          
          if (error) throw error;
        }
        
        setShowModal(false);
        await loadData();
      } catch (error) {
        console.error('Error saving venue:', error);
        setError('Error al guardar el venue');
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white font-space text-sm mb-2">Nombre *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-gray-800 text-white border border-gray-600 px-3 py-2 font-space"
              required
            />
          </div>

          <div>
            <label className="block text-white font-space text-sm mb-2">Tipo de Venue</label>
            <select
              value={formData.venue_type}
              onChange={(e) => setFormData({...formData, venue_type: e.target.value})}
              className="w-full bg-gray-800 text-white border border-gray-600 px-3 py-2 font-space"
            >
              <option value="club">Club</option>
              <option value="festival">Festival</option>
              <option value="warehouse">Warehouse</option>
              <option value="arena">Arena</option>
              <option value="outdoor">Outdoor</option>
              <option value="underground">Underground</option>
            </select>
          </div>

          <div>
            <label className="block text-white font-space text-sm mb-2">Dirección *</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="w-full bg-gray-800 text-white border border-gray-600 px-3 py-2 font-space"
              required
            />
          </div>

          <div>
            <label className="block text-white font-space text-sm mb-2">Ciudad *</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({...formData, city: e.target.value})}
              className="w-full bg-gray-800 text-white border border-gray-600 px-3 py-2 font-space"
              required
            />
          </div>

          <div>
            <label className="block text-white font-space text-sm mb-2">País</label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => setFormData({...formData, country: e.target.value})}
              className="w-full bg-gray-800 text-white border border-gray-600 px-3 py-2 font-space"
            />
          </div>

          <div>
            <label className="block text-white font-space text-sm mb-2">Capacidad</label>
            <input
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({...formData, capacity: e.target.value})}
              className="w-full bg-gray-800 text-white border border-gray-600 px-3 py-2 font-space"
            />
          </div>

          <div>
            <label className="block text-white font-space text-sm mb-2">Website</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({...formData, website: e.target.value})}
              placeholder="https://venue-website.com"
              className="w-full bg-gray-800 text-white border border-gray-600 px-3 py-2 font-space"
            />
          </div>

          <div>
            <label className="block text-white font-space text-sm mb-2">Teléfono</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full bg-gray-800 text-white border border-gray-600 px-3 py-2 font-space"
            />
          </div>

          <div>
            <label className="block text-white font-space text-sm mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full bg-gray-800 text-white border border-gray-600 px-3 py-2 font-space"
            />
          </div>
        </div>

        <div>
          <label className="block text-white font-space text-sm mb-2">Descripción</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            rows={4}
            className="w-full bg-gray-800 text-white border border-gray-600 px-3 py-2 font-space"
            placeholder="Descripción del venue, ambiente, características especiales..."
          />
        </div>

        <ImageUpload
          onUpload={(url) => setFormData({...formData, image: url})}
          currentImage={formData.image}
          label="Imagen del Venue"
          resize={{ width: 1200, height: 800 }}
        />

        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => setFormData({...formData, featured: e.target.checked})}
              className="form-checkbox text-neon-mint"
            />
            <span className="text-white font-space text-sm">Venue Destacado</span>
          </label>
        </div>

        <div className="flex items-center justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={() => setShowModal(false)}
            className="px-6 py-2 bg-gray-600 text-white font-space hover:bg-gray-500 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-neon-mint text-black font-space font-bold hover:bg-neon-cyan transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingItem ? 'Actualizar' : 'Crear') + ' Venue'}
          </button>
        </div>
      </form>
    );
  };

  const ArticleForm = () => {
    const [formData, setFormData] = useState({
      title: editingItem?.title || '',
      content: editingItem?.content || '',
      excerpt: editingItem?.excerpt || '',
      image_url: editingItem?.image_url || '',
      category: editingItem?.category || 'news',
      tags: editingItem?.tags?.join(', ') || '',
      published: editingItem?.published || false,
      featured: editingItem?.featured || false,
      slug: editingItem?.slug || '',
      reading_time: editingItem?.reading_time || ''
    });

    const generateSlug = (title: string) => {
      return title
        .toLowerCase()
        .replace(/[áàäâ]/g, 'a')
        .replace(/[éèëê]/g, 'e')
        .replace(/[íìïî]/g, 'i')
        .replace(/[óòöô]/g, 'o')
        .replace(/[úùüû]/g, 'u')
        .replace(/ñ/g, 'n')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      const submitData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
        slug: formData.slug || generateSlug(formData.title),
        reading_time: formData.reading_time ? parseInt(formData.reading_time) : Math.ceil(formData.content.split(' ').length / 200)
      };

      try {
        if (editingItem) {
          const { error } = await supabase
            .from('articles')
            .update(submitData)
            .eq('id', editingItem.id);
          
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('articles')
            .insert([submitData]);
          
          if (error) throw error;
        }
        
        setShowModal(false);
        await loadData();
      } catch (error) {
        console.error('Error saving article:', error);
        setError('Error al guardar el artículo');
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white font-space text-sm mb-2">Título *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => {
                setFormData({...formData, title: e.target.value});
                if (!formData.slug) {
                  setFormData(prev => ({...prev, slug: generateSlug(e.target.value)}));
                }
              }}
              className="w-full bg-gray-800 text-white border border-gray-600 px-3 py-2 font-space"
              required
            />
          </div>

          <div>
            <label className="block text-white font-space text-sm mb-2">Categoría</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full bg-gray-800 text-white border border-gray-600 px-3 py-2 font-space"
            >
              <option value="news">Noticias</option>
              <option value="review">Reseñas</option>
              <option value="interview">Entrevistas</option>
              <option value="culture">Cultura</option>
              <option value="technology">Tecnología</option>
              <option value="feature">Especiales</option>
            </select>
          </div>

          <div>
            <label className="block text-white font-space text-sm mb-2">Slug (URL)</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({...formData, slug: generateSlug(e.target.value)})}
              className="w-full bg-gray-800 text-white border border-gray-600 px-3 py-2 font-space"
            />
          </div>

          <div>
            <label className="block text-white font-space text-sm mb-2">Tiempo de Lectura (min)</label>
            <input
              type="number"
              value={formData.reading_time}
              onChange={(e) => setFormData({...formData, reading_time: e.target.value})}
              className="w-full bg-gray-800 text-white border border-gray-600 px-3 py-2 font-space"
            />
          </div>
        </div>

        <div>
          <label className="block text-white font-space text-sm mb-2">Extracto *</label>
          <textarea
            value={formData.excerpt}
            onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
            rows={2}
            className="w-full bg-gray-800 text-white border border-gray-600 px-3 py-2 font-space"
            placeholder="Breve descripción del artículo..."
            required
          />
        </div>

        <div>
          <label className="block text-white font-space text-sm mb-2">Tags (separados por comas)</label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData({...formData, tags: e.target.value})}
            placeholder="techno, underground, españa"
            className="w-full bg-gray-800 text-white border border-gray-600 px-3 py-2 font-space"
          />
        </div>

        <div>
          <label className="block text-white font-space text-sm mb-2">Contenido *</label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({...formData, content: e.target.value})}
            rows={8}
            className="w-full bg-gray-800 text-white border border-gray-600 px-3 py-2 font-space"
            placeholder="Escribir el contenido del artículo..."
            required
          />
        </div>

        <ImageUpload
          onUpload={(url) => setFormData({...formData, image_url: url})}
          currentImage={formData.image_url}
          label="Imagen del Artículo"
          resize={{ width: 1200, height: 800 }}
        />

        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.published}
              onChange={(e) => setFormData({...formData, published: e.target.checked})}
              className="form-checkbox text-neon-mint"
            />
            <span className="text-white font-space text-sm">Publicado</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => setFormData({...formData, featured: e.target.checked})}
              className="form-checkbox text-neon-mint"
            />
            <span className="text-white font-space text-sm">Artículo Destacado</span>
          </label>
        </div>

        <div className="flex items-center justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={() => setShowModal(false)}
            className="px-6 py-2 bg-gray-600 text-white font-space hover:bg-gray-500 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-neon-mint text-black font-space font-bold hover:bg-neon-cyan transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingItem ? 'Actualizar' : 'Crear') + ' Artículo'}
          </button>
        </div>
      </form>
    );
  };

  const ArtistForm = () => {
    const [formData, setFormData] = useState({
      name: editingItem?.name || '',
      bio: editingItem?.bio || '',
      genre: editingItem?.genre || 'Techno',
      country: editingItem?.country || '',
      city: editingItem?.city || '',
      image: editingItem?.image || '',
      social_links: {
        instagram: editingItem?.social_links?.instagram || '',
        spotify: editingItem?.social_links?.spotify || '',
        soundcloud: editingItem?.social_links?.soundcloud || '',
        website: editingItem?.social_links?.website || ''
      },
      featured: editingItem?.featured || false,
      verified: editingItem?.verified || false
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      try {
        if (editingItem) {
          const { error } = await supabase
            .from('artists')
            .update(formData)
            .eq('id', editingItem.id);
          
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('artists')
            .insert([formData]);
          
          if (error) throw error;
        }
        
        setShowModal(false);
        await loadData();
      } catch (error) {
        console.error('Error saving artist:', error);
        setError('Error al guardar el artista');
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white font-space text-sm mb-2">Nombre *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-gray-800 text-white border border-gray-600 px-3 py-2 font-space"
              required
            />
          </div>

          <div>
            <label className="block text-white font-space text-sm mb-2">Género Musical</label>
            <select
              value={formData.genre}
              onChange={(e) => setFormData({...formData, genre: e.target.value})}
              className="w-full bg-gray-800 text-white border border-gray-600 px-3 py-2 font-space"
            >
              <option value="Techno">Techno</option>
              <option value="House">House</option>
              <option value="Minimal">Minimal</option>
              <option value="Progressive">Progressive</option>
              <option value="Trance">Trance</option>
              <option value="Electronic">Electronic</option>
            </select>
          </div>

          <div>
            <label className="block text-white font-space text-sm mb-2">País</label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => setFormData({...formData, country: e.target.value})}
              className="w-full bg-gray-800 text-white border border-gray-600 px-3 py-2 font-space"
            />
          </div>

          <div>
            <label className="block text-white font-space text-sm mb-2">Ciudad</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({...formData, city: e.target.value})}
              className="w-full bg-gray-800 text-white border border-gray-600 px-3 py-2 font-space"
            />
          </div>
        </div>

        <div>
          <label className="block text-white font-space text-sm mb-2">Biografía</label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({...formData, bio: e.target.value})}
            rows={4}
            className="w-full bg-gray-800 text-white border border-gray-600 px-3 py-2 font-space"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white font-space text-sm mb-2">Instagram</label>
            <input
              type="url"
              value={formData.social_links.instagram}
              onChange={(e) => setFormData({
                ...formData, 
                social_links: {...formData.social_links, instagram: e.target.value}
              })}
              placeholder="https://instagram.com/artist"
              className="w-full bg-gray-800 text-white border border-gray-600 px-3 py-2 font-space"
            />
          </div>

          <div>
            <label className="block text-white font-space text-sm mb-2">Spotify</label>
            <input
              type="url"
              value={formData.social_links.spotify}
              onChange={(e) => setFormData({
                ...formData, 
                social_links: {...formData.social_links, spotify: e.target.value}
              })}
              placeholder="https://spotify.com/artist"
              className="w-full bg-gray-800 text-white border border-gray-600 px-3 py-2 font-space"
            />
          </div>

          <div>
            <label className="block text-white font-space text-sm mb-2">SoundCloud</label>
            <input
              type="url"
              value={formData.social_links.soundcloud}
              onChange={(e) => setFormData({
                ...formData, 
                social_links: {...formData.social_links, soundcloud: e.target.value}
              })}
              placeholder="https://soundcloud.com/artist"
              className="w-full bg-gray-800 text-white border border-gray-600 px-3 py-2 font-space"
            />
          </div>

          <div>
            <label className="block text-white font-space text-sm mb-2">Website</label>
            <input
              type="url"
              value={formData.social_links.website}
              onChange={(e) => setFormData({
                ...formData, 
                social_links: {...formData.social_links, website: e.target.value}
              })}
              placeholder="https://artist-website.com"
              className="w-full bg-gray-800 text-white border border-gray-600 px-3 py-2 font-space"
            />
          </div>
        </div>

        <ImageUpload
          onUpload={(url) => setFormData({...formData, image: url})}
          currentImage={formData.image}
          label="Foto del Artista"
          resize={{ width: 800, height: 800 }}
        />

        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => setFormData({...formData, featured: e.target.checked})}
              className="form-checkbox text-neon-mint"
            />
            <span className="text-white font-space text-sm">Artista Destacado</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.verified}
              onChange={(e) => setFormData({...formData, verified: e.target.checked})}
              className="form-checkbox text-neon-mint"
            />
            <span className="text-white font-space text-sm">Artista Verificado</span>
          </label>
        </div>

        <div className="flex items-center justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={() => setShowModal(false)}
            className="px-6 py-2 bg-gray-600 text-white font-space hover:bg-gray-500 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-neon-mint text-black font-space font-bold hover:bg-neon-cyan transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingItem ? 'Actualizar' : 'Crear') + ' Artista'}
          </button>
        </div>
      </form>
    );
  };

  const EventForm = () => {
    const [formData, setFormData] = useState({
      title: editingItem?.title || '',
      description: editingItem?.description || '',
      date: editingItem?.date || '',
      time: editingItem?.time || '',
      location: editingItem?.location || '',
      image_url: editingItem?.image_url || '',
      price: editingItem?.price || '',
      capacity: editingItem?.capacity || '',
      genre: editingItem?.genre || 'Techno',
      featured: editingItem?.featured || false,
      status: editingItem?.status || 'draft'
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      const submitData = {
        ...formData,
        price: formData.price ? parseFloat(formData.price) : null,
        capacity: formData.capacity ? parseInt(formData.capacity) : null
      };

      try {
        if (editingItem) {
          const { error } = await supabase
            .from('events')
            .update(submitData)
            .eq('id', editingItem.id);
          
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('events')
            .insert([submitData]);
          
          if (error) throw error;
        }
        
        setShowModal(false);
        await loadData();
      } catch (error) {
        console.error('Error saving event:', error);
        setError('Error al guardar el evento');
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white font-space text-sm mb-2">Título *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full bg-gray-800 text-white border border-gray-600 px-3 py-2 font-space"
              required
            />
          </div>

          <div>
            <label className="block text-white font-space text-sm mb-2">Ubicación *</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              placeholder="Venue, Ciudad"
              className="w-full bg-gray-800 text-white border border-gray-600 px-3 py-2 font-space"
              required
            />
          </div>

          <div>
            <label className="block text-white font-space text-sm mb-2">Fecha *</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="w-full bg-gray-800 text-white border border-gray-600 px-3 py-2 font-space"
              required
            />
          </div>

          <div>
            <label className="block text-white font-space text-sm mb-2">Hora *</label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({...formData, time: e.target.value})}
              className="w-full bg-gray-800 text-white border border-gray-600 px-3 py-2 font-space"
              required
            />
          </div>

          <div>
            <label className="block text-white font-space text-sm mb-2">Precio (€)</label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              className="w-full bg-gray-800 text-white border border-gray-600 px-3 py-2 font-space"
            />
          </div>

          <div>
            <label className="block text-white font-space text-sm mb-2">Capacidad</label>
            <input
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({...formData, capacity: e.target.value})}
              className="w-full bg-gray-800 text-white border border-gray-600 px-3 py-2 font-space"
            />
          </div>

          <div>
            <label className="block text-white font-space text-sm mb-2">Género</label>
            <select
              value={formData.genre}
              onChange={(e) => setFormData({...formData, genre: e.target.value})}
              className="w-full bg-gray-800 text-white border border-gray-600 px-3 py-2 font-space"
            >
              <option value="Techno">Techno</option>
              <option value="House">House</option>
              <option value="Electronic">Electronic</option>
              <option value="Minimal">Minimal</option>
              <option value="Progressive">Progressive</option>
              <option value="Trance">Trance</option>
            </select>
          </div>

          <div>
            <label className="block text-white font-space text-sm mb-2">Estado</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              className="w-full bg-gray-800 text-white border border-gray-600 px-3 py-2 font-space"
            >
              <option value="draft">Borrador</option>
              <option value="published">Publicado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-white font-space text-sm mb-2">Descripción *</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            rows={4}
            className="w-full bg-gray-800 text-white border border-gray-600 px-3 py-2 font-space"
            required
          />
        </div>

        <ImageUpload
          onUpload={(url) => setFormData({...formData, image_url: url})}
          currentImage={formData.image_url}
          label="Imagen del Evento"
          resize={{ width: 1200, height: 800 }}
        />

        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => setFormData({...formData, featured: e.target.checked})}
              className="form-checkbox text-neon-mint"
            />
            <span className="text-white font-space text-sm">Evento Destacado</span>
          </label>
        </div>

        <div className="flex items-center justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={() => setShowModal(false)}
            className="px-6 py-2 bg-gray-600 text-white font-space hover:bg-gray-500 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-neon-mint text-black font-space font-bold hover:bg-neon-cyan transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingItem ? 'Actualizar' : 'Crear') + ' Evento'}
          </button>
        </div>
      </form>
    );
  };

  const UserForm = () => {
    const [formData, setFormData] = useState({
      full_name: editingItem?.full_name || '',
      username: editingItem?.username || '',
      bio: editingItem?.bio || '',
      role: editingItem?.role || 'user',
      is_active: editingItem?.is_active !== false,
      subscription_status: editingItem?.subscription_status || 'free',
      notes: editingItem?.notes || ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (editingItem) {
        await handleUpdateUser(editingItem.user_id, formData);
        setShowModal(false);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white font-space text-sm mb-2">Nombre Completo</label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              className="w-full bg-gray-800 text-white border border-gray-600 px-3 py-2 font-space"
            />
          </div>

          <div>
            <label className="block text-white font-space text-sm mb-2">Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              className="w-full bg-gray-800 text-white border border-gray-600 px-3 py-2 font-space"
            />
          </div>

          <div>
            <label className="block text-white font-space text-sm mb-2">Rol</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value as any})}
              className="w-full bg-gray-800 text-white border border-gray-600 px-3 py-2 font-space"
            >
              <option value="user">Usuario</option>
              <option value="moderator">Moderador</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div>
            <label className="block text-white font-space text-sm mb-2">Suscripción</label>
            <select
              value={formData.subscription_status}
              onChange={(e) => setFormData({...formData, subscription_status: e.target.value as any})}
              className="w-full bg-gray-800 text-white border border-gray-600 px-3 py-2 font-space"
            >
              <option value="free">Gratis</option>
              <option value="premium">Premium</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-white font-space text-sm mb-2">Biografía</label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({...formData, bio: e.target.value})}
            rows={3}
            className="w-full bg-gray-800 text-white border border-gray-600 px-3 py-2 font-space"
          />
        </div>

        <div>
          <label className="block text-white font-space text-sm mb-2">Notas Admin</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            rows={2}
            placeholder="Notas internas para administradores..."
            className="w-full bg-gray-800 text-white border border-gray-600 px-3 py-2 font-space"
          />
        </div>

        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
              className="form-checkbox text-neon-mint"
            />
            <span className="text-white font-space text-sm">Usuario Activo</span>
          </label>
        </div>

        <div className="flex items-center justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={() => setShowModal(false)}
            className="px-6 py-2 bg-gray-600 text-white font-space hover:bg-gray-500 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-neon-mint text-black font-space font-bold hover:bg-neon-cyan transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Actualizar Usuario'}
          </button>
        </div>
      </form>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white font-space">Acceso denegado. Debes estar autenticado.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-space mb-2">PANEL DE ADMINISTRACIÓN</h1>
          <p className="text-gray-light font-space">Gestiona todo el contenido de TECHNO EXPERIENCE</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'events', label: 'Eventos', icon: Calendar },
            { id: 'artists', label: 'Artistas', icon: Users },
            { id: 'articles', label: 'Artículos', icon: FileText },
            { id: 'venues', label: 'Venues', icon: MapPin },
            { id: 'music', label: 'Música', icon: Music },
            { id: 'users', label: 'Usuarios', icon: UserCheck }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 font-space font-bold transition-colors ${
                  activeTab === tab.id
                    ? 'bg-neon-mint text-black'
                    : 'bg-gray-dark text-gray-light hover:text-white border border-gray-600'
                }`}
              >
                <Icon className="w-4 h-4 inline mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="min-h-[400px]">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-neon-mint" />
            </div>
          )}

          {error && (
            <div className="bg-red-500 bg-opacity-20 border border-red-500 p-4 brutal-border mb-6">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-300 font-space">Error: {error}</span>
              </div>
            </div>
          )}

          {!loading && (
            <>
              {activeTab === 'dashboard' && renderDashboard()}
              {activeTab === 'events' && renderEventsSection()}
              {activeTab === 'artists' && renderArtistsSection()}
              {activeTab === 'articles' && renderArticlesSection()}
              {activeTab === 'venues' && renderVenuesSection()}
              {activeTab === 'music' && renderMusicSection()}
              {activeTab === 'users' && renderUsersSection()}
            </>
          )}
        </div>
      </div>

      {renderModal()}
    </div>
  );
};

export default Admin;
