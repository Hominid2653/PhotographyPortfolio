"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Upload, Trash2, Loader2, Eye, EyeOff, Star } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getAllPhotosClient, uploadPhotoClient, deletePhotoClient, updatePhotoClient } from "@/lib/photos-client";
import type { PhotoWithUrl } from "@/lib/photos";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AdminPage() {
  const [photos, setPhotos] = useState<PhotoWithUrl[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<PhotoWithUrl | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkAuth();
    loadPhotos();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth/login");
    }
  };

  const loadPhotos = async () => {
    try {
      setLoading(true);
      const allPhotos = await getAllPhotosClient();
      setPhotos(allPhotos);
    } catch (error) {
      console.error("Error loading photos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    try {
      setUploading(true);

      for (const file of selectedFiles) {
        await uploadPhotoClient(file, {
          is_visible: true,
        });
      }

      setSelectedFiles([]);
      setUploadDialogOpen(false);
      await loadPhotos();
    } catch (error) {
      console.error("Error uploading photos:", error);
      alert("Failed to upload photos. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteClick = (photo: PhotoWithUrl) => {
    setPhotoToDelete(photo);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!photoToDelete?.id) return;

    try {
      await deletePhotoClient(photoToDelete.id);
      setDeleteDialogOpen(false);
      setPhotoToDelete(null);
      await loadPhotos();
    } catch (error) {
      console.error("Error deleting photo:", error);
      alert("Failed to delete photo. Please try again.");
    }
  };

  const toggleVisibility = async (photo: PhotoWithUrl) => {
    if (!photo.id) return;

    try {
      await updatePhotoClient(photo.id, {
        is_visible: !photo.is_visible,
      });
      await loadPhotos();
    } catch (error) {
      console.error("Error updating photo:", error);
      alert("Failed to update photo. Please try again.");
    }
  };

  const toggleFeatured = async (photo: PhotoWithUrl) => {
    if (!photo.id) return;

    try {
      await updatePhotoClient(photo.id, {
        is_featured: !photo.is_featured,
      });
      await loadPhotos();
    } catch (error) {
      console.error("Error updating photo:", error);
      alert("Failed to update photo. Please try again.");
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your photography portfolio
            </p>
          </div>
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Upload Photos
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Photos</DialogTitle>
                <DialogDescription>
                  Select one or more photos to upload to your portfolio
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                />
                {selectedFiles.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    {selectedFiles.length} file(s) selected
                  </div>
                )}
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setUploadDialogOpen(false);
                      setSelectedFiles([]);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleUpload} disabled={uploading || selectedFiles.length === 0}>
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : photos.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Photos Yet</CardTitle>
              <CardDescription>
                Upload your first photos to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setUploadDialogOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Photos
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <Card key={photo.id} className="overflow-hidden">
                <div className="relative aspect-square w-full overflow-hidden bg-muted group">
                  <Image
                    src={photo.url}
                    alt={photo.title || photo.file_name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  />
                  {photo.is_featured && (
                    <div className="absolute top-2 left-2">
                      <div className="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                        <Star className="h-3 w-3 fill-current" />
                        Featured
                      </div>
                    </div>
                  )}
                  {!photo.is_visible && (
                    <div className="absolute top-2 right-2">
                      <div className="bg-gray-600 text-white px-2 py-1 rounded text-xs font-semibold">
                        Hidden
                      </div>
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium truncate">
                        {photo.title || photo.file_name}
                      </p>
                      {photo.title && (
                        <p className="text-xs text-muted-foreground truncate">
                          {photo.file_name}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleVisibility(photo)}
                          className="h-8 w-8"
                          title={photo.is_visible ? "Hide photo" : "Show photo"}
                        >
                          {photo.is_visible ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleFeatured(photo)}
                          className={`h-8 w-8 ${
                            photo.is_featured
                              ? "text-yellow-500 hover:text-yellow-600"
                              : ""
                          }`}
                          title={
                            photo.is_featured
                              ? "Remove from featured"
                              : "Mark as featured"
                          }
                        >
                          <Star
                            className={`h-4 w-4 ${
                              photo.is_featured ? "fill-current" : ""
                            }`}
                          />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(photo)}
                        className="text-destructive hover:text-destructive h-8 w-8"
                        title="Delete photo"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      {photo.width && photo.height && (
                        <p>
                          {photo.width} × {photo.height}px
                        </p>
                      )}
                      <p>
                        {photo.created_at &&
                          new Date(photo.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the photo &quot;
                {photoToDelete?.title || photoToDelete?.file_name}&quot;. This
                action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

