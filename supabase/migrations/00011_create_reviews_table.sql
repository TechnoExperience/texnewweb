-- Migration: Create reviews table
-- Separate table for reviews (critiques of events, DJs, clubs, promoters)
-- Reviews can be about: Events, DJs, Clubs, Promoters

CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  published_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  image_url TEXT,
  category TEXT NOT NULL CHECK (category IN ('event', 'dj', 'club', 'promoter', 'general')),
  rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5),
  review_type TEXT CHECK (review_type IN ('event', 'dj', 'club', 'promoter', 'general')),
  -- Relations
  related_event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  related_dj_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- DJ profile (profile_type = 'dj')
  related_club_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Club profile (profile_type could be 'club' or venue from events)
  related_promoter_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Promoter profile (profile_type = 'promoter')
  -- Additional info
  venue_name TEXT, -- For club reviews, store venue name
  language TEXT NOT NULL DEFAULT 'es',
  featured BOOLEAN DEFAULT false,
  tags TEXT[],
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  -- Constraint: At least one relation must be set (or venue_name for clubs)
  CONSTRAINT check_review_relation CHECK (
    related_event_id IS NOT NULL OR 
    related_dj_id IS NOT NULL OR 
    related_club_id IS NOT NULL OR 
    related_promoter_id IS NOT NULL OR
    venue_name IS NOT NULL
  )
);

-- RLS for reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are viewable by everyone" 
  ON reviews FOR SELECT 
  USING (true);

CREATE POLICY "Only admins and editors can insert reviews" 
  ON reviews FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Only admins and editors can update reviews" 
  ON reviews FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Only admins can delete reviews" 
  ON reviews FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reviews_category ON reviews(category);
CREATE INDEX IF NOT EXISTS idx_reviews_published_date ON reviews(published_date);
CREATE INDEX IF NOT EXISTS idx_reviews_featured ON reviews(featured);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_slug ON reviews(slug);
CREATE INDEX IF NOT EXISTS idx_reviews_event_id ON reviews(related_event_id);
CREATE INDEX IF NOT EXISTS idx_reviews_dj_id ON reviews(related_dj_id);
CREATE INDEX IF NOT EXISTS idx_reviews_club_id ON reviews(related_club_id);
CREATE INDEX IF NOT EXISTS idx_reviews_promoter_id ON reviews(related_promoter_id);

-- Add comments for clarity
COMMENT ON COLUMN reviews.related_dj_id IS 'Reference to DJ profile (profiles with profile_type = dj)';
COMMENT ON COLUMN reviews.related_club_id IS 'Reference to club profile or venue';
COMMENT ON COLUMN reviews.related_promoter_id IS 'Reference to promoter profile (profiles with profile_type = promoter)';
COMMENT ON COLUMN reviews.venue_name IS 'Venue name for club reviews when not linked to a profile';

