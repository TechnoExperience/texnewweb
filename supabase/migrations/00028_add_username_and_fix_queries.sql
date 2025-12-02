-- =============================================
-- ADD USERNAME FIELD AND FIX QUERIES
-- =============================================

-- 1) Agregar campo username a profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'username'
  ) THEN
    ALTER TABLE profiles
      ADD COLUMN username TEXT UNIQUE;
    
    -- Crear índice para búsquedas rápidas
    CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
    
    -- Crear índice para búsquedas case-insensitive
    CREATE INDEX IF NOT EXISTS idx_profiles_username_lower ON profiles(LOWER(username));
  END IF;
END $$;

-- 2) Función para buscar usuario por email o username
CREATE OR REPLACE FUNCTION get_user_by_email_or_username(identifier TEXT)
RETURNS TABLE(id UUID, email TEXT, username TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.username
  FROM profiles p
  WHERE 
    LOWER(p.email) = LOWER(identifier)
    OR LOWER(p.username) = LOWER(identifier)
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3) Comentarios
COMMENT ON COLUMN profiles.username IS 'Nombre de usuario único para login. Puede usarse junto con email para autenticación.';
COMMENT ON FUNCTION get_user_by_email_or_username IS 'Busca un usuario por email o username (case-insensitive)';

