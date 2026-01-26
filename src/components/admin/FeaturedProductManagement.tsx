import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Search, Star, TrendingUp, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LazyImage } from "@/components/LazyImage";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Product {
  id: string;
  "Material Desc": string | null;
  "Brand Desc": string | null;
  "MRP (INR)": number | null;
  is_featured: boolean | null;
  is_trending: boolean | null;
  product_images: { image_url: string }[];
}

export const FeaturedProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(`
          id,
          "Material Desc",
          "Brand Desc",
          "MRP (INR)",
          is_featured,
          is_trending,
          product_images(image_url)
        `)
        .eq("is_deleted", false)
        .order("Material Desc");

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFeatured = async (productId: string, currentValue: boolean | null) => {
    const featuredCount = products.filter(p => p.is_featured).length;
    
    if (!currentValue && featuredCount >= 4) {
      toast.error("Maximum 4 featured products allowed. Please unselect one first.");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("products")
        .update({ is_featured: !currentValue })
        .eq("id", productId);

      if (error) throw error;

      setProducts(products.map(p => 
        p.id === productId ? { ...p, is_featured: !currentValue } : p
      ));
      toast.success(currentValue ? "Removed from featured" : "Added to featured");
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleTrending = async (productId: string, currentValue: boolean | null) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("products")
        .update({ is_trending: !currentValue })
        .eq("id", productId);

      if (error) throw error;

      setProducts(products.map(p => 
        p.id === productId ? { ...p, is_trending: !currentValue } : p
      ));
      toast.success(currentValue ? "Removed from trending" : "Added to trending");
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product["Material Desc"]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product["Brand Desc"]?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const featuredProducts = products.filter(p => p.is_featured);
  const trendingProducts = products.filter(p => p.is_trending);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-r from-yellow-100 to-yellow-50 border-yellow-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-600" />
              Featured Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-700">{featuredProducts.length}/4</div>
            <p className="text-xs text-yellow-600">Displayed on homepage</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-100 to-orange-50 border-orange-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-orange-600" />
              Trending Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">{trendingProducts.length}</div>
            <p className="text-xs text-orange-600">Displayed on trending page</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Management Card */}
      <Card>
        <CardHeader>
          <CardTitle>Product Display Management</CardTitle>
          <CardDescription>
            Select which products appear on the homepage (max 4) and trending page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Products Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Image</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-center w-32">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      Featured
                    </div>
                  </TableHead>
                  <TableHead className="text-center w-32">
                    <div className="flex items-center justify-center gap-1">
                      <TrendingUp className="h-4 w-4 text-orange-500" />
                      Trending
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No products found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        {product.product_images && product.product_images.length > 0 ? (
                          <LazyImage
                            src={product.product_images[0].image_url}
                            alt={product["Material Desc"] || "Product"}
                            className="w-12 h-12 rounded-md object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center text-xs">
                            No img
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {product["Material Desc"] || "Unnamed Product"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {product["Brand Desc"] || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        ₹{product["MRP (INR)"] || 0}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center">
                          <Checkbox
                            checked={product.is_featured || false}
                            onCheckedChange={() => handleToggleFeatured(product.id, product.is_featured)}
                            disabled={saving}
                            className="data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center">
                          <Checkbox
                            checked={product.is_trending || false}
                            onCheckedChange={() => handleToggleTrending(product.id, product.is_trending)}
                            disabled={saving}
                            className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
