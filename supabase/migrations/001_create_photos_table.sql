-- Create photos table to track uploaded photos metadata
create table if not exists public.photos (
  id uuid default gen_random_uuid() primary key,
  file_name text not null,
  file_path text not null,
  file_size bigint,
  mime_type text,
  width integer,
  height integer,
  title text,
  description text,
  category text,
  is_featured boolean default false,
  is_visible boolean default true,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create index for faster queries
create index if not exists photos_created_at_idx on public.photos(created_at desc);
create index if not exists photos_is_visible_idx on public.photos(is_visible);
create index if not exists photos_is_featured_idx on public.photos(is_featured);
create index if not exists photos_category_idx on public.photos(category);
create index if not exists photos_uploaded_by_idx on public.photos(uploaded_by);

-- Enable Row Level Security
alter table public.photos enable row level security;

-- Policy: Anyone can view visible photos
create policy "Photos are viewable by everyone"
  on public.photos
  for select
  using (is_visible = true);

-- Policy: Only authenticated users can insert photos
create policy "Authenticated users can insert photos"
  on public.photos
  for insert
  to authenticated
  with check (true);

-- Policy: Only authenticated users can update photos
create policy "Authenticated users can update photos"
  on public.photos
  for update
  to authenticated
  using (true)
  with check (true);

-- Policy: Only authenticated users can delete photos
create policy "Authenticated users can delete photos"
  on public.photos
  for delete
  to authenticated
  using (true);

-- Function to automatically update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Trigger to update updated_at on photo updates
create trigger set_updated_at
  before update on public.photos
  for each row
  execute function public.handle_updated_at();

