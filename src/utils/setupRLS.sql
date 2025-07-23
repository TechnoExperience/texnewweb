-- =====================================================
-- CONFIGURACIÓN COMPLETA DE ROW LEVEL SECURITY (RLS)
-- TECHNO EXPERIENCE - Supabase Database
-- =====================================================

-- PASO 1: Crear tabla de archivos musicales
-- =====================================================

CREATE TABLE IF NOT EXISTS public.music_tracks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE,
    album VARCHAR(255),
    genre VARCHAR(100),
    duration INTEGER, -- duración en segundos
    file_url TEXT NOT NULL, -- URL del archivo de audio en Supabase Storage
    cover_image_url TEXT, -- URL de la portada
    release_date DATE,
    bpm INTEGER, -- beats per minute
    key VARCHAR(10), -- key musical (A, B, C, etc.)
    description TEXT,
    tags TEXT[], -- array de tags
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    play_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índices para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_music_tracks_artist_id ON public.music_tracks(artist_id);
CREATE INDEX IF NOT EXISTS idx_music_tracks_genre ON public.music_tracks(genre);
CREATE INDEX IF NOT EXISTS idx_music_tracks_featured ON public.music_tracks(is_featured);
CREATE INDEX IF NOT EXISTS idx_music_tracks_active ON public.music_tracks(is_active);
CREATE INDEX IF NOT EXISTS idx_music_tracks_bpm ON public.music_tracks(bpm);

-- PASO 2: Habilitar RLS en todas las tablas
-- =====================================================

-- Tablas principales
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_tracks ENABLE ROW LEVEL SECURITY;

-- Tablas de relaciones
ALTER TABLE public.event_artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_reviews ENABLE ROW LEVEL SECURITY;

-- Tablas de mensajería
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- PASO 3: Políticas para MUSIC_TRACKS
-- =====================================================

-- Lectura pública para tracks activos
CREATE POLICY "Public can view active music tracks" ON public.music_tracks
    FOR SELECT USING (is_active = true);

-- Solo admins pueden crear tracks
CREATE POLICY "Admins can insert music tracks" ON public.music_tracks
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Solo admins pueden actualizar tracks
CREATE POLICY "Admins can update music tracks" ON public.music_tracks
    FOR UPDATE USING (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Solo admins pueden eliminar tracks
CREATE POLICY "Admins can delete music tracks" ON public.music_tracks
    FOR DELETE USING (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- PASO 4: Políticas para ARTICLES
-- =====================================================

-- Lectura pública para artículos publicados
CREATE POLICY "Public can view published articles" ON public.articles
    FOR SELECT USING (published = true);

-- Los usuarios autenticados pueden ver todos los artículos
CREATE POLICY "Authenticated users can view all articles" ON public.articles
    FOR SELECT USING (auth.role() = 'authenticated');

-- Solo admins pueden crear artículos
CREATE POLICY "Admins can insert articles" ON public.articles
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Solo admins pueden actualizar artículos
CREATE POLICY "Admins can update articles" ON public.articles
    FOR UPDATE USING (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Solo admins pueden eliminar artículos
CREATE POLICY "Admins can delete articles" ON public.articles
    FOR DELETE USING (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- PASO 5: Políticas para ARTISTS
-- =====================================================

-- Lectura pública para artistas
CREATE POLICY "Public can view artists" ON public.artists
    FOR SELECT USING (true);

-- Solo admins pueden crear artistas
CREATE POLICY "Admins can insert artists" ON public.artists
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Solo admins pueden actualizar artistas
CREATE POLICY "Admins can update artists" ON public.artists
    FOR UPDATE USING (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Solo admins pueden eliminar artistas
CREATE POLICY "Admins can delete artists" ON public.artists
    FOR DELETE USING (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- PASO 6: Políticas para EVENTS
-- =====================================================

-- Lectura pública para eventos
CREATE POLICY "Public can view events" ON public.events
    FOR SELECT USING (true);

-- Solo admins pueden crear eventos
CREATE POLICY "Admins can insert events" ON public.events
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Solo admins pueden actualizar eventos
CREATE POLICY "Admins can update events" ON public.events
    FOR UPDATE USING (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Solo admins pueden eliminar eventos
CREATE POLICY "Admins can delete events" ON public.events
    FOR DELETE USING (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- PASO 7: Políticas para VENUES
-- =====================================================

-- Lectura pública para venues
CREATE POLICY "Public can view venues" ON public.venues
    FOR SELECT USING (true);

-- Solo admins pueden gestionar venues
CREATE POLICY "Admins can manage venues" ON public.venues
    FOR ALL USING (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- PASO 8: Políticas para USER_PROFILES
-- =====================================================

-- Los usuarios pueden ver su propio perfil
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Los admins pueden ver todos los perfiles
CREATE POLICY "Admins can view all profiles" ON public.user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Los usuarios pueden insertar su propio perfil
CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden actualizar su propio perfil (excepto el role)
CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (
        auth.uid() = user_id AND
        (OLD.role = NEW.role OR EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_id = auth.uid() AND role = 'admin'
        ))
    );

-- PASO 9: Políticas para EVENT_ARTISTS
-- =====================================================

-- Lectura pública
CREATE POLICY "Public can view event artists" ON public.event_artists
    FOR SELECT USING (true);

-- Solo admins pueden gestionar relaciones
CREATE POLICY "Admins can manage event artists" ON public.event_artists
    FOR ALL USING (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- PASO 10: Políticas para MEDIA_GALLERY
-- =====================================================

-- Lectura pública
CREATE POLICY "Public can view media" ON public.media_gallery
    FOR SELECT USING (true);

-- Solo admins pueden gestionar media
CREATE POLICY "Admins can manage media" ON public.media_gallery
    FOR ALL USING (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- PASO 11: Políticas para COMMENTS
-- =====================================================

-- Lectura pública para comentarios aprobados
CREATE POLICY "Public can view approved comments" ON public.comments
    FOR SELECT USING (status = 'approved');

-- Los usuarios autenticados pueden crear comentarios
CREATE POLICY "Authenticated users can create comments" ON public.comments
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND
        auth.uid() = user_id
    );

-- Los usuarios pueden editar sus propios comentarios
CREATE POLICY "Users can update own comments" ON public.comments
    FOR UPDATE USING (auth.uid() = user_id);

-- Los admins pueden gestionar todos los comentarios
CREATE POLICY "Admins can manage all comments" ON public.comments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- PASO 12: Políticas para FAVORITES
-- =====================================================

-- Los usuarios pueden ver sus propios favoritos
CREATE POLICY "Users can view own favorites" ON public.favorites
    FOR SELECT USING (auth.uid() = user_id);

-- Los usuarios pueden gestionar sus propios favoritos
CREATE POLICY "Users can manage own favorites" ON public.favorites
    FOR ALL USING (auth.uid() = user_id);

-- PASO 13: Políticas para EVENT_REVIEWS
-- =====================================================

-- Lectura pública para reviews aprobadas
CREATE POLICY "Public can view approved reviews" ON public.event_reviews
    FOR SELECT USING (status = 'approved');

-- Los usuarios autenticados pueden crear reviews
CREATE POLICY "Authenticated users can create reviews" ON public.event_reviews
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND
        auth.uid() = user_id
    );

-- Los usuarios pueden editar sus propias reviews
CREATE POLICY "Users can update own reviews" ON public.event_reviews
    FOR UPDATE USING (auth.uid() = user_id);

-- Los admins pueden gestionar todas las reviews
CREATE POLICY "Admins can manage all reviews" ON public.event_reviews
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- PASO 14: Políticas para CONTACT_MESSAGES
-- =====================================================

-- Solo admins pueden ver mensajes de contacto
CREATE POLICY "Admins can view contact messages" ON public.contact_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Cualquiera puede enviar mensajes de contacto
CREATE POLICY "Anyone can send contact messages" ON public.contact_messages
    FOR INSERT WITH CHECK (true);

-- Solo admins pueden actualizar el estado
CREATE POLICY "Admins can update contact messages" ON public.contact_messages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- PASO 15: Políticas para NEWSLETTER_SUBSCRIPTIONS
-- =====================================================

-- Solo admins pueden ver suscripciones
CREATE POLICY "Admins can view newsletter subscriptions" ON public.newsletter_subscriptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Cualquiera puede suscribirse
CREATE POLICY "Anyone can subscribe to newsletter" ON public.newsletter_subscriptions
    FOR INSERT WITH CHECK (true);

-- Los usuarios pueden actualizar su propia suscripción si proporcionan su email
CREATE POLICY "Users can update own subscription" ON public.newsletter_subscriptions
    FOR UPDATE USING (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_id = auth.uid() AND email = newsletter_subscriptions.email
        )
    );

-- PASO 16: Políticas para STORAGE
-- =====================================================

-- Estas políticas se deben ejecutar por separado en la sección de Storage

-- BUCKET IMAGES - Lectura pública
-- CREATE POLICY "Public read access for images" ON storage.objects
--     FOR SELECT USING (bucket_id = 'images');

-- BUCKET IMAGES - Solo usuarios autenticados pueden gestionar
-- CREATE POLICY "Authenticated users can upload images" ON storage.objects
--     FOR INSERT WITH CHECK (
--         bucket_id = 'images' AND
--         auth.role() = 'authenticated'
--     );

-- CREATE POLICY "Authenticated users can update images" ON storage.objects
--     FOR UPDATE USING (
--         bucket_id = 'images' AND
--         auth.role() = 'authenticated'
--     );

-- CREATE POLICY "Authenticated users can delete images" ON storage.objects
--     FOR DELETE USING (
--         bucket_id = 'images' AND
--         auth.role() = 'authenticated'
--     );

-- BUCKET MUSIC - Lectura pública para archivos de audio
-- CREATE POLICY "Public read access for music" ON storage.objects
--     FOR SELECT USING (bucket_id = 'music');

-- BUCKET MUSIC - Solo admins pueden gestionar archivos musicales
-- CREATE POLICY "Admins can upload music" ON storage.objects
--     FOR INSERT WITH CHECK (
--         bucket_id = 'music' AND
--         auth.role() = 'authenticated' AND
--         EXISTS (
--             SELECT 1 FROM public.user_profiles
--             WHERE user_id = auth.uid() AND role = 'admin'
--         )
--     );

-- CREATE POLICY "Admins can update music" ON storage.objects
--     FOR UPDATE USING (
--         bucket_id = 'music' AND
--         auth.role() = 'authenticated' AND
--         EXISTS (
--             SELECT 1 FROM public.user_profiles
--             WHERE user_id = auth.uid() AND role = 'admin'
--         )
--     );

-- CREATE POLICY "Admins can delete music" ON storage.objects
--     FOR DELETE USING (
--         bucket_id = 'music' AND
--         auth.role() = 'authenticated' AND
--         EXISTS (
--             SELECT 1 FROM public.user_profiles
--             WHERE user_id = auth.uid() AND role = 'admin'
--         )
--     );

-- PASO 17: Función helper para crear un usuario admin
-- =====================================================

CREATE OR REPLACE FUNCTION make_user_admin(user_email text)
RETURNS void AS $$
BEGIN
    UPDATE public.user_profiles
    SET role = 'admin'
    WHERE email = user_email;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Usuario con email % no encontrado', user_email;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- INSTRUCCIONES DE USO:
-- =====================================================

-- 1. Copia y pega este script completo en el SQL Editor de Supabase
-- 2. Ejecuta el script para configurar todas las políticas RLS
-- 3. Ve a Storage > Settings y configura las políticas de storage manualmente
-- 4. Para hacer a un usuario admin, ejecuta:
--    SELECT make_user_admin('tu-email@ejemplo.com');
-- 5. Verifica que todas las políticas estén activas en el Dashboard

-- ¡IMPORTANTE!: Asegúrate de tener al menos un usuario admin antes de aplicar estas políticas 