import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Award, Heart, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function PhotographersPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Meet the Photographer
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get to know the talented photographer behind Hominid Photography
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="mb-8">
              <CardHeader>
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                  <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-primary/20 flex-shrink-0">
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <Camera className="h-24 w-24 text-primary/50" />
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <CardTitle className="text-3xl mb-2">
                      Elias Cheruiyot
                    </CardTitle>
                    <CardDescription className="text-lg mb-4">
                      Professional Graduation Photographer
                    </CardDescription>
                    <p className="text-muted-foreground">
                      With a passion for capturing life&apos;s most important
                      moments, Elias brings years of experience and artistic
                      vision to every graduation ceremony. Specializing in
                      graduation photography, he ensures that your milestone
                      achievements are preserved with the highest quality and
                      attention to detail.
                    </p>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Experience</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Years of professional photography experience specializing in
                    graduation ceremonies and celebrations
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Artistic Vision</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Creative approach to capturing authentic moments and emotions
                    that tell your unique story
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Dedication</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Committed to delivering exceptional results and ensuring
                    your satisfaction with every photograph
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>About Hominid Photography</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Hominid Photography is dedicated to capturing the essence of
                  your graduation celebration. We understand that graduation is
                  a significant milestone, and we&apos;re here to ensure that
                  every moment is beautifully preserved.
                </p>
                <p className="text-muted-foreground">
                  Our focus on Kabarak University Graduation Class of 2025
                  allows us to provide specialized, personalized service to
                  each graduate. From the ceremony to the celebrations, we
                  capture it all with professionalism and artistic flair.
                </p>
                <p className="text-muted-foreground">
                  Every photo is carefully edited and retouched to ensure the
                  highest quality. We deliver not just images, but memories that
                  will last a lifetime.
                </p>
              </CardContent>
            </Card>

            <div className="mt-8 text-center">
              <Button asChild size="lg">
                <Link href="/contacts">Book Your Session</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

