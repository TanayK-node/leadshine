import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Filter, Heart, ShoppingCart, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import { LazyImage } from "@/components/LazyImage";

const Trending = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { addToCart, isInCart } = useCart();

  const handleAddToCart = async (productId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast({
        title: "Login required",
        description: "Please login to add items to cart",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    try {
      await addToCart(productId);
    } catch (error) {
      // Error already handled in context
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      // First try to get trending products marked by admin
      let { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images(image_url)
        `)
        .eq('is_deleted', false)
        .eq('is_trending', true);

      if (error) throw error;

      // If no trending products marked, fall back to first 20 products
      if (!data || data.length === 0) {
        const fallback = await supabase
          .from('products')
          .select(`
            *,
            product_images(image_url)
          `)
          .eq('is_deleted', false)
          .limit(20);
        
        if (fallback.error) throw fallback.error;
        data = fallback.data;
      }

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product["Brand Desc"]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product["Material Desc"]?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="h-8 w-8 text-primary" />
            Trending Products
          </h1>
          <p className="text-muted-foreground">Most popular toys and games right now!</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">No products found</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <div 
                key={product.id} 
                className="group bg-white rounded-3xl border-4 border-foreground shadow-sticker hover:shadow-glow hover:scale-105 hover:-rotate-1 transition-all duration-300 overflow-hidden"
              >
                <div className="relative p-4">
                  <Link to={`/product/${product.id}`}>
                    {product.product_images && product.product_images.length > 0 ? (
                      <LazyImage
                        src={product.product_images[0].image_url}
                        alt={product["Material Desc"] || "Product"}
                        className="w-full h-52 rounded-2xl border-2 border-foreground group-hover:animate-wiggle"
                      />
                    ) : (
                      <div className="w-full h-52 bg-muted rounded-2xl border-2 border-foreground flex items-center justify-center">
                        <span className="text-muted-foreground font-display">No Image</span>
                      </div>
                    )}
                  </Link>
                  
                  {/* Badges */}
                  <Badge className="absolute top-6 left-6 bg-accent text-accent-foreground font-bold text-xs px-3 py-1 shadow-lg border-2 border-foreground">
                    ⭐ Trending
                  </Badge>
                  {product.QTY && product.QTY <= 3 && product.QTY > 0 && (
                    <Badge className="absolute top-6 right-6 bg-secondary text-secondary-foreground font-bold text-xs px-3 py-1 shadow-lg border-2 border-foreground">
                      🔥 Low Stock
                    </Badge>
                  )}
                  
                  {/* Quick Wishlist */}
                  <Button 
                    size="icon" 
                    className="absolute top-16 right-6 h-10 w-10 rounded-full bg-accent hover:bg-accent/80 border-2 border-foreground shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Heart className="h-5 w-5 fill-white text-white" />
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
                        <Badge className="bg-primary text-primary-foreground font-bold text-xs border-2 border-foreground">
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
                  {isInCart(product.id) ? (
                    <Button 
                      className="w-full rounded-full h-12 font-display font-bold text-base shadow-lg hover-pop border-2 border-foreground" 
                      onClick={() => navigate('/cart')}
                      variant="secondary"
                      disabled={!product.QTY || product.QTY === 0}
                    >
                      Go to Cart 🛒
                    </Button>
                  ) : (
                    <Button 
                      className="w-full rounded-full h-12 font-display font-bold text-base shadow-lg hover-pop border-2 border-foreground" 
                      onClick={() => handleAddToCart(product.id)}
                      disabled={!product.QTY || product.QTY === 0}
                    >
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      {!product.QTY || product.QTY === 0 ? "Out of Stock 🚫" : "Add to Cart 🛒"}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Trending;
