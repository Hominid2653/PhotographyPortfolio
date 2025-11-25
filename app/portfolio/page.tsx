import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import { Suspense } from "react";

async function PhotoGallery() {
  const supabase = await createClient();
  
  // List files from Supabase storage
  // Note: You'll need to create a 'photos' bucket in Supabase Storage
  const { data: files, error } = await supabase.storage
    .from("photos")
    .list("", {
      limit: 100,
      offset: 0,
      sortBy: { column: "created_at", order: "desc" },
    });

  if (error) {
    console.error("Error fetching photos:", error);
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Unable to load photos. Please check storage configuration.
        </p>
      </div>
    );
  }

  if (!files || files.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No photos available yet. Check back soon!
        </p>
      </div>
    );
  }

  // Filter out folders and get public URLs
  const photoFiles = files.filter((file) => file.name !== ".emptyFolderPlaceholder");
  
  const { data: { publicUrl } } = supabase.storage
    .from("photos")
    .getPublicUrl("");

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {photoFiles.map((file) => {
        const { data: { publicUrl: imageUrl } } = supabase.storage
          .from("photos")
          .getPublicUrl(file.name);
        
        return (
          <Card key={file.name} className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-0">
              <div className="relative aspect-square w-full overflow-hidden">
                <Image
                  src={imageUrl}
                  alt={file.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default function PortfolioPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Portfolio</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore our collection of graduation photography from Kabarak
              University Class of 2025
            </p>
          </div>

          <Suspense
            fallback={
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading photos...</p>
              </div>
            }
          >
            <PhotoGallery />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}

