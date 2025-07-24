-- =====================================================
-- CREAR ARTÍCULOS DE EJEMPLO PARA TECHNO EXPERIENCE
-- =====================================================

-- Insertar artículos de muestra
INSERT INTO public.articles (
    id,
    title,
    content,
    excerpt,
    image_url,
    author_id,
    category,
    tags,
    published,
    featured,
    slug,
    seo_title,
    seo_description,
    reading_time,
    views_count,
    likes_count,
    created_at,
    updated_at
) VALUES

-- Artículo 1: Techno News
(
    gen_random_uuid(),
    'La Escena Techno Española Explota en 2025',
    'La música electrónica española está viviendo un momento dorado. Con artistas como ANNA, Paco Osuna y la nueva generación de productores como Karretero, España se ha consolidado como una potencia mundial en el techno underground.

Los clubs de Madrid y Barcelona reciben a los mejores DJs del mundo, mientras que festivales como Sónar han puesto a la península ibérica en el mapa internacional de la música electrónica. Este año promete ser especial con lanzamientos de artistas nacionales que están conquistando las mejores discográficas europeas.

La fusión del techno tradicional con elementos del EBM y la música industrial ha creado un sonido distintivo que caracteriza a la nueva ola del techno español. Sellos como Bandidos Records, Semantica y Hypnus Records están liderando esta revolución sonora.',
    'Un análisis profundo del momento actual de la escena techno española y sus principales exponentes.',
    'https://images.unsplash.com/photo-1571566882372-1598d88abd90?w=800',
    (SELECT id FROM auth.users LIMIT 1),
    'news',
    ARRAY['techno', 'españa', 'música electrónica', 'underground'],
    true,
    true,
    'escena-techno-espanola-2025',
    'La Escena Techno Española Explota en 2025 | Techno Experience',
    'Descubre cómo la escena techno española está conquistando el mundo en 2025',
    4,
    125,
    23,
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days'
),

-- Artículo 2: Artist Interview
(
    gen_random_uuid(),
    'Entrevista Exclusiva: El Futuro del Techno Industrial',
    'En una charla íntima con uno de los productores más prometedores de la escena underground, exploramos las raíces del techno industrial y su evolución hacia nuevos territorios sonoros.

"El techno siempre ha sido una música de resistencia", nos comenta mientras ajusta los knobs de su modulador analógico. "En los tiempos actuales, el sonido industrial cobra más relevancia que nunca."

Su último EP ha sido aclamado por la crítica especializada y ha conseguido rotación en los mejores clubs de Berlín y Detroit. La fusión de elementos orgánicos con secuencias programadas crea paisajes sonoros únicos.

La entrevista se desarrolla en su estudio casero, rodeado de sintetizadores vintage y cajas de ritmos clásicas que han definido el sonido del techno durante décadas.',
    'Una conversación profunda sobre la evolución del techno industrial con uno de sus máximos exponentes.',
    'https://images.unsplash.com/photo-1518384401463-7c69b1a8b2a3?w=800',
    (SELECT id FROM auth.users LIMIT 1),
    'interview',
    ARRAY['entrevista', 'techno industrial', 'productor', 'underground'],
    true,
    false,
    'entrevista-futuro-techno-industrial',
    'Entrevista Exclusiva: El Futuro del Techno Industrial',
    'Una charla exclusiva sobre la evolución del techno industrial contemporáneo',
    6,
    89,
    15,
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '5 days'
),

-- Artículo 3: Event Review
(
    gen_random_uuid(),
    'Reseña: Una Noche Épica en Industrial Copera',
    'La sala Industrial Copera de Madrid volvió a demostrar por qué es considerada uno de los templos del techno underground en España. La programación de anoche, con línea-up 100% nacional, fue sencillamente espectacular.

La noche arrancó con sonidos deep y progresivos que fueron escalando hacia territorios más duros conforme avanzaban las horas. El sound system de la sala, recientemente renovado, permitió experimentar cada frecuencia con una claridad cristalina.

El punto álgido llegó de madrugada cuando el headliner desplegó todo su arsenal de tracks inéditos. La pista se convirtió en un hervidero de cuerpos moviéndose al unísono, creando esa energía única que solo el techno de calidad puede generar.

Una noche que reafirma la importancia de los espacios underground en la cultura electrónica madrileña.',
    'Crónica de una noche memorable en uno de los clubs techno más respetados de Madrid.',
    'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800',
    (SELECT id FROM auth.users LIMIT 1),
    'review',
    ARRAY['reseña', 'club', 'madrid', 'techno underground'],
    true,
    false,
    'resena-noche-epica-industrial-copera',
    'Reseña: Una Noche Épica en Industrial Copera | Techno Experience',
    'Crónica completa de una noche legendaria en Industrial Copera Madrid',
    3,
    156,
    31,
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
),

-- Artículo 4: Feature Article
(
    gen_random_uuid(),
    'Los Nuevos Templos del Techno: Arquitectura y Sonido',
    'La relación entre espacios arquitectónicos y música electrónica ha evolucionado significativamente en los últimos años. Los nuevos clubs y salas de conciertos están siendo diseñados específicamente para optimizar la experiencia sonora del techno.

Elementos como la altura de los techos, los materiales de construcción y la distribución del espacio influyen directamente en cómo percibimos las frecuencias graves y agudos que caracterizan este género musical.

Arquitectos especializados en acústica trabajan ahora mano a mano con ingenieros de sonido para crear espacios que no solo suenen bien, sino que también generen la atmósfera adecuada para la experiencia techno.

Desde bunkers subterráneos hasta antiguas fábricas reconvertidas, cada espacio cuenta una historia única que se fusiona con la música para crear experiencias inmersivas inolvidables.

La tendencia actual busca espacios más íntimos y auténticos, alejándose de los grandes festivales masivos para volver a las raíces underground del movimiento.',
    'Un análisis de cómo la arquitectura y el diseño de espacios influyen en la experiencia techno.',
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
    (SELECT id FROM auth.users LIMIT 1),
    'feature',
    ARRAY['arquitectura', 'clubs', 'diseño', 'acústica', 'underground'],
    true,
    true,
    'nuevos-templos-techno-arquitectura-sonido',
    'Los Nuevos Templos del Techno: Arquitectura y Sonido',
    'Explorando la relación entre arquitectura y música electrónica en los espacios underground',
    8,
    203,
    45,
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days'
),

-- Artículo 5: Technology Review
(
    gen_random_uuid(),
    'Review: Los Mejores Controladores MIDI de 2025',
    'El mundo de los controladores MIDI ha experimentado una revolución tecnológica importante este año. Analizamos los modelos más destacados que están marcando tendencia en cabinas de todo el mundo.

La nueva generación de controladores integra haptic feedback, pantallas LCD de alta resolución y conectividad inalámbrica que permite mayor libertad de movimiento durante las actuaciones.

Entre los modelos destacados encontramos propuestas que van desde la simplicidad funcional hasta complejos centros de control que permiten manipular múltiples decks simultáneamente.

La calidad de construcción ha mejorado notablemente, con materiales más resistentes que aguantan las exigencias de las giras internacionales. Los precios se han vuelto más accesibles sin sacrificar prestaciones.

Para DJs que se inician en el mundo profesional, nunca había habido tantas opciones de calidad a precios razonables. Para los veteranos, las nuevas funcionalidades abren posibilidades creativas inexploradas.',
    'Análisis completo de los controladores MIDI más innovadores del año.',
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
    (SELECT id FROM auth.users LIMIT 1),
    'review',
    ARRAY['controladores', 'midi', 'dj', 'tecnología', 'gear'],
    true,
    false,
    'review-mejores-controladores-midi-2025',
    'Review: Los Mejores Controladores MIDI de 2025 | Techno Experience',
    'Guía completa de los controladores MIDI más innovadores para DJs profesionales',
    7,
    178,
    28,
    NOW() - INTERVAL '6 days',
    NOW() - INTERVAL '6 days'
);

-- Verificar que se insertaron correctamente
SELECT title, category, published, featured, created_at 
FROM public.articles 
ORDER BY created_at DESC; 