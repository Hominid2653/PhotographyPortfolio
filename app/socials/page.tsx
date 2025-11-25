import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Instagram, Facebook, Twitter, Youtube, Linkedin, Mail } from "lucide-react";
import Link from "next/link";

export default function SocialsPage() {
  const socialLinks = [
    {
      name: "Instagram",
      icon: Instagram,
      url: "https://instagram.com/hominidphotography",
      description: "Follow us for daily updates and behind-the-scenes content",
      color: "bg-gradient-to-br from-purple-500 to-pink-500",
    },
    {
      name: "Facebook",
      icon: Facebook,
      url: "https://facebook.com/hominidphotography",
      description: "Connect with us on Facebook for news and updates",
      color: "bg-blue-600",
    },
    {
      name: "Twitter",
      icon: Twitter,
      url: "https://twitter.com/hominidphoto",
      description: "Stay updated with our latest tweets and announcements",
      color: "bg-sky-500",
    },
    {
      name: "YouTube",
      icon: Youtube,
      url: "https://youtube.com/@hominidphotography",
      description: "Watch our video content and photography tutorials",
      color: "bg-red-600",
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      url: "https://linkedin.com/company/hominidphotography",
      description: "Connect with us professionally on LinkedIn",
      color: "bg-blue-700",
    },
    {
      name: "Email",
      icon: Mail,
      url: "mailto:info@hominidphotography.com",
      description: "Send us an email for inquiries and bookings",
      color: "bg-gray-600",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Follow Us</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Connect with Hominid Photography on social media to stay updated
              with our latest work and announcements
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <Card key={social.name} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-4 mb-4">
                      <div
                        className={`w-12 h-12 rounded-lg ${social.color} flex items-center justify-center text-white`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <CardTitle className="text-xl">{social.name}</CardTitle>
                    </div>
                    <CardDescription>{social.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild variant="outline" className="w-full">
                      <Link href={social.url} target="_blank" rel="noopener noreferrer">
                        Visit {social.name}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Stay Connected</CardTitle>
                <CardDescription>
                  Follow us across all platforms to never miss an update about
                  Kabarak University Graduation Class of 2025 photography
                  sessions
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

