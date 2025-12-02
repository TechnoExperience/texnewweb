-- =============================================
-- COMMENTS SYSTEM
-- =============================================
-- Sistema de comentarios para noticias, eventos, videos y lanzamientos

CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('news', 'event', 'video', 'release', 'review')),
  resource_id UUID NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT true,
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_comments_resource ON comments(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- RLS para comentarios
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Política: Todos pueden ver comentarios aprobados
CREATE POLICY "Public can view approved comments"
ON comments FOR SELECT
USING (is_approved = true OR auth.uid() = user_id);

-- Política: Usuarios autenticados pueden crear comentarios
CREATE POLICY "Authenticated users can create comments"
ON comments FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Política: Usuarios pueden editar sus propios comentarios
CREATE POLICY "Users can update own comments"
ON comments FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Política: Usuarios pueden eliminar sus propios comentarios, admins pueden eliminar cualquier comentario
CREATE POLICY "Users can delete own comments, admins can delete any"
ON comments FOR DELETE
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'editor')
  )
);

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  IF OLD.content != NEW.content THEN
    NEW.is_edited = true;
    NEW.edited_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_comments_updated_at();

-- Función para contar comentarios
CREATE OR REPLACE FUNCTION get_comment_count(
  p_resource_type TEXT,
  p_resource_id UUID
)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM comments
    WHERE resource_type = p_resource_type
      AND resource_id = p_resource_id
      AND is_approved = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

