import React, { useState } from 'react';
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
  Music
} from 'lucide-react';
import { mockEvents, mockArticles } from '../data/mockData';

const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  const adminTabs = [
    { id: 'dashboard', label: 'DASHBOARD', icon: BarChart3, color: '#A2F2C2' },
    { id: 'events', label: 'EVENTOS', icon: Calendar, color: '#00CED1' },
    { id: 'articles', label: 'ARTÍCULOS', icon: FileText, color: '#8A2BE2' },
    { id: 'media', label: 'MEDIA', icon: Image, color: '#F2FF00' },
    { id: 'users', label: 'USUARIOS', icon: Users, color: '#00FF00' },
    { id: 'settings', label: 'CONFIGURACIÓN', icon: Settings, color: '#FF8C00' }
  ];

  const stats = {
    totalEvents: mockEvents.length,
    totalArticles: mockArticles.length,
    totalUsers: 1247,
    monthlyViews: 25600
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-dark bg-opacity-50 p-6 brutal-border border-gray-dark">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-light font-space text-sm">Total Eventos</p>
              <p className="font-bebas text-3xl text-neon-mint">{stats.totalEvents}</p>
            </div>
            <Calendar className="w-8 h-8 text-neon-mint" />
          </div>
        </div>
        
        <div className="bg-gray-dark bg-opacity-50 p-6 brutal-border border-gray-dark">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-light font-space text-sm">Total Artículos</p>
              <p className="font-bebas text-3xl text-neon-pink">{stats.totalArticles}</p>
            </div>
            <FileText className="w-8 h-8 text-neon-pink" />
          </div>
        </div>
        
        <div className="bg-gray-dark bg-opacity-50 p-6 brutal-border border-gray-dark">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-light font-space text-sm">Total Usuarios</p>
              <p className="font-bebas text-3xl text-neon-yellow">{stats.totalUsers}</p>
            </div>
            <Users className="w-8 h-8 text-neon-yellow" />
          </div>
        </div>
        
        <div className="bg-gray-dark bg-opacity-50 p-6 brutal-border border-gray-dark">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-light font-space text-sm">Vistas Mensuales</p>
              <p className="font-bebas text-3xl text-white">{stats.monthlyViews.toLocaleString()}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-dark bg-opacity-30 p-6 brutal-border border-gray-dark">
        <h3 className="font-bebas text-xl tracking-wider text-white mb-4">
          ACTIVIDAD RECIENTE
        </h3>
        <div className="space-y-3">
          {[
            { action: 'Nuevo evento creado', item: 'DANCE CONTROL', time: 'hace 2 horas', type: 'create' },
            { action: 'Artículo publicado', item: 'Karretero EP Review', time: 'hace 5 horas', type: 'publish' },
            { action: 'Usuario registrado', item: 'techno_fan_92', time: 'hace 1 día', type: 'user' },
            { action: 'Media subida', item: 'flyer_veta_2025.jpg', time: 'hace 2 días', type: 'media' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-black bg-opacity-30 brutal-border border-gray-dark">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 ${
                  activity.type === 'create' ? 'bg-neon-mint' :
                  activity.type === 'publish' ? 'bg-neon-pink' :
                  activity.type === 'user' ? 'bg-neon-yellow' : 'bg-white'
                }`} />
                <div>
                  <p className="text-white font-space text-sm">{activity.action}</p>
                  <p className="text-gray-light font-space text-xs">{activity.item}</p>
                </div>
              </div>
              <p className="text-gray-light font-space text-xs">{activity.time}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContentTable = (content: any[], type: 'events' | 'articles') => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bebas text-2xl tracking-wider text-white">
          {type === 'events' ? 'GESTIÓN DE EVENTOS' : 'GESTIÓN DE ARTÍCULOS'}
        </h3>
        <button className="px-4 py-2 bg-neon-mint text-black font-bebas tracking-wider hover:bg-transparent hover:text-neon-mint border-2 border-neon-mint transition-all duration-300 brutal-border flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          CREAR {type === 'events' ? 'EVENTO' : 'ARTÍCULO'}
        </button>
      </div>
      
      <div className="bg-gray-dark bg-opacity-30 brutal-border border-gray-dark overflow-hidden">
        <table className="w-full">
          <thead className="bg-black">
            <tr>
              <th className="text-left p-4 font-bebas text-sm tracking-wider text-gray-light">TÍTULO</th>
              <th className="text-left p-4 font-bebas text-sm tracking-wider text-gray-light">FECHA</th>
              <th className="text-left p-4 font-bebas text-sm tracking-wider text-gray-light">ESTADO</th>
              <th className="text-left p-4 font-bebas text-sm tracking-wider text-gray-light">ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {content.slice(0, 5).map((item, index) => (
              <tr key={item.id} className="border-b border-gray-dark hover:bg-black hover:bg-opacity-30">
                <td className="p-4">
                  <div>
                    <p className="text-white font-space text-sm">{item.title}</p>
                    {item.subtitle && (
                      <p className="text-gray-light font-space text-xs">{item.subtitle}</p>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <p className="text-gray-light font-space text-xs">
                    {type === 'events' ? item.date : item.created_at}
                  </p>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 font-space text-xs brutal-border ${
                    item.featured 
                      ? 'bg-neon-mint text-black border-neon-mint' 
                      : type === 'articles' && item.published
                        ? 'bg-neon-yellow text-black border-neon-yellow'
                        : 'bg-gray-dark text-white border-gray-dark'
                  }`}>
                    {item.featured ? 'DESTACADO' : 
                     type === 'articles' ? (item.published ? 'PUBLICADO' : 'BORRADOR') : 'ACTIVO'}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex space-x-2">
                    <button className="p-2 bg-transparent border border-gray-dark hover:border-neon-mint hover:text-neon-mint transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 bg-transparent border border-gray-dark hover:border-neon-pink hover:text-neon-pink transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h3 className="font-bebas text-2xl tracking-wider text-white">
        CONFIGURACIÓN DEL SITIO
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-gray-dark bg-opacity-30 p-6 brutal-border border-gray-dark">
          <h4 className="font-bebas text-lg tracking-wider text-neon-mint mb-4">
            CONFIGURACIÓN GENERAL
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block font-space text-sm text-gray-light mb-2">
                Nombre del Sitio
              </label>
              <input
                type="text"
                value="TECHNO EXPERIENCE"
                className="w-full bg-black border-2 border-gray-dark text-white px-4 py-2 font-space text-sm focus:border-neon-mint focus:outline-none brutal-border"
              />
            </div>
            <div>
              <label className="block font-space text-sm text-gray-light mb-2">
                Descripción
              </label>
              <textarea
                value="Portal Cultural Inmersivo de la Escena Techno"
                rows={3}
                className="w-full bg-black border-2 border-gray-dark text-white px-4 py-2 font-space text-sm focus:border-neon-mint focus:outline-none brutal-border resize-none"
              />
            </div>
          </div>
        </div>

        {/* SEO Settings */}
        <div className="bg-gray-dark bg-opacity-30 p-6 brutal-border border-gray-dark">
          <h4 className="font-bebas text-lg tracking-wider text-neon-pink mb-4">
            CONFIGURACIÓN SEO
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block font-space text-sm text-gray-light mb-2">
                Meta Title
              </label>
              <input
                type="text"
                value="Techno Experience | Portal Cultural Techno"
                className="w-full bg-black border-2 border-gray-dark text-white px-4 py-2 font-space text-sm focus:border-neon-mint focus:outline-none brutal-border"
              />
            </div>
            <div>
              <label className="block font-space text-sm text-gray-light mb-2">
                Meta Description
              </label>
              <textarea
                value="Descubre la mejor música techno, eventos exclusivos y contenido editorial underground en el portal cultural más completo de la escena electrónica."
                rows={3}
                className="w-full bg-black border-2 border-gray-dark text-white px-4 py-2 font-space text-sm focus:border-neon-mint focus:outline-none brutal-border resize-none"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <button className="px-8 py-4 bg-neon-mint text-black font-bebas text-lg tracking-wider hover:bg-transparent hover:text-neon-mint border-2 border-neon-mint transition-all duration-300 brutal-border flex items-center mx-auto">
          <Save className="w-5 h-5 mr-2" />
          GUARDAR CONFIGURACIÓN
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black pt-8">
      <div className="container mx-auto px-4">
        {/* Admin Header */}
        <div className="mb-component">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-neon-mint brutal-border border-neon-mint flex items-center justify-center">
              <Settings className="w-5 h-5 text-black" />
            </div>
            <h1 className="font-bebas text-4xl md:text-6xl tracking-wider text-white">
              PANEL DE ADMINISTRACIÓN
            </h1>
          </div>
          <p className="text-gray-light font-space text-lg">
            Sistema de gestión de contenido para Techno Experience
          </p>
        </div>

        {/* Admin Navigation */}
        <div className="flex flex-wrap gap-2 mb-component">
          {adminTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 font-bebas text-sm tracking-wider brutal-border transition-all duration-300 flex items-center ${
                activeTab === tab.id
                  ? 'text-black border-2'
                  : 'bg-transparent text-white border-gray-dark hover:border-white'
              }`}
              style={{
                backgroundColor: activeTab === tab.id ? tab.color : 'transparent',
                borderColor: activeTab === tab.id ? tab.color : ''
              }}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="bg-black bg-opacity-50 p-6 brutal-border border-gray-dark">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'events' && renderContentTable(mockEvents, 'events')}
          {activeTab === 'articles' && renderContentTable(mockArticles, 'articles')}
          {activeTab === 'media' && (
            <div className="text-center py-16">
              <Upload className="w-16 h-16 text-gray-light mx-auto mb-4" />
              <h3 className="font-bebas text-2xl tracking-wider text-white mb-2">
                GESTIÓN DE MEDIA
              </h3>
              <p className="text-gray-light font-space text-sm">
                Funcionalidad de gestión de archivos multimedia en desarrollo
              </p>
            </div>
          )}
          {activeTab === 'users' && (
            <div className="text-center py-16">
              <Users className="w-16 h-16 text-gray-light mx-auto mb-4" />
              <h3 className="font-bebas text-2xl tracking-wider text-white mb-2">
                GESTIÓN DE USUARIOS
              </h3>
              <p className="text-gray-light font-space text-sm">
                Sistema de gestión de usuarios en desarrollo
              </p>
            </div>
          )}
          {activeTab === 'settings' && renderSettings()}
        </div>
      </div>
    </div>
  );
};

export default Admin;
