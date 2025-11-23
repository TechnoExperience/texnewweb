-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create profiles table (user management)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  display_name text,
  bio text,
  avatar_url text,
  role text default 'user' check (role in ('user', 'admin', 'editor')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create news table
create table if not exists public.news (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text unique not null,
  excerpt text,
  content text not null,
  cover_image text,
  author_id uuid references public.profiles(id) on delete set null,
  category text default 'general' check (category in ('general', 'interview', 'review', 'feature', 'opinion')),
  published boolean default false,
  published_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create events table
create table if not exists public.events (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text unique not null,
  description text,
  venue text not null,
  city text not null,
  country text not null,
  event_date timestamp with time zone not null,
  end_date timestamp with time zone,
  cover_image text,
  ticket_url text,
  lineup jsonb default '[]'::jsonb,
  price_from decimal(10,2),
  price_to decimal(10,2),
  currency text default 'EUR',
  created_by uuid references public.profiles(id) on delete set null,
  status text default 'upcoming' check (status in ('upcoming', 'ongoing', 'past', 'cancelled')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create dj_releases table
create table if not exists public.dj_releases (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  artist text not null,
  label text,
  release_date date,
  cover_art text,
  description text,
  tracklist jsonb default '[]'::jsonb,
  spotify_url text,
  beatport_url text,
  bandcamp_url text,
  soundcloud_url text,
  genre text[],
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create videos table
create table if not exists public.videos (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  youtube_url text,
  thumbnail_url text,
  artist text,
  event_name text,
  video_date date,
  duration integer,
  category text default 'set' check (category in ('set', 'interview', 'documentary', 'tutorial', 'live')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.news enable row level security;
alter table public.events enable row level security;
alter table public.dj_releases enable row level security;
alter table public.videos enable row level security;

-- Profiles policies
create policy "profiles_select_all" on public.profiles for select using (true);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- News policies (anyone can read, only editors/admins can write)
create policy "news_select_published" on public.news for select using (published = true or auth.uid() = author_id);
create policy "news_insert_auth" on public.news for insert with check (auth.uid() = author_id);
create policy "news_update_own" on public.news for update using (auth.uid() = author_id);
create policy "news_delete_own" on public.news for delete using (auth.uid() = author_id);

-- Events policies (anyone can read, authenticated users can create)
create policy "events_select_all" on public.events for select using (true);
create policy "events_insert_auth" on public.events for insert with check (auth.uid() = created_by);
create policy "events_update_own" on public.events for update using (auth.uid() = created_by);
create policy "events_delete_own" on public.events for delete using (auth.uid() = created_by);

-- DJ Releases policies (anyone can read, authenticated users can create)
create policy "releases_select_all" on public.dj_releases for select using (true);
create policy "releases_insert_auth" on public.dj_releases for insert with check (auth.uid() = created_by);
create policy "releases_update_own" on public.dj_releases for update using (auth.uid() = created_by);
create policy "releases_delete_own" on public.dj_releases for delete using (auth.uid() = created_by);

-- Videos policies (anyone can read, authenticated users can create)
create policy "videos_select_all" on public.videos for select using (true);
create policy "videos_insert_auth" on public.videos for insert with check (auth.uid() = created_by);
create policy "videos_update_own" on public.videos for update using (auth.uid() = created_by);
create policy "videos_delete_own" on public.videos for delete using (auth.uid() = created_by);

-- Create indexes for better performance
create index if not exists idx_news_published on public.news(published, published_at desc);
create index if not exists idx_events_date on public.events(event_date);
create index if not exists idx_events_city on public.events(city);
create index if not exists idx_releases_date on public.dj_releases(release_date desc);
create index if not exists idx_videos_date on public.videos(video_date desc);
