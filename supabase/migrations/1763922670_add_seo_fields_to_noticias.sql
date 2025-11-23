-- Migration: add_seo_fields_to_noticias
-- Created at: 1763922670

-- Agregar campos SEO y Open Graph a la tabla noticias
ALTER TABLE noticias 
ADD COLUMN IF NOT EXISTS og_title TEXT,
ADD COLUMN IF NOT EXISTS og_description TEXT,
ADD COLUMN IF NOT EXISTS og_image TEXT,
ADD COLUMN IF NOT EXISTS og_type TEXT DEFAULT 'article',
ADD COLUMN IF NOT EXISTS h1_tag TEXT,
ADD COLUMN IF NOT EXISTS h2_tags TEXT[],
ADD COLUMN IF NOT EXISTS h3_tags TEXT[];;