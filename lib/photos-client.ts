"use client";

import { createClient } from "@/lib/supabase/client";
import type { PhotoMetadata, PhotoWithUrl } from "@/lib/photos";

/**
 * Client-side functions for photo management
 * These use the browser client and can be called from client components
 */

/**
 * Get all visible photos from the database (client-side)
 */
export async function getVisiblePhotosClient(): Promise<PhotoWithUrl[]> {
  const supabase = createClient();

  const { data: photos, error } = await supabase
    .from("photos")
    .select("*")
    .eq("is_visible", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching photos:", error);
    throw error;
  }

  // Get public URLs for each photo
  const photosWithUrls: PhotoWithUrl[] = (photos || []).map((photo) => {
  const { data } = supabase.storage
    .from("portfolio")
    .getPublicUrl(photo.file_path);

    return {
      ...photo,
      url: data.publicUrl,
    };
  });

  return photosWithUrls;
}

/**
 * Get all photos (including hidden ones) - for admin use (client-side)
 */
export async function getAllPhotosClient(): Promise<PhotoWithUrl[]> {
  const supabase = createClient();

  const { data: photos, error } = await supabase
    .from("photos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all photos:", error);
    throw error;
  }

  // Get public URLs for each photo
  const photosWithUrls: PhotoWithUrl[] = (photos || []).map((photo) => {
  const { data } = supabase.storage
    .from("portfolio")
    .getPublicUrl(photo.file_path);

    return {
      ...photo,
      url: data.publicUrl,
    };
  });

  return photosWithUrls;
}

/**
 * Upload a photo to storage and create a database record (client-side)
 */
export async function uploadPhotoClient(
  file: File,
  metadata?: {
    title?: string;
    description?: string;
    category?: string;
    is_featured?: boolean;
    is_visible?: boolean;
  }
): Promise<PhotoMetadata> {
  const supabase = createClient();

  // Verify environment variables are set
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set in environment variables");
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    throw new Error("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is not set in environment variables");
  }

  // Get current user and session
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw new Error(`Authentication error: ${authError.message}`);
  }

  if (!user) {
    throw new Error("User must be authenticated to upload photos");
  }

  // Verify we have a valid session and refresh if needed
  let { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    console.warn("Session error:", sessionError);
  }
  
  // If session is expired or missing, try to refresh it
  if (!session || (session.expires_at && session.expires_at * 1000 < Date.now())) {
    console.log("Session expired or missing, attempting refresh...");
    const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError) {
      console.error("Failed to refresh session:", refreshError);
      throw new Error("Session expired. Please log in again.");
    }
    session = refreshedSession;
  }
  
  if (!session) {
    throw new Error("No active session. Please log in again.");
  }

  console.log("Upload authentication check:", {
    userId: user.id,
    userEmail: user.email,
    hasSession: !!session,
    hasAccessToken: !!session?.access_token,
    sessionExpiresAt: session?.expires_at,
  });

  // Generate unique filename
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = fileName;

  // Try to list buckets (non-blocking - won't fail if this errors)
  let bucketVerified = false;
  try {
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    if (!bucketError && buckets) {
      bucketVerified = buckets.some((bucket) => bucket.name === "portfolio");
      if (bucketVerified) {
        console.log("Bucket 'portfolio' verified via listBuckets()");
      }
    }
  } catch (error) {
    // listBuckets() can fail with "Invalid tenant id" even when bucket access works
    // This is a known Supabase issue, so we'll continue with upload anyway
    console.log("Could not verify bucket via listBuckets (non-critical):", error);
  }

  // Upload file to storage
  console.log("Attempting to upload file:", {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    filePath,
    bucket: "portfolio",
    hasSession: !!session,
    hasAccessToken: !!session?.access_token,
    userId: user.id,
    userEmail: user.email,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  });

  // Try upload with Supabase client first
  let uploadData;
  let uploadError;
  
  try {
    const result = await supabase.storage
      .from("portfolio")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });
    
    uploadData = result.data;
    uploadError = result.error;
    
    // If upload fails with 400/tenant error, try direct API call with explicit auth header
    if (uploadError && (uploadError.statusCode === 400 || uploadError.message?.includes("tenant"))) {
      console.log("Supabase client upload failed, trying direct API call with explicit auth...");
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const uploadUrl = `${supabaseUrl}/storage/v1/object/portfolio/${filePath}`;
      
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        },
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Direct upload failed: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const result = await response.json();
      uploadData = result;
      uploadError = null;
      console.log("Direct API upload succeeded:", result);
    }
  } catch (directError) {
    // If direct upload also fails, use the original error
    if (!uploadError) {
      uploadError = directError as any;
    }
  }

  if (uploadError) {
    console.error("Upload error details:", {
      message: uploadError.message,
      statusCode: uploadError.statusCode,
      error: uploadError,
      fileName: file.name,
      fileSize: file.size,
      filePath,
    });

    // Provide detailed error information
    if (uploadError.message?.includes("tenant") || uploadError.message?.includes("Invalid")) {
      throw new Error(
        `Storage upload failed: ${uploadError.message}\n\n` +
        `This might be a storage provisioning issue. Please:\n` +
        `1. Verify the 'portfolio' bucket exists in Supabase Dashboard\n` +
        `2. Check storage policies allow authenticated uploads\n` +
        `3. Try uploading a file manually in the dashboard to verify bucket access\n` +
        `4. Check browser console for detailed error information`
      );
    }

    if (uploadError.message?.includes("new row violates row-level security")) {
      throw new Error(
        `Upload failed: Permission denied\n\n` +
        `Storage policy issue. Please check:\n` +
        `1. Go to Supabase Dashboard > Storage > Policies\n` +
        `2. Ensure 'Authenticated users can upload photos' policy exists for 'portfolio' bucket\n` +
        `3. Policy should have: WITH CHECK expression: bucket_id = 'portfolio'`
      );
    }

    if (uploadError.message?.includes("not found") || uploadError.message?.includes("does not exist")) {
      throw new Error(
        `Upload failed: Bucket 'portfolio' not found\n\n` +
        `Please create the 'portfolio' bucket in Supabase Dashboard > Storage`
      );
    }

    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  console.log("File uploaded successfully:", uploadData);

  // Get image dimensions if it's an image
  let width: number | undefined;
  let height: number | undefined;

  if (file.type.startsWith("image/")) {
    try {
      const dimensions = await getImageDimensions(file);
      width = dimensions.width;
      height = dimensions.height;
    } catch (error) {
      console.warn("Could not get image dimensions:", error);
    }
  }

  // Create database record
  const photoData: Partial<PhotoMetadata> = {
    file_name: file.name,
    file_path: filePath,
    file_size: file.size,
    mime_type: file.type,
    width,
    height,
    title: metadata?.title,
    description: metadata?.description,
    category: metadata?.category,
    is_featured: metadata?.is_featured ?? false,
    is_visible: metadata?.is_visible ?? true,
    uploaded_by: user.id,
  };

  const { data: photo, error: dbError } = await supabase
    .from("photos")
    .insert(photoData)
    .select()
    .single();

  if (dbError) {
    // If database insert fails, try to clean up the uploaded file
    await supabase.storage.from("portfolio").remove([filePath]);
    console.error("Error creating photo record:", dbError);
    throw dbError;
  }

  return photo;
}

/**
 * Delete a photo from both storage and database (client-side)
 */
export async function deletePhotoClient(id: string): Promise<void> {
  const supabase = createClient();

  // Get photo record first to get file path
  const { data: photo, error: fetchError } = await supabase
    .from("photos")
    .select("file_path")
    .eq("id", id)
    .single();

  if (fetchError || !photo) {
    throw new Error("Photo not found");
  }

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from("portfolio")
    .remove([photo.file_path]);

  if (storageError) {
    console.error("Error deleting file from storage:", storageError);
    // Continue to delete from database even if storage delete fails
  }

  // Delete from database
  const { error: dbError } = await supabase.from("photos").delete().eq("id", id);

  if (dbError) {
    console.error("Error deleting photo record:", dbError);
    throw dbError;
  }
}

/**
 * Update photo metadata (client-side)
 */
export async function updatePhotoClient(
  id: string,
  updates: {
    title?: string;
    description?: string;
    category?: string;
    is_featured?: boolean;
    is_visible?: boolean;
  }
): Promise<PhotoMetadata> {
  const supabase = createClient();

  const { data: photo, error } = await supabase
    .from("photos")
    .update(updates)
    .select()
    .single();

  if (error) {
    console.error("Error updating photo:", error);
    throw error;
  }

  return photo;
}

/**
 * Get image dimensions from a file
 */
function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
}

