import Link from "next/link";
import { Camera, Instagram, Facebook, Twitter, Mail, Phone } from "lucide-react";
import { ThemeSwitcher } from "@/components/theme-switcher";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Camera className="h-6 w-6" />
              <span className="font-bold text-xl">Hominid Photography</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Capturing your special moments at Kabarak University Graduation
              Class of 2025
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/portfolio"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Portfolio
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/photographers"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Photographers
                </Link>
              </li>
              <li>
                <Link
                  href="/contacts"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>info@hominidphotography.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+254 XXX XXX XXX</span>
              </li>
            </ul>
            <div className="flex space-x-4 mt-4">
              <Link
                href="/socials"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </Link>
              <Link
                href="/socials"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </Link>
              <Link
                href="/socials"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground text-center sm:text-left">
              © {new Date().getFullYear()} Hominid Photography. All rights
              reserved. | Photographer: Elias Cheruiyot
            </p>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Theme:</span>
              <ThemeSwitcher />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

