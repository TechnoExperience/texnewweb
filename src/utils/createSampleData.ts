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
        description: 'Una noche épica de techno underground con los mejores DJs nacionales',
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
        description: 'Fiesta en nave industrial con sound system de primer nivel',
        date: '2025-02-22',
        time: '22:00:00',
        location: 'Warehouse District, Barcelona',
        image_url: 'https://images.unsplash.com/photo-1571566882372-1598d88abd90?w=800',
        price: 30,
        capacity: 800,
        genre: 'Electronic',
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