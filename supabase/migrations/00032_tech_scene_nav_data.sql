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

-- 2) Insertar clubs como perfiles (si no existen)
INSERT INTO profiles (id, email, role, profile_type, name, city, country, is_active, is_verified, verification_status)
SELECT 
  gen_random_uuid(),
  LOWER(REPLACE(club.name, ' ', '_')) || '@technoexperience.com',
  'user',
  'club',
  club.name,
  club.city,
  'España',
  true,
  true,
  'APPROVED'
FROM (VALUES
  ('METRO DANCE CLUB', 'Madrid'),
  ('Fabrik', 'Madrid'),
  ('Kapital', 'Madrid'),
  ('Opium', 'Barcelona'),
  ('Pacha', 'Barcelona'),
  ('Space', 'Barcelona'),
  ('Input', 'Barcelona'),
  ('Razzmatazz', 'Barcelona'),
  ('Sala Apolo', 'Barcelona'),
  ('Moog', 'Barcelona'),
  ('Luz de Gas', 'Barcelona'),
  ('Bassiani', 'Barcelona')
) AS club(name, city)
WHERE NOT EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.name = club.name 
  AND profiles.profile_type = 'club'
)
ON CONFLICT DO NOTHING;

-- 3) Insertar labels como perfiles (si no existen)
INSERT INTO profiles (id, email, role, profile_type, name, city, country, is_active, is_verified, verification_status)
SELECT 
  gen_random_uuid(),
  LOWER(REPLACE(label.name, ' ', '_')) || '@technoexperience.com',
  'user',
  'label',
  label.name,
  label.city,
  'España',
  true,
  true,
  'APPROVED'
FROM (VALUES
  ('POLE GROUP', 'Madrid'),
  ('Industrial Copera', 'Madrid'),
  ('Warm Up Recordings', 'Barcelona'),
  ('Semantica', 'Barcelona'),
  ('Informa Records', 'Valencia'),
  ('Analogue Attic', 'Barcelona')
) AS label(name, city)
WHERE NOT EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.name = label.name 
  AND profiles.profile_type = 'label'
)
ON CONFLICT DO NOTHING;

-- 4) Insertar festivales como eventos (si no existen)
INSERT INTO events (id, title, slug, description, event_date, venue, city, country, event_type, featured, status)
SELECT 
  gen_random_uuid(),
  festival.name,
  LOWER(REPLACE(REPLACE(festival.name, ' ', '-'), '''', '')),
  'Festival de música techno en España',
  festival.date,
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

-- 5) Crear índices para mejorar rendimiento de consultas
CREATE INDEX IF NOT EXISTS idx_profiles_type_verified ON profiles(profile_type, is_verified) 
WHERE is_verified = true;
CREATE INDEX IF NOT EXISTS idx_events_type_featured ON events(event_type, featured) 
WHERE featured = true AND event_type = 'promoter_festival';

COMMENT ON INDEX idx_profiles_type_verified IS 'Índice para consultas rápidas de clubs y labels verificados';
COMMENT ON INDEX idx_events_type_featured IS 'Índice para consultas rápidas de festivales destacados';

