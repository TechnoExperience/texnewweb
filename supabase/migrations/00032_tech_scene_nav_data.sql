-- =============================================
-- DATOS PARA BARRA DE NAVEGACIÓN TECHNO SCENE
-- =============================================
-- Objetivo: Insertar datos de ejemplo de clubs, festivales y labels
-- para que la barra de navegación muestre datos reales de Supabase

-- 1) Asegurar que 'club' esté permitido en profile_type
DO $$
BEGIN
  -- Verificar si la constraint existe y permite 'club'
  IF EXISTS (
    SELECT 1 
    FROM information_schema.check_constraints 
    WHERE constraint_name LIKE '%profile_type%'
  ) THEN
    -- Eliminar constraint antigua si existe
    ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_profile_type_check;
  END IF;
  
  -- Crear nueva constraint con 'club' incluido
  ALTER TABLE profiles 
    ADD CONSTRAINT profiles_profile_type_check 
    CHECK (profile_type IN ('dj', 'promoter', 'clubber', 'label', 'agency', 'club'));
END
$$;

-- 2) Crear tabla separada para datos de navegación (clubs y labels)
-- Esta tabla no requiere usuarios reales en auth.users
CREATE TABLE IF NOT EXISTS tech_scene_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('club', 'label')),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  city TEXT,
  country TEXT DEFAULT 'España',
  is_featured BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_tech_scene_entities_type ON tech_scene_entities(entity_type, is_featured);
CREATE INDEX IF NOT EXISTS idx_tech_scene_entities_slug ON tech_scene_entities(slug);

-- RLS: lectura pública, escritura solo para admins
ALTER TABLE tech_scene_entities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tech_scene_entities_select" ON tech_scene_entities
  FOR SELECT
  USING (true);

CREATE POLICY "tech_scene_entities_modify" ON tech_scene_entities
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'editor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'editor')
    )
  );

-- 3) Insertar clubs en tech_scene_entities (si no existen)
INSERT INTO tech_scene_entities (entity_type, name, slug, city, country, is_featured, display_order)
SELECT 
  'club',
  club.name,
  LOWER(REPLACE(REPLACE(club.name, ' ', '-'), '''', '')),
  club.city,
  'España',
  true,
  club.order
FROM (VALUES
  ('METRO DANCE CLUB', 'Madrid', 1),
  ('Fabrik', 'Madrid', 2),
  ('Kapital', 'Madrid', 3),
  ('Opium', 'Barcelona', 4),
  ('Pacha', 'Barcelona', 5),
  ('Space', 'Barcelona', 6),
  ('Input', 'Barcelona', 7),
  ('Razzmatazz', 'Barcelona', 8),
  ('Sala Apolo', 'Barcelona', 9),
  ('Moog', 'Barcelona', 10),
  ('Luz de Gas', 'Barcelona', 11),
  ('Bassiani', 'Barcelona', 12)
) AS club(name, city, "order")
WHERE NOT EXISTS (
  SELECT 1 FROM tech_scene_entities 
  WHERE tech_scene_entities.name = club.name 
  AND tech_scene_entities.entity_type = 'club'
)
ON CONFLICT (slug) DO NOTHING;

-- 4) Insertar labels en tech_scene_entities (si no existen)
INSERT INTO tech_scene_entities (entity_type, name, slug, city, country, is_featured, display_order)
SELECT 
  'label',
  label.name,
  LOWER(REPLACE(REPLACE(label.name, ' ', '-'), '''', '')),
  label.city,
  'España',
  true,
  label.order
FROM (VALUES
  ('POLE GROUP', 'Madrid', 1),
  ('Industrial Copera', 'Madrid', 2),
  ('Warm Up Recordings', 'Barcelona', 3),
  ('Semantica', 'Barcelona', 4),
  ('Informa Records', 'Valencia', 5),
  ('Analogue Attic', 'Barcelona', 6)
) AS label(name, city, "order")
WHERE NOT EXISTS (
  SELECT 1 FROM tech_scene_entities 
  WHERE tech_scene_entities.name = label.name 
  AND tech_scene_entities.entity_type = 'label'
)
ON CONFLICT (slug) DO NOTHING;

-- 5) Insertar festivales como eventos (si no existen)
-- IMPORTANTE: Convertir el texto a timestamptz usando CAST
INSERT INTO events (id, title, slug, description, event_date, venue, city, country, event_type, featured, status)
SELECT 
  gen_random_uuid(),
  festival.name,
  LOWER(REPLACE(REPLACE(festival.name, ' ', '-'), '''', '')),
  'Festival de música techno en España',
  festival.date::timestamptz,
  festival.venue,
  festival.city,
  'España',
  'promoter_festival',
  true,
  'PUBLISHED'
FROM (VALUES
  ('A Summer Story', '2024-07-15 20:00:00+00', 'Parque de Atracciones', 'Madrid'),
  ('Monegros Desert Festival', '2024-08-10 18:00:00+00', 'Desierto de Monegros', 'Zaragoza'),
  ('Sónar', '2024-06-13 12:00:00+00', 'Fira de Barcelona', 'Barcelona'),
  ('Awakenings', '2024-09-20 20:00:00+00', 'Parque del Retiro', 'Madrid'),
  ('Time Warp', '2024-10-05 22:00:00+00', 'Palau Sant Jordi', 'Barcelona'),
  ('DGTL', '2024-05-25 14:00:00+00', 'Parque del Fórum', 'Barcelona'),
  ('Brunch in the Park', '2024-06-30 12:00:00+00', 'Parque de la Ciudadela', 'Barcelona')
) AS festival(name, date, venue, city)
WHERE NOT EXISTS (
  SELECT 1 FROM events 
  WHERE events.title = festival.name 
  AND events.event_type = 'promoter_festival'
)
ON CONFLICT (slug) DO NOTHING;

-- 6) Crear índices para mejorar rendimiento de consultas
CREATE INDEX IF NOT EXISTS idx_profiles_type_verified ON profiles(profile_type, is_verified) 
WHERE is_verified = true;
CREATE INDEX IF NOT EXISTS idx_events_type_featured ON events(event_type, featured) 
WHERE featured = true AND event_type = 'promoter_festival';

COMMENT ON INDEX idx_profiles_type_verified IS 'Índice para consultas rápidas de clubs y labels verificados';
COMMENT ON INDEX idx_events_type_featured IS 'Índice para consultas rápidas de festivales destacados';

