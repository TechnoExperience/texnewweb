import { supabase } from '../lib/supabase';
import { mockEvents, mockArticles, mockVenues, mockMediaItems } from '../data/mockData';

interface MigrationResult {
  success: boolean;
  message: string;
  details?: any;
}

export class DataMigrator {
  
  async migrateAll(): Promise<MigrationResult[]> {
    console.log('🚀 Iniciando migración de datos a Supabase...');
    
    const results: MigrationResult[] = [];
    
    try {
      // Migrar venues primero (son referenciados por eventos)
      results.push(await this.migrateVenues());
      
      // Migrar artistas
      results.push(await this.migrateArtists());
      
      // Migrar eventos
      results.push(await this.migrateEvents());
      
      // Migrar artículos
      results.push(await this.migrateArticles());
      
      // Migrar media gallery
      results.push(await this.migrateMediaItems());
      
      console.log('✅ Migración completada');
      return results;
      
    } catch (error) {
      console.error('❌ Error durante la migración:', error);
      return [{
        success: false,
        message: `Error general en la migración: ${error}`,
        details: error
      }];
    }
  }

  async migrateVenues(): Promise<MigrationResult> {
    try {
      console.log('📍 Migrando venues...');
      
      const venuesData = mockVenues.map(venue => ({
        id: venue.id,
        name: venue.name,
        description: venue.description,
        address: venue.address,
        city: venue.city,
        country: venue.country,
        latitude: venue.coordinates.lat,
        longitude: venue.coordinates.lng,
        capacity: venue.capacity,
        website: venue.website,
        social_links: venue.social,
        image_url: venue.image,
        featured: venue.featured,
        created_at: venue.created_at,
        updated_at: venue.updated_at
      }));

      const { data, error } = await supabase
        .from('venues')
        .upsert(venuesData, { onConflict: 'id' });

      if (error) {
        return {
          success: false,
          message: `Error migrando venues: ${error.message}`,
          details: error
        };
      }

      return {
        success: true,
        message: `✅ ${venuesData.length} venues migrados exitosamente`,
        details: data
      };

    } catch (error) {
      return {
        success: false,
        message: `Error inesperado migrando venues: ${error}`,
        details: error
      };
    }
  }

  async migrateArtists(): Promise<MigrationResult> {
    try {
      console.log('🎵 Migrando artistas...');
      
      // Extraer artistas únicos de los eventos mock
      const artistsSet = new Set();
      const artistsData: any[] = [];

      mockEvents.forEach(event => {
        event.artists?.forEach(artist => {
          if (!artistsSet.has(artist.id)) {
            artistsSet.add(artist.id);
            artistsData.push({
              id: artist.id,
              name: artist.name,
              bio: artist.bio,
              image_url: artist.image,
              genres: artist.genres,
              country: artist.country,
              social_links: artist.social,
              featured: artist.featured || false,
              verified: false,
              followers_count: Math.floor(Math.random() * 50000) + 1000,
              monthly_listeners: Math.floor(Math.random() * 100000) + 5000,
              label: 'Independent',
              booking_email: `booking@${artist.name.toLowerCase().replace(/\s+/g, '')}.com`,
              press_kit_url: `https://presskit.${artist.name.toLowerCase().replace(/\s+/g, '')}.com`,
              created_at: artist.created_at,
              updated_at: artist.updated_at
            });
          }
        });
      });

      // Agregar algunos artistas adicionales
      const additionalArtists = [
        {
          id: 'mosha-001',
          name: 'Mosha',
          bio: 'Productor anónimo especializado en minimal techno con un enfoque purista que privilegia la sustancia sobre la forma.',
          image_url: '/images/dj-setup-techno.jpg',
          genres: ['Minimal Techno', 'Deep House'],
          country: 'España',
          social_links: {
            soundcloud: 'mosha-official',
            instagram: '@mosha_minimal'
          },
          featured: true,
          verified: true,
          followers_count: 25000,
          monthly_listeners: 150000,
          label: 'Underground Collective',
          booking_email: 'booking@mosha.com',
          press_kit_url: 'https://presskit.mosha.com',
          created_at: '2025-01-01',
          updated_at: '2025-01-01'
        },
        {
          id: 'alex-under-002',
          name: 'Alex Under',
          bio: 'Pionero del techno español y fundador del sello MONOGRAM. Figura clave en la escena underground ibérica.',
          image_url: '/images/vinyl-turntable.jpg',
          genres: ['Techno', 'Industrial Techno', 'Acid Techno'],
          country: 'España',
          social_links: {
            soundcloud: 'alex-under',
            instagram: '@alexunder_official',
            website: 'https://alexunder.com'
          },
          featured: true,
          verified: true,
          followers_count: 45000,
          monthly_listeners: 200000,
          label: 'MONOGRAM',
          booking_email: 'booking@alexunder.com',
          press_kit_url: 'https://presskit.alexunder.com',
          created_at: '2025-01-01',
          updated_at: '2025-01-01'
        }
      ];

      artistsData.push(...additionalArtists);

      const { data, error } = await supabase
        .from('artists')
        .upsert(artistsData, { onConflict: 'id' });

      if (error) {
        return {
          success: false,
          message: `Error migrando artistas: ${error.message}`,
          details: error
        };
      }

      return {
        success: true,
        message: `✅ ${artistsData.length} artistas migrados exitosamente`,
        details: data
      };

    } catch (error) {
      return {
        success: false,
        message: `Error inesperado migrando artistas: ${error}`,
        details: error
      };
    }
  }

  async migrateEvents(): Promise<MigrationResult> {
    try {
      console.log('🎉 Migrando eventos...');
      
      const eventsData = mockEvents.map(event => ({
        id: event.id,
        title: event.title,
        subtitle: event.subtitle,
        description: event.description,
        date: event.date,
        time: event.time,
        venue_id: '1', // Asumiendo que existe el venue con ID 1
        image_url: event.image,
        genres: event.genres,
        ticket_price: event.tickets?.price || null,
        ticket_currency: event.tickets?.currency || 'EUR',
        ticket_url: event.tickets?.url || null,
        tickets_available: event.tickets?.available || true,
        featured: event.featured,
        event_type: event.category,
        age_restriction: '18+',
        dress_code: 'Smart Casual',
        tags: event.tags,
        created_at: event.created_at,
        updated_at: event.updated_at
      }));

      const { data, error } = await supabase
        .from('events')
        .upsert(eventsData, { onConflict: 'id' });

      if (error) {
        return {
          success: false,
          message: `Error migrando eventos: ${error.message}`,
          details: error
        };
      }

      // Crear relaciones evento-artista
      const eventArtistRelations: any[] = [];
      mockEvents.forEach(event => {
        event.artists?.forEach((artist, index) => {
          eventArtistRelations.push({
            event_id: event.id,
            artist_id: artist.id,
            performance_order: index + 1,
            set_time: `${22 + index}:00`,
            is_headliner: index === 0
          });
        });
      });

      if (eventArtistRelations.length > 0) {
        await supabase
          .from('event_artists')
          .upsert(eventArtistRelations, { onConflict: 'event_id,artist_id' });
      }

      return {
        success: true,
        message: `✅ ${eventsData.length} eventos y ${eventArtistRelations.length} relaciones evento-artista migrados exitosamente`,
        details: data
      };

    } catch (error) {
      return {
        success: false,
        message: `Error inesperado migrando eventos: ${error}`,
        details: error
      };
    }
  }

  async migrateArticles(): Promise<MigrationResult> {
    try {
      console.log('📝 Migrando artículos...');
      
      const articlesData = mockArticles.map(article => ({
        id: article.id,
        title: article.title,
        subtitle: article.subtitle,
        content: article.content,
        excerpt: article.excerpt,
        author_id: null, // Se asignará después cuando tengamos usuarios
        image_url: article.image,
        category: article.category,
        tags: article.tags,
        published: article.published,
        featured: article.featured,
        meta_title: article.seo?.meta_title,
        meta_description: article.seo?.meta_description,
        reading_time: this.calculateReadingTime(article.content),
        views_count: Math.floor(Math.random() * 1000) + 100,
        likes_count: Math.floor(Math.random() * 50) + 5,
        created_at: article.created_at,
        updated_at: article.updated_at,
        published_at: article.published_at
      }));

      const { data, error } = await supabase
        .from('articles')
        .upsert(articlesData, { onConflict: 'id' });

      if (error) {
        return {
          success: false,
          message: `Error migrando artículos: ${error.message}`,
          details: error
        };
      }

      return {
        success: true,
        message: `✅ ${articlesData.length} artículos migrados exitosamente`,
        details: data
      };

    } catch (error) {
      return {
        success: false,
        message: `Error inesperado migrando artículos: ${error}`,
        details: error
      };
    }
  }

  async migrateMediaItems(): Promise<MigrationResult> {
    try {
      console.log('🖼️ Migrando media gallery...');
      
      const mediaData = mockMediaItems.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        media_type: item.type,
        media_url: item.url,
        artist_name: item.artist,
        event_name: item.event,
        year: item.year,
        genre: item.genre,
        location: item.location,
        tags: item.tags,
        featured: item.featured,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));

      const { data, error } = await supabase
        .from('media_gallery')
        .upsert(mediaData, { onConflict: 'id' });

      if (error) {
        return {
          success: false,
          message: `Error migrando media gallery: ${error.message}`,
          details: error
        };
      }

      return {
        success: true,
        message: `✅ ${mediaData.length} elementos de media migrados exitosamente`,
        details: data
      };

    } catch (error) {
      return {
        success: false,
        message: `Error inesperado migrando media gallery: ${error}`,
        details: error
      };
    }
  }

  private calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const words = content.split(' ').length;
    return Math.ceil(words / wordsPerMinute);
  }

  // Método para limpiar datos existentes (usar con precaución)
  async clearAllData(): Promise<MigrationResult> {
    try {
      console.log('🗑️ Limpiando datos existentes...');
      
      const tables = ['event_artists', 'events', 'articles', 'artists', 'venues', 'media_gallery'];
      const results = [];

      for (const table of tables) {
        const { error } = await supabase
          .from(table)
          .delete()
          .neq('id', ''); // Eliminar todos los registros

        if (error) {
          console.error(`Error limpiando tabla ${table}:`, error);
        } else {
          results.push(`✅ Tabla ${table} limpiada`);
        }
      }

      return {
        success: true,
        message: `✅ Datos limpiados: ${results.join(', ')}`,
        details: results
      };

    } catch (error) {
      return {
        success: false,
        message: `Error limpiando datos: ${error}`,
        details: error
      };
    }
  }
}

// Función helper para ejecutar la migración
export const runMigration = async (clearFirst: boolean = false): Promise<void> => {
  const migrator = new DataMigrator();
  
  if (clearFirst) {
    const clearResult = await migrator.clearAllData();
    console.log(clearResult.message);
  }
  
  const results = await migrator.migrateAll();
  
  results.forEach(result => {
    if (result.success) {
      console.log(`✅ ${result.message}`);
    } else {
      console.error(`❌ ${result.message}`);
    }
  });
}; 