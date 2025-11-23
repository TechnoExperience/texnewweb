-- Migration: fix_rls_policies_v2
-- Created at: 1763922146

-- Eliminar políticas antiguas de perfiles_usuario
DROP POLICY IF EXISTS "Usuarios pueden crear su perfil" ON perfiles_usuario;
DROP POLICY IF EXISTS "Usuarios pueden actualizar su perfil" ON perfiles_usuario;
DROP POLICY IF EXISTS "Permitir inserción de perfiles" ON perfiles_usuario;
DROP POLICY IF EXISTS "Permitir actualización de perfiles propios" ON perfiles_usuario;
DROP POLICY IF EXISTS "Permitir lectura de perfiles propios" ON perfiles_usuario;

-- Crear políticas permisivas para perfiles_usuario
CREATE POLICY "Allow all inserts" ON perfiles_usuario
  FOR INSERT WITH CHECK (auth.role() IN ('anon', 'authenticated', 'service_role'));

CREATE POLICY "Allow all updates" ON perfiles_usuario
  FOR UPDATE USING (auth.role() IN ('anon', 'authenticated', 'service_role'));

CREATE POLICY "Allow all selects" ON perfiles_usuario
  FOR SELECT USING (true);

-- Eliminar y recrear políticas de storage
DROP POLICY IF EXISTS "Permitir uploads públicos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir lectura pública" ON storage.objects;
DROP POLICY IF EXISTS "Permitir actualizaciones propias" ON storage.objects;
DROP POLICY IF EXISTS "Permitir eliminación propia" ON storage.objects;

CREATE POLICY "Allow public uploads" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'techno-media');

CREATE POLICY "Allow public reads" ON storage.objects
  FOR SELECT USING (bucket_id = 'techno-media');

CREATE POLICY "Allow public updates" ON storage.objects
  FOR UPDATE USING (bucket_id = 'techno-media');

CREATE POLICY "Allow public deletes" ON storage.objects
  FOR DELETE USING (bucket_id = 'techno-media');;