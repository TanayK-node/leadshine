import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";

const FeaturedProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images(image_url)
        `)
        .limit(4);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to load featured products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please login to add items to cart",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      await addToCart(productId);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleAddToWishlist = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please login to add items to wishlist",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      await addToWishlist(productId);
    } catch (error) {
      console.error('Error adding to wishlist:', error);
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center">Loading featured products...</div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
            Featured Products
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover our most popular wholesale toys, carefully selected for their 
            quality, safety, and educational value.
          </p>
        </div>

        {/* Products grid - Gamified Card Design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <div 
              key={product.id} 
              className="group bg-white rounded-3xl border-4 border-foreground shadow-sticker hover:shadow-glow hover:scale-105 hover:-rotate-1 transition-all duration-300 overflow-hidden"
            >
              <div className="relative p-4">
                <Link to={`/product/${product.id}`}>
                  {product.product_images && product.product_images.length > 0 ? (
                    <img
                      src={product.product_images[0].image_url}
                      alt={product["Material Desc"] || product["Brand Desc"] || "Product"}
                      className="w-full h-52 object-cover rounded-2xl border-2 border-foreground group-hover:animate-wiggle"
                    />
                  ) : (
                    <div className="w-full h-52 bg-muted rounded-2xl border-2 border-foreground flex items-center justify-center">
                      <span className="text-muted-foreground font-display">No Image</span>
                    </div>
                  )}
                </Link>
                
                {/* Badges */}
                <Badge className="absolute top-6 left-6 bg-accent text-accent-foreground font-bold text-xs px-3 py-1 shadow-lg border-2 border-foreground">
                  ⭐ Featured
                </Badge>
                {product.QTY && product.QTY <= 3 && product.QTY > 0 && (
                  <Badge className="absolute top-6 right-6 bg-secondary text-secondary-foreground font-bold text-xs px-3 py-1 shadow-lg border-2 border-foreground">
                    🔥 Low Stock
                  </Badge>
                )}
                
                {/* Quick Wishlist */}
                <Button 
                  size="icon"
                  onClick={(e) => handleAddToWishlist(product.id, e)}
                  className={`absolute top-16 right-6 h-10 w-10 rounded-full ${
                    isInWishlist(product.id) 
                      ? 'bg-destructive hover:bg-destructive/80' 
                      : 'bg-accent hover:bg-accent/80'
                  } border-2 border-foreground shadow-lg opacity-0 group-hover:opacity-100 transition-opacity`}
                >
                  <Heart className={`h-5 w-5 ${
                    isInWishlist(product.id) 
                      ? 'fill-white text-white' 
                      : 'text-white'
                  }`} />
                </Button>
              </div>

              <div className="px-6 pb-6">
                <div className="text-xs font-bold text-muted-foreground mb-1 font-display uppercase">
                  {product["Brand Desc"]} {product.SubBrand && `• ${product.SubBrand}`}
                </div>
                
                <Link to={`/product/${product.id}`}>
                  <h3 className="font-display font-bold text-foreground text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {product["Material Desc"]}
                  </h3>
                </Link>
                
                {product.age_range && (
                  <Badge variant="outline" className="text-xs mb-3 font-display border-2">
                    Age: {product.age_range}
                  </Badge>
                )}
                
                {/* Price */}
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  {product.discount_price ? (
                    <>
                      <span className="text-base font-display text-muted-foreground line-through">
                        ₹{product["MRP (INR)"]}
                      </span>
                      <span className="text-2xl font-display font-bold text-primary">
                        ₹{product.discount_price}
                      </span>
                      <Badge className="bg-destructive text-destructive-foreground font-bold text-xs border-2 border-foreground">
                        {Math.round((1 - product.discount_price / product["MRP (INR)"]) * 100)}% OFF
                      </Badge>
                    </>
                  ) : (
                    <span className="text-2xl font-display font-bold text-primary">
                      ₹{product["MRP (INR)"]}
                    </span>
                  )}
                </div>

                {/* Add to Cart Button */}
                <Button 
                  onClick={() => handleAddToCart(product.id)}
                  className="w-full rounded-full h-12 font-display font-bold text-base shadow-lg hover-pop border-2 border-foreground"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart 🛒
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <Link to="/shop-all">
            <Button size="lg" className="rounded-full h-14 px-10 font-display font-bold text-lg shadow-glow hover-pop border-4 border-foreground">
              View All Products 🚀
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
