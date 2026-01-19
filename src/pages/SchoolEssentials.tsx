import { useState, useEffect } from "react";
import { Search, Filter, ShoppingCart, Heart, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import { LazyImage } from "@/components/LazyImage";

const SchoolEssentials = () => {
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
      // First get product IDs from junction table
      const { data: classificationData, error: classError } = await supabase
        .from('product_classifications')
        .select('product_id')
        .eq('classification_id', 'f6b5a09a-aa92-4e98-9c2b-25278c52a0eb');

      if (classError) throw classError;
      
      if (!classificationData || classificationData.length === 0) {
        setProducts([]);
        return;
      }

      const productIds = classificationData.map(item => item.product_id);

      // Then fetch the products
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images(image_url)
        `)
        .in('id', productIds)
        .eq('is_deleted', false);

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
            <BookOpen className="h-8 w-8 text-primary" />
            School Essentials
          </h1>
          <p className="text-muted-foreground">Everything your child needs for a successful school year!</p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search school supplies..."
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

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">No products found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="group hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <Link to={`/product/${product.id}`}>
                      {product.product_images && product.product_images.length > 0 ? (
                        <LazyImage
                          src={product.product_images[0].image_url}
                          alt={product["Material Desc"] || "Product"}
                          className="w-full h-48 group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                        />
                      ) : (
                        <div className="w-full h-48 bg-muted flex items-center justify-center">
                          <span className="text-muted-foreground">No Image</span>
                        </div>
                      )}
                    </Link>
                    <Badge className="absolute top-2 right-2 bg-accent">ESSENTIAL</Badge>
                    <div className="absolute top-2 left-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <Link to={`/product/${product.id}`}>
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors cursor-pointer">
                        {product["Material Desc"]}
                      </h3>
                    </Link>
                    <p className="text-sm text-muted-foreground mb-2">
                      {product["Brand Desc"]} {product.SubBrand && `• ${product.SubBrand}`}
                    </p>
                    <p className="text-xs text-muted-foreground mb-2">
                      SKU: {product["Funskool Code"]}
                    </p>
                    {product.age_range && (
                      <p className="text-xs text-muted-foreground mb-2">Age: {product.age_range}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">
                        ₹{product["MRP (INR)"]}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Stock: {product.QTY}
                      </span>
                    </div>
                    {isInCart(product.id) ? (
                      <Button 
                        className="w-full mt-3" 
                        size="sm" 
                        onClick={() => navigate('/cart')}
                        variant="secondary"
                        disabled={!product.QTY || product.QTY === 0}
                      >
                        Go to Cart 🛒
                      </Button>
                    ) : (
                      <Button 
                        className="w-full mt-3" 
                        size="sm" 
                        onClick={() => handleAddToCart(product.id)}
                        disabled={!product.QTY || product.QTY === 0}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {!product.QTY || product.QTY === 0 ? "Out of Stock" : "Add to Cart"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default SchoolEssentials;
