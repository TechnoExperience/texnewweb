import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import { Event } from '../../data/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Configurar moment para español
moment.locale('es');
const localizer = momentLocalizer(moment);

interface EventCalendarProps {
  events: Event[];
  onEventSelect?: (event: Event) => void;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Event;
}

const EventCalendar: React.FC<EventCalendarProps> = ({ events, onEventSelect }) => {
  const [view, setView] = useState<'month' | 'week' | 'agenda'>('month');

  // Convertir eventos a formato de calendario
  const calendarEvents: CalendarEvent[] = events.map(event => {
    const eventDate = new Date(event.date);
    // Agregar la hora del evento
    const [hours, minutes] = event.time.split(':');
    eventDate.setHours(parseInt(hours), parseInt(minutes));
    
    // Asumir 4 horas de duración para eventos club, 8 para festivales
    const endDate = new Date(eventDate);
    endDate.setHours(eventDate.getHours() + (event.category === 'festival' ? 8 : 4));

    return {
      id: event.id,
      title: `${event.title} - ${event.city}`,
      start: eventDate,
      end: endDate,
      resource: event
    };
  });

  const handleEventSelect = (event: CalendarEvent) => {
    if (onEventSelect) {
      onEventSelect(event.resource);
    }
  };

  // Componente personalizado para eventos
  const EventComponent = ({ event }: { event: CalendarEvent }) => (
    <div className="text-xs">
      <strong className="block">{event.resource.title}</strong>
      <span>{event.resource.venue}</span>
    </div>
  );

  // Estilos personalizados para el calendario
  const eventStyleGetter = (event: CalendarEvent) => {
    const backgroundColor = event.resource.category === 'festival' ? '#F2FF00' : '#00CED1';
    const style = {
      backgroundColor,
      borderRadius: '0px',
      opacity: 0.9,
      color: 'black',
      border: `2px solid ${backgroundColor}`,
      display: 'block',
      fontFamily: 'Space Mono, monospace',
      fontSize: '11px',
      fontWeight: 'bold'
    };
    return { style };
  };

  return (
    <div className="bg-black">
      {/* Controles de Vista */}
      <div className="mb-6 flex flex-wrap items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-gray-light font-space text-sm">Vista:</span>
          {(['month', 'week', 'agenda'] as const).map((viewType) => (
            <button
              key={viewType}
              onClick={() => setView(viewType)}
              className={`px-4 py-2 font-bebas text-sm tracking-wider transition-all duration-300 brutal-border border-2 ${
                view === viewType
                  ? 'bg-neon-mint text-black border-neon-mint'
                  : 'bg-transparent text-white border-gray-dark hover:border-neon-mint hover:text-neon-mint'
              }`}
            >
              {viewType === 'month' ? 'MES' : viewType === 'week' ? 'SEMANA' : 'AGENDA'}
            </button>
          ))}
        </div>
        
        <div className="text-gray-light font-space text-sm">
          {calendarEvents.length} eventos programados
        </div>
      </div>

      {/* Calendario */}
      <div className="bg-white brutal-border border-gray-dark" style={{ height: '600px' }}>
        <Calendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          view={view}
          onView={setView}
          onSelectEvent={handleEventSelect}
          eventPropGetter={eventStyleGetter}
          components={{
            event: EventComponent
          }}
          messages={{
            next: 'Siguiente',
            previous: 'Anterior',
            today: 'Hoy',
            month: 'Mes',
            week: 'Semana',
            day: 'Día',
            agenda: 'Agenda',
            date: 'Fecha',
            time: 'Hora',
            event: 'Evento',
            noEventsInRange: 'No hay eventos en este rango',
            showMore: (total) => `+ Ver ${total} más`
          }}
          culture="es"
          style={{
            fontFamily: 'Space Mono, monospace',
            fontSize: '12px'
          }}
        />
      </div>

      {/* Leyenda */}
      <div className="mt-4 flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-neon-yellow brutal-border border-neon-yellow"></div>
          <span className="text-gray-light font-space text-sm">FESTIVALES</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-category-news brutal-border border-category-news"></div>
          <span className="text-gray-light font-space text-sm">CLUBS</span>
        </div>
      </div>
    </div>
  );
};

export default EventCalendar;
