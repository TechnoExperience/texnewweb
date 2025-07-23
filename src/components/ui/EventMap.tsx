import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useLoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { Event } from '../../data/types';
import { MapPin, Calendar, Clock, Users } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface EventMapProps {
  events: Event[];
  onEventSelect?: (event: Event) => void;
}

const mapContainerStyle = {
  width: '100%',
  height: '500px'
};

// Centro de España como posición por defecto
const center = {
  lat: 40.4168,
  lng: -3.7038
};

const mapOptions = {
  styles: [
    {
      "elementType": "geometry",
      "stylers": [{ "color": "#212121" }]
    },
    {
      "elementType": "labels.icon",
      "stylers": [{ "visibility": "off" }]
    },
    {
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#757575" }]
    },
    {
      "elementType": "labels.text.stroke",
      "stylers": [{ "color": "#212121" }]
    },
    {
      "featureType": "administrative",
      "elementType": "geometry",
      "stylers": [{ "color": "#757575" }]
    },
    {
      "featureType": "administrative.country",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#9ca5b3" }]
    },
    {
      "featureType": "administrative.land_parcel",
      "stylers": [{ "visibility": "off" }]
    },
    {
      "featureType": "administrative.locality",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#bdbdbd" }]
    },
    {
      "featureType": "poi",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#757575" }]
    },
    {
      "featureType": "poi.park",
      "elementType": "geometry",
      "stylers": [{ "color": "#181818" }]
    },
    {
      "featureType": "poi.park",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#616161" }]
    },
    {
      "featureType": "poi.park",
      "elementType": "labels.text.stroke",
      "stylers": [{ "color": "#1b1b1b" }]
    },
    {
      "featureType": "road",
      "elementType": "geometry.fill",
      "stylers": [{ "color": "#2c2c2c" }]
    },
    {
      "featureType": "road",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#8a8a8a" }]
    },
    {
      "featureType": "road.arterial",
      "elementType": "geometry",
      "stylers": [{ "color": "#373737" }]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry",
      "stylers": [{ "color": "#3c3c3c" }]
    },
    {
      "featureType": "road.highway.controlled_access",
      "elementType": "geometry",
      "stylers": [{ "color": "#4e4e4e" }]
    },
    {
      "featureType": "road.local",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#616161" }]
    },
    {
      "featureType": "transit",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#757575" }]
    },
    {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [{ "color": "#000000" }]
    },
    {
      "featureType": "water",
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#3d3d3d" }]
    }
  ],
  disableDefaultUI: true,
  zoomControl: true,
  mapTypeControl: false,
  scaleControl: true,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: true
};

const EventMap: React.FC<EventMapProps> = ({ events, onEventSelect }) => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyBWXNE96Eb23e16DCw7Zfb9rkYwxRiTUfQ",
    libraries: ['places']
  });

  // Obtener coordenadas de eventos con datos de venue mock
  const getEventCoordinates = (event: Event) => {
    // Coordenadas aproximadas para las ciudades principales
    const cityCoordinates: { [key: string]: { lat: number; lng: number } } = {
      'Ibiza': { lat: 38.9067, lng: 1.4205 },
      'Valencia': { lat: 39.4699, lng: -0.3763 },
      'Madrid': { lat: 40.4168, lng: -3.7038 },
      'Barcelona': { lat: 41.3851, lng: 2.1734 },
      'Sevilla': { lat: 37.3891, lng: -5.9845 }
    };

    return cityCoordinates[event.city] || center;
  };

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMarkerClick = (event: Event) => {
    setSelectedEvent(event);
    if (onEventSelect) {
      onEventSelect(event);
    }
  };

  const getMarkerIcon = (event: Event) => {
    if (!isLoaded) return null;
    
    const color = event.category === 'festival' ? '#F2FF00' : '#00CED1';
    
    return {
      path: window.google.maps.SymbolPath.CIRCLE,
      fillColor: color,
      fillOpacity: 1,
      strokeColor: '#000000',
      strokeWeight: 2,
      scale: 8
    };
  };

  return (
    <div className="bg-black">
      {/* Controles del Mapa */}
      <div className="mb-6 flex flex-wrap items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-neon-mint brutal-border border-neon-mint flex items-center justify-center">
            <MapPin className="w-4 h-4 text-black" />
          </div>
          <h3 className="font-bebas text-xl tracking-wider text-white">
            MAPA DE EVENTOS
          </h3>
        </div>
        
        <div className="text-gray-light font-space text-sm">
          {events.length} ubicaciones
        </div>
      </div>

      {/* Mapa */}
      <div className="brutal-border border-gray-dark overflow-hidden">
        {!isLoaded && !loadError && (
          <div className="flex items-center justify-center h-96 bg-gray-dark bg-opacity-50">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-neon-mint border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-light font-space text-sm">Cargando mapa...</p>
            </div>
          </div>
        )}
        
        {loadError && (
          <div className="flex items-center justify-center h-96 bg-gray-dark bg-opacity-50">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-gray-light mx-auto mb-4" />
              <h4 className="font-bebas text-lg tracking-wider text-white mb-2">
                ERROR AL CARGAR MAPA
              </h4>
              <p className="text-gray-light font-space text-sm max-w-md">
                No se pudo cargar Google Maps. Verifica tu conexión a internet.
              </p>
            </div>
          </div>
        )}

        {isLoaded && (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={6}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={mapOptions}
          >
            {events.map((event) => {
              const position = getEventCoordinates(event);
              const markerIcon = getMarkerIcon(event);
              return (
                <Marker
                  key={event.id}
                  position={position}
                  onClick={() => handleMarkerClick(event)}
                  icon={markerIcon}
                />
              );
            })}

            {selectedEvent && (
              <InfoWindow
                position={getEventCoordinates(selectedEvent)}
                onCloseClick={() => setSelectedEvent(null)}
                options={{
                  pixelOffset: new window.google.maps.Size(0, -10)
                }}
              >
                <div className="bg-black text-white p-4 max-w-xs" style={{ fontFamily: 'Space Mono, monospace' }}>
                  <h4 className="font-bebas text-lg tracking-wider text-white mb-2">
                    {selectedEvent.title}
                  </h4>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-neon-mint flex-shrink-0" />
                      <span className="text-gray-light">
                        {selectedEvent.venue}, {selectedEvent.city}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-neon-yellow flex-shrink-0" />
                      <span className="text-gray-light">
                        {format(new Date(selectedEvent.date), 'dd MMM yyyy', { locale: es })}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-neon-pink flex-shrink-0" />
                      <span className="text-gray-light">{selectedEvent.time}</span>
                    </div>

                    {selectedEvent.artists.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-white flex-shrink-0" />
                        <span className="text-gray-light">
                          {selectedEvent.artists.slice(0, 2).map(artist => artist.name).join(', ')}
                          {selectedEvent.artists.length > 2 && ` +${selectedEvent.artists.length - 2}`}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-dark">
                    <div className="flex items-center justify-between">
                      <span className="font-bebas text-lg text-white">
                        {selectedEvent.tickets.price}€
                      </span>
                      <span 
                        className="px-2 py-1 text-xs font-bold text-black"
                        style={{ 
                          backgroundColor: selectedEvent.category === 'festival' ? '#F2FF00' : '#00CED1'
                        }}
                      >
                        {selectedEvent.category.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        )}
      </div>

      {/* Leyenda */}
      <div className="mt-4 flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-neon-yellow border-2 border-black"></div>
          <span className="text-gray-light font-space text-sm">FESTIVALES</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-category-news border-2 border-black"></div>
          <span className="text-gray-light font-space text-sm">CLUBS</span>
        </div>
      </div>
    </div>
  );
};

export default EventMap;
