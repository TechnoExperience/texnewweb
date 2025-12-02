-- =============================================
-- COMPLETAR SISTEMA DE ROLES - RLS PARA EDITORES
-- =============================================
-- Asegurar que los editores solo pueden ver/editar su propio contenido

-- =============================================
-- 1) ACTUALIZAR POLÍTICAS SELECT PARA EDITORES
-- =============================================

-- News: Editores solo ven su propio contenido, admins ven todo
DROP POLICY IF EXISTS "News are viewable by everyone" ON news;
DROP POLICY IF EXISTS "Editors can view own news, admins can view all" ON news;

CREATE POLICY "Public can view published news, editors see own, admins see all"
  ON news FOR SELECT
  USING (
    status = 'PUBLISHED' OR
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

-- Events: Similar a news
DROP POLICY IF EXISTS "Events are viewable by everyone" ON events;
DROP POLICY IF EXISTS "Editors can view own events, admins can view all" ON events;

CREATE POLICY "Public can view published events, editors see own, admins see all"
  ON events FOR SELECT
  USING (
    status = 'PUBLISHED' OR
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

-- DJ Releases: Similar
DROP POLICY IF EXISTS "Releases are viewable by everyone" ON dj_releases;
DROP POLICY IF EXISTS "Editors can view own releases, admins can view all" ON dj_releases;

CREATE POLICY "Public can view published releases, editors see own, admins see all"
  ON dj_releases FOR SELECT
  USING (
    status = 'PUBLISHED' OR
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

-- Videos: Similar
DROP POLICY IF EXISTS "Videos are viewable by everyone" ON videos;
DROP POLICY IF EXISTS "Editors can view own videos, admins can view all" ON videos;

CREATE POLICY "Public can view published videos, editors see own, admins see all"
  ON videos FOR SELECT
  USING (
    status = 'PUBLISHED' OR
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

-- Reviews: Similar
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON reviews;
DROP POLICY IF EXISTS "Editors can view own reviews, admins can view all" ON reviews;

CREATE POLICY "Public can view published reviews, editors see own, admins see all"
  ON reviews FOR SELECT
  USING (
    status = 'PUBLISHED' OR
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
-- 2) ACTUALIZAR POLÍTICAS DELETE PARA EDITORES
-- =============================================

-- News: Editores solo pueden eliminar su propio contenido
DROP POLICY IF EXISTS "Only admins can delete news" ON news;

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

-- Events: Similar
DROP POLICY IF EXISTS "Only admins can delete events" ON events;

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

-- DJ Releases: Similar
DROP POLICY IF EXISTS "Only admins can delete releases" ON dj_releases;

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

-- Videos: Similar
DROP POLICY IF EXISTS "Only admins can delete videos" ON videos;

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

-- Reviews: Similar
DROP POLICY IF EXISTS "Only admins can delete reviews" ON reviews;

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

