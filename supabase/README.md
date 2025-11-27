# Supabase Setup Instructions

This directory contains SQL migrations for setting up the database schema and storage policies for the Hominid Photography website.

## Setup Steps

### 1. Run Database Migrations

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to your project
3. Go to **SQL Editor**
4. Run the migrations in order:

   - First, run `001_create_photos_table.sql` to create the photos metadata table
   - Then, review `002_create_storage_policies.sql` for storage policy setup

### 2. Create Storage Bucket

1. In Supabase Dashboard, go to **Storage**
2. Click **New bucket**
3. Name it: `photos`
4. Make it **Public** (or configure RLS policies as needed)
5. Click **Create bucket**

### 3. Set Up Storage Policies

You can set up storage policies in two ways:

#### Option A: Via Dashboard (Recommended)

1. Go to **Storage** → **Policies** tab
2. Select the `photos` bucket
3. Create the following policies:

   **Policy 1: Public Read Access**
   - Policy name: "Public can view photos"
   - Allowed operation: SELECT
   - Target roles: `anon`, `authenticated`
   - USING expression: `bucket_id = 'photos'`

   **Policy 2: Authenticated Upload**
   - Policy name: "Authenticated users can upload"
   - Allowed operation: INSERT
   - Target roles: `authenticated`
   - WITH CHECK expression: `bucket_id = 'photos'`

   **Policy 3: Authenticated Update**
   - Policy name: "Authenticated users can update"
   - Allowed operation: UPDATE
   - Target roles: `authenticated`
   - USING expression: `bucket_id = 'photos'`
   - WITH CHECK expression: `bucket_id = 'photos'`

   **Policy 4: Authenticated Delete**
   - Policy name: "Authenticated users can delete"
   - Allowed operation: DELETE
   - Target roles: `authenticated`
   - USING expression: `bucket_id = 'photos'`

#### Option B: Via SQL (if you have the necessary permissions)

Run the SQL commands in `002_create_storage_policies.sql` in the SQL Editor.

### 4. Verify Setup

After running the migrations:

1. Check that the `photos` table exists in **Table Editor**
2. Verify the storage bucket `photos` exists in **Storage**
3. Test uploading a photo through the admin panel at `/protected/admin`

## Database Schema

### Photos Table

The `photos` table stores metadata about uploaded photos:

- `id`: UUID primary key
- `file_name`: Original filename
- `file_path`: Path in storage bucket
- `file_size`: File size in bytes
- `mime_type`: MIME type (e.g., image/jpeg)
- `width`: Image width in pixels
- `height`: Image height in pixels
- `title`: Optional title for the photo
- `description`: Optional description
- `category`: Optional category (e.g., "graduation", "ceremony")
- `is_featured`: Whether photo should be featured
- `is_visible`: Whether photo is visible in portfolio
- `uploaded_by`: Reference to the user who uploaded it
- `created_at`: Timestamp when uploaded
- `updated_at`: Timestamp when last updated

## Security

- Row Level Security (RLS) is enabled on the `photos` table
- Public users can only view photos where `is_visible = true`
- Only authenticated users can insert, update, or delete photos
- Storage policies control access to the actual files

