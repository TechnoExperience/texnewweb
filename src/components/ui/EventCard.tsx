import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, Users } from 'lucide-react';
import { Event } from '../../data/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface EventCardProps {
  event: Event;
  featured?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ event, featured = false }) => {
  const eventDate = new Date(event.date);
  const formattedDate = format(eventDate, 'dd MMM', { locale: es });
  const formattedDay = format(eventDate, 'EEEE', { locale: es });

  return (
    <Link 
      to={`/eventos/${event.id}`}
      className={`
        group block overflow-hidden transition-all duration-300 hover:scale-105
        ${featured ? 'col-span-full lg:col-span-2 row-span-2' : ''}
      `}
    >
      <article className="bg-black border-2 border-gray-dark hover:border-neon-mint transition-all duration-300 h-full flex flex-col brutal-border">
        {/* Image Section */}
        <div className="relative overflow-hidden">
          <img
            src={event.image}
            alt={event.title}
            className={`
              w-full object-cover transition-transform duration-500 group-hover:scale-110
              ${featured ? 'h-64 md:h-80' : 'h-48'}
            `}
          />
          
          {/* Category Badge */}
          <div className="absolute top-4 left-4">
            <span 
              className="px-3 py-1 font-bebas text-xs tracking-wider text-black brutal-border border-2"
              style={{ 
                backgroundColor: event.category === 'festival' ? '#F2FF00' : 
                                event.category === 'club' ? '#00CED1' : '#A2F2C2',
                borderColor: event.category === 'festival' ? '#F2FF00' : 
                            event.category === 'club' ? '#00CED1' : '#A2F2C2'
              }}
            >
              {event.category.toUpperCase()}
            </span>
          </div>

          {/* Featured Badge */}
          {event.featured && (
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1 bg-neon-pink text-white font-bebas text-xs tracking-wider brutal-border border-2 border-neon-pink">
                DESTACADO
              </span>
            </div>
          )}

          {/* Date Overlay */}
          <div className="absolute bottom-4 left-4 bg-black bg-opacity-90 p-3 brutal-border border-white border">
            <div className="text-center">
              <div className="font-bebas text-2xl text-white leading-none">
                {formattedDate.split(' ')[0]}
              </div>
              <div className="font-bebas text-sm text-neon-mint">
                {formattedDate.split(' ')[1].toUpperCase()}
              </div>
              <div className="font-space text-xs text-gray-light">
                {formattedDay}
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 flex-1 flex flex-col">
          {/* Title */}
          <h3 className={`
            font-bebas tracking-wider text-white group-hover:text-neon-mint transition-colors duration-300 mb-2
            ${featured ? 'text-2xl md:text-3xl' : 'text-xl'}
          `}>
            {event.title}
          </h3>

          {/* Subtitle */}
          {event.subtitle && (
            <p className="text-gray-light font-space text-sm mb-4 line-clamp-2">
              {event.subtitle}
            </p>
          )}

          {/* Event Details */}
          <div className="space-y-2 mb-4 flex-1">
            <div className="flex items-center space-x-2 text-gray-light font-space text-sm">
              <MapPin className="w-4 h-4 text-neon-mint flex-shrink-0" />
              <span>{event.venue}, {event.city}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-light font-space text-sm">
              <Clock className="w-4 h-4 text-neon-yellow flex-shrink-0" />
              <span>{event.time}</span>
            </div>
            {event.artists.length > 0 && (
              <div className="flex items-center space-x-2 text-gray-light font-space text-sm">
                <Users className="w-4 h-4 text-neon-pink flex-shrink-0" />
                <span>
                  {event.artists.slice(0, 2).map(artist => artist.name).join(', ')}
                  {event.artists.length > 2 && ` +${event.artists.length - 2} más`}
                </span>
              </div>
            )}
          </div>

          {/* Genres */}
          <div className="flex flex-wrap gap-2 mb-4">
            {event.genres.slice(0, 3).map((genre) => (
              <span
                key={genre}
                className="px-2 py-1 bg-gray-dark text-white font-space text-xs border border-gray-light hover:border-white transition-colors"
              >
                {genre}
              </span>
            ))}
          </div>

          {/* Price & CTA */}
          <div className="flex items-center justify-between">
            <div className="text-white">
              <span className="font-bebas text-lg tracking-wider">
                {event.tickets.price}€
              </span>
              <span className="text-gray-light font-space text-sm ml-1">
                /entrada
              </span>
            </div>
            
            <button className="px-4 py-2 bg-transparent border-2 border-neon-mint text-neon-mint font-bebas text-sm tracking-wider hover:bg-neon-mint hover:text-black transition-all duration-300 brutal-border group-hover:animate-neon-pulse">
              VER EVENTO
            </button>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default EventCard;
