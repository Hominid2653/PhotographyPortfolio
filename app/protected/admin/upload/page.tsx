"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Upload,
  Loader2,
  CheckCircle2,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { uploadPhotoClient } from "@/lib/photos-client";

export default function UploadPhotosPage() {
  const router = useRouter();
  const supabase = createClient();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: boolean;
  }>({});
  const [uploadedCount, setUploadedCount] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch (e) {
          // Ignore errors during cleanup
        }
      });
    };
  }, [previewUrls]);

  const checkAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth/login");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).filter((file) =>
        file.type.startsWith("image/")
      );
      const newUrls = files.map((file) => URL.createObjectURL(file));
      setSelectedFiles((prev) => [...prev, ...files]);
      setPreviewUrls((prev) => [...prev, ...newUrls]);
      setUploadComplete(false);
    }
  };

  const handleRemoveFile = (index: number) => {
    // Revoke the object URL
    if (previewUrls[index]) {
      URL.revokeObjectURL(previewUrls[index]);
    }
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    setUploadProgress((prev) => {
      const newProgress = { ...prev };
      const fileKey = `${selectedFiles[index].name}-${index}`;
      delete newProgress[fileKey];
      return newProgress;
    });
  };

  const handleClearAll = () => {
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setSelectedFiles([]);
    setPreviewUrls([]);
    setUploadProgress({});
    setUploadedCount(0);
    setUploadComplete(false);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    try {
      setUploading(true);
      setUploadedCount(0);
      setUploadComplete(false);
      const progress: { [key: string]: boolean } = {};

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const fileKey = `${file.name}-${i}`;

        try {
          await uploadPhotoClient(file, {
            is_visible: true,
          });
          progress[fileKey] = true;
          setUploadProgress({ ...progress });
          setUploadedCount(i + 1);
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          progress[fileKey] = false;
          setUploadProgress({ ...progress });
          // Show user-friendly error message
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error occurred";
          if (
            errorMessage.includes("bucket") ||
            errorMessage.includes("tenant") ||
            errorMessage.includes("Invalid")
          ) {
            alert(
              `Upload failed: ${errorMessage}\n\nPlease ensure:\n1. The "photos" storage bucket exists in Supabase\n2. Your Supabase environment variables are correct\n3. You have proper storage permissions`
            );
          }
        }
      }

      // Clear selected files after successful upload
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
      setSelectedFiles([]);
      setPreviewUrls([]);
      setUploadProgress({});
      setUploadedCount(0);
      setUploadComplete(true);

      // Reset upload complete message after 3 seconds
      setTimeout(() => {
        setUploadComplete(false);
      }, 3000);
    } catch (error) {
      console.error("Error uploading photos:", error);
      alert("Failed to upload some photos. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "16rem",
          "--header-height": "4rem",
        } as React.CSSProperties
      }
    >
      <AdminSidebar />
      <SidebarInset className="md:ml-[16rem]">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">Upload Photos</h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col">
          <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 lg:p-8">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">
                Upload Photos
              </h1>
              <p className="text-muted-foreground">
                Select and upload multiple images to your portfolio. Photos will
                be visible on the public portfolio page by default.
              </p>
            </div>

            {/* Upload Card */}
            <Card>
              <CardHeader>
                <CardTitle>Select Photos to Upload</CardTitle>
                <CardDescription>
                  Choose one or more image files. Supported formats: JPEG, PNG,
                  WebP, GIF
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label htmlFor="file-upload" className="sr-only">
                      Select photos
                    </Label>
                    <Input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileSelect}
                      disabled={uploading}
                      className="cursor-pointer"
                    />
                  </div>
                  {selectedFiles.length > 0 && (
                    <Button
                      variant="outline"
                      onClick={handleClearAll}
                      disabled={uploading}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Clear All
                    </Button>
                  )}
                  <Button
                    onClick={handleUpload}
                    disabled={uploading || selectedFiles.length === 0}
                    size="lg"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload{" "}
                        {selectedFiles.length > 0 &&
                          `(${selectedFiles.length})`}
                      </>
                    )}
                  </Button>
                </div>

                {uploading && uploadedCount > 0 && (
                  <div className="text-sm text-muted-foreground">
                    Uploaded {uploadedCount} of {selectedFiles.length} photos...
                  </div>
                )}

                {uploadComplete && (
                  <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-md">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>All photos uploaded successfully!</span>
                  </div>
                )}

                {selectedFiles.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">
                        Selected Files ({selectedFiles.length})
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total size:{" "}
                        {formatFileSize(
                          selectedFiles.reduce(
                            (sum, file) => sum + file.size,
                            0
                          )
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 max-h-[500px] overflow-y-auto p-2">
                      {selectedFiles.map((file, index) => {
                        const fileKey = `${file.name}-${index}`;
                        const isUploaded = uploadProgress[fileKey];
                        const previewUrl = previewUrls[index];

                        return (
                          <Card
                            key={fileKey}
                            className="relative group overflow-hidden border-2 transition-all"
                          >
                            <div className="relative aspect-square w-full overflow-hidden bg-muted">
                              <img
                                src={previewUrl}
                                alt={file.name}
                                className="w-full h-full object-cover"
                              />
                              {isUploaded && (
                                <div className="absolute inset-0 bg-green-500/30 flex items-center justify-center">
                                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                                </div>
                              )}
                              {!uploading && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="absolute top-2 right-2 h-8 w-8 bg-background/80 hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => handleRemoveFile(index)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                            <CardContent className="p-3">
                              <p className="text-xs font-medium truncate mb-1">
                                {file.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatFileSize(file.size)}
                              </p>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}

                {selectedFiles.length === 0 && !uploading && (
                  <div className="border-2 border-dashed rounded-lg p-12 text-center">
                    <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-sm text-muted-foreground mb-2">
                      No files selected
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Click "Choose File" or drag and drop images here
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
