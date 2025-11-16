import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const ShopByAge = () => {
  const navigate = useNavigate();
  const [ageGroups, setAgeGroups] = useState([
    { 
      range: "0-2 Years", 
      description: "Infants & Toddlers", 
      color: "bg-toy-pink/10 border-toy-pink/20", 
      count: 0,
      emoji: "🍼",
      image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=300&fit=crop"
    },
    { 
      range: "3-5 Years", 
      description: "Preschoolers", 
      color: "bg-toy-blue/10 border-toy-blue/20", 
      count: 0,
      emoji: "🎨",
      image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=300&fit=crop"
    },
    { 
      range: "6-8 Years", 
      description: "Early School", 
      color: "bg-toy-yellow/10 border-toy-yellow/20", 
      count: 0,
      emoji: "📚",
      image: "https://images.unsplash.com/photo-1560785477-d43d2b34e0df?w=400&h=300&fit=crop"
    },
    { 
      range: "9-12 Years", 
      description: "Middle School", 
      color: "bg-primary/10 border-primary/20", 
      count: 0,
      emoji: "🎮",
      image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop"
    },
    { 
      range: "13+ Years", 
      description: "Teens & Adults", 
      color: "bg-accent/10 border-accent/20", 
      count: 0,
      emoji: "🎯",
      image: "https://images.unsplash.com/photo-1509350007205-187c66b38e85?w=400&h=300&fit=crop"
    },
  ]);

  useEffect(() => {
    fetchAgeCounts();
  }, []);

  const fetchAgeCounts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('age_range');

      if (error) throw error;

      // Count products for each age group
      const updatedGroups = ageGroups.map(group => ({
        ...group,
        count: data?.filter(p => p.age_range === group.range).length || 0
      }));

      setAgeGroups(updatedGroups);
    } catch (error) {
      console.error('Error fetching age counts:', error);
    }
  };

  const handleAgeClick = (ageRange: string) => {
    // Navigate to shop all products with age filter
    navigate(`/shop-all?age=${encodeURIComponent(ageRange)}`);
  };

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-display font-bold text-foreground mb-4">
            Shop by Age Group
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find the perfect toys for every stage of development. Age-appropriate selections ensure safety and engagement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {ageGroups.map((group, index) => (
            <div 
              key={index} 
              className="group bg-white rounded-3xl border-4 border-foreground shadow-sticker hover:shadow-glow hover:scale-105 hover:-rotate-1 transition-all duration-300 overflow-hidden cursor-pointer"
              onClick={() => handleAgeClick(group.range)}
            >
              <div className="relative p-4">
                <img
                  src={group.image}
                  alt={`${group.range} - ${group.description}`}
                  className="w-full h-40 object-cover rounded-2xl border-2 border-foreground group-hover:animate-wiggle"
                />
                <div className="absolute top-6 left-6 bg-accent text-accent-foreground font-bold text-2xl px-3 py-2 rounded-full border-2 border-foreground shadow-lg">
                  {group.emoji}
                </div>
              </div>

              <div className="px-6 pb-6">
                <div className="text-2xl font-display font-bold text-primary mb-1">
                  {group.range}
                </div>
                <div className="text-sm font-display font-semibold text-foreground mb-3">
                  {group.description}
                </div>
                {group.count > 0 && (
                  <div className="text-xs font-display text-muted-foreground bg-accent/20 rounded-full py-1 px-3 inline-block border-2 border-foreground mb-3">
                    {group.count} {group.count === 1 ? 'product' : 'products'}
                  </div>
                )}
                <Button className="w-full rounded-full h-10 font-display font-bold text-sm shadow-lg hover-pop border-2 border-foreground">
                  Explore 🎈
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShopByAge;