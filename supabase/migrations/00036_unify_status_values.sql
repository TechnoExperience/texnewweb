-- =============================================
-- UNIFICAR Y OPTIMIZAR VALORES DE STATUS
-- =============================================
-- Objetivo: Unificar todos los valores de status usando valores cortos en minúsculas
-- para optimizar el almacenamiento y evitar conflictos entre migraciones

-- =============================================
-- 1) EVENTS: Unificar a valores cortos optimizados
-- =============================================
-- Valores: 'draft', 'pub', 'can' (en lugar de 'draft', 'published', 'cancelled')
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_status_check;

-- Actualizar valores existentes
UPDATE events SET status = 'pub' WHERE status IN ('published', 'PUBLISHED', 'PUB');
UPDATE events SET status = 'draft' WHERE status IN ('DRAFT', 'draft');
UPDATE events SET status = 'can' WHERE status IN ('cancelled', 'CANCELLED', 'CANCEL');

-- Aplicar nueva restricción con valores optimizados
ALTER TABLE events 
ADD CONSTRAINT events_status_check CHECK (status IN ('draft', 'pub', 'can'));

-- Establecer default
ALTER TABLE events ALTER COLUMN status SET DEFAULT 'draft';

-- =============================================
-- 2) NEWS: Unificar a valores cortos optimizados
-- =============================================
-- Valores: 'draft', 'pend', 'pub', 'rej'
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'news' AND column_name = 'status'
  ) THEN
    ALTER TABLE news DROP CONSTRAINT IF EXISTS news_status_check;
    
    -- Actualizar valores existentes
    UPDATE news SET status = 'pub' WHERE status IN ('published', 'PUBLISHED', 'PUB');
    UPDATE news SET status = 'draft' WHERE status IN ('DRAFT', 'draft');
    UPDATE news SET status = 'pend' WHERE status IN ('PENDING', 'PENDING_REVIEW', 'pending');
    UPDATE news SET status = 'rej' WHERE status IN ('REJECTED', 'rejected');
    
    -- Aplicar nueva restricción
    ALTER TABLE news 
    ADD CONSTRAINT news_status_check CHECK (status IN ('draft', 'pend', 'pub', 'rej'));
    
    ALTER TABLE news ALTER COLUMN status SET DEFAULT 'draft';
  ELSE
    ALTER TABLE news
    ADD COLUMN status TEXT DEFAULT 'draft'
    CHECK (status IN ('draft', 'pend', 'pub', 'rej'));
    CREATE INDEX IF NOT EXISTS idx_news_status ON news(status);
  END IF;
END $$;

-- =============================================
-- 3) DJ_RELEASES: Unificar a valores cortos optimizados
-- =============================================
-- Valores: 'draft', 'pub'
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dj_releases' AND column_name = 'status'
  ) THEN
    ALTER TABLE dj_releases DROP CONSTRAINT IF EXISTS dj_releases_status_check;
    
    -- Actualizar valores existentes
    UPDATE dj_releases SET status = 'pub' WHERE status IN ('published', 'PUBLISHED', 'PUB');
    UPDATE dj_releases SET status = 'draft' WHERE status IN ('DRAFT', 'draft');
    
    -- Aplicar nueva restricción
    ALTER TABLE dj_releases 
    ADD CONSTRAINT dj_releases_status_check CHECK (status IN ('draft', 'pub'));
    
    ALTER TABLE dj_releases ALTER COLUMN status SET DEFAULT 'pub';
  ELSE
    ALTER TABLE dj_releases
    ADD COLUMN status TEXT DEFAULT 'pub'
    CHECK (status IN ('draft', 'pub'));
    CREATE INDEX IF NOT EXISTS idx_dj_releases_status ON dj_releases(status);
  END IF;
END $$;

-- =============================================
-- 4) VIDEOS: Unificar a valores cortos optimizados
-- =============================================
-- Valores: 'pend', 'pub', 'rej' (en lugar de 'PENDING_REVIEW', 'PUBLISHED', 'REJECTED')
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'videos' AND column_name = 'status'
  ) THEN
    ALTER TABLE videos DROP CONSTRAINT IF EXISTS videos_status_check;
    
    -- Actualizar valores existentes
    UPDATE videos SET status = 'pub' WHERE status IN ('published', 'PUBLISHED', 'PUB');
    UPDATE videos SET status = 'pend' WHERE status IN ('PENDING_REVIEW', 'PENDING', 'pending');
    UPDATE videos SET status = 'rej' WHERE status IN ('REJECTED', 'rejected');
    
    -- Aplicar nueva restricción
    ALTER TABLE videos 
    ADD CONSTRAINT videos_status_check CHECK (status IN ('pend', 'pub', 'rej'));
    
    ALTER TABLE videos ALTER COLUMN status SET DEFAULT 'pend';
  ELSE
    ALTER TABLE videos
    ADD COLUMN status TEXT DEFAULT 'pend'
    CHECK (status IN ('pend', 'pub', 'rej'));
    CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);
  END IF;
END $$;

-- =============================================
-- 5) REVIEWS: Unificar a valores cortos optimizados
-- =============================================
-- Valores: 'draft', 'pend', 'pub', 'rej'
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reviews' AND column_name = 'status'
  ) THEN
    ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_status_check;
    
    -- Actualizar valores existentes
    UPDATE reviews SET status = 'pub' WHERE status IN ('published', 'PUBLISHED', 'PUB');
    UPDATE reviews SET status = 'draft' WHERE status IN ('DRAFT', 'draft');
    UPDATE reviews SET status = 'pend' WHERE status IN ('PENDING', 'pending');
    UPDATE reviews SET status = 'rej' WHERE status IN ('REJECTED', 'rejected');
    
    -- Aplicar nueva restricción
    ALTER TABLE reviews 
    ADD CONSTRAINT reviews_status_check CHECK (status IN ('draft', 'pend', 'pub', 'rej'));
    
    ALTER TABLE reviews ALTER COLUMN status SET DEFAULT 'draft';
  ELSE
    ALTER TABLE reviews
    ADD COLUMN status TEXT DEFAULT 'draft'
    CHECK (status IN ('draft', 'pend', 'pub', 'rej'));
    CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
  END IF;
END $$;

-- =============================================
-- 6) ACTUALIZAR POLÍTICAS RLS PARA USAR NUEVOS VALORES
-- =============================================

-- Actualizar políticas de SELECT para news
DO $$
BEGIN
  -- Buscar y actualizar políticas que usen 'PUBLISHED'
  PERFORM pg_get_functiondef(oid) 
  FROM pg_proc 
  WHERE proname LIKE '%news%' AND prosrc LIKE '%PUBLISHED%';
  
  -- Actualizar política de SELECT para news
  DROP POLICY IF EXISTS "Public can view published news, editors see own, admins see all" ON news;
  CREATE POLICY "Public can view published news, editors see own, admins see all"
    ON news FOR SELECT
    USING (
      status = 'pub' OR
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
END $$;

-- Actualizar políticas de SELECT para events
DO $$
BEGIN
  DROP POLICY IF EXISTS "Public can view published events, editors see own, admins see all" ON events;
  CREATE POLICY "Public can view published events, editors see own, admins see all"
    ON events FOR SELECT
    USING (
      status = 'pub' OR
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
END $$;

-- Actualizar políticas de SELECT para dj_releases
DO $$
BEGIN
  DROP POLICY IF EXISTS "Public can view published releases, editors see own, admins see all" ON dj_releases;
  CREATE POLICY "Public can view published releases, editors see own, admins see all"
    ON dj_releases FOR SELECT
    USING (
      status = 'pub' OR
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
END $$;

-- Actualizar políticas de SELECT para videos
DO $$
BEGIN
  DROP POLICY IF EXISTS "Public can view published videos, editors see own, admins see all" ON videos;
  CREATE POLICY "Public can view published videos, editors see own, admins see all"
    ON videos FOR SELECT
    USING (
      status = 'pub' OR
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
END $$;

-- Actualizar políticas de SELECT para reviews
DO $$
BEGIN
  DROP POLICY IF EXISTS "Public can view published reviews, editors see own, admins see all" ON reviews;
  CREATE POLICY "Public can view published reviews, editors see own, admins see all"
    ON reviews FOR SELECT
    USING (
      status = 'pub' OR
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
END $$;

-- =============================================
-- COMENTARIOS
-- =============================================
COMMENT ON COLUMN events.status IS 'Estado del evento: draft (borrador), pub (publicado), can (cancelado)';
COMMENT ON COLUMN news.status IS 'Estado de la noticia: draft (borrador), pend (pendiente), pub (publicado), rej (rechazado)';
COMMENT ON COLUMN dj_releases.status IS 'Estado del lanzamiento: draft (borrador), pub (publicado)';
COMMENT ON COLUMN videos.status IS 'Estado del video: pend (pendiente revisión), pub (publicado), rej (rechazado)';
COMMENT ON COLUMN reviews.status IS 'Estado de la review: draft (borrador), pend (pendiente), pub (publicado), rej (rechazado)';

