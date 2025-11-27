-- Create storage bucket if it doesn't exist
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'photos',
  'photos',
  true,
  52428800, -- 50MB file size limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

-- Enable RLS on storage.objects
-- Note: RLS should already be enabled, but this ensures it's on
alter table storage.objects enable row level security;

-- Drop existing policies if they exist (to avoid conflicts on re-run)
drop policy if exists "Public can view photos" on storage.objects;
drop policy if exists "Authenticated users can upload photos" on storage.objects;
drop policy if exists "Authenticated users can update photos" on storage.objects;
drop policy if exists "Authenticated users can delete photos" on storage.objects;

-- Policy 1: Allow public read access to photos
create policy "Public can view photos"
on storage.objects
for select
to public
using (bucket_id = 'photos');

-- Policy 2: Allow authenticated users to upload photos
create policy "Authenticated users can upload photos"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'photos');

-- Policy 3: Allow authenticated users to update photos
create policy "Authenticated users can update photos"
on storage.objects
for update
to authenticated
using (bucket_id = 'photos')
with check (bucket_id = 'photos');

-- Policy 4: Allow authenticated users to delete photos
create policy "Authenticated users can delete photos"
on storage.objects
for delete
to authenticated
using (bucket_id = 'photos');

