-- Mejorar políticas de seguridad para el CMS

-- Crear función helper para verificar si el usuario es admin o editor
create or replace function public.is_admin_or_editor()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role in ('admin', 'editor')
  );
$$ language sql security definer;

-- Actualizar políticas de news para mayor seguridad
drop policy if exists "news_insert_auth" on public.news;
drop policy if exists "news_update_own" on public.news;
drop policy if exists "news_delete_own" on public.news;

create policy "news_insert_admin_editor"
  on public.news for insert
  with check (is_admin_or_editor());

create policy "news_update_admin_editor"
  on public.news for update
  using (is_admin_or_editor());

create policy "news_delete_admin_editor"
  on public.news for delete
  using (is_admin_or_editor());

-- Actualizar políticas de events
drop policy if exists "events_insert_auth" on public.events;
drop policy if exists "events_update_own" on public.events;
drop policy if exists "events_delete_own" on public.events;

create policy "events_insert_admin_editor"
  on public.events for insert
  with check (is_admin_or_editor());

create policy "events_update_admin_editor"
  on public.events for update
  using (is_admin_or_editor());

create policy "events_delete_admin_editor"
  on public.events for delete
  using (is_admin_or_editor());

-- Actualizar políticas de releases
drop policy if exists "releases_insert_auth" on public.dj_releases;
drop policy if exists "releases_update_own" on public.dj_releases;
drop policy if exists "releases_delete_own" on public.dj_releases;

create policy "releases_insert_admin_editor"
  on public.dj_releases for insert
  with check (is_admin_or_editor());

create policy "releases_update_admin_editor"
  on public.dj_releases for update
  using (is_admin_or_editor());

create policy "releases_delete_admin_editor"
  on public.dj_releases for delete
  using (is_admin_or_editor());

-- Actualizar políticas de videos
drop policy if exists "videos_insert_auth" on public.videos;
drop policy if exists "videos_update_own" on public.videos;
drop policy if exists "videos_delete_own" on public.videos;

create policy "videos_insert_admin_editor"
  on public.videos for insert
  with check (is_admin_or_editor());

create policy "videos_update_admin_editor"
  on public.videos for update
  using (is_admin_or_editor());

create policy "videos_delete_admin_editor"
  on public.videos for delete
  using (is_admin_or_editor());

-- Política de profiles: solo admins pueden cambiar roles
drop policy if exists "profiles_update_own" on public.profiles;

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id and (
      -- No se puede cambiar el propio rol a menos que seas admin
      (old.role = new.role) or 
      (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
    )
  );

-- Añadir auditoría y logs
create table if not exists public.audit_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,
  table_name text not null,
  action text not null check (action in ('insert', 'update', 'delete')),
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  created_at timestamp with time zone default now()
);

alter table public.audit_logs enable row level security;

-- Solo admins pueden ver logs
create policy "audit_logs_select_admin"
  on public.audit_logs for select
  using (exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  ));

-- Crear índices para auditoría
create index if not exists idx_audit_logs_user on public.audit_logs(user_id);
create index if not exists idx_audit_logs_table on public.audit_logs(table_name);
create index if not exists idx_audit_logs_created on public.audit_logs(created_at desc);
