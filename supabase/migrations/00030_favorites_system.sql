-- =============================================
-- FAVORITES/WISHLIST SYSTEM
-- =============================================

CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('product', 'event', 'release', 'video', 'news')),
  resource_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, resource_type, resource_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_resource ON favorites(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON favorites(created_at DESC);

-- RLS
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Política: Usuarios pueden ver sus propios favoritos
CREATE POLICY "Users can view own favorites"
ON favorites FOR SELECT
USING (auth.uid() = user_id);

-- Política: Usuarios pueden crear sus propios favoritos
CREATE POLICY "Users can create own favorites"
ON favorites FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Política: Usuarios pueden eliminar sus propios favoritos
CREATE POLICY "Users can delete own favorites"
ON favorites FOR DELETE
USING (auth.uid() = user_id);

-- Función para verificar si un recurso está en favoritos
CREATE OR REPLACE FUNCTION is_favorite(
  p_user_id UUID,
  p_resource_type TEXT,
  p_resource_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM favorites
    WHERE user_id = p_user_id
      AND resource_type = p_resource_type
      AND resource_id = p_resource_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

