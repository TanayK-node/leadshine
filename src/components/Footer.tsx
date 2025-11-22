import { Button } from "@/components/ui/button";
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-16">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-primary rounded-xl p-2">
                <span className="text-primary-foreground font-display font-bold text-xl">
                  Leadshine
                </span>
              </div>
            </div>
            <p className="text-background/80 leading-relaxed">
              Your trusted partner for premium wholesale toys. We provide safe, 
              educational, and fun toys for retailers and educators worldwide.
            </p>
            <div className="flex space-x-3">
              <Button size="icon" variant="ghost" className="text-background hover:bg-background/10">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button size="icon" variant="ghost" className="text-background hover:bg-background/10">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button size="icon" variant="ghost" className="text-background hover:bg-background/10">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button size="icon" variant="ghost" className="text-background hover:bg-background/10">
                <Youtube className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          {/* <div className="space-y-4">
            <h3 className="text-lg font-display font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-background/80 hover:text-background transition-colors">About Us</a></li>
              <li><a href="#" className="text-background/80 hover:text-background transition-colors">Wholesale Pricing</a></li>
              <li><a href="#" className="text-background/80 hover:text-background transition-colors">Bulk Orders</a></li>
              <li><a href="#" className="text-background/80 hover:text-background transition-colors">Become a Retailer</a></li>
              <li><a href="#" className="text-background/80 hover:text-background transition-colors">Safety Standards</a></li>
              <li><a href="#" className="text-background/80 hover:text-background transition-colors">Quality Assurance</a></li>
            </ul>
          </div> */}

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-display font-semibold">Shop</h3>
            <ul className="space-y-2">
              <li><a href="/shop-all" className="text-background/80 hover:text-background transition-colors">Shop All Products</a></li>
              <li><a href="/new-arrivals" className="text-background/80 hover:text-background transition-colors">New Arrivals</a></li>
              <li><a href="/trending" className="text-background/80 hover:text-background transition-colors">Trending</a></li>
              <li><a href="/school-essentials" className="text-background/80 hover:text-background transition-colors">School Essentials</a></li>
              <li><a href="/toys-and-games" className="text-background/80 hover:text-background transition-colors">Toys & Games</a></li>
              <li><a href="/kids-accessories" className="text-background/80 hover:text-background transition-colors">Kids Accessories</a></li>
              <li><a href="/art-and-crafts" className="text-background/80 hover:text-background transition-colors">Art & Crafts</a></li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-display font-semibold">Contact Us</h3>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-primary" />
                <span className="text-background/80">+91 9820142014</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-background/80">leadshinemarketing@gmail.com</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                <span className="text-background/80">46/369 motilal nagar, 1, Rd Number 10, Siddharth Nagar, Goregaon West, Mumbai, Maharashtra 400104</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="pt-8 border-t border-background/20">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-background/60 text-sm">
              © 2024 Leadshine. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="/about-us" className="text-background/60 hover:text-background transition-colors">
                About Us
              </a>
              <a href="/privacy-policy" className="text-background/60 hover:text-background transition-colors">
                Privacy Policy
              </a>
              <a href="/terms-of-service" className="text-background/60 hover:text-background transition-colors">
                Terms of Service
              </a>
              <a href="/refund-policy" className="text-background/60 hover:text-background transition-colors">
                Refund Policy
              </a>
              <a href="/shipping-policy" className="text-background/60 hover:text-background transition-colors">
                Shipping Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;