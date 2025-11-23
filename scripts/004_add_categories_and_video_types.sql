-- Add techno style categories to dj_releases
-- Categorías comunes de techno
alter table public.dj_releases add column if not exists techno_style text check (techno_style in (
  'acid_techno',
  'detroit_techno',
  'minimal_techno',
  'hard_techno',
  'industrial_techno',
  'melodic_techno',
  'progressive_techno',
  'raw_techno',
  'peak_time_techno',
  'dub_techno',
  'ambient_techno',
  'hypnotic_techno',
  'tribal_techno',
  'experimental_techno'
));

-- Update videos table to separate DJ Sets and Short Videos
alter table public.videos drop constraint if exists videos_category_check;
alter table public.videos add constraint videos_category_check check (category in ('dj_set', 'short_video'));

-- Add language support to all content tables
alter table public.news add column if not exists language text default 'es' check (language in ('es', 'en', 'de', 'it'));
alter table public.events add column if not exists language text default 'es' check (language in ('es', 'en', 'de', 'it'));
alter table public.dj_releases add column if not exists language text default 'es' check (language in ('es', 'en', 'de', 'it'));
alter table public.videos add column if not exists language text default 'es' check (language in ('es', 'en', 'de', 'it'));

-- Create indexes for new fields
create index if not exists idx_releases_techno_style on public.dj_releases(techno_style);
create index if not exists idx_videos_category on public.videos(category);
create index if not exists idx_news_language on public.news(language);
create index if not exists idx_events_language on public.events(language);
create index if not exists idx_releases_language on public.dj_releases(language);
create index if not exists idx_videos_language on public.videos(language);

-- Add view count and featured flag for better CMS management
alter table public.news add column if not exists view_count integer default 0;
alter table public.news add column if not exists featured boolean default false;
alter table public.events add column if not exists featured boolean default false;
alter table public.dj_releases add column if not exists featured boolean default false;
alter table public.videos add column if not exists view_count integer default 0;
alter table public.videos add column if not exists featured boolean default false;

create index if not exists idx_news_featured on public.news(featured, published_at desc);
create index if not exists idx_events_featured on public.events(featured, event_date);
create index if not exists idx_releases_featured on public.dj_releases(featured, release_date desc);
create index if not exists idx_videos_featured on public.videos(featured, video_date desc);
