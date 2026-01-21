import { useState, useEffect } from "react";
import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import type { Tables } from "@/integrations/supabase/types";

type Product = Tables<"products">;

const productSchema = z.object({
  "Brand Desc": z.string().min(1, "Brand is required"),
  SubBrand: z.string().nullable().optional(),
  "Super Category Description": z.string().nullable().optional(),
  "Material Desc": z.string().min(1, "Product name is required"),
  "Barcode (UPC/EAN)": z.string().nullable().optional(),
  "MRP (INR)": z.number().min(0, "Price must be positive"),
  QTY: z.number().int().min(0, "Quantity must be non-negative"),
  "Elec/ Non Elec": z.string().nullable().optional(),
  age_range: z.string().nullable().optional(),
  "Sku length": z.number().nullable().optional(),
  "Sku Width": z.number().nullable().optional(),
  "Sku Height": z.number().nullable().optional(),
  "Unit of measure of SKU length Width and Height": z.string().nullable().optional(),
});

interface Brand {
  id: string;
  name: string;
}

interface SubBrand {
  id: string;
  name: string;
  brand_id: string;
}

interface Classification {
  id: string;
  name: string;
}

export const EditProductDialog = ({ product, onProductUpdated }: { product: Product; onProductUpdated?: () => void }) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Dropdown data
  const [brands, setBrands] = useState<Brand[]>([]);
  const [subBrands, setSubBrands] = useState<SubBrand[]>([]);
  const [classifications, setClassifications] = useState<Classification[]>([]);
  
  // Selected values
  const [selectedBrandId, setSelectedBrandId] = useState<string>("");
  const [selectedSubBrandId, setSelectedSubBrandId] = useState<string>("");
  const [selectedClassificationIds, setSelectedClassificationIds] = useState<string[]>([]);
  
  // Form data
  const [formData, setFormData] = useState({
    "Super Category Description": product["Super Category Description"] || "",
    "Material Desc": product["Material Desc"] || "",
    "Barcode (UPC/EAN)": product["Barcode (UPC/EAN)"] || "",
    "MRP (INR)": product["MRP (INR)"]?.toString() || "",
    QTY: product.QTY?.toString() || "",
    "Elec/ Non Elec": product["Elec/ Non Elec"] || "Non Elec",
    age_range: product.age_range || "",
    "Sku length": product["Sku length"]?.toString() || "",
    "Sku Width": product["Sku Width"]?.toString() || "",
    "Sku Height": product["Sku Height"]?.toString() || "",
    "Unit of measure of SKU length Width and Height": product["Unit of measure of SKU length Width and Height"] || "cm",
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<Array<{id: string, url: string}>>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setImageFiles(files);
      
      const previews: string[] = [];
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          previews.push(reader.result as string);
          if (previews.length === files.length) {
            setImagePreviews(previews);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeNewImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = async (imageId: string) => {
    try {
      const { error } = await supabase
        .from('product_images')
        .delete()
        .eq('id', imageId);
      
      if (error) throw error;
      
      setExistingImages(prev => prev.filter(img => img.id !== imageId));
      toast({
        title: "Success",
        description: "Image removed",
      });
    } catch (error) {
      console.error("Error removing image:", error);
      toast({
        title: "Error",
        description: "Failed to remove image",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (open) {
      fetchDropdownData();
      fetchExistingImages();
    }
  }, [open]);

  const fetchExistingImages = async () => {
    try {
      const { data, error } = await supabase
        .from('product_images')
        .select('id, image_url')
        .eq('product_id', product.id)
        .order('display_order');

      if (error) throw error;
      if (data) {
        setExistingImages(data.map(img => ({ id: img.id, url: img.image_url })));
      }
    } catch (error) {
      console.error('Error fetching existing images:', error);
    }
  };

  const fetchDropdownData = async () => {
    try {
      // Fetch brands
      const { data: brandsData, error: brandsError } = await supabase
        .from('brands')
        .select('*')
        .order('name');
      
      if (brandsError) throw brandsError;
      setBrands(brandsData || []);

      // Find and set current brand
      const currentBrand = brandsData?.find(b => b.name === product["Brand Desc"]);
      if (currentBrand) {
        setSelectedBrandId(currentBrand.id);
      }

      // Fetch all subbrands
      const { data: subBrandsData, error: subBrandsError } = await supabase
        .from('subbrands')
        .select('*')
        .order('name');
      
      if (subBrandsError) throw subBrandsError;
      setSubBrands(subBrandsData || []);

      // Find and set current subbrand
      if (product.SubBrand) {
        const currentSubBrand = subBrandsData?.find(sb => sb.name === product.SubBrand);
        if (currentSubBrand) {
          setSelectedSubBrandId(currentSubBrand.id);
        } else {
          setSelectedSubBrandId("none");
        }
      } else {
        setSelectedSubBrandId("none");
      }

      // Fetch classifications
      const { data: classificationsData, error: classificationsError } = await supabase
        .from('classifications')
        .select('*')
        .order('name');
      
      if (classificationsError) throw classificationsError;
      setClassifications(classificationsData || []);

      // Fetch current product classifications
      const { data: productClassifications, error: productClassError } = await supabase
        .from('product_classifications')
        .select('classification_id')
        .eq('product_id', product.id);

      if (productClassError) throw productClassError;
      setSelectedClassificationIds(productClassifications?.map(pc => pc.classification_id) || []);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
      toast({
        title: "Error",
        description: "Failed to load form data",
        variant: "destructive",
      });
    }
  };

  const handleBrandChange = (brandId: string) => {
    setSelectedBrandId(brandId);
    setSelectedSubBrandId(""); // Reset sub-brand when brand changes
  };

  const filteredSubBrands = selectedBrandId
    ? subBrands.filter(sb => sb.brand_id === selectedBrandId)
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get brand and subbrand names
      const selectedBrand = brands.find(b => b.id === selectedBrandId);
      const selectedSubBrand = selectedSubBrandId && selectedSubBrandId !== "none" 
        ? subBrands.find(sb => sb.id === selectedSubBrandId) 
        : null;

      if (!selectedBrand) {
        toast({
          title: "Validation Error",
          description: "Please select a brand",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const productData = {
        "Brand Desc": selectedBrand.name,
        SubBrand: selectedSubBrand?.name || null,
        "Super Category Description": formData["Super Category Description"] || null,
        "Material Desc": formData["Material Desc"],
        "Barcode (UPC/EAN)": formData["Barcode (UPC/EAN)"] || null,
        "MRP (INR)": parseFloat(formData["MRP (INR)"]) || 0,
        QTY: parseInt(formData.QTY) || 0,
        "Elec/ Non Elec": formData["Elec/ Non Elec"] || null,
        age_range: formData.age_range || null,
        "Sku length": formData["Sku length"] ? parseFloat(formData["Sku length"]) : null,
        "Sku Width": formData["Sku Width"] ? parseFloat(formData["Sku Width"]) : null,
        "Sku Height": formData["Sku Height"] ? parseFloat(formData["Sku Height"]) : null,
        "Unit of measure of SKU length Width and Height": formData["Unit of measure of SKU length Width and Height"] || null,
      };

      // Validate with zod
      const validated = productSchema.parse(productData);

      const { error } = await supabase
        .from('products')
        .update(validated)
        .eq('id', product.id);

      if (error) throw error;

      // Upload new images if provided
      if (imageFiles.length > 0) {
        const currentMaxOrder = existingImages.length;
        const imageUploads = imageFiles.map(async (file, index) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${product.id}/${crypto.randomUUID()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(fileName);

          return {
            product_id: product.id,
            image_url: publicUrl,
            display_order: currentMaxOrder + index,
          };
        });

        const imageData = await Promise.all(imageUploads);
        
        const { error: imagesError } = await supabase
          .from('product_images')
          .insert(imageData);

        if (imagesError) throw imagesError;
      }

      // Update classifications - delete existing and insert new ones
      const { error: deleteError } = await supabase
        .from('product_classifications')
        .delete()
        .eq('product_id', product.id);

      if (deleteError) throw deleteError;

      if (selectedClassificationIds.length > 0) {
        const classificationInserts = selectedClassificationIds.map(classId => ({
          product_id: product.id,
          classification_id: classId,
        }));

        const { error: classError } = await supabase
          .from('product_classifications')
          .insert(classificationInserts);

        if (classError) throw classError;
      }

      toast({
        title: "Success",
        description: "Product updated successfully",
      });

      setOpen(false);
      setImageFiles([]);
      setImagePreviews([]);
      
      if (onProductUpdated) {
        onProductUpdated();
      }
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update product",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Edit className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>
            Update product details below
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Brand Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Brand *</Label>
              <Select value={selectedBrandId} onValueChange={handleBrandChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subbrand">Sub-Brand (Optional)</Label>
              <Select 
                value={selectedSubBrandId} 
                onValueChange={setSelectedSubBrandId}
                disabled={!selectedBrandId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedBrandId ? (filteredSubBrands.length === 0 ? "No sub-brands available" : "Select sub-brand (optional)") : "Select brand first"} />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  <SelectItem value="none">None</SelectItem>
                  {filteredSubBrands.map((subBrand) => (
                    <SelectItem key={subBrand.id} value={subBrand.id}>
                      {subBrand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Classifications */}
          <div className="space-y-2">
            <Label>Classifications</Label>
            <div className="border rounded-md p-4 space-y-3 max-h-48 overflow-y-auto">
              {classifications
                .filter(c => c.name !== "New Arrivals")
                .map((classification) => (
                <div key={classification.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={classification.id}
                    checked={selectedClassificationIds.includes(classification.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedClassificationIds([...selectedClassificationIds, classification.id]);
                      } else {
                        setSelectedClassificationIds(
                          selectedClassificationIds.filter((id) => id !== classification.id)
                        );
                      }
                    }}
                  />
                  <Label
                    htmlFor={classification.id}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {classification.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Product Images */}
          <div className="space-y-2">
            <Label htmlFor="images">Product Images</Label>
            
            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Current Images</p>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {existingImages.map((img) => (
                    <div key={img.id} className="relative">
                      <img 
                        src={img.url} 
                        alt="Product" 
                        className="w-full h-24 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(img.id)}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Add New Images */}
            <Input
              id="images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
            />
            {imagePreviews.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-muted-foreground mb-2">New Images to Add</p>
                <div className="grid grid-cols-4 gap-2">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img 
                        src={preview} 
                        alt={`New ${index + 1}`} 
                        className="w-full h-24 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Product Name */}
          <div className="space-y-2">
            <Label htmlFor="productName">Product Name *</Label>
            <Input
              id="productName"
              value={formData["Material Desc"]}
              onChange={(e) => setFormData({ ...formData, "Material Desc": e.target.value })}
              placeholder="e.g., KNIGHT STAR BATMAN"
              required
            />
          </div>

          {/* Category (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="category">Category (Optional)</Label>
            <Input
              id="category"
              value={formData["Super Category Description"]}
              onChange={(e) => setFormData({ ...formData, "Super Category Description": e.target.value })}
              placeholder="e.g., Building Blocks"
            />
          </div>

          {/* Barcode */}
          <div className="space-y-2">
            <Label htmlFor="barcode">Barcode (UPC/EAN) (Optional)</Label>
            <Input
              id="barcode"
              value={formData["Barcode (UPC/EAN)"]}
              onChange={(e) => setFormData({ ...formData, "Barcode (UPC/EAN)": e.target.value })}
              placeholder="e.g., 1234567890123"
            />
          </div>

          {/* Price and Quantity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">MRP (INR) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData["MRP (INR)"]}
                onChange={(e) => setFormData({ ...formData, "MRP (INR)": e.target.value })}
                placeholder="e.g., 499.99"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="qty">Quantity *</Label>
              <Input
                id="qty"
                type="number"
                value={formData.QTY}
                onChange={(e) => setFormData({ ...formData, QTY: e.target.value })}
                placeholder="e.g., 100"
                required
              />
            </div>
          </div>

          {/* Type and Age Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select 
                value={formData["Elec/ Non Elec"]} 
                onValueChange={(value) => setFormData({ ...formData, "Elec/ Non Elec": value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  <SelectItem value="Non Elec">Non Electronic</SelectItem>
                  <SelectItem value="Elec">Electronic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Age Range</Label>
              <Select 
                value={formData.age_range} 
                onValueChange={(value) => setFormData({ ...formData, age_range: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select age range" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  <SelectItem value="0-2 Years">0-2 Years</SelectItem>
                  <SelectItem value="3-5 Years">3-5 Years</SelectItem>
                  <SelectItem value="6-8 Years">6-8 Years</SelectItem>
                  <SelectItem value="9-12 Years">9-12 Years</SelectItem>
                  <SelectItem value="13+ Years">13+ Years</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dimensions */}
          <div className="space-y-4">
            <Label>Dimensions (Optional)</Label>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="length">Length</Label>
                <Input
                  id="length"
                  type="number"
                  step="0.01"
                  value={formData["Sku length"]}
                  onChange={(e) => setFormData({ ...formData, "Sku length": e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="width">Width</Label>
                <Input
                  id="width"
                  type="number"
                  step="0.01"
                  value={formData["Sku Width"]}
                  onChange={(e) => setFormData({ ...formData, "Sku Width": e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="height">Height</Label>
                <Input
                  id="height"
                  type="number"
                  step="0.01"
                  value={formData["Sku Height"]}
                  onChange={(e) => setFormData({ ...formData, "Sku Height": e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Select 
                  value={formData["Unit of measure of SKU length Width and Height"]} 
                  onValueChange={(value) => setFormData({ ...formData, "Unit of measure of SKU length Width and Height": value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="cm">cm</SelectItem>
                    <SelectItem value="inch">inch</SelectItem>
                    <SelectItem value="mm">mm</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
