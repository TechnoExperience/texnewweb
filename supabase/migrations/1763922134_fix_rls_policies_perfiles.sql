-- Migration: fix_rls_policies_perfiles
-- Created at: 1763922134

-- Eliminar políticas antiguas restrictivas
DROP POLICY IF EXISTS "Usuarios pueden crear su perfil" ON perfiles_usuario;
DROP POLICY IF EXISTS "Usuarios pueden actualizar su perfil" ON perfiles_usuario;

-- Crear políticas más permisivas que permitan operaciones de usuarios autenticados
CREATE POLICY "Permitir inserción de perfiles" ON perfiles_usuario
  FOR INSERT WITH CHECK (auth.role() IN ('anon', 'authenticated', 'service_role'));

CREATE POLICY "Permitir actualización de perfiles propios" ON perfiles_usuario
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    auth.role() IN ('authenticated', 'service_role')
  );

CREATE POLICY "Permitir lectura de perfiles propios" ON perfiles_usuario
  FOR SELECT USING (
    auth.uid() = user_id OR 
    auth.role() IN ('anon', 'authenticated', 'service_role') OR
    true
  );

-- Asegurar que las políticas de storage también son permisivas
CREATE POLICY IF NOT EXISTS "Permitir uploads públicos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'techno-media' AND 
    auth.role() IN ('anon', 'authenticated', 'service_role')
  );

CREATE POLICY IF NOT EXISTS "Permitir lectura pública" ON storage.objects
  FOR SELECT USING (bucket_id = 'techno-media');

CREATE POLICY IF NOT EXISTS "Permitir actualizaciones propias" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'techno-media' AND 
    auth.role() IN ('anon', 'authenticated', 'service_role')
  );

CREATE POLICY IF NOT EXISTS "Permitir eliminación propia" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'techno-media' AND 
    auth.role() IN ('anon', 'authenticated', 'service_role')
  );;