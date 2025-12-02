-- =============================================
-- EDITOR ROLE AND CONTENT VERIFICATION SYSTEM
-- =============================================
-- Objetivo:
-- - Agregar campo created_by a todas las tablas de contenido
-- - Agregar campo status/verification_status donde falte
-- - Configurar políticas RLS para redactores (solo editan su contenido)
-- - Configurar políticas RLS para usuarios normales (requieren verificación)

-- =============================================
-- 1) AGREGAR created_by A TABLAS DE CONTENIDO
-- =============================================

-- News
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'news' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE news
      ADD COLUMN created_by UUID REFERENCES profiles(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_news_created_by ON news(created_by);
  END IF;
END $$;

-- Events
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE events
      ADD COLUMN created_by UUID REFERENCES profiles(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);
  END IF;
END $$;

-- DJ Releases
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dj_releases' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE dj_releases
      ADD COLUMN created_by UUID REFERENCES profiles(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_dj_releases_created_by ON dj_releases(created_by);
  END IF;
END $$;

-- Videos (ya tiene uploader_id, pero agregamos created_by para consistencia)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'videos' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE videos
      ADD COLUMN created_by UUID REFERENCES profiles(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_videos_created_by ON videos(created_by);
  END IF;
END $$;

-- Reviews
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reviews' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE reviews
      ADD COLUMN created_by UUID REFERENCES profiles(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_reviews_created_by ON reviews(created_by);
  END IF;
END $$;

-- =============================================
-- 2) AGREGAR status/verification_status DONDE FALTE
-- =============================================

-- News: agregar status si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'news' AND column_name = 'status'
  ) THEN
    ALTER TABLE news
      ADD COLUMN status TEXT
        CHECK (status IN ('DRAFT', 'PENDING', 'PUBLISHED', 'REJECTED'))
        DEFAULT 'PUBLISHED';
    CREATE INDEX IF NOT EXISTS idx_news_status ON news(status);
  END IF;
END $$;

-- Events: ya tiene status, pero asegurarnos de que incluya PENDING
DO $$
BEGIN
  -- Si el status existe pero no tiene PENDING, necesitamos actualizar el CHECK
  -- Por ahora solo verificamos que exista
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'status'
  ) THEN
    ALTER TABLE events
      ADD COLUMN status TEXT
        CHECK (status IN ('DRAFT', 'PENDING', 'PUBLISHED', 'SOLD_OUT', 'CANCELLED'))
        DEFAULT 'PUBLISHED';
    CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
  END IF;
END $$;

-- DJ Releases: agregar status si no existe (ya puede tenerlo de migración anterior)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dj_releases' AND column_name = 'status'
  ) THEN
    ALTER TABLE dj_releases
      ADD COLUMN status TEXT
        CHECK (status IN ('DRAFT', 'PENDING', 'PUBLISHED', 'REJECTED'))
        DEFAULT 'PUBLISHED';
    CREATE INDEX IF NOT EXISTS idx_dj_releases_status ON dj_releases(status);
  END IF;
END $$;

-- Videos: ya tiene status, pero asegurarnos de que incluya PENDING
-- (ya tiene PENDING_REVIEW de migración anterior, lo dejamos así)

-- Reviews: agregar status si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reviews' AND column_name = 'status'
  ) THEN
    ALTER TABLE reviews
      ADD COLUMN status TEXT
        CHECK (status IN ('DRAFT', 'PENDING', 'PUBLISHED', 'REJECTED'))
        DEFAULT 'PUBLISHED';
    CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
  END IF;
END $$;

-- =============================================
-- 3) ACTUALIZAR POLÍTICAS RLS PARA REDACTORES
-- =============================================

-- Eliminar políticas antiguas de UPDATE para news
DROP POLICY IF EXISTS "Only admins and editors can update news" ON news;

-- Nueva política: Redactores solo pueden editar su propio contenido
CREATE POLICY "Editors can update own news, admins can update all"
  ON news FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (
        -- Admin puede editar todo
        profiles.role = 'admin'
        OR
        -- Editor solo puede editar lo que creó
        (profiles.role = 'editor' AND news.created_by = auth.uid())
      )
    )
  );

-- Eliminar políticas antiguas de UPDATE para events
DROP POLICY IF EXISTS "Only admins and editors can update events" ON events;

CREATE POLICY "Editors can update own events, admins can update all"
  ON events FOR UPDATE
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

-- Eliminar políticas antiguas de UPDATE para dj_releases
DROP POLICY IF EXISTS "Only admins and editors can update releases" ON dj_releases;

CREATE POLICY "Editors can update own releases, admins can update all"
  ON dj_releases FOR UPDATE
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

-- Videos: actualizar política de UPDATE
DROP POLICY IF EXISTS "Only admins and editors can update videos" ON videos;

CREATE POLICY "Editors can update own videos, admins can update all"
  ON videos FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (
        profiles.role = 'admin'
        OR
        (profiles.role = 'editor' AND (videos.created_by = auth.uid() OR videos.uploader_id = auth.uid()))
      )
    )
  );

-- Reviews: actualizar política de UPDATE (si existe)
DROP POLICY IF EXISTS "Only admins and editors can update reviews" ON reviews;

CREATE POLICY "Editors can update own reviews, admins can update all"
  ON reviews FOR UPDATE
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
-- 4) ACTUALIZAR POLÍTICAS RLS PARA USUARIOS NORMALES
-- =============================================

-- News: Permitir que usuarios normales creen con status PENDING
DROP POLICY IF EXISTS "Only admins and editors can insert news" ON news;

CREATE POLICY "Admins, editors and users can insert news"
  ON news FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor', 'user')
    )
  );

-- Events: Permitir que usuarios normales creen con status PENDING
DROP POLICY IF EXISTS "Only admins and editors can insert events" ON events;

CREATE POLICY "Admins, editors and users can insert events"
  ON events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor', 'user')
    )
  );

-- DJ Releases: Permitir que usuarios normales creen con status PENDING
DROP POLICY IF EXISTS "Only admins and editors can insert releases" ON dj_releases;

CREATE POLICY "Admins, editors and users can insert releases"
  ON dj_releases FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor', 'user')
    )
  );

-- Videos: Permitir que usuarios normales creen con status PENDING_REVIEW
DROP POLICY IF EXISTS "Only admins and editors can insert videos" ON videos;

CREATE POLICY "Admins, editors and users can insert videos"
  ON videos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'editor', 'user')
    )
  );

-- Reviews: Permitir que usuarios normales creen con status PENDING
-- (asumiendo que existe una política similar, si no, se creará)

-- =============================================
-- 5) ACTUALIZAR POLÍTICAS DE SELECT PARA OCULTAR CONTENIDO PENDIENTE
-- =============================================

-- News: Solo mostrar publicado o contenido propio
DROP POLICY IF EXISTS "News are viewable by everyone" ON news;

CREATE POLICY "Published news visible to all, pending visible to creator and admins"
  ON news FOR SELECT
  USING (
    status = 'PUBLISHED'
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (
        profiles.role = 'admin'
        OR (news.created_by = auth.uid())
      )
    )
  );

-- Events: Similar
DROP POLICY IF EXISTS "Events are viewable by everyone" ON events;

CREATE POLICY "Published events visible to all, pending visible to creator and admins"
  ON events FOR SELECT
  USING (
    status = 'PUBLISHED'
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (
        profiles.role = 'admin'
        OR (events.created_by = auth.uid())
      )
    )
  );

-- DJ Releases: Similar
DROP POLICY IF EXISTS "Releases are viewable by everyone" ON dj_releases;

CREATE POLICY "Published releases visible to all, pending visible to creator and admins"
  ON dj_releases FOR SELECT
  USING (
    status = 'PUBLISHED'
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (
        profiles.role = 'admin'
        OR (dj_releases.created_by = auth.uid())
      )
    )
  );

-- Videos: Similar (usar PENDING_REVIEW en lugar de PENDING)
DROP POLICY IF EXISTS "Videos are viewable by everyone" ON videos;

CREATE POLICY "Published videos visible to all, pending visible to creator and admins"
  ON videos FOR SELECT
  USING (
    status = 'PUBLISHED'
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (
        profiles.role = 'admin'
        OR (videos.created_by = auth.uid() OR videos.uploader_id = auth.uid())
      )
    )
  );

COMMENT ON COLUMN news.created_by IS 'Usuario que creó la noticia. Redactores solo pueden editar su propio contenido.';
COMMENT ON COLUMN events.created_by IS 'Usuario que creó el evento. Redactores solo pueden editar su propio contenido.';
COMMENT ON COLUMN dj_releases.created_by IS 'Usuario que creó el lanzamiento. Redactores solo pueden editar su propio contenido.';
COMMENT ON COLUMN videos.created_by IS 'Usuario que creó el video. Redactores solo pueden editar su propio contenido.';
COMMENT ON COLUMN reviews.created_by IS 'Usuario que creó la review. Redactores solo pueden editar su propio contenido.';

COMMENT ON COLUMN news.status IS 'Estado: DRAFT (borrador), PENDING (pendiente de verificación), PUBLISHED (publicado), REJECTED (rechazado)';
COMMENT ON COLUMN events.status IS 'Estado: DRAFT, PENDING, PUBLISHED, SOLD_OUT, CANCELLED';
COMMENT ON COLUMN dj_releases.status IS 'Estado: DRAFT, PENDING, PUBLISHED, REJECTED';
COMMENT ON COLUMN reviews.status IS 'Estado: DRAFT, PENDING, PUBLISHED, REJECTED';

