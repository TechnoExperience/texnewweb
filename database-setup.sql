-- ============================================
-- SETUP COMPLETO DE BASE DE DATOS - TECHNO EXPERIENCE
-- ============================================
-- Ejecuta este script en el SQL Editor de Supabase
-- ============================================

-- 1. CREAR TABLAS PRINCIPALES
-- ============================================

-- Tabla: events
CREATE TABLE IF NOT EXISTS public.events (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TIME,
  location TEXT,
  image_url TEXT,
  price DECIMAL(10,2),
  capacity INTEGER,
  genre TEXT,
  featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'published',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla: articles  
CREATE TABLE IF NOT EXISTS public.articles (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  excerpt TEXT,
  image_url TEXT,
  category TEXT,
  tags TEXT[],
  published BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  slug TEXT UNIQUE,
  reading_time INTEGER,
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE
);

-- Tabla: artists
CREATE TABLE IF NOT EXISTS public.artists (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  bio TEXT,
  genre TEXT,
  country TEXT,
  city TEXT,
  image TEXT,
  social_links JSONB,
  featured BOOLEAN DEFAULT false,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla: venues
CREATE TABLE IF NOT EXISTS public.venues (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  country TEXT DEFAULT 'España',
  capacity INTEGER,
  description TEXT,
  image TEXT,
  website TEXT,
  phone TEXT,
  email TEXT,
  featured BOOLEAN DEFAULT false,
  venue_type TEXT DEFAULT 'club',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla: music_tracks
CREATE TABLE IF NOT EXISTS public.music_tracks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  artist_id INTEGER REFERENCES public.artists(id),
  album TEXT,
  genre TEXT,
  duration INTEGER,
  file_url TEXT,
  cover_image_url TEXT,
  release_date DATE,
  bpm INTEGER,
  key TEXT,
  description TEXT,
  tags TEXT[],
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  play_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla: user_profiles (CRÍTICA para autenticación)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  username TEXT UNIQUE,
  full_name TEXT,
  email TEXT,
  bio TEXT,
  website TEXT,
  location TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  subscription_status TEXT DEFAULT 'free',
  blocked_until TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- 2. CONFIGURAR ROW LEVEL SECURITY (RLS)
-- ============================================

-- RLS para events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Events are viewable by everyone" ON public.events;
CREATE POLICY "Events are viewable by everyone" ON public.events FOR SELECT USING (true);
DROP POLICY IF EXISTS "Events are manageable by admins" ON public.events;
CREATE POLICY "Events are manageable by admins" ON public.events FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_profiles.id = auth.uid() 
    AND user_profiles.role IN ('admin', 'editor')
  )
);

-- RLS para articles
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Articles are viewable by everyone" ON public.articles;
CREATE POLICY "Articles are viewable by everyone" ON public.articles FOR SELECT USING (published = true);
DROP POLICY IF EXISTS "Articles are manageable by admins" ON public.articles;
CREATE POLICY "Articles are manageable by admins" ON public.articles FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_profiles.id = auth.uid() 
    AND user_profiles.role IN ('admin', 'editor', 'redactor')
  )
);

-- RLS para artists
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Artists are viewable by everyone" ON public.artists;
CREATE POLICY "Artists are viewable by everyone" ON public.artists FOR SELECT USING (true);
DROP POLICY IF EXISTS "Artists are manageable by admins" ON public.artists;
CREATE POLICY "Artists are manageable by admins" ON public.artists FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_profiles.id = auth.uid() 
    AND user_profiles.role IN ('admin', 'editor')
  )
);

-- RLS para venues
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Venues are viewable by everyone" ON public.venues;
CREATE POLICY "Venues are viewable by everyone" ON public.venues FOR SELECT USING (true);
DROP POLICY IF EXISTS "Venues are manageable by admins" ON public.venues;
CREATE POLICY "Venues are manageable by admins" ON public.venues FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_profiles.id = auth.uid() 
    AND user_profiles.role IN ('admin', 'editor')
  )
);

-- RLS para music_tracks
ALTER TABLE public.music_tracks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Music tracks are viewable by everyone" ON public.music_tracks;
CREATE POLICY "Music tracks are viewable by everyone" ON public.music_tracks FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "Music tracks are manageable by admins" ON public.music_tracks;
CREATE POLICY "Music tracks are manageable by admins" ON public.music_tracks FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_profiles.id = auth.uid() 
    AND user_profiles.role IN ('admin', 'editor')
  )
);

-- RLS para user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "User profiles are viewable by owner" ON public.user_profiles;
CREATE POLICY "User profiles are viewable by owner" ON public.user_profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "User profiles are manageable by admins" ON public.user_profiles;
CREATE POLICY "User profiles are manageable by admins" ON public.user_profiles FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_profiles.id = auth.uid() 
    AND user_profiles.role = 'admin'
  )
);

-- ============================================
-- 3. FUNCIÓN PARA HACER ADMIN A UN USUARIO
-- ============================================

CREATE OR REPLACE FUNCTION make_user_admin(user_email text)
RETURNS void AS $$
DECLARE
  user_uuid uuid;
BEGIN
  -- Buscar el UUID del usuario por email
  SELECT id INTO user_uuid 
  FROM auth.users 
  WHERE email = user_email;
  
  IF user_uuid IS NULL THEN
    RAISE EXCEPTION 'Usuario con email % no encontrado', user_email;
  END IF;
  
  -- Crear o actualizar el perfil como admin
  INSERT INTO public.user_profiles (
    id, 
    user_id, 
    username, 
    email, 
    role,
    is_active
  ) VALUES (
    user_uuid,
    user_uuid,
    split_part(user_email, '@', 1),
    user_email,
    'admin',
    true
  )
  ON CONFLICT (id) 
  DO UPDATE SET 
    role = 'admin',
    is_active = true,
    updated_at = now();
    
  RAISE NOTICE 'Usuario % es ahora administrador', user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. DATOS DE MUESTRA
-- ============================================

-- Insertar eventos de muestra
INSERT INTO public.events (title, description, date, time, location, image_url, price, capacity, genre, featured, status) VALUES
('Techno Night Madrid', 'Una noche épica de techno en el corazón de Madrid con los mejores DJs internacionales', '2024-02-15', '23:00', 'Club Industrial, Madrid', 'https://images.unsplash.com/photo-1571266028243-d220c9dce6ac?w=800', 25.00, 500, 'Techno', true, 'published'),
('Underground Barcelona', 'Sesión underground en los túneles históricos de Barcelona', '2024-02-22', '22:30', 'Sotterrani, Barcelona', 'https://images.unsplash.com/photo-1551213692-3d8f4e23b7a3?w=800', 30.00, 300, 'Underground', true, 'published'),
('Minimal Valencia', 'Experiencia minimal con artistas locales e internacionales', '2024-03-01', '23:30', 'La3 Club, Valencia', 'https://images.unsplash.com/photo-1594736797933-d0f59aafcda7?w=800', 20.00, 400, 'Minimal', false, 'published')
ON CONFLICT DO NOTHING;

-- Insertar artistas de muestra
INSERT INTO public.artists (name, bio, genre, country, city, image, social_links, featured, verified) VALUES
('DJ Martinez', 'Pionero del techno español con más de 15 años de experiencia', 'Techno', 'España', 'Madrid', 'https://images.unsplash.com/photo-1571266028243-d220c9dce6ac?w=400', '{"instagram": "@djmartinez", "soundcloud": "djmartinez"}', true, true),
('Luna Electric', 'Artista emergente especializada en minimal y progressive', 'Minimal', 'España', 'Barcelona', 'https://images.unsplash.com/photo-1551213692-3d8f4e23b7a3?w=400', '{"instagram": "@lunaelectric", "spotify": "lunaelectric"}', false, false),
('Bass Underground', 'Colectivo de productores underground de Valencia', 'Underground', 'España', 'Valencia', 'https://images.unsplash.com/photo-1594736797933-d0f59aafcda7?w=400', '{"facebook": "bassunderground", "soundcloud": "bassunderground"}', true, true)
ON CONFLICT DO NOTHING;

-- Insertar artículos de muestra
INSERT INTO public.articles (title, content, excerpt, image_url, category, tags, published, featured, slug, reading_time, views_count, likes_count, published_at) VALUES
('El Futuro del Techno en España', 'El techno español está viviendo un momento dorado. Con festivales como Sonar y artistas emergentes...', 'Análisis del panorama actual del techno español y sus tendencias futuras', 'https://images.unsplash.com/photo-1571266028243-d220c9dce6ac?w=800', 'Análisis', ARRAY['techno', 'españa', 'música'], true, true, 'futuro-techno-espana', 5, 1250, 89, now()),
('Guía de Clubes Underground', 'Los mejores espacios underground de Madrid y Barcelona para vivir la música electrónica...', 'Descubre los clubes más auténticos de la escena underground española', 'https://images.unsplash.com/photo-1551213692-3d8f4e23b7a3?w=800', 'Guías', ARRAY['underground', 'clubes', 'madrid', 'barcelona'], true, false, 'guia-clubes-underground', 7, 890, 45, now()),
('Producción Musical: Tips para Principiantes', 'Comenzar en la producción de música electrónica puede parecer abrumador...', 'Consejos esenciales para dar tus primeros pasos en la producción musical', 'https://images.unsplash.com/photo-1594736797933-d0f59aafcda7?w=800', 'Tutoriales', ARRAY['producción', 'tutorial', 'principiantes'], true, true, 'produccion-musical-principiantes', 10, 2100, 156, now())
ON CONFLICT DO NOTHING;

-- ============================================
-- 5. HACER ADMIN AL USUARIO ESPECIFICADO
-- ============================================

-- Ejecutar la función para hacer admin a technoexperiencemagazine@gmail.com
SELECT make_user_admin('technoexperiencemagazine@gmail.com');

-- ============================================
-- SETUP COMPLETADO
-- ============================================
-- Todas las tablas han sido creadas
-- Las políticas RLS están configuradas  
-- Los datos de muestra están insertados
-- El usuario technoexperiencemagazine@gmail.com es admin
-- ============================================ 