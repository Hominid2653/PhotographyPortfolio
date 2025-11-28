import { createClient } from "@/lib/supabase/server";

export interface PhotoMetadata {
  id?: string;
  file_name: string;
  file_path: string;
  file_size?: number;
  mime_type?: string;
  width?: number;
  height?: number;
  title?: string;
  description?: string;
  category?: string;
  is_featured?: boolean;
  is_visible?: boolean;
  uploaded_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PhotoWithUrl extends PhotoMetadata {
  url: string;
}

/**
 * Get all visible photos from the database
 */
export async function getVisiblePhotos(): Promise<PhotoWithUrl[]> {
  const supabase = await createClient();

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
      .from("photos")
      .getPublicUrl(photo.file_path);

    return {
      ...photo,
      url: data.publicUrl,
    };
  });

  return photosWithUrls;
}

/**
 * Get all photos (including hidden ones) - for admin use
 */
export async function getAllPhotos(): Promise<PhotoWithUrl[]> {
  const supabase = await createClient();

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
      .from("photos")
      .getPublicUrl(photo.file_path);

    return {
      ...photo,
      url: data.publicUrl,
    };
  });

  return photosWithUrls;
}

/**
 * Get a single photo by ID
 */
export async function getPhotoById(id: string): Promise<PhotoWithUrl | null> {
  const supabase = await createClient();

  const { data: photo, error } = await supabase
    .from("photos")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching photo:", error);
    return null;
  }

  const { data } = supabase.storage
    .from("portfolio")
    .getPublicUrl(photo.file_path);

  return {
    ...photo,
    url: data.publicUrl,
  };
}

/**
 * Upload a photo to storage and create a database record
 */
export async function uploadPhoto(
  file: File,
  metadata?: {
    title?: string;
    description?: string;
    category?: string;
    is_featured?: boolean;
    is_visible?: boolean;
  }
): Promise<PhotoMetadata> {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User must be authenticated to upload photos");
  }

  // Generate unique filename
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = fileName;

  // Upload file to storage
  const { error: uploadError } = await supabase.storage
    .from("photos")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    console.error("Error uploading file:", uploadError);
    throw uploadError;
  }

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
 * Delete a photo from both storage and database
 */
export async function deletePhoto(id: string): Promise<void> {
  const supabase = await createClient();

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
 * Update photo metadata
 */
export async function updatePhoto(
  id: string,
  updates: {
    title?: string;
    description?: string;
    category?: string;
    is_featured?: boolean;
    is_visible?: boolean;
  }
): Promise<PhotoMetadata> {
  const supabase = await createClient();

  const { data: photo, error } = await supabase
    .from("photos")
    .update(updates)
    .eq("id", id)
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

