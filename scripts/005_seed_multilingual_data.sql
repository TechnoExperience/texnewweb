-- Clear existing data (optional, remove if you want to keep current data)
truncate public.news, public.events, public.dj_releases, public.videos restart identity cascade;

-- Insert sample news articles in multiple languages
insert into public.news (title, slug, excerpt, content, cover_image, category, published, published_at, language, featured) values
-- Spanish
('La Revolución del Techno Underground en Berlín', 'revolucion-techno-berlin-es', 'Exploramos la escena underground que está definiendo el sonido del techno moderno', 'El techno underground de Berlín continúa siendo el epicentro de la innovación musical...', '/placeholder.svg?height=800&width=1200', 'feature', true, now() - interval '2 days', 'es', true),
('Entrevista Exclusiva: Amelie Lens Habla Sobre Su Nuevo Sello', 'amelie-lens-entrevista-es', 'La DJ belga comparte sus visiones sobre LENSKE y el futuro del techno', 'Amelie Lens se ha convertido en una de las figuras más influyentes del techno actual...', '/placeholder.svg?height=800&width=1200', 'interview', true, now() - interval '5 days', 'es', false),
-- English
('The Underground Techno Revolution in Berlin', 'underground-techno-revolution-berlin-en', 'Exploring the underground scene defining modern techno sound', 'Berlin''s underground techno continues to be the epicenter of musical innovation...', '/placeholder.svg?height=800&width=1200', 'feature', true, now() - interval '2 days', 'en', true),
('Exclusive Interview: Amelie Lens Talks About Her New Label', 'amelie-lens-interview-en', 'The Belgian DJ shares her visions about LENSKE and the future of techno', 'Amelie Lens has become one of the most influential figures in current techno...', '/placeholder.svg?height=800&width=1200', 'interview', true, now() - interval '5 days', 'en', false),
-- German
('Die Underground-Techno-Revolution in Berlin', 'underground-techno-revolution-berlin-de', 'Erkundung der Underground-Szene, die den modernen Techno-Sound definiert', 'Berlins Underground-Techno bleibt das Epizentrum musikalischer Innovation...', '/placeholder.svg?height=800&width=1200', 'feature', true, now() - interval '2 days', 'de', true),
-- Italian
('La Rivoluzione Techno Underground a Berlino', 'rivoluzione-techno-underground-berlino-it', 'Esplorando la scena underground che definisce il suono techno moderno', 'La techno underground di Berlino continua ad essere l''epicentro dell''innovazione musicale...', '/placeholder.svg?height=800&width=1200', 'feature', true, now() - interval '2 days', 'it', true);

-- Insert sample events in multiple languages
insert into public.events (title, slug, description, venue, city, country, event_date, cover_image, lineup, status, language, featured) values
-- Spanish
('Awakenings Festival 2025', 'awakenings-festival-2025-es', 'El festival de techno más grande de Europa regresa', 'Spaarnwoude', 'Amsterdam', 'Netherlands', now() + interval '60 days', '/placeholder.svg?height=800&width=1200', '["Adam Beyer", "Nina Kraviz", "Charlotte de Witte", "Amelie Lens"]'::jsonb, 'upcoming', 'es', true),
('Berghain Nacht', 'berghain-nacht-es', 'Una noche épica en el templo del techno', 'Berghain', 'Berlin', 'Germany', now() + interval '7 days', '/placeholder.svg?height=800&width=1200', '["Marcel Dettmann", "Ben Klock", "DVS1"]'::jsonb, 'upcoming', 'es', false),
-- English
('Awakenings Festival 2025', 'awakenings-festival-2025-en', 'Europe''s biggest techno festival returns', 'Spaarnwoude', 'Amsterdam', 'Netherlands', now() + interval '60 days', '/placeholder.svg?height=800&width=1200', '["Adam Beyer", "Nina Kraviz", "Charlotte de Witte", "Amelie Lens"]'::jsonb, 'upcoming', 'en', true),
-- German
('Awakenings Festival 2025', 'awakenings-festival-2025-de', 'Europas größtes Techno-Festival kehrt zurück', 'Spaarnwoude', 'Amsterdam', 'Netherlands', now() + interval '60 days', '/placeholder.svg?height=800&width=1200', '["Adam Beyer", "Nina Kraviz", "Charlotte de Witte", "Amelie Lens"]'::jsonb, 'upcoming', 'de', true);

-- Insert sample DJ releases with techno styles
insert into public.dj_releases (title, artist, label, release_date, cover_art, description, tracklist, genre, techno_style, language, featured) values
-- Acid Techno
('Acid Transmission', 'Amelie Lens', 'LENSKE', current_date - interval '10 days', '/placeholder.svg?height=600&width=600', 'EP de acid techno hipnótico y enérgico', '["Transmission", "Acid Dreams", "303 Flow"]'::jsonb, array['Techno', 'Acid'], 'acid_techno', 'es', true),
-- Hard Techno
('Raw Power', 'Charlotte de Witte', 'KNTXT', current_date - interval '15 days', '/placeholder.svg?height=600&width=600', 'Puro hard techno industrial', '["Power", "Raw Force", "Dark Matter"]'::jsonb, array['Techno', 'Hard Techno'], 'hard_techno', 'es', true),
-- Melodic Techno
('Ethereal Waves', 'Tale Of Us', 'Afterlife', current_date - interval '20 days', '/placeholder.svg?height=600&width=600', 'Techno melódico y atmosférico', '["Ethereal", "Waves", "Journey"]'::jsonb, array['Melodic Techno'], 'melodic_techno', 'es', false),
-- Minimal Techno
('Reduced Forms', 'Richie Hawtin', 'M_nus', current_date - interval '25 days', '/placeholder.svg?height=600&width=600', 'Minimal techno hipnótico', '["Form", "Structure", "Minimal"]'::jsonb, array['Minimal Techno'], 'minimal_techno', 'en', false),
-- Industrial Techno
('Factory Sounds', 'Rebekah', 'Soma', current_date - interval '30 days', '/placeholder.svg?height=600&width=600', 'Industrial techno oscuro', '["Factory", "Machine", "Industrial"]'::jsonb, array['Industrial Techno'], 'industrial_techno', 'en', false);

-- Insert sample videos (DJ Sets and Short Videos)
insert into public.videos (title, description, youtube_url, thumbnail_url, artist, event_name, video_date, duration, category, language, featured) values
-- DJ Sets
('Adam Beyer @ Drumcode Halloween 2024', 'Set completo de 2 horas de techno puro', 'https://youtube.com/watch?v=example1', '/placeholder.svg?height=480&width=854', 'Adam Beyer', 'Drumcode Halloween', current_date - interval '30 days', 7200, 'dj_set', 'es', true),
('Nina Kraviz @ Awakenings 2024', 'Set épico de techno y acid', 'https://youtube.com/watch?v=example2', '/placeholder.svg?height=480&width=854', 'Nina Kraviz', 'Awakenings Festival', current_date - interval '45 days', 5400, 'dj_set', 'es', true),
('Amelie Lens @ Tomorrowland 2024', 'Hard techno en el main stage', 'https://youtube.com/watch?v=example3', '/placeholder.svg?height=480&width=854', 'Amelie Lens', 'Tomorrowland', current_date - interval '60 days', 3600, 'dj_set', 'en', false),
-- Short Videos
('Cómo Hacer Acid Techno - Tutorial', 'Tutorial rápido de producción de acid techno', 'https://youtube.com/watch?v=example4', '/placeholder.svg?height=480&width=854', 'Various Artists', 'Production Tutorial', current_date - interval '15 days', 600, 'short_video', 'es', false),
('Behind The Scenes: Berghain', 'Documental corto sobre el club más famoso', 'https://youtube.com/watch?v=example5', '/placeholder.svg?height=480&width=854', 'Documentary', 'Berghain Documentary', current_date - interval '20 days', 900, 'short_video', 'en', true),
('Die Geschichte von Detroit Techno', 'Breve historia del techno de Detroit', 'https://youtube.com/watch?v=example6', '/placeholder.svg?height=480&width=854', 'Documentary', 'Techno History', current_date - interval '25 days', 1200, 'short_video', 'de', false);
