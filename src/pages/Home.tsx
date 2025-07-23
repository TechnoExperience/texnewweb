import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Music, Calendar } from 'lucide-react';
import Hero from '../components/ui/Hero';
import EventCard from '../components/ui/EventCard';
import ArticleCard from '../components/ui/ArticleCard';
import DataManager from '../utils/dataManager';
import { Event, Article } from '../data/types';

const Home: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    const loadedEvents = DataManager.getEvents();
    const loadedArticles = DataManager.getArticles();
    setEvents(loadedEvents);
    setArticles(loadedArticles);
  }, []);

  const featuredEvents = events.filter(event => event.featured);
  const upcomingEvents = events.filter(event => !event.featured).slice(0, 4);
  const featuredArticles = articles.filter(article => article.featured);
  const recentArticles = articles.filter(article => !article.featured).slice(0, 4);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero />

      {/* Featured Events Section */}
      <section className="py-section bg-black">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-component">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-neon-yellow brutal-border border-neon-yellow flex items-center justify-center">
                  <Zap className="w-4 h-4 text-black" />
                </div>
                <h2 className="font-bebas text-3xl md:text-4xl tracking-wider text-white">
                  EVENTOS DESTACADOS
                </h2>
              </div>
              <p className="text-gray-light font-space text-lg max-w-2xl">
                Las experiencias techno más intensas que definirán la escena underground en 2025.
              </p>
            </div>
            <Link
              to="/eventos"
              className="hidden md:flex items-center space-x-2 px-6 py-3 border-2 border-neon-yellow text-neon-yellow font-bebas tracking-wider hover:bg-neon-yellow hover:text-black transition-all duration-300 brutal-border"
            >
              <span>VER TODOS</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Featured Events Grid */}
          <div className="grid-techno mb-8">
            {featuredEvents.map((event) => (
              <EventCard key={event.id} event={event} featured />
            ))}
          </div>

          {/* Upcoming Events */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          {/* Mobile CTA */}
          <div className="md:hidden mt-8 text-center">
            <Link
              to="/eventos"
              className="inline-flex items-center space-x-2 px-6 py-3 border-2 border-neon-yellow text-neon-yellow font-bebas tracking-wider hover:bg-neon-yellow hover:text-black transition-all duration-300 brutal-border"
            >
              <span>VER TODOS LOS EVENTOS</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Articles Section */}
      <section className="py-section bg-gray-dark bg-opacity-50">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-component">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-neon-pink brutal-border border-neon-pink flex items-center justify-center">
                  <Music className="w-4 h-4 text-white" />
                </div>
                <h2 className="font-bebas text-3xl md:text-4xl tracking-wider text-white">
                  CONTENIDO EDITORIAL
                </h2>
              </div>
              <p className="text-gray-light font-space text-lg max-w-2xl">
                Análisis profundo de la cultura techno, entrevistas exclusivas y las últimas novedades de la escena.
              </p>
            </div>
            <Link
              to="/articulos"
              className="hidden md:flex items-center space-x-2 px-6 py-3 border-2 border-neon-pink text-neon-pink font-bebas tracking-wider hover:bg-neon-pink hover:text-white transition-all duration-300 brutal-border"
            >
              <span>VER TODOS</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Featured Articles Grid */}
          <div className="grid-techno mb-8">
            {featuredArticles.map((article) => (
              <ArticleCard key={article.id} article={article} featured />
            ))}
          </div>

          {/* Recent Articles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>

          {/* Mobile CTA */}
          <div className="md:hidden mt-8 text-center">
            <Link
              to="/articulos"
              className="inline-flex items-center space-x-2 px-6 py-3 border-2 border-neon-pink text-neon-pink font-bebas tracking-wider hover:bg-neon-pink hover:text-white transition-all duration-300 brutal-border"
            >
              <span>VER TODOS LOS ARTÍCULOS</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-section bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-neon-mint brutal-border border-neon-mint flex items-center justify-center">
                <Calendar className="w-5 h-5 text-black" />
              </div>
              <h2 className="font-bebas text-4xl md:text-5xl tracking-wider text-white">
                ÚNETE A LA EXPERIENCIA
              </h2>
            </div>
            
            <p className="text-gray-light font-space text-xl mb-8 leading-relaxed">
              Conecta con la comunidad techno más vibrante. Descubre eventos exclusivos, 
              accede a contenido premium y forma parte del underground digital.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/registro"
                className="px-8 py-4 bg-neon-mint text-black font-bebas text-lg tracking-wider hover:bg-transparent hover:text-neon-mint border-2 border-neon-mint transition-all duration-300 brutal-border"
              >
                CREAR CUENTA
              </Link>
              
              <Link
                to="/nosotros"
                className="px-8 py-4 bg-transparent text-white font-bebas text-lg tracking-wider hover:bg-white hover:text-black border-2 border-white transition-all duration-300 brutal-border"
              >
                CONOCE MÁS
              </Link>
            </div>

            {/* Quick Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="p-6 border border-gray-dark hover:border-neon-mint transition-colors">
                <h4 className="font-bebas text-lg tracking-wider text-neon-mint mb-2">
                  EVENTOS EXCLUSIVOS
                </h4>
                <p className="text-gray-light font-space text-sm">
                  Acceso prioritario a los mejores eventos techno y experiencias inmersivas.
                </p>
              </div>
              
              <div className="p-6 border border-gray-dark hover:border-neon-pink transition-colors">
                <h4 className="font-bebas text-lg tracking-wider text-neon-pink mb-2">
                  CONTENIDO PREMIUM
                </h4>
                <p className="text-gray-light font-space text-sm">
                  Sets exclusivos, entrevistas profundas y análisis de la escena underground.
                </p>
              </div>
              
              <div className="p-6 border border-gray-dark hover:border-neon-yellow transition-colors">
                <h4 className="font-bebas text-lg tracking-wider text-neon-yellow mb-2">
                  COMUNIDAD GLOBAL
                </h4>
                <p className="text-gray-light font-space text-sm">
                  Conecta con artistas, promotores y fanáticos del techno de todo el mundo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
