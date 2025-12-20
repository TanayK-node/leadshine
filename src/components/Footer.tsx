import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Category {
  id: string;
  name: string;
  slug: string | null;
  show_in_navbar: boolean | null;
}

const Footer = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("classifications")
        .select("id, name, slug, show_in_navbar")
        .eq("show_in_navbar", true)
        .order("display_order", { ascending: true })
        .limit(5);

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-12 sm:py-16">
        {/* Main footer content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 mb-8 sm:mb-12">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-primary rounded-xl p-2">
                <span className="text-primary-foreground font-display font-bold text-lg sm:text-xl">
                  Leadshine
                </span>
              </div>
            </div>
            <p className="text-background/80 leading-relaxed text-sm sm:text-base">
              Your trusted partner for premium wholesale toys. We provide safe, 
              educational, and fun toys for retailers and educators worldwide.
            </p>
            <div className="flex space-x-3">
              <Button size="icon" variant="ghost" className="text-background hover:bg-background/10 h-9 w-9 sm:h-10 sm:w-10">
                <Facebook className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <Button size="icon" variant="ghost" className="text-background hover:bg-background/10 h-9 w-9 sm:h-10 sm:w-10">
                <Instagram className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <Button size="icon" variant="ghost" className="text-background hover:bg-background/10 h-9 w-9 sm:h-10 sm:w-10">
                <Twitter className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <Button size="icon" variant="ghost" className="text-background hover:bg-background/10 h-9 w-9 sm:h-10 sm:w-10">
                <Youtube className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-display font-semibold">Shop</h3>
            <ul className="space-y-2">
              <li><a href="/shop-all" className="text-background/80 hover:text-background transition-colors text-sm sm:text-base">Shop All Products</a></li>
              <li><a href="/new-arrivals" className="text-background/80 hover:text-background transition-colors text-sm sm:text-base">New Arrivals</a></li>
              <li><a href="/trending" className="text-background/80 hover:text-background transition-colors text-sm sm:text-base">Trending</a></li>
              {categories.map((category) => (
                <li key={category.id}>
                  <a 
                    href={`/category/${category.slug}`} 
                    className="text-background/80 hover:text-background transition-colors text-sm sm:text-base"
                  >
                    {category.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-2">
            <h3 className="text-base sm:text-lg font-display font-semibold">Contact Us</h3>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-background/80 text-sm sm:text-base">+91 9820142014</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-background/80 text-sm sm:text-base break-all">leadshinemarketing@gmail.com</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                <span className="text-background/80 text-sm sm:text-base">46/369 motilal nagar, 1, Rd Number 10, Siddharth Nagar, Goregaon West, Mumbai, Maharashtra 400104</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="pt-6 sm:pt-8 border-t border-background/20">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-background/60 text-xs sm:text-sm text-center md:text-left">
              © 2024 Leadshine. All rights reserved.
            </div>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-6 text-xs sm:text-sm">
              <a href="/about-us" className="text-background/60 hover:text-background transition-colors">
                About Us
              </a>
              <a href="/privacy-policy" className="text-background/60 hover:text-background transition-colors">
                Privacy
              </a>
              <a href="/terms-of-service" className="text-background/60 hover:text-background transition-colors">
                Terms
              </a>
              <a href="/refund-policy" className="text-background/60 hover:text-background transition-colors">
                Refund
              </a>
              <a href="/shipping-policy" className="text-background/60 hover:text-background transition-colors">
                Shipping
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
