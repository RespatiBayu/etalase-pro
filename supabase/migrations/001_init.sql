-- Etalase Pro 2.0 — Initial Schema

-- Projects table
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  category text not null,
  style_config jsonb,
  settings jsonb,
  created_at timestamptz default now()
);

alter table public.projects enable row level security;

create policy "Users can view own projects"
  on public.projects for select
  using (auth.uid() = user_id);

create policy "Users can insert own projects"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update own projects"
  on public.projects for update
  using (auth.uid() = user_id);

create policy "Users can delete own projects"
  on public.projects for delete
  using (auth.uid() = user_id);

-- Uploads table
create table public.uploads (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects on delete cascade not null,
  upload_type text not null,
  storage_path text not null,
  created_at timestamptz default now()
);

alter table public.uploads enable row level security;

create policy "Users can view own uploads"
  on public.uploads for select
  using (
    exists (
      select 1 from public.projects
      where projects.id = uploads.project_id
        and projects.user_id = auth.uid()
    )
  );

create policy "Users can insert own uploads"
  on public.uploads for insert
  with check (
    exists (
      select 1 from public.projects
      where projects.id = uploads.project_id
        and projects.user_id = auth.uid()
    )
  );

create policy "Users can update own uploads"
  on public.uploads for update
  using (
    exists (
      select 1 from public.projects
      where projects.id = uploads.project_id
        and projects.user_id = auth.uid()
    )
  );

create policy "Users can delete own uploads"
  on public.uploads for delete
  using (
    exists (
      select 1 from public.projects
      where projects.id = uploads.project_id
        and projects.user_id = auth.uid()
    )
  );

-- Generated images table
create table public.generated_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects on delete cascade not null,
  image_url text not null,
  prompt_used text,
  created_at timestamptz default now()
);

alter table public.generated_images enable row level security;

create policy "Users can view own generated images"
  on public.generated_images for select
  using (
    exists (
      select 1 from public.projects
      where projects.id = generated_images.project_id
        and projects.user_id = auth.uid()
    )
  );

create policy "Users can insert own generated images"
  on public.generated_images for insert
  with check (
    exists (
      select 1 from public.projects
      where projects.id = generated_images.project_id
        and projects.user_id = auth.uid()
    )
  );

create policy "Users can update own generated images"
  on public.generated_images for update
  using (
    exists (
      select 1 from public.projects
      where projects.id = generated_images.project_id
        and projects.user_id = auth.uid()
    )
  );

create policy "Users can delete own generated images"
  on public.generated_images for delete
  using (
    exists (
      select 1 from public.projects
      where projects.id = generated_images.project_id
        and projects.user_id = auth.uid()
    )
  );

-- Storage buckets (run via Supabase Dashboard or API)
-- 1. Create bucket "uploads" (private, authenticated)
-- 2. Create bucket "results" (private, authenticated)
--
-- Storage policies for "uploads" bucket:
--   SELECT: auth.uid()::text = (storage.foldername(name))[1]
--   INSERT: auth.uid()::text = (storage.foldername(name))[1]
--   UPDATE: auth.uid()::text = (storage.foldername(name))[1]
--   DELETE: auth.uid()::text = (storage.foldername(name))[1]
--
-- Storage policies for "results" bucket:
--   (same as uploads)
