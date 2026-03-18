import { useState, useEffect } from "react";
import { Search, Filter, Shirt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ProductCard from "@/components/ProductCard";
import { useProductImageFilter } from "@/hooks/use-product-image-filter";

const KidsAccessories = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data: classificationData, error: classError } = await supabase
        .from('product_classifications')
        .select('product_id')
        .eq('classification_id', '2e18dd71-bf52-4260-ac4e-3a377433705b');

      if (classError) throw classError;
      if (!classificationData || classificationData.length === 0) { setProducts([]); return; }

      const productIds = classificationData.map(item => item.product_id);
      const { data, error } = await supabase
        .from('products')
        .select(`*, product_images(image_url)`)
        .in('id', productIds)
        .eq('is_deleted', false);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({ title: "Error", description: "Failed to load products", variant: "destructive" });
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
            <Shirt className="h-8 w-8 text-primary" /> Kids Accessories
          </h1>
          <p className="text-muted-foreground">Stylish accessories to complete your child's look!</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input placeholder="Search accessories..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" /> Filter
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">No products found</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} badgeLabel="Accessories" badgeEmoji="✨" />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default KidsAccessories;
