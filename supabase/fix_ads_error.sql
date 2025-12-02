-- =============================================
-- FIX ADS TABLE SCHEMA
-- Safely adds missing columns and constraints
-- =============================================

-- 1. Ensure table exists (basic structure)
CREATE TABLE IF NOT EXISTS ads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY
);

-- 2. Add all potentially missing columns
DO $$
BEGIN
    -- Content
    ALTER TABLE ads ADD COLUMN IF NOT EXISTS title TEXT;
    ALTER TABLE ads ADD COLUMN IF NOT EXISTS image_url TEXT;
    ALTER TABLE ads ADD COLUMN IF NOT EXISTS link_url TEXT;
    ALTER TABLE ads ADD COLUMN IF NOT EXISTS alt_text TEXT;
    
    -- Position & Scheduling
    ALTER TABLE ads ADD COLUMN IF NOT EXISTS "position" TEXT;
    ALTER TABLE ads ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    ALTER TABLE ads ADD COLUMN IF NOT EXISTS end_date TIMESTAMP WITH TIME ZONE;
    ALTER TABLE ads ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
    
    -- Targeting
    ALTER TABLE ads ADD COLUMN IF NOT EXISTS target_pages TEXT[] DEFAULT '{}';
    ALTER TABLE ads ADD COLUMN IF NOT EXISTS target_countries TEXT[] DEFAULT '{}';
    
    -- Priority & Stats
    ALTER TABLE ads ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0;
    ALTER TABLE ads ADD COLUMN IF NOT EXISTS weight INTEGER DEFAULT 1;
    ALTER TABLE ads ADD COLUMN IF NOT EXISTS impressions INTEGER DEFAULT 0;
    ALTER TABLE ads ADD COLUMN IF NOT EXISTS clicks INTEGER DEFAULT 0;
    
    -- Metadata
    ALTER TABLE ads ADD COLUMN IF NOT EXISTS advertiser_name TEXT;
    ALTER TABLE ads ADD COLUMN IF NOT EXISTS campaign_name TEXT;
    ALTER TABLE ads ADD COLUMN IF NOT EXISTS notes TEXT;
    ALTER TABLE ads ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());
    ALTER TABLE ads ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());
END $$;

-- 3. Fix Constraints
DO $$
BEGIN
    -- Drop existing check if it exists to ensure we have the latest values
    ALTER TABLE ads DROP CONSTRAINT IF EXISTS ads_position_check;
    
    -- Add the check constraint
    ALTER TABLE ads ADD CONSTRAINT ads_position_check 
      CHECK ("position" IN ('header_leaderboard', 'inline_content', 'footer_banner', 'mobile_banner'));
END $$;

-- 4. Enable RLS
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;

-- 5. Re-apply Policies (Drop first to avoid conflicts)
DROP POLICY IF EXISTS "Active ads are viewable by everyone" ON ads;
CREATE POLICY "Active ads are viewable by everyone" 
  ON ads FOR SELECT 
  USING (
    is_active = true 
    AND start_date <= NOW() 
    AND (end_date IS NULL OR end_date >= NOW())
  );

DROP POLICY IF EXISTS "Only admins can insert ads" ON ads;
CREATE POLICY "Only admins can insert ads" 
  ON ads FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Only admins can update ads" ON ads;
CREATE POLICY "Only admins can update ads" 
  ON ads FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Only admins can delete ads" ON ads;
CREATE POLICY "Only admins can delete ads" 
  ON ads FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 6. Insert Sample Data (Only if table is empty)
INSERT INTO ads (title, image_url, link_url, alt_text, "position", priority, advertiser_name, campaign_name)
SELECT 
    'Techno Festival 2025',
    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=970&h=90&fit=crop',
    'https://example.com/festival',
    'Techno Festival 2025 - Summer Edition',
    'header_leaderboard',
    10,
    'Techno Events Ltd',
    'Summer 2025'
WHERE NOT EXISTS (SELECT 1 FROM ads LIMIT 1);

INSERT INTO ads (title, image_url, link_url, alt_text, "position", priority, advertiser_name, campaign_name)
SELECT 
    'New DJ Equipment',
    'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=728&h=90&fit=crop',
    'https://example.com/equipment',
    'Latest DJ Equipment - Special Offer',
    'inline_content',
    5,
    'Music Gear Store',
    'Spring Sale'
WHERE NOT EXISTS (SELECT 1 FROM ads WHERE "position" = 'inline_content');
