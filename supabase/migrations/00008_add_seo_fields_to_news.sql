-- Migration: Add SEO fields to news table
-- Adds meta tags, Open Graph, and structured data fields for SEO optimization

ALTER TABLE news 
ADD COLUMN IF NOT EXISTS meta_title TEXT,
ADD COLUMN IF NOT EXISTS meta_description TEXT,
ADD COLUMN IF NOT EXISTS meta_keywords TEXT,
ADD COLUMN IF NOT EXISTS og_title TEXT,
ADD COLUMN IF NOT EXISTS og_description TEXT,
ADD COLUMN IF NOT EXISTS og_image TEXT,
ADD COLUMN IF NOT EXISTS og_type TEXT DEFAULT 'article',
ADD COLUMN IF NOT EXISTS reading_time INTEGER,
ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Create index for better search performance
CREATE INDEX IF NOT EXISTS idx_news_slug ON news(slug);
CREATE INDEX IF NOT EXISTS idx_news_featured ON news(featured);
CREATE INDEX IF NOT EXISTS idx_news_category ON news(category);
CREATE INDEX IF NOT EXISTS idx_news_published_date ON news(published_date);

