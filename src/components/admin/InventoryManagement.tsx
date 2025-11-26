import { useState, useEffect } from "react";
import { AddProductDialog } from "./AddProductDialog";
import { EditProductDialog } from "./EditProductDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search, Package, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type Product = Tables<"products">;

export const InventoryManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [brandFilter, setBrandFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('Brand Desc');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async (productId: string, newQuantity: number) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ QTY: newQuantity })
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Stock updated successfully",
      });

      fetchProducts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update stock",
        variant: "destructive",
      });
    }
  };

  const openDeleteDialog = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    setIsDeleting(true);
    const productId = productToDelete.id;

    try {
      // Check if product is in any orders (cannot delete if so - preserves order history)
      const { data: orderItems, error: orderCheckError } = await supabase
        .from('order_items')
        .select('id')
        .eq('product_id', productId)
        .limit(1);

      if (orderCheckError) throw orderCheckError;

      if (orderItems && orderItems.length > 0) {
        toast({
          title: "Cannot Delete Product",
          description: "This product is referenced in existing orders and cannot be deleted. Consider setting stock to 0 to hide it from customers instead.",
          variant: "destructive",
        });
        setDeleteDialogOpen(false);
        setProductToDelete(null);
        setIsDeleting(false);
        return;
      }

      // Delete from wishlist first (foreign key constraint)
      await supabase
        .from('wishlist')
        .delete()
        .eq('product_id', productId);

      // Delete from cart_items (foreign key constraint)
      await supabase
        .from('cart_items')
        .delete()
        .eq('product_id', productId);

      // Delete product images from storage and database
      const { data: images } = await supabase
        .from('product_images')
        .select('image_url')
        .eq('product_id', productId);

      if (images) {
        for (const image of images) {
          const fileName = image.image_url.split('/').pop();
          if (fileName) {
            await supabase.storage
              .from('product-images')
              .remove([`${productId}/${fileName}`]);
          }
        }
      }

      // Delete product images records
      await supabase
        .from('product_images')
        .delete()
        .eq('product_id', productId);

      // Delete product classifications
      await supabase
        .from('product_classifications')
        .delete()
        .eq('product_id', productId);

      // Delete the product
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product deleted successfully",
      });

      setDeleteDialogOpen(false);
      setProductToDelete(null);
      fetchProducts();
    } catch (error: any) {
      console.error("Delete error:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to delete product",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product["Brand Desc"]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.SubBrand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product["Funskool Code"]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product["Material Desc"]?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBrand = brandFilter === "all" || product["Brand Desc"] === brandFilter;
    
    return matchesSearch && matchesBrand;
  });

  const uniqueBrands = Array.from(new Set(products.map(p => p["Brand Desc"]).filter(Boolean)));


  const getStockStatus = (quantity: number | null) => {
    if (!quantity || quantity === 0) return { label: "Out of Stock", color: "bg-red-100 text-red-800 border-red-200" };
    if (quantity < 10) return { label: "Low Stock", color: "bg-yellow-100 text-yellow-800 border-yellow-200" };
    return { label: "In Stock", color: "bg-green-100 text-green-800 border-green-200" };
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Inventory Management</CardTitle>
              <CardDescription>Manage products and stock levels</CardDescription>
            </div>
            <AddProductDialog onProductAdded={fetchProducts} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Filter by Brand</label>
                <select
                  value={brandFilter}
                  onChange={(e) => setBrandFilter(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="all">All Brands</option>
                  {uniqueBrands.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Sub-Brand</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>MRP</TableHead>
                  <TableHead>Discount Price</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product.QTY);
                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product["Material Desc"] || 'N/A'}</TableCell>
                      <TableCell>{product["Brand Desc"] || 'N/A'}</TableCell>
                      <TableCell>{product.SubBrand || 'N/A'}</TableCell>
                      <TableCell>{product["Super Category Description"] || 'N/A'}</TableCell>
                      <TableCell>{product["Funskool Code"] || 'N/A'}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={product.QTY || 0}
                          onChange={(e) => handleUpdateStock(product.id, parseInt(e.target.value) || 0)}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Badge className={stockStatus.color}>
                          {stockStatus.label}
                        </Badge>
                      </TableCell>
                      <TableCell>₹{product["MRP (INR)"]?.toLocaleString()}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Discounted"
                          value={product.discount_price || ''}
                          onChange={(e) => {
                            const value = e.target.value ? parseFloat(e.target.value) : null;
                            supabase
                              .from('products')
                              .update({ discount_price: value })
                              .eq('id', product.id)
                              .then(({ error }) => {
                                if (error) {
                                  toast({
                                    title: "Error",
                                    description: "Failed to update discount price",
                                    variant: "destructive",
                                  });
                                } else {
                                  fetchProducts();
                                }
                              });
                          }}
                          className="w-28"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <EditProductDialog product={product} onProductUpdated={fetchProducts} />
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => openDeleteDialog(product)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          {filteredProducts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              No products found
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Are you sure you want to delete this product?</p>
              {productToDelete && (
                <p className="font-medium text-foreground">
                  "{productToDelete["Material Desc"] || productToDelete["Brand Desc"] || 'This product'}"
                </p>
              )}
              <p className="text-destructive">This action cannot be undone. The product will be removed from all wishlists and carts.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Product"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
