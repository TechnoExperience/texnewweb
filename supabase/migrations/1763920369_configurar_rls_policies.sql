-- Migration: configurar_rls_policies
-- Created at: 1763920369

-- Habilitar RLS en todas las tablas
ALTER TABLE perfiles_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE noticias ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE lanzamientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Políticas para perfiles_usuario
CREATE POLICY "Perfiles visibles públicamente" ON perfiles_usuario
  FOR SELECT USING (true);

CREATE POLICY "Usuarios pueden crear su perfil" ON perfiles_usuario
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden actualizar su perfil" ON perfiles_usuario
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para noticias
CREATE POLICY "Noticias publicadas visibles" ON noticias
  FOR SELECT USING (estado = 'publicado' OR auth.role() IN ('anon', 'service_role'));

CREATE POLICY "Editores pueden crear noticias" ON noticias
  FOR INSERT WITH CHECK (auth.role() IN ('anon', 'service_role'));

CREATE POLICY "Autores pueden actualizar sus noticias" ON noticias
  FOR UPDATE USING (auth.uid() = autor_id OR auth.role() IN ('anon', 'service_role'));

-- Políticas para eventos
CREATE POLICY "Eventos publicados visibles" ON eventos
  FOR SELECT USING (estado IN ('publicado', 'aprobado') OR auth.role() IN ('anon', 'service_role'));

CREATE POLICY "Promotores pueden crear eventos" ON eventos
  FOR INSERT WITH CHECK (auth.role() IN ('anon', 'service_role'));

CREATE POLICY "Promotores pueden actualizar eventos" ON eventos
  FOR UPDATE USING (auth.uid() = promotor_id OR auth.role() IN ('anon', 'service_role'));

-- Políticas para lanzamientos
CREATE POLICY "Lanzamientos publicados visibles" ON lanzamientos
  FOR SELECT USING (estado = 'publicado' OR auth.role() IN ('anon', 'service_role'));

CREATE POLICY "DJs y sellos pueden crear lanzamientos" ON lanzamientos
  FOR INSERT WITH CHECK (auth.role() IN ('anon', 'service_role'));

CREATE POLICY "DJs y sellos pueden actualizar lanzamientos" ON lanzamientos
  FOR UPDATE USING (auth.role() IN ('anon', 'service_role'));

-- Políticas para videos
CREATE POLICY "Videos publicados visibles" ON videos
  FOR SELECT USING (estado = 'publicado' OR auth.role() IN ('anon', 'service_role'));

CREATE POLICY "Usuarios pueden subir videos" ON videos
  FOR INSERT WITH CHECK (auth.role() IN ('anon', 'service_role'));

CREATE POLICY "Usuarios pueden actualizar videos" ON videos
  FOR UPDATE USING (auth.role() IN ('anon', 'service_role'));;