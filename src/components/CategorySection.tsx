import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import blocksImage from "@/assets/blocks-category.jpg";
import plushImage from "@/assets/plush-category.jpg";
import vehiclesImage from "@/assets/vehicles-category.jpg";

const categories = [
  {
    title: "School Essentials",
    description: "Everything your child needs for learning and school",
    image: blocksImage,
    color: "bg-toy-blue",
    itemCount: "150+ items",
    link: "/school-essentials"
  },
  {
    title: "Toys & Games",
    description: "Fun and engaging toys for endless entertainment",
    image: vehiclesImage,
    color: "bg-toy-yellow",
    itemCount: "200+ items",
    link: "/toys-and-games"
  },
  {
    title: "Accessories",
    description: "Stylish and practical accessories for kids",
    image: plushImage,
    color: "bg-toy-pink",
    itemCount: "120+ items",
    link: "/kids-accessories"
  },
  {
    title: "Art & Crafts",
    description: "Creative supplies to inspire young artists",
    image: blocksImage,
    color: "bg-primary/10",
    itemCount: "180+ items",
    link: "/art-and-crafts"
  },
];

const CategorySection = () => {
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
              key={index}
              to={category.link}
              className="group bg-white rounded-3xl border-3 sm:border-4 border-foreground shadow-sticker hover:shadow-glow hover:scale-105 hover:-rotate-1 transition-all duration-300 overflow-hidden cursor-pointer"
            >
              <div className="relative p-3 sm:p-4">
                <img
                  src={category.image}
                  alt={`${category.title} - wholesale toys category`}
                  className="w-full h-48 sm:h-56 md:h-64 object-cover rounded-2xl border-2 border-foreground group-hover:animate-wiggle"
                />
                
                {/* Category badge */}
                <div className={`absolute top-5 sm:top-6 left-5 sm:left-6 ${category.color} text-foreground px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold border-2 border-foreground shadow-lg`}>
                  {category.itemCount}
                </div>
              </div>

              <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                <h3 className="text-xl sm:text-2xl font-display font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {category.title}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 font-display">
                  {category.description}
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
          <Button size="lg" className="rounded-full h-12 sm:h-14 px-8 sm:px-10 font-display font-bold text-base sm:text-lg shadow-glow hover-pop border-3 sm:border-4 border-foreground">
            View All Categories 🎯
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;