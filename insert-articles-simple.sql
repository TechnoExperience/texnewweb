-- =====================================================
-- CREAR ARTÍCULOS DE EJEMPLO PARA TECHNO EXPERIENCE
-- =====================================================

-- Insertar artículos de muestra (versión simplificada)
INSERT INTO public.articles (
    title,
    content,
    excerpt,
    image_url,
    category,
    tags,
    published,
    featured,
    slug,
    reading_time,
    views_count,
    likes_count
) VALUES

-- Artículo 1: Techno News
(
    'La Escena Techno Española Explota en 2025',
    'La música electrónica española está viviendo un momento dorado. Con artistas como ANNA, Paco Osuna y la nueva generación de productores como Karretero, España se ha consolidado como una potencia mundial en el techno underground.',
    'Un análisis profundo del momento actual de la escena techno española y sus principales exponentes.',
    'https://images.unsplash.com/photo-1571566882372-1598d88abd90?w=800',
    'news',
    ARRAY['techno', 'españa', 'música electrónica', 'underground'],
    true,
    true,
    'escena-techno-espanola-2025',
    4,
    125,
    23
),

-- Artículo 2: Artist Interview
(
    'Entrevista Exclusiva: El Futuro del Techno Industrial',
    'En una charla íntima con uno de los productores más prometedores de la escena underground, exploramos las raíces del techno industrial y su evolución hacia nuevos territorios sonoros.',
    'Una conversación profunda sobre la evolución del techno industrial con uno de sus máximos exponentes.',
    'https://images.unsplash.com/photo-1518384401463-7c69b1a8b2a3?w=800',
    'interview',
    ARRAY['entrevista', 'techno industrial', 'productor', 'underground'],
    true,
    false,
    'entrevista-futuro-techno-industrial',
    6,
    89,
    15
),

-- Artículo 3: Event Review
(
    'Reseña: Una Noche Épica en Industrial Copera',
    'La sala Industrial Copera de Madrid volvió a demostrar por qué es considerada uno de los templos del techno underground en España. La programación de anoche, con línea-up 100% nacional, fue sencillamente espectacular.',
    'Crónica de una noche memorable en uno de los clubs techno más respetados de Madrid.',
    'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800',
    'review',
    ARRAY['reseña', 'club', 'madrid', 'techno underground'],
    true,
    false,
    'resena-noche-epica-industrial-copera',
    3,
    156,
    31
),

-- Artículo 4: Feature Article
(
    'Los Nuevos Templos del Techno: Arquitectura y Sonido',
    'La relación entre espacios arquitectónicos y música electrónica ha evolucionado significativamente en los últimos años. Los nuevos clubs y salas de conciertos están siendo diseñados específicamente para optimizar la experiencia sonora del techno.',
    'Un análisis de cómo la arquitectura y el diseño de espacios influyen en la experiencia techno.',
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
    'feature',
    ARRAY['arquitectura', 'clubs', 'diseño', 'acústica', 'underground'],
    true,
    true,
    'nuevos-templos-techno-arquitectura-sonido',
    8,
    203,
    45
),

-- Artículo 5: Technology Review
(
    'Review: Los Mejores Controladores MIDI de 2025',
    'El mundo de los controladores MIDI ha experimentado una revolución tecnológica importante este año. Analizamos los modelos más destacados que están marcando tendencia en cabinas de todo el mundo.',
    'Análisis completo de los controladores MIDI más innovadores del año.',
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
    'review',
    ARRAY['controladores', 'midi', 'dj', 'tecnología', 'gear'],
    true,
    false,
    'review-mejores-controladores-midi-2025',
    7,
    178,
    28
);

-- Verificar que se insertaron correctamente
SELECT title, category, published, featured, created_at 
FROM public.articles 
ORDER BY created_at DESC; 