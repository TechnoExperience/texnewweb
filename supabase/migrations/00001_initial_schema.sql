-- =============================================
-- TECHNO EXPERIENCE DATABASE SCHEMA
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- PROFILES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'editor', 'user')),
  profile_type TEXT CHECK (profile_type IN ('dj', 'promoter', 'clubber', 'label', 'agency')),
  name TEXT,
  bio TEXT,
  avatar_url TEXT,
  city TEXT,
  country TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" 
  ON profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- =============================================
-- NEWS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS news (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  published_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  image_url TEXT,
  category TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'es',
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS for news
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "News are viewable by everyone" 
  ON news FOR SELECT 
  USING (true);

CREATE POLICY "Only admins and editors can insert news" 
  ON news FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Only admins and editors can update news" 
  ON news FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Only admins can delete news" 
  ON news FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- =============================================
-- EVENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  venue TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  lineup TEXT[] DEFAULT '{}',
  image_url TEXT,
  ticket_url TEXT,
  language TEXT NOT NULL DEFAULT 'es',
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS for events
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Events are viewable by everyone" 
  ON events FOR SELECT 
  USING (true);

CREATE POLICY "Only admins and editors can insert events" 
  ON events FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Only admins and editors can update events" 
  ON events FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Only admins can delete events" 
  ON events FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- =============================================
-- DJ RELEASES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS dj_releases (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  label TEXT NOT NULL,
  release_date DATE NOT NULL,
  cover_art TEXT,
  genre TEXT[] DEFAULT '{}',
  techno_style TEXT,
  language TEXT NOT NULL DEFAULT 'es',
  featured BOOLEAN DEFAULT false,
  release_type TEXT CHECK (release_type IN ('single', 'ep', 'album', 'remix', 'compilation')),
  tracklist TEXT[] DEFAULT '{}',
  links JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS for dj_releases
ALTER TABLE dj_releases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Releases are viewable by everyone" 
  ON dj_releases FOR SELECT 
  USING (true);

CREATE POLICY "Only admins and editors can insert releases" 
  ON dj_releases FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Only admins and editors can update releases" 
  ON dj_releases FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Only admins can delete releases" 
  ON dj_releases FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- =============================================
-- VIDEOS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS videos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  thumbnail_url TEXT,
  artist TEXT NOT NULL,
  event_name TEXT,
  video_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  duration INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL CHECK (category IN ('dj_set', 'short_video', 'aftermovie', 'live_set')),
  language TEXT NOT NULL DEFAULT 'es',
  featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  video_type TEXT CHECK (video_type IN ('aftermovie', 'live_set', 'music_video', 'dj_mix')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS for videos
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Videos are viewable by everyone" 
  ON videos FOR SELECT 
  USING (true);

CREATE POLICY "Only admins and editors can insert videos" 
  ON videos FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Only admins and editors can update videos" 
  ON videos FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Only admins can delete videos" 
  ON videos FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX IF NOT EXISTS news_published_date_idx ON news(published_date DESC);
CREATE INDEX IF NOT EXISTS news_language_idx ON news(language);
CREATE INDEX IF NOT EXISTS news_slug_idx ON news(slug);

CREATE INDEX IF NOT EXISTS events_event_date_idx ON events(event_date);
CREATE INDEX IF NOT EXISTS events_language_idx ON events(language);
CREATE INDEX IF NOT EXISTS events_slug_idx ON events(slug);

CREATE INDEX IF NOT EXISTS releases_release_date_idx ON dj_releases(release_date DESC);
CREATE INDEX IF NOT EXISTS releases_language_idx ON dj_releases(language);
CREATE INDEX IF NOT EXISTS releases_techno_style_idx ON dj_releases(techno_style);

CREATE INDEX IF NOT EXISTS videos_video_date_idx ON videos(video_date DESC);
CREATE INDEX IF NOT EXISTS videos_category_idx ON videos(category);
CREATE INDEX IF NOT EXISTS videos_language_idx ON videos(language);

-- =============================================
-- FUNCTIONS FOR AUTO-UPDATING TIMESTAMPS
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for auto-updating timestamps
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON news 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_releases_updated_at BEFORE UPDATE ON dj_releases 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON videos 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
