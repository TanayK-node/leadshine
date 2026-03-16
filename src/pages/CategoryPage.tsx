import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCard from "@/components/ProductCard";

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

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) fetchCategoryAndProducts();
  }, [slug]);

  const fetchCategoryAndProducts = async () => {
    setLoading(true);
    try {
      const { data: categoryData, error: categoryError } = await supabase
        .from("classifications")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (categoryError) throw categoryError;
      if (!categoryData) { navigate("/404"); return; }

      setCategory(categoryData);

      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select(`*, product_images (image_url, display_order)`)
        .eq("classification_id", categoryData.id)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

      if (productsError) throw productsError;
      setProducts(productsData || []);
    } catch (error) {
      console.error("Error fetching category data:", error);
      toast({ title: "Error", description: "Failed to load category", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-6 w-96 mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-xl" />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!category) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
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

        {products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-muted-foreground">No products found in this category.</p>
            <Button onClick={() => navigate("/shop-all")} className="mt-4">
              Browse All Products
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default CategoryPage;
