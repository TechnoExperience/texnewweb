-- =============================================
-- SCRIPT COMBINADO PARA EJECUTAR TODAS LAS MIGRACIONES
-- =============================================
-- Ejecuta este script completo en Supabase SQL Editor
-- O ejecuta cada sección por separado si prefieres

-- =============================================
-- MIGRACIÓN 1: SISTEMA DE COMENTARIOS
-- =============================================

CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('news', 'event', 'video', 'release', 'review')),
  resource_id UUID NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT true,
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_comments_resource ON comments(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view approved comments" ON comments;
CREATE POLICY "Public can view approved comments"
ON comments FOR SELECT
USING (is_approved = true OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can create comments" ON comments;
CREATE POLICY "Authenticated users can create comments"
ON comments FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own comments" ON comments;
CREATE POLICY "Users can update own comments"
ON comments FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own comments, admins can delete any" ON comments;
CREATE POLICY "Users can delete own comments, admins can delete any"
ON comments FOR DELETE
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'editor')
  )
);

CREATE OR REPLACE FUNCTION update_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  IF OLD.content != NEW.content THEN
    NEW.is_edited = true;
    NEW.edited_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_comments_updated_at();

CREATE OR REPLACE FUNCTION get_comment_count(
  p_resource_type TEXT,
  p_resource_id UUID
)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM comments
    WHERE resource_type = p_resource_type
      AND resource_id = p_resource_id
      AND is_approved = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- MIGRACIÓN 2: SISTEMA DE FAVORITOS
-- =============================================

CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('product', 'event', 'release', 'video', 'news')),
  resource_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, resource_type, resource_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_resource ON favorites(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON favorites(created_at DESC);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own favorites" ON favorites;
CREATE POLICY "Users can view own favorites"
ON favorites FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own favorites" ON favorites;
CREATE POLICY "Users can create own favorites"
ON favorites FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own favorites" ON favorites;
CREATE POLICY "Users can delete own favorites"
ON favorites FOR DELETE
USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION is_favorite(
  p_user_id UUID,
  p_resource_type TEXT,
  p_resource_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM favorites
    WHERE user_id = p_user_id
      AND resource_type = p_resource_type
      AND resource_id = p_resource_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- MIGRACIÓN 3: COMPLETAR SISTEMA DE ROLES RLS
-- =============================================
-- NOTA: Requiere que 00027_editor_role_and_verification.sql esté ejecutada

-- News: Actualizar políticas SELECT
DROP POLICY IF EXISTS "News are viewable by everyone" ON news;
DROP POLICY IF EXISTS "Editors can view own news, admins can view all" ON news;
DROP POLICY IF EXISTS "Public can view published news, editors see own, admins see all" ON news;

CREATE POLICY "Public can view published news, editors see own, admins see all"
  ON news FOR SELECT
  USING (
    status = 'PUBLISHED' OR
    status IS NULL OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (
        profiles.role = 'admin'
        OR
        (profiles.role = 'editor' AND news.created_by = auth.uid())
      )
    )
  );

-- Events: Actualizar políticas SELECT
DROP POLICY IF EXISTS "Events are viewable by everyone" ON events;
DROP POLICY IF EXISTS "Editors can view own events, admins can view all" ON events;
DROP POLICY IF EXISTS "Public can view published events, editors see own, admins see all" ON events;

CREATE POLICY "Public can view published events, editors see own, admins see all"
  ON events FOR SELECT
  USING (
    status = 'PUBLISHED' OR
    status IS NULL OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (
        profiles.role = 'admin'
        OR
        (profiles.role = 'editor' AND events.created_by = auth.uid())
      )
    )
  );

-- DJ Releases: Actualizar políticas SELECT
DROP POLICY IF EXISTS "Releases are viewable by everyone" ON dj_releases;
DROP POLICY IF EXISTS "Editors can view own releases, admins can view all" ON dj_releases;
DROP POLICY IF EXISTS "Public can view published releases, editors see own, admins see all" ON dj_releases;

CREATE POLICY "Public can view published releases, editors see own, admins see all"
  ON dj_releases FOR SELECT
  USING (
    status = 'PUBLISHED' OR
    status IS NULL OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (
        profiles.role = 'admin'
        OR
        (profiles.role = 'editor' AND dj_releases.created_by = auth.uid())
      )
    )
  );

-- Videos: Actualizar políticas SELECT
DROP POLICY IF EXISTS "Videos are viewable by everyone" ON videos;
DROP POLICY IF EXISTS "Editors can view own videos, admins can view all" ON videos;
DROP POLICY IF EXISTS "Public can view published videos, editors see own, admins see all" ON videos;

CREATE POLICY "Public can view published videos, editors see own, admins see all"
  ON videos FOR SELECT
  USING (
    status = 'PUBLISHED' OR
    status IS NULL OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (
        profiles.role = 'admin'
        OR
        (profiles.role = 'editor' AND videos.created_by = auth.uid())
      )
    )
  );

-- Reviews: Actualizar políticas SELECT
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON reviews;
DROP POLICY IF EXISTS "Editors can view own reviews, admins can view all" ON reviews;
DROP POLICY IF EXISTS "Public can view published reviews, editors see own, admins see all" ON reviews;

CREATE POLICY "Public can view published reviews, editors see own, admins see all"
  ON reviews FOR SELECT
  USING (
    status = 'PUBLISHED' OR
    status IS NULL OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (
        profiles.role = 'admin'
        OR
        (profiles.role = 'editor' AND reviews.created_by = auth.uid())
      )
    )
  );

-- News: Actualizar políticas DELETE
DROP POLICY IF EXISTS "Only admins can delete news" ON news;
DROP POLICY IF EXISTS "Editors can delete own news, admins can delete all" ON news;

CREATE POLICY "Editors can delete own news, admins can delete all"
  ON news FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (
        profiles.role = 'admin'
        OR
        (profiles.role = 'editor' AND news.created_by = auth.uid())
      )
    )
  );

-- Events: Actualizar políticas DELETE
DROP POLICY IF EXISTS "Only admins can delete events" ON events;
DROP POLICY IF EXISTS "Editors can delete own events, admins can delete all" ON events;

CREATE POLICY "Editors can delete own events, admins can delete all"
  ON events FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (
        profiles.role = 'admin'
        OR
        (profiles.role = 'editor' AND events.created_by = auth.uid())
      )
    )
  );

-- DJ Releases: Actualizar políticas DELETE
DROP POLICY IF EXISTS "Only admins can delete releases" ON dj_releases;
DROP POLICY IF EXISTS "Editors can delete own releases, admins can delete all" ON dj_releases;

CREATE POLICY "Editors can delete own releases, admins can delete all"
  ON dj_releases FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (
        profiles.role = 'admin'
        OR
        (profiles.role = 'editor' AND dj_releases.created_by = auth.uid())
      )
    )
  );

-- Videos: Actualizar políticas DELETE
DROP POLICY IF EXISTS "Only admins can delete videos" ON videos;
DROP POLICY IF EXISTS "Editors can delete own videos, admins can delete all" ON videos;

CREATE POLICY "Editors can delete own videos, admins can delete all"
  ON videos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (
        profiles.role = 'admin'
        OR
        (profiles.role = 'editor' AND videos.created_by = auth.uid())
      )
    )
  );

-- Reviews: Actualizar políticas DELETE
DROP POLICY IF EXISTS "Only admins can delete reviews" ON reviews;
DROP POLICY IF EXISTS "Editors can delete own reviews, admins can delete all" ON reviews;

CREATE POLICY "Editors can delete own reviews, admins can delete all"
  ON reviews FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (
        profiles.role = 'admin'
        OR
        (profiles.role = 'editor' AND reviews.created_by = auth.uid())
      )
    )
  );

-- =============================================
-- FIN DE LAS MIGRACIONES
-- =============================================
-- Verifica que no haya errores en la ejecución
-- Si todo está correcto, las tablas y políticas estarán creadas

