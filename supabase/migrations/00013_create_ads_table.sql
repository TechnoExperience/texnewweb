-- Migration: Create ads table for managing advertisements from CMS
-- This table allows managing advertisements that can be displayed in sidebar areas

CREATE TABLE IF NOT EXISTS ads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  position TEXT NOT NULL CHECK (position IN ('sidebar_top', 'sidebar_middle', 'sidebar_bottom', 'content_top', 'content_bottom')),
  ad_type TEXT NOT NULL CHECK (ad_type IN ('banner', 'square', 'rectangle', 'skyscraper')),
  width INTEGER DEFAULT 300,
  height INTEGER DEFAULT 250,
  active BOOLEAN DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  click_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  priority INTEGER DEFAULT 0, -- Higher priority ads shown first
  target_audience TEXT[], -- Array of target audiences (e.g., ['events', 'releases', 'reviews'])
  language TEXT DEFAULT 'es',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ads_position ON ads(position);
CREATE INDEX IF NOT EXISTS idx_ads_active ON ads(active);
CREATE INDEX IF NOT EXISTS idx_ads_dates ON ads(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_ads_priority ON ads(priority DESC);

-- RLS Policies
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active ads
CREATE POLICY "Public can view active ads"
  ON ads
  FOR SELECT
  USING (active = true AND (start_date IS NULL OR start_date <= NOW()) AND (end_date IS NULL OR end_date >= NOW()));

-- Allow service role to manage all ads
CREATE POLICY "Service role can manage ads"
  ON ads
  FOR ALL
  USING (auth.role() = 'service_role');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_ads_updated_at
  BEFORE UPDATE ON ads
  FOR EACH ROW
  EXECUTE FUNCTION update_ads_updated_at();

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_ad_view_count(ad_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE ads SET view_count = view_count + 1 WHERE id = ad_id;
END;
$$ LANGUAGE plpgsql;

-- Function to increment click count
CREATE OR REPLACE FUNCTION increment_ad_click_count(ad_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE ads SET click_count = click_count + 1 WHERE id = ad_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE ads IS 'Advertisement management table for CMS';
COMMENT ON COLUMN ads.position IS 'Where the ad should be displayed (sidebar_top, sidebar_middle, sidebar_bottom, content_top, content_bottom)';
COMMENT ON COLUMN ads.ad_type IS 'Type of ad (banner, square, rectangle, skyscraper)';
COMMENT ON COLUMN ads.priority IS 'Higher priority ads are shown first when multiple ads are available for the same position';

