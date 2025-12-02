-- =============================================
-- VERIFICAR Y CREAR USUARIOS DE PRUEBA
-- =============================================
-- Ejecuta este script en el SQL Editor de Supabase

-- 1) Verificar que el campo username existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'username'
  ) THEN
    RAISE EXCEPTION 'El campo username no existe en la tabla profiles. Ejecuta primero la migración 00028_add_username_and_fix_queries.sql';
  END IF;
END $$;

-- 2) Crear usuarios en auth.users (si no existen)
-- Nota: Esto requiere permisos de service_role

-- Usuario Admin
DO $$
DECLARE
  admin_user_id UUID;
  has_name BOOLEAN;
  has_is_active BOOLEAN;
  has_is_verified BOOLEAN;
BEGIN
  -- Verificar qué columnas existen
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'name'
  ) INTO has_name;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'is_active'
  ) INTO has_is_active;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'is_verified'
  ) INTO has_is_verified;
  
  -- Intentar encontrar el usuario
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'admin@technoexperience.com';
  
  IF admin_user_id IS NULL THEN
    RAISE NOTICE 'Usuario admin@technoexperience.com no existe. Debes crearlo desde el dashboard de Supabase o usando el script create_test_users.ts';
  ELSE
    RAISE NOTICE 'Usuario admin encontrado: %', admin_user_id;
    
    -- Crear o actualizar perfil según las columnas disponibles
    IF has_name AND has_is_active AND has_is_verified THEN
      INSERT INTO profiles (id, email, username, role, name, is_active, is_verified)
      VALUES (admin_user_id, 'admin@technoexperience.com', 'admin_te', 'admin', 'Administrador', true, true)
      ON CONFLICT (id) DO UPDATE
      SET username = 'admin_te',
          role = 'admin',
          name = 'Administrador',
          is_active = true,
          is_verified = true;
    ELSIF has_name THEN
      INSERT INTO profiles (id, email, username, role, name)
      VALUES (admin_user_id, 'admin@technoexperience.com', 'admin_te', 'admin', 'Administrador')
      ON CONFLICT (id) DO UPDATE
      SET username = 'admin_te',
          role = 'admin',
          name = 'Administrador';
    ELSE
      INSERT INTO profiles (id, email, username, role)
      VALUES (admin_user_id, 'admin@technoexperience.com', 'admin_te', 'admin')
      ON CONFLICT (id) DO UPDATE
      SET username = 'admin_te',
          role = 'admin';
    END IF;
  END IF;
END $$;

-- Usuario Editor
DO $$
DECLARE
  editor_user_id UUID;
  has_name BOOLEAN;
  has_is_active BOOLEAN;
  has_is_verified BOOLEAN;
BEGIN
  -- Verificar qué columnas existen
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'name'
  ) INTO has_name;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'is_active'
  ) INTO has_is_active;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'is_verified'
  ) INTO has_is_verified;
  
  SELECT id INTO editor_user_id
  FROM auth.users
  WHERE email = 'editor@technoexperience.com';
  
  IF editor_user_id IS NULL THEN
    RAISE NOTICE 'Usuario editor@technoexperience.com no existe. Debes crearlo desde el dashboard de Supabase o usando el script create_test_users.ts';
  ELSE
    RAISE NOTICE 'Usuario editor encontrado: %', editor_user_id;
    
    IF has_name AND has_is_active AND has_is_verified THEN
      INSERT INTO profiles (id, email, username, role, name, is_active, is_verified)
      VALUES (editor_user_id, 'editor@technoexperience.com', 'editor_te', 'editor', 'Redactor', true, true)
      ON CONFLICT (id) DO UPDATE
      SET username = 'editor_te',
          role = 'editor',
          name = 'Redactor',
          is_active = true,
          is_verified = true;
    ELSIF has_name THEN
      INSERT INTO profiles (id, email, username, role, name)
      VALUES (editor_user_id, 'editor@technoexperience.com', 'editor_te', 'editor', 'Redactor')
      ON CONFLICT (id) DO UPDATE
      SET username = 'editor_te',
          role = 'editor',
          name = 'Redactor';
    ELSE
      INSERT INTO profiles (id, email, username, role)
      VALUES (editor_user_id, 'editor@technoexperience.com', 'editor_te', 'editor')
      ON CONFLICT (id) DO UPDATE
      SET username = 'editor_te',
          role = 'editor';
    END IF;
  END IF;
END $$;

-- Usuario Normal
DO $$
DECLARE
  user_user_id UUID;
  has_name BOOLEAN;
  has_is_active BOOLEAN;
  has_is_verified BOOLEAN;
BEGIN
  -- Verificar qué columnas existen
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'name'
  ) INTO has_name;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'is_active'
  ) INTO has_is_active;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'is_verified'
  ) INTO has_is_verified;
  
  SELECT id INTO user_user_id
  FROM auth.users
  WHERE email = 'user@technoexperience.com';
  
  IF user_user_id IS NULL THEN
    RAISE NOTICE 'Usuario user@technoexperience.com no existe. Debes crearlo desde el dashboard de Supabase o usando el script create_test_users.ts';
  ELSE
    RAISE NOTICE 'Usuario user encontrado: %', user_user_id;
    
    IF has_name AND has_is_active AND has_is_verified THEN
      INSERT INTO profiles (id, email, username, role, name, profile_type, is_active, is_verified)
      VALUES (user_user_id, 'user@technoexperience.com', 'usuario_te', 'user', 'Usuario', 'clubber', true, false)
      ON CONFLICT (id) DO UPDATE
      SET username = 'usuario_te',
          role = 'user',
          name = 'Usuario',
          profile_type = 'clubber',
          is_active = true,
          is_verified = false;
    ELSIF has_name THEN
      INSERT INTO profiles (id, email, username, role, name, profile_type)
      VALUES (user_user_id, 'user@technoexperience.com', 'usuario_te', 'user', 'Usuario', 'clubber')
      ON CONFLICT (id) DO UPDATE
      SET username = 'usuario_te',
          role = 'user',
          name = 'Usuario',
          profile_type = 'clubber';
    ELSE
      INSERT INTO profiles (id, email, username, role, profile_type)
      VALUES (user_user_id, 'user@technoexperience.com', 'usuario_te', 'user', 'clubber')
      ON CONFLICT (id) DO UPDATE
      SET username = 'usuario_te',
          role = 'user',
          profile_type = 'clubber';
    END IF;
  END IF;
END $$;

-- 3) Verificar columnas disponibles en profiles
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 4) Verificar usuarios creados
SELECT 
  p.id,
  p.email,
  p.username,
  p.role,
  CASE WHEN au.id IS NOT NULL THEN 'Sí' ELSE 'No' END as existe_en_auth
FROM profiles p
LEFT JOIN auth.users au ON au.id = p.id
WHERE p.email IN (
  'admin@technoexperience.com',
  'editor@technoexperience.com',
  'user@technoexperience.com'
)
ORDER BY p.role;

