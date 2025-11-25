import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
  const packages = [
    {
      name: "Basic Package",
      price: "5,000",
      currency: "KES",
      description: "Perfect for individual graduates",
      features: [
        "30 edited high-resolution photos",
        "Digital delivery via online gallery",
        "Basic retouching",
        "5-day delivery",
        "Social media ready images",
      ],
      popular: false,
    },
    {
      name: "Standard Package",
      price: "10,000",
      currency: "KES",
      description: "Most popular choice for graduates",
      features: [
        "60 edited high-resolution photos",
        "Digital delivery via online gallery",
        "Professional retouching",
        "3-day delivery",
        "Social media ready images",
        "Print-ready files",
        "Photo album design (digital)",
      ],
      popular: true,
    },
    {
      name: "Premium Package",
      price: "15,000",
      currency: "KES",
      description: "Complete graduation photography experience",
      features: [
        "100+ edited high-resolution photos",
        "Digital delivery via online gallery",
        "Premium retouching & color grading",
        "2-day delivery",
        "Social media ready images",
        "Print-ready files",
        "Photo album design (digital)",
        "Group photos included",
        "Ceremony coverage (if applicable)",
        "Priority support",
      ],
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Pricing</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the perfect package for your graduation photography needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
            {packages.map((pkg) => (
              <Card
                key={pkg.name}
                className={`relative ${
                  pkg.popular
                    ? "border-primary shadow-lg scale-105"
                    : ""
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl mb-2">{pkg.name}</CardTitle>
                  <CardDescription className="mb-4">
                    {pkg.description}
                  </CardDescription>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold">
                      {pkg.currency} {pkg.price}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    asChild
                    className="w-full"
                    variant={pkg.popular ? "default" : "outline"}
                  >
                    <Link href="/contacts">Book Now</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>Additional Services</CardTitle>
              <CardDescription>
                Customize your package with these add-ons
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">Extra Photos</h3>
                    <p className="text-sm text-muted-foreground">
                      Additional edited photos
                    </p>
                  </div>
                  <span className="font-semibold">KES 200/photo</span>
                </div>
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">Rush Delivery</h3>
                    <p className="text-sm text-muted-foreground">
                      24-hour delivery
                    </p>
                  </div>
                  <span className="font-semibold">KES 2,000</span>
                </div>
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">Physical Album</h3>
                    <p className="text-sm text-muted-foreground">
                      Printed photo album
                    </p>
                  </div>
                  <span className="font-semibold">KES 5,000</span>
                </div>
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">Video Coverage</h3>
                    <p className="text-sm text-muted-foreground">
                      Short highlight video
                    </p>
                  </div>
                  <span className="font-semibold">KES 8,000</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-12 text-center">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Have Questions?</CardTitle>
                <CardDescription>
                  Contact us to discuss custom packages or special requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild size="lg">
                  <Link href="/contacts">Contact Us</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

