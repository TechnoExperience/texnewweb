-- Migration: Create Ads System
-- Creates table for managing advertisements with positions, scheduling, and tracking

-- =============================================
-- ADS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS ads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Ad Content
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link_url TEXT,
  alt_text TEXT,
  
  -- Ad Placement
  "position" TEXT NOT NULL CHECK ("position" IN (
    'header_leaderboard',      -- 728x90 or 970x90 top banner
    'inline_content',          -- Native ad between content
    'footer_banner',           -- Bottom banner
    'mobile_banner'            -- Mobile-specific banner
  )),
  
  -- Scheduling
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  
  -- Targeting
  target_pages TEXT[] DEFAULT '{}', -- Empty array = all pages
  target_countries TEXT[] DEFAULT '{}', -- Empty array = all countries
  
  -- Priority & Display
  priority INTEGER DEFAULT 0, -- Higher priority shows first
  weight INTEGER DEFAULT 1, -- For rotation weighting
  
  -- Tracking
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  
  -- Metadata
  advertiser_name TEXT,
  campaign_name TEXT,
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =============================================
-- AD IMPRESSIONS LOG (Optional - for detailed tracking)
-- =============================================
CREATE TABLE IF NOT EXISTS ad_impressions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ad_id UUID REFERENCES ads(id) ON DELETE CASCADE,
  
  -- Tracking Data
  impression_type TEXT CHECK (impression_type IN ('view', 'click')),
  page_url TEXT,
  user_agent TEXT,
  ip_address TEXT,
  country TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS ads_position_idx ON ads("position");
CREATE INDEX IF NOT EXISTS ads_active_idx ON ads(is_active);
CREATE INDEX IF NOT EXISTS ads_dates_idx ON ads(start_date, end_date);
CREATE INDEX IF NOT EXISTS ads_priority_idx ON ads(priority DESC);

CREATE INDEX IF NOT EXISTS ad_impressions_ad_id_idx ON ad_impressions(ad_id);
CREATE INDEX IF NOT EXISTS ad_impressions_created_at_idx ON ad_impressions(created_at DESC);

-- =============================================
-- RLS POLICIES
-- =============================================
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_impressions ENABLE ROW LEVEL SECURITY;

-- Public can view active ads
CREATE POLICY "Active ads are viewable by everyone" 
  ON ads FOR SELECT 
  USING (
    is_active = true 
    AND start_date <= NOW() 
    AND (end_date IS NULL OR end_date >= NOW())
  );

-- Only admins can manage ads
CREATE POLICY "Only admins can insert ads" 
  ON ads FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can update ads" 
  ON ads FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete ads" 
  ON ads FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Anyone can log impressions (for tracking)
CREATE POLICY "Anyone can log impressions" 
  ON ad_impressions FOR INSERT 
  WITH CHECK (true);

-- Only admins can view impression logs
CREATE POLICY "Only admins can view impressions" 
  ON ad_impressions FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- =============================================
-- TRIGGER FOR AUTO-UPDATING TIMESTAMPS
-- =============================================
CREATE TRIGGER update_ads_updated_at 
  BEFORE UPDATE ON ads 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- SAMPLE ADS DATA
-- =============================================
INSERT INTO ads (title, image_url, link_url, alt_text, "position", priority, advertiser_name, campaign_name) VALUES
  (
    'Techno Festival 2025',
    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=970&h=90&fit=crop',
    'https://example.com/festival',
    'Techno Festival 2025 - Summer Edition',
    'header_leaderboard',
    10,
    'Techno Events Ltd',
    'Summer 2025'
  ),
  (
    'New DJ Equipment',
    'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=728&h=90&fit=crop',
    'https://example.com/equipment',
    'Latest DJ Equipment - Special Offer',
    'inline_content',
    5,
    'Music Gear Store',
    'Spring Sale'
  );

-- =============================================
-- HELPER FUNCTION: Get Active Ads by Position
-- =============================================
CREATE OR REPLACE FUNCTION get_active_ads(ad_position TEXT, page_path TEXT DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  title TEXT,
  image_url TEXT,
  link_url TEXT,
  alt_text TEXT,
  "position" TEXT,
  priority INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.title,
    a.image_url,
    a.link_url,
    a.alt_text,
    a."position",
    a.priority
  FROM ads a
  WHERE 
    a.is_active = true
    AND a."position" = ad_position
    AND a.start_date <= NOW()
    AND (a.end_date IS NULL OR a.end_date >= NOW())
    AND (
      array_length(a.target_pages, 1) IS NULL 
      OR page_path = ANY(a.target_pages)
    )
  ORDER BY a.priority DESC, RANDOM()
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;
