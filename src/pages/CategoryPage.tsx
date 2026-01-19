import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Grid, List } from "lucide-react";
import { LazyImage } from "@/components/LazyImage";

interface Product {
  id: string;
  "Material Desc": string | null;
  "MRP (INR)": number | null;
  discount_price: number | null;
  image_url: string | null;
  "Brand Desc": string | null;
  QTY: number | null;
  product_images?: { image_url: string; display_order: number }[];
}

interface Category {
  id: string;
  name: string;
  description: string | null;
  slug: string | null;
  emoji: string | null;
}

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addToCart } = useCart();
  
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    if (slug) {
      fetchCategoryAndProducts();
    }
  }, [slug]);

  const fetchCategoryAndProducts = async () => {
    setLoading(true);
    try {
      // Fetch category by slug
      const { data: categoryData, error: categoryError } = await supabase
        .from("classifications")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (categoryError) throw categoryError;
      
      if (!categoryData) {
        navigate("/404");
        return;
      }

      setCategory(categoryData);

      // Fetch products for this category
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select(`
          id,
          "Material Desc",
          "MRP (INR)",
          discount_price,
          image_url,
          "Brand Desc",
          QTY,
          product_images (image_url, display_order)
        `)
        .eq("classification_id", categoryData.id)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

      if (productsError) throw productsError;
      setProducts(productsData || []);
    } catch (error) {
      console.error("Error fetching category data:", error);
      toast({
        title: "Error",
        description: "Failed to load category",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Please login",
        description: "You need to be logged in to add items to cart",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }
    addToCart(productId);
  };

  const getProductImage = (product: Product) => {
    if (product.product_images && product.product_images.length > 0) {
      const sorted = [...product.product_images].sort((a, b) => a.display_order - b.display_order);
      return sorted[0].image_url;
    }
    return product.image_url || "/placeholder.svg";
  };

  const getDisplayPrice = (product: Product) => {
    return product.discount_price || product["MRP (INR)"] || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-6 w-96 mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-xl" />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!category) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/30">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Category Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
            {category.emoji} {category.name}
          </h1>
          {category.description && (
            <p className="text-muted-foreground text-lg">{category.description}</p>
          )}
          <p className="text-sm text-muted-foreground mt-2">
            {products.length} product{products.length !== 1 ? "s" : ""} found
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex justify-end mb-4">
          <div className="flex border rounded-lg overflow-hidden">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Products Grid/List */}
        {products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-muted-foreground">No products found in this category.</p>
            <Button onClick={() => navigate("/shop-all")} className="mt-4">
              Browse All Products
            </Button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <Card 
                key={product.id} 
                className="group overflow-hidden border-2 border-foreground/10 hover:border-primary/50 transition-all cursor-pointer hover:shadow-lg"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <LazyImage
                    src={getProductImage(product)}
                    alt={product["Material Desc"] || "Product"}
                    className="w-full h-full group-hover:scale-105 transition-transform"
                  />
                  {product.QTY !== null && product.QTY <= 5 && product.QTY > 0 && (
                    <Badge className="absolute top-2 right-2 bg-orange-500">
                      Low Stock
                    </Badge>
                  )}
                  {product.QTY === 0 && (
                    <Badge className="absolute top-2 right-2 bg-destructive">
                      Out of Stock
                    </Badge>
                  )}
                </div>
                <CardContent className="p-3">
                  <p className="text-xs text-muted-foreground mb-1">
                    {product["Brand Desc"] || "Leadshine"}
                  </p>
                  <h3 className="font-medium text-sm line-clamp-2 mb-2">
                    {product["Material Desc"] || "Product"}
                  </h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-primary">
                        ₹{getDisplayPrice(product).toLocaleString()}
                      </span>
                      {product.discount_price && product["MRP (INR)"] && product.discount_price < product["MRP (INR)"] && (
                        <span className="text-xs text-muted-foreground line-through ml-2">
                          ₹{product["MRP (INR)"].toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="w-full mt-2"
                    disabled={product.QTY === 0}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product.id);
                    }}
                  >
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <Card 
                key={product.id}
                className="flex overflow-hidden border-2 border-foreground/10 hover:border-primary/50 transition-all cursor-pointer"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <div className="w-32 h-32 flex-shrink-0 bg-muted">
                  <LazyImage
                    src={getProductImage(product)}
                    alt={product["Material Desc"] || "Product"}
                    className="w-full h-full"
                  />
                </div>
                <CardContent className="flex-1 p-4 flex flex-col justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {product["Brand Desc"] || "Leadshine"}
                    </p>
                    <h3 className="font-medium text-base">
                      {product["Material Desc"] || "Product"}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div>
                      <span className="font-bold text-primary text-lg">
                        ₹{getDisplayPrice(product).toLocaleString()}
                      </span>
                      {product.discount_price && product["MRP (INR)"] && product.discount_price < product["MRP (INR)"] && (
                        <span className="text-sm text-muted-foreground line-through ml-2">
                          ₹{product["MRP (INR)"].toLocaleString()}
                        </span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      disabled={product.QTY === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product.id);
                      }}
                    >
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      Add to Cart
                    </Button>
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

export default CategoryPage;
