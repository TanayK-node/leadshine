import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { LazyImage } from "@/components/LazyImage";

const FeaturedProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { addToCart, isInCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      // First try to get featured products
      let { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images(image_url)
        `)
        .eq('is_deleted', false)
        .eq('is_featured', true)
        .limit(4);

      if (error) throw error;

      // If no featured products, fall back to first 4 products
      if (!data || data.length === 0) {
        const fallback = await supabase
          .from('products')
          .select(`
            *,
            product_images(image_url)
          `)
          .eq('is_deleted', false)
          .limit(4);
        
        if (fallback.error) throw fallback.error;
        data = fallback.data;
      }

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
    <section className="py-12 sm:py-16 md:py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mb-3 sm:mb-4">
            Featured Products
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Discover our most popular wholesale toys, carefully selected for their 
            quality, safety, and educational value.
          </p>
        </div>

        {/* Products grid - Gamified Card Design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {products.map((product) => (
            <div 
              key={product.id} 
              className="group bg-white rounded-3xl border-3 sm:border-4 border-foreground shadow-sticker hover:shadow-glow hover:scale-105 hover:-rotate-1 transition-all duration-300 overflow-hidden"
            >
              <div className="relative p-3 sm:p-4">
                <Link to={`/product/${product.id}`}>
                  {product.product_images && product.product_images.length > 0 ? (
                    <LazyImage
                      src={product.product_images[0].image_url}
                      alt={product["Material Desc"] || product["Brand Desc"] || "Product"}
                      className="w-full h-44 sm:h-52 rounded-2xl border-2 border-foreground group-hover:animate-wiggle"
                    />
                  ) : (
                    <div className="w-full h-44 sm:h-52 bg-muted rounded-2xl border-2 border-foreground flex items-center justify-center">
                      <span className="text-muted-foreground font-display text-sm">No Image</span>
                    </div>
                  )}
                </Link>
                
                {/* Badges */}
                <Badge className="absolute top-5 sm:top-6 left-5 sm:left-6 bg-accent text-accent-foreground font-bold text-[10px] sm:text-xs px-2 sm:px-3 py-1 shadow-lg border-2 border-foreground">
                  ⭐ Featured
                </Badge>
                {product.QTY && product.QTY <= 3 && product.QTY > 0 && (
                  <Badge className="absolute top-5 sm:top-6 right-5 sm:right-6 bg-secondary text-secondary-foreground font-bold text-[10px] sm:text-xs px-2 sm:px-3 py-1 shadow-lg border-2 border-foreground">
                    🔥 Low Stock
                  </Badge>
                )}
                
                {/* Quick Wishlist */}
                <Button 
                  size="icon"
                  onClick={(e) => handleAddToWishlist(product.id, e)}
                  className={`absolute top-14 sm:top-16 right-5 sm:right-6 h-9 w-9 sm:h-10 sm:w-10 rounded-full ${
                    isInWishlist(product.id) 
                      ? 'bg-destructive hover:bg-destructive/80' 
                      : 'bg-accent hover:bg-accent/80'
                  } border-2 border-foreground shadow-lg opacity-0 group-hover:opacity-100 transition-opacity`}
                >
                  <Heart className={`h-4 w-4 sm:h-5 sm:w-5 ${
                    isInWishlist(product.id) 
                      ? 'fill-white text-white' 
                      : 'text-white'
                  }`} />
                </Button>
              </div>

              <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                <div className="text-[10px] sm:text-xs font-bold text-muted-foreground mb-1 font-display uppercase">
                  {product["Brand Desc"]} {product.SubBrand && `• ${product.SubBrand}`}
                </div>
                
                <Link to={`/product/${product.id}`}>
                  <h3 className="font-display font-bold text-foreground text-base sm:text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {product["Material Desc"]}
                  </h3>
                </Link>
                
                {product.age_range && (
                  <Badge variant="outline" className="text-[10px] sm:text-xs mb-3 font-display border-2">
                    Age: {product.age_range}
                  </Badge>
                )}
                
                {/* Price */}
                <div className="flex items-center gap-2 mb-3 sm:mb-4 flex-wrap">
                  {product.discount_price ? (
                    <>
                      <span className="text-sm sm:text-base font-display text-muted-foreground line-through">
                        ₹{product["MRP (INR)"]}
                      </span>
                      <span className="text-xl sm:text-2xl font-display font-bold text-primary">
                        ₹{product.discount_price}
                      </span>
                      <Badge className="bg-destructive text-destructive-foreground font-bold text-[10px] sm:text-xs border-2 border-foreground">
                        {Math.round((1 - product.discount_price / product["MRP (INR)"]) * 100)}% OFF
                      </Badge>
                    </>
                  ) : (
                    <span className="text-xl sm:text-2xl font-display font-bold text-primary">
                      ₹{product["MRP (INR)"]}
                    </span>
                  )}
                </div>

                {/* Add to Cart Button */}
                {isInCart(product.id) ? (
                  <Button 
                    onClick={() => navigate('/cart')}
                    variant="secondary"
                    className="w-full rounded-full h-10 sm:h-12 font-display font-bold text-sm sm:text-base shadow-lg hover-pop border-2 border-foreground"
                    disabled={!product.QTY || product.QTY === 0}
                  >
                    Go to Cart 🛒
                  </Button>
                ) : (
                  <Button 
                    onClick={() => handleAddToCart(product.id)}
                    className="w-full rounded-full h-10 sm:h-12 font-display font-bold text-sm sm:text-base shadow-lg hover-pop border-2 border-foreground"
                    disabled={!product.QTY || product.QTY === 0}
                  >
                    <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    <span className="hidden sm:inline">{!product.QTY || product.QTY === 0 ? "Out of Stock 🚫" : "Add to Cart 🛒"}</span>
                    <span className="sm:hidden">{!product.QTY || product.QTY === 0 ? "Out of Stock" : "Add 🛒"}</span>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-8 sm:mt-12">
          <Link to="/shop-all">
            <Button size="lg" className="rounded-full h-12 sm:h-14 px-8 sm:px-10 font-display font-bold text-base sm:text-lg shadow-glow hover-pop border-3 sm:border-4 border-foreground">
              View All Products 🚀
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
