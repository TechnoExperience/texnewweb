import { supabase } from '../lib/supabase';

export const createSampleArticles = async () => {
  try {
    console.log('Creando artículos de muestra...');
    
    const articles = [
      {
        title: 'La Escena Techno Española Explota en 2025',
        content: 'La música electrónica española está viviendo un momento dorado. Con artistas como ANNA, Paco Osuna y la nueva generación de productores como Karretero, España se ha consolidado como una potencia mundial en el techno underground. Los clubs de Madrid y Barcelona reciben a los mejores DJs del mundo.',
        excerpt: 'Un análisis profundo del momento actual de la escena techno española y sus principales exponentes.',
        image_url: 'https://images.unsplash.com/photo-1571566882372-1598d88abd90?w=800',
        category: 'news',
        tags: ['techno', 'españa', 'música electrónica', 'underground'],
        published: true,
        featured: true,
        slug: 'escena-techno-espanola-2025',
        reading_time: 4,
        views_count: 125,
        likes_count: 23
      },
      {
        title: 'Entrevista Exclusiva: El Futuro del Techno Industrial',
        content: 'En una charla íntima con uno de los productores más prometedores de la escena underground, exploramos las raíces del techno industrial y su evolución hacia nuevos territorios sonoros. El techno siempre ha sido una música de resistencia.',
        excerpt: 'Una conversación profunda sobre la evolución del techno industrial con uno de sus máximos exponentes.',
        image_url: 'https://images.unsplash.com/photo-1518384401463-7c69b1a8b2a3?w=800',
        category: 'interview',
        tags: ['entrevista', 'techno industrial', 'productor', 'underground'],
        published: true,
        featured: false,
        slug: 'entrevista-futuro-techno-industrial',
        reading_time: 6,
        views_count: 89,
        likes_count: 15
      },
      {
        title: 'Reseña: Una Noche Épica en Industrial Copera',
        content: 'La sala Industrial Copera de Madrid volvió a demostrar por qué es considerada uno de los templos del techno underground en España. La programación de anoche, con línea-up 100% nacional, fue sencillamente espectacular.',
        excerpt: 'Crónica de una noche memorable en uno de los clubs techno más respetados de Madrid.',
        image_url: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800',
        category: 'review',
        tags: ['reseña', 'club', 'madrid', 'techno underground'],
        published: true,
        featured: false,
        slug: 'resena-noche-epica-industrial-copera',
        reading_time: 3,
        views_count: 156,
        likes_count: 31
      }
    ];

    const { data, error } = await supabase
      .from('articles')
      .insert(articles)
      .select();

    if (error) {
      console.error('Error creando artículos:', error);
      return false;
    }

    console.log('Artículos creados:', data?.length);
    return true;
  } catch (error) {
    console.error('Error en createSampleArticles:', error);
    return false;
  }
};

export const createSampleEvents = async () => {
  try {
    console.log('Creando eventos de muestra...');
    
    const events = [
      {
        title: 'TECHNO UNDERGROUND NIGHT',
        description: 'Una noche épica de techno underground con los mejores DJs nacionales. El lineup incluye a los más destacados artistas de la escena techno española, con un sound system de última generación y visuales impresionantes.',
        date: '2025-02-15',
        time: '23:00:00',
        location: 'Industrial Copera, Madrid',
        image_url: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800',
        price: 25,
        capacity: 500,
        genre: 'Techno',
        featured: true
      },
      {
        title: 'WAREHOUSE PARTY',
        description: 'Fiesta en nave industrial con sound system de primer nivel. Una experiencia inmersiva en un espacio industrial único, donde el techno más puro resuena entre estructuras de hormigón y acero.',
        date: '2025-02-22',
        time: '22:00:00',
        location: 'Warehouse District, Barcelona',
        image_url: 'https://images.unsplash.com/photo-1571566882372-1598d88abd90?w=800',
        price: 30,
        capacity: 800,
        genre: 'Electronic',
        featured: false
      },
      {
        title: 'MINIMAL SESSIONS MADRID',
        description: 'Una sesión íntima de techno minimal en uno de los clubs más exclusivos de Madrid. Enfoque en la calidad del sonido y la experiencia musical más pura.',
        date: '2025-03-01',
        time: '00:00:00',
        location: 'Club Moog, Madrid',
        image_url: 'https://images.unsplash.com/photo-1571266028243-d220c0ecf99b?w=800',
        price: 20,
        capacity: 300,
        genre: 'Minimal',
        featured: true
      },
      {
        title: 'UNDERGROUND FESTIVAL 2025',
        description: 'El festival de techno underground más esperado del año. Dos días de música ininterrumpida con los mejores artistas internacionales y nacionales en múltiples escenarios.',
        date: '2025-03-15',
        time: '18:00:00',
        location: 'Recinto Ferial, Valencia',
        image_url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
        price: 75,
        capacity: 5000,
        genre: 'Techno',
        featured: true
      },
      {
        title: 'PROGRESSIVE NIGHT',
        description: 'Una noche dedicada al progressive techno y house, con artistas que llevarán tu mente a otro nivel con melodías envolventes y beats hipnóticos.',
        date: '2025-03-08',
        time: '23:30:00',
        location: 'Pacha, Ibiza',
        image_url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800',
        price: 45,
        capacity: 600,
        genre: 'Progressive',
        featured: false
      }
    ];

    const { data, error } = await supabase
      .from('events')
      .insert(events)
      .select();

    if (error) {
      console.error('Error creando eventos:', error);
      return false;
    }

    console.log('Eventos creados:', data?.length);
    return true;
  } catch (error) {
    console.error('Error en createSampleEvents:', error);
    return false;
  }
}; 