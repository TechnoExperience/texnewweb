-- =============================================
-- EXTENDER MODELOS DE EVENTS / RELEASES / VIDEOS (NO BREAKING)
-- =============================================
-- Objetivo:
-- - Mantener intactas las tablas existentes usadas por el frontend
-- - Añadir solo columnas y tablas auxiliares necesarias para:
--   * Estados de publicación y metadatos adicionales
--   * Relaciones N:M entre eventos y perfiles (DJs, promotores, clubs)
--   * Player unificado para releases y vídeos
--   * Campos SEO adicionales en news/reviews

-- =============================================
-- 1) EVENTS: CAMPOS ADICIONALES + ESTADOS
-- =============================================

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS end_datetime TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS venue_id UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS promoter_id UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
  ADD COLUMN IF NOT EXISTS ticket_link_url TEXT,
  ADD COLUMN IF NOT EXISTS price_info TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT
    CHECK (status IN ('DRAFT','PUBLISHED','SOLD_OUT','CANCELLED'))
    DEFAULT 'DRAFT';

-- Índices útiles para filtros por estado/fechas
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_event_date_status ON events(event_date, status);

-- =============================================
-- 2) TABLAS PIVOT PARA EVENTOS
-- =============================================

CREATE TABLE IF NOT EXISTS event_djs (
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (event_id, profile_id)
);

CREATE TABLE IF NOT EXISTS event_promoters (
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (event_id, profile_id)
);

CREATE TABLE IF NOT EXISTS event_clubs (
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (event_id, profile_id)
);

CREATE INDEX IF NOT EXISTS idx_event_djs_event_id ON event_djs(event_id);
CREATE INDEX IF NOT EXISTS idx_event_promoters_event_id ON event_promoters(event_id);
CREATE INDEX IF NOT EXISTS idx_event_clubs_event_id ON event_clubs(event_id);

-- =============================================
-- 3) RELEASES (DJ_RELEASES): PLAYER Y ESTADO
-- =============================================

ALTER TABLE dj_releases
  ADD COLUMN IF NOT EXISTS player_url TEXT,
  ADD COLUMN IF NOT EXISTS player_provider TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT
    CHECK (status IN ('DRAFT','PUBLISHED'))
    DEFAULT 'PUBLISHED';

CREATE INDEX IF NOT EXISTS idx_dj_releases_status ON dj_releases(status);

-- =============================================
-- 4) VIDEOS: CAMPOS PARA EMBEDS UNIFICADOS
-- =============================================

ALTER TABLE videos
  ADD COLUMN IF NOT EXISTS video_url TEXT,
  ADD COLUMN IF NOT EXISTS provider TEXT,
  ADD COLUMN IF NOT EXISTS embed_data JSONB,
  ADD COLUMN IF NOT EXISTS uploader_id UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS status TEXT
    CHECK (status IN ('PENDING_REVIEW','PUBLISHED','REJECTED'))
    DEFAULT 'PENDING_REVIEW';

CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);
CREATE INDEX IF NOT EXISTS idx_videos_provider ON videos(provider);

-- =============================================
-- 5) SEO ADICIONAL PARA NEWS Y REVIEWS
-- =============================================

ALTER TABLE news
  ADD COLUMN IF NOT EXISTS seo_focus_keyword TEXT,
  ADD COLUMN IF NOT EXISTS seo_slug TEXT;

ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS seo_title TEXT,
  ADD COLUMN IF NOT EXISTS seo_description TEXT,
  ADD COLUMN IF NOT EXISTS seo_focus_keyword TEXT,
  ADD COLUMN IF NOT EXISTS seo_slug TEXT;

CREATE INDEX IF NOT EXISTS idx_news_seo_slug ON news(seo_slug);
CREATE INDEX IF NOT EXISTS idx_reviews_seo_slug ON reviews(seo_slug);


