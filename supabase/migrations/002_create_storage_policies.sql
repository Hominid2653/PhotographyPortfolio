-- Create storage bucket if it doesn't exist
-- Note: Storage policies cannot be created via SQL due to permissions.
-- You must create them through the Supabase Dashboard (see instructions below).
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

-- ============================================================================
-- IMPORTANT: Storage policies must be created via the Dashboard
-- ============================================================================
-- After running this SQL, go to Storage > Policies in your Supabase Dashboard
-- and create the following policies for the 'photos' bucket:
--
-- Policy 1: "Public can view photos"
--   - Operation: SELECT
--   - Target roles: anon, authenticated
--   - USING expression: bucket_id = 'photos'
--
-- Policy 2: "Authenticated users can upload photos"
--   - Operation: INSERT
--   - Target roles: authenticated
--   - WITH CHECK expression: bucket_id = 'photos'
--
-- Policy 3: "Authenticated users can update photos"
--   - Operation: UPDATE
--   - Target roles: authenticated
--   - USING expression: bucket_id = 'photos'
--   - WITH CHECK expression: bucket_id = 'photos'
--
-- Policy 4: "Authenticated users can delete photos"
--   - Operation: DELETE
--   - Target roles: authenticated
--   - USING expression: bucket_id = 'photos'
--
-- Steps:
-- 1. Go to Storage in Supabase Dashboard
-- 2. Click on the 'photos' bucket
-- 3. Go to the "Policies" tab
-- 4. Click "New Policy" for each policy above
-- 5. Use "For full customization" option
-- 6. Copy the expressions above
-- ============================================================================

