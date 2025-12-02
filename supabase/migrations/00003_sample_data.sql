-- =============================================
-- DATOS DE EJEMPLO PARA TECHNO EXPERIENCE
-- =============================================

-- Limpiar datos existentes (opcional)
-- TRUNCATE TABLE news, events, dj_releases, videos CASCADE;

-- =============================================
-- NOTICIAS
-- =============================================
INSERT INTO news (title, slug, excerpt, content, author, category, image_url, language, featured) VALUES
(
  'Amelie Lens anuncia su residencia en Tomorrowland 2025',
  'amelie-lens-tomorrowland-2025',
  'La DJ belga regresa a uno de los festivales más importantes del mundo con una residencia exclusiva',
  '<p>La reconocida DJ y productora belga Amelie Lens ha confirmado su residencia en Tomorrowland 2025, uno de los festivales de música electrónica más importantes del mundo.</p><p>Esta será su tercera aparición consecutiva en el festival, consolidándose como una de las artistas más importantes de la escena techno actual.</p>',
  'Redacción Techno Experience',
  'Festivales',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800',
  'es',
  true
),
(
  'Drumcode celebra 25 años con compilación especial',
  'drumcode-25-aniversario',
  'El sello de Adam Beyer lanza una compilación épica para celebrar un cuarto de siglo de música techno',
  '<p>Drumcode, el icónico sello fundado por Adam Beyer, celebra su 25 aniversario con una compilación especial que reúne a los mejores artistas de su roster.</p><p>La colección incluye tracks inéditos y remezclas exclusivas de artistas como Amelie Lens, Bart Skils, Enrico Sangiuliano y más.</p>',
  'Carlos Martínez',
  'Industria',
  'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=800',
  'es',
  false
),
(
  'Berghain reabre sus puertas tras renovación',
  'berghain-reapertura-2025',
  'El club más famoso de Berlín presenta mejoras en su sistema de sonido y nuevas áreas',
  '<p>Después de tres meses de trabajos de renovación, Berghain reabre sus puertas con un sistema de sonido completamente renovado y nuevas áreas para los asistentes.</p><p>La legendaria sala mantendrá su esencia, pero con mejoras técnicas que prometen llevar la experiencia sonora a otro nivel.</p>',
  'Ana García',
  'Clubs',
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800',
  'es',
  false
),
(
  'Time Warp anuncia lineup para Mannheim 2025',
  'time-warp-lineup-2025',
  'El festival alemán revela su cartel con más de 40 artistas internacionales',
  '<p>Time Warp ha anunciado oficialmente el lineup completo para su edición 2025 en Mannheim, Alemania. El festival contará con más de 40 artistas de la escena techno internacional.</p><p>Entre los nombres destacados se encuentran Adam Beyer, Charlotte de Witte, Carl Cox, Nina Kraviz y muchos más.</p>',
  'Redacción TE',
  'Festivales',
  'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800',
  'es',
  true
),
(
  'Nuevo EP de Enrico Sangiuliano en Drumcode',
  'enrico-sangiuliano-nuevo-ep',
  'El productor italiano presenta "Moon Rocks", su trabajo más experimental hasta la fecha',
  '<p>Enrico Sangiuliano lanza "Moon Rocks", un EP de tres tracks que explora territorios más experimentales dentro del techno contemporáneo.</p><p>El EP ya está disponible en Beatport y promete ser uno de los lanzamientos más importantes del año en Drumcode.</p>',
  'María López',
  'Lanzamientos',
  'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800',
  'es',
  false
);

-- =============================================
-- EVENTOS
-- =============================================
INSERT INTO events (title, slug, description, event_date, venue, city, country, image_url, event_type, lineup, featured, language) VALUES
(
  'Drumcode Night: Adam Beyer & Amelie Lens',
  'drumcode-night-madrid',
  'Una noche épica con los dos mejores exponentes del techno moderno en un showcase exclusivo de Drumcode',
  '2025-12-20 23:00:00+00',
  'Fabrik',
  'Madrid',
  'España',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
  'dj',
  ARRAY['Adam Beyer', 'Amelie Lens', 'Sam Paganini', 'Bart Skils'],
  true,
  'es'
),
(
  'Sonar Festival 2025',
  'sonar-barcelona-2025',
  'El festival de música avanzada y arte multimedia regresa a Barcelona con su edición más ambiciosa',
  '2025-06-15 18:00:00+00',
  'Fira Montjuïc',
  'Barcelona',
  'España',
  'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800',
  'promoter_festival',
  ARRAY['Carl Cox', 'Nina Kraviz', 'Charlotte de Witte', 'Richie Hawtin'],
  true,
  'es'
),
(
  'Afterlife presenta: Tale Of Us',
  'afterlife-tale-of-us',
  'El icónico dúo italiano presenta su proyecto Afterlife en una noche inolvidable',
  '2025-11-30 23:00:00+00',
  'Razzmatazz',
  'Barcelona',
  'España',
  'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800',
  'record_label',
  ARRAY['Tale Of Us', 'Adriatique', 'Anyma', 'Massano'],
  false,
  'es'
),
(
  'Awakenings ADE 2025',
  'awakenings-ade-amsterdam',
  'El festival más grande durante Amsterdam Dance Event con 5 escenarios y 80 artistas',
  '2025-10-18 22:00:00+00',
  'Gashouder',
  'Amsterdam',
  'Países Bajos',
  'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800',
  'promoter_festival',
  ARRAY['Adam Beyer', 'Amelie Lens', 'Charlotte de Witte', 'Enrico Sangiuliano'],
  true,
  'es'
),
(
  'Monegros Desert Festival',
  'monegros-desert-festival',
  'El festival de techno al aire libre más importante de España vuelve al desierto',
  '2025-07-26 16:00:00+00',
  'Desierto de Monegros',
  'Fraga',
  'España',
  'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800',
  'promoter_festival',
  ARRAY['Carl Cox', 'Adam Beyer', 'Nina Kraviz', 'Chris Liebing'],
  false,
  'es'
),
(
  'Exhale Night at Bassiani',
  'exhale-bassiani-tbilisi',
  'Noche especial del sello italiano Exhale en el legendario club georgiano',
  '2025-09-14 23:00:00+00',
  'Bassiani',
  'Tbilisi',
  'Georgia',
  'https://images.unsplash.com/photo-1571266028243-d220c8b8ccb8?w=800',
  'club',
  ARRAY['Dax J', 'Kobosil', 'Rebekah', 'SNTS'],
  false,
  'es'
);

-- =============================================
-- LANZAMIENTOS
-- =============================================
INSERT INTO dj_releases (title, artist, label, release_date, cover_art, genre, techno_style, release_type, tracklist, language, featured) VALUES
(
  'Moon Rocks EP',
  'Enrico Sangiuliano',
  'Drumcode',
  '2025-03-15',
  'https://images.unsplash.com/photo-1614149162883-504ce4d13909?w=800',
  ARRAY['Techno', 'Peak Time'],
  'Peak Time Techno',
  'ep',
  ARRAY['Moon Rocks', 'Asteroid', 'Cosmic Dust'],
  'es',
  true
),
(
  'Rave',
  'Amelie Lens',
  'LROD',
  '2025-02-20',
  'https://images.unsplash.com/photo-1619983081563-430f63602796?w=800',
  ARRAY['Techno', 'Hard Techno'],
  'Hard Techno',
  'single',
  ARRAY['Rave'],
  'es',
  true
),
(
  'Drumcode A-Sides Vol. 10',
  'Various Artists',
  'Drumcode',
  '2025-01-10',
  'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=800',
  ARRAY['Techno', 'Peak Time'],
  'Peak Time Techno',
  'compilation',
  ARRAY['Track 1', 'Track 2', 'Track 3', 'Track 4', 'Track 5'],
  'es',
  false
),
(
  'Intergalactic',
  'Charlotte de Witte',
  'KNTXT',
  '2025-04-01',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
  ARRAY['Techno', 'Melodic Techno'],
  'Melodic Techno',
  'single',
  ARRAY['Intergalactic'],
  'es',
  true
),
(
  'Time Warp Compilation 2025',
  'Various Artists',
  'Time Warp',
  '2025-03-01',
  'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800',
  ARRAY['Techno', 'Various'],
  'Various',
  'compilation',
  ARRAY['Track 1', 'Track 2', 'Track 3', 'Track 4', 'Track 5', 'Track 6'],
  'es',
  false
);

-- =============================================
-- VIDEOS
-- =============================================
INSERT INTO videos (title, description, youtube_url, thumbnail_url, artist, category, duration, language, featured, video_type, event_name) VALUES
(
  'Adam Beyer @ Drumcode Festival 2024',
  'Set completo de Adam Beyer en el Drumcode Festival, mostrando los mejores tracks del sello',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800',
  'Adam Beyer',
  'dj_set',
  7200,
  'es',
  true,
  'live_set',
  'Drumcode Festival 2024'
),
(
  'Amelie Lens - Tomorrowland 2024',
  'La DJ belga destroza el mainstage de Tomorrowland con un set inolvidable',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
  'Amelie Lens',
  'dj_set',
  5400,
  'es',
  true,
  'live_set',
  'Tomorrowland 2024'
),
(
  'Awakenings Festival 2024 - Aftermovie',
  'El aftermovie oficial del festival más grande de techno en Holanda',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800',
  'Various Artists',
  'short_video',
  180,
  'es',
  false,
  'aftermovie',
  'Awakenings Festival 2024'
),
(
  'Charlotte de Witte - KNTXT Showcase',
  'Set exclusivo de Charlotte de Witte para su sello KNTXT',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800',
  'Charlotte de Witte',
  'dj_set',
  3600,
  'es',
  true,
  'dj_mix',
  'KNTXT Showcase'
),
(
  'Carl Cox - Space Ibiza Closing',
  'El legendario Carl Cox cierra la temporada en Space con un set histórico',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800',
  'Carl Cox',
  'dj_set',
  10800,
  'es',
  false,
  'live_set',
  'Space Ibiza Closing'
);
