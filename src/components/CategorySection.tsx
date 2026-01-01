import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import blocksImage from "@/assets/BoardGames-logo.jpg"
import plushImage from "@/assets/educational.jpg";
import vehiclesImage from "@/assets/actiontoys.avif";
import nerf from "@/assets/nerf.jpg";

interface Category {
  id: string;
  name: string;
  description: string | null;
  slug: string | null;
  emoji: string | null;
  image_url: string | null;
  display_order: number | null;
  show_in_navbar: boolean | null;
  item_count_label: string | null;
}

// Default images to use when no image_url is set
const defaultImages = [blocksImage, vehiclesImage, plushImage,nerf];
const defaultColors = ["bg-toy-blue", "bg-toy-yellow", "bg-toy-pink", "bg-primary/10"];

const CategorySection = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("classifications")
        .select("*")
        .eq("show_in_navbar", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryImage = (category: Category, index: number) => {
    if (category.image_url) return category.image_url;
    return defaultImages[index % defaultImages.length];
  };

  const getCategoryColor = (index: number) => {
    return defaultColors[index % defaultColors.length];
  };

  if (loading) {
    return (
      <section className="py-12 sm:py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <Skeleton className="h-12 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-96 rounded-3xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mb-3 sm:mb-4">
            Shop by Category
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Explore our carefully curated collections designed to inspire learning, 
            creativity, and endless fun for children of all ages.
          </p>
        </div>

        {/* Categories grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {categories.map((category, index) => (
            <Link 
              key={category.id}
              to={`/category/${category.slug}`}
              className="group bg-white rounded-3xl border-3 sm:border-4 border-foreground shadow-sticker hover:shadow-glow hover:scale-105 hover:-rotate-1 transition-all duration-300 overflow-hidden cursor-pointer"
            >
              <div className="relative p-3 sm:p-4">
                <img
                  src={getCategoryImage(category, index)}
                  alt={`${category.name} - wholesale toys category`}
                  className="w-full h-48 sm:h-56 md:h-64 object-cover rounded-2xl border-2 border-foreground group-hover:animate-wiggle"
                />
                
                {/* Category badge */}
                <div className={`absolute top-5 sm:top-6 left-5 sm:left-6 ${getCategoryColor(index)} text-foreground px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold border-2 border-foreground shadow-lg`}>
                  {category.item_count_label || "Browse"}
                </div>
              </div>

              <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                <h3 className="text-xl sm:text-2xl font-display font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {category.emoji} {category.name}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 font-display">
                  {category.description || `Explore our ${category.name} collection`}
                </p>
                
                <Button className="w-full rounded-full h-10 sm:h-12 font-display font-bold text-sm sm:text-base shadow-lg hover-pop border-2 border-foreground">
                  Explore Collection
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
                </Button>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12 sm:mt-16">
          <Link to="/shop-all">
            <Button size="lg" className="rounded-full h-12 sm:h-14 px-8 sm:px-10 font-display font-bold text-base sm:text-lg shadow-glow hover-pop border-3 sm:border-4 border-foreground">
              View All Products 🎯
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
