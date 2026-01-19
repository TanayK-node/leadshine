import { useState, useEffect } from "react";
import { ShoppingCart, Heart, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { LazyImage } from "@/components/LazyImage";
import type { Tables } from "@/integrations/supabase/types";

type Product = Tables<"products"> & {
  product_images?: Array<{ image_url: string }>;
};

const ShopAllProducts = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { addToCart, isInCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [sortBy, setSortBy] = useState("name");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterAge, setFilterAge] = useState(searchParams.get("age") || "all");
  const [priceFilter, setPriceFilter] = useState(searchParams.get("price") || "all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

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
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            product_images(image_url)
          `)
          .eq('is_deleted', false)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProducts(data || []);
        setFilteredProducts(data || []);
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

    fetchProducts();
  }, [toast]);

  // Update filters when URL params change
  useEffect(() => {
    const search = searchParams.get("search") || "";
    const age = searchParams.get("age") || "all";
    const price = searchParams.get("price") || "all";
    
    setSearchTerm(search);
    setFilterAge(age);
    setPriceFilter(price);
  }, [searchParams]);

  useEffect(() => {
    let filtered = products;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product["Material Desc"]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product["Brand Desc"]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product["Funskool Code"]?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (filterCategory !== "all") {
      filtered = filtered.filter(product =>
        product["Super Category Description"]?.toLowerCase() === filterCategory.toLowerCase()
      );
    }

    // Age filter
    if (filterAge !== "all") {
      filtered = filtered.filter(product =>
        product.age_range === filterAge
      );
    }

    // Price filter
    if (priceFilter !== "all") {
      filtered = filtered.filter(product => {
        const price = product["MRP (INR)"] || 0;
        switch (priceFilter) {
          case "0-500":
            return price < 500;
          case "500-1000":
            return price >= 500 && price < 1000;
          case "1000-2000":
            return price >= 1000 && price < 2000;
          case "2000-5000":
            return price >= 2000 && price < 5000;
          case "5000+":
            return price >= 5000;
          default:
            return true;
        }
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return (a["MRP (INR)"] || 0) - (b["MRP (INR)"] || 0);
        case "price-high":
          return (b["MRP (INR)"] || 0) - (a["MRP (INR)"] || 0);
        case "name":
          return (a["Material Desc"] || "").localeCompare(b["Material Desc"] || "");
        case "newest":
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  }, [products, searchTerm, sortBy, filterCategory, filterAge, priceFilter]);

  const categories = Array.from(new Set(products.map(p => p["Super Category Description"]).filter(Boolean)));
  const ageRanges = ["0-2 Years", "3-5 Years", "6-8 Years", "9-12 Years", "13+ Years"];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-80 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">All Products</h1>
            <p className="text-muted-foreground">
              Showing {filteredProducts.length} of {products.length} products
              {searchTerm && ` for "${searchTerm}"`}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 hidden">
          <p className="text-muted-foreground">
            Showing {filteredProducts.length} of {products.length} products
          </p>
        </div>

        {/* Products Grid */}
        <div className={viewMode === "grid" 
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          : "space-y-4"
        }>
          {filteredProducts.map((product) => (
            viewMode === "grid" ? (
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
                  {product.QTY && product.QTY <= 3 && product.QTY > 0 && (
                    <Badge className="absolute top-6 right-6 bg-secondary text-secondary-foreground font-bold text-xs px-3 py-1 shadow-lg border-2 border-foreground">
                      🔥 Low Stock
                    </Badge>
                  )}
                  
                  {/* Quick Wishlist */}
                  <Button 
                    size="icon" 
                    className="absolute top-6 left-6 h-10 w-10 rounded-full bg-accent hover:bg-accent/80 border-2 border-foreground shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
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
            ) : (
              <Card key={product.id} className="group hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="flex items-center gap-4 p-4">
                    <Link to={`/product/${product.id}`}>
                      {product.product_images && product.product_images.length > 0 ? (
                        <LazyImage 
                          src={product.product_images[0].image_url} 
                          alt={product["Material Desc"] || "Product"}
                          className="w-24 h-24 rounded cursor-pointer"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-muted flex items-center justify-center rounded cursor-pointer">
                          <span className="text-xs text-muted-foreground">No Image</span>
                        </div>
                      )}
                    </Link>
                    
                    <div className="flex-1">
                      <Link to={`/product/${product.id}`}>
                        <h3 className="font-semibold text-foreground hover:text-primary transition-colors cursor-pointer">
                          {product["Material Desc"]}
                        </h3>
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {product["Brand Desc"]} {product.SubBrand && `• ${product.SubBrand}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {product["Super Category Description"]} • SKU: {product["Funskool Code"]}
                      </p>
                      {product.age_range && (
                        <p className="text-xs text-muted-foreground">
                          Age: {product.age_range}
                        </p>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <div className="flex flex-col items-end mb-2">
                        {product.discount_price ? (
                          <>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-primary">₹{product.discount_price}</span>
                              <Badge variant="destructive" className="text-xs">
                                {Math.round((1 - product.discount_price / product["MRP (INR)"]) * 100)}% OFF
                              </Badge>
                            </div>
                            <span className="text-sm text-muted-foreground line-through">₹{product["MRP (INR)"]}</span>
                          </>
                        ) : (
                          <p className="text-lg font-bold text-primary">₹{product["MRP (INR)"]}</p>
                        )}
                        {product.QTY && product.QTY <= 3 && product.QTY > 0 && (
                          <Badge className="bg-orange-500 text-white text-xs mt-1">
                            Low in Stock
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button 
                          size="sm"
                          onClick={() => handleAddToCart(product.id)}
                          disabled={!product.QTY || product.QTY === 0}
                        >
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          {!product.QTY || product.QTY === 0 ? "Out of Stock" : "Add to Cart"}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No products found matching your criteria.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ShopAllProducts;