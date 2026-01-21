import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

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
  description: z.string().nullable().optional(),
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

export const AddProductDialog = ({ onProductAdded }: { onProductAdded?: () => void }) => {
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
    "Super Category Description": "",
    "Material Desc": "",
    "Barcode (UPC/EAN)": "",
    "MRP (INR)": "",
    QTY: "",
    "Elec/ Non Elec": "Non Elec",
    age_range: "",
    "Sku length": "",
    "Sku Width": "",
    "Sku Height": "",
    "Unit of measure of SKU length Width and Height": "cm",
    description: "",
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setImageFiles(files);
      
      // Create previews for all files
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

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeVideo = () => {
    setVideoFile(null);
    setVideoPreview("");
  };

  useEffect(() => {
    if (open) {
      fetchDropdownData();
    }
  }, [open]);

  const fetchDropdownData = async () => {
    try {
      // Fetch brands
      const { data: brandsData, error: brandsError } = await supabase
        .from('brands')
        .select('*')
        .order('name');
      
      if (brandsError) throw brandsError;
      setBrands(brandsData || []);

      // Fetch all subbrands
      const { data: subBrandsData, error: subBrandsError } = await supabase
        .from('subbrands')
        .select('*')
        .order('name');
      
      if (subBrandsError) throw subBrandsError;
      setSubBrands(subBrandsData || []);

      // Fetch classifications
      const { data: classificationsData, error: classificationsError } = await supabase
        .from('classifications')
        .select('*')
        .order('name');
      
      if (classificationsError) throw classificationsError;
      setClassifications(classificationsData || []);
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
        description: formData.description || null,
      };

      // Validate with zod
      const validated = productSchema.parse(productData);

      const { data: newProduct, error } = await supabase
        .from('products')
        .insert([validated])
        .select()
        .single();

      if (error) throw error;

      // Upload images if provided
      if (imageFiles.length > 0 && newProduct) {
        const imageUploads = imageFiles.map(async (file, index) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${newProduct.id}/${crypto.randomUUID()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(fileName);

          return {
            product_id: newProduct.id,
            image_url: publicUrl,
            display_order: index,
          };
        });

        const imageData = await Promise.all(imageUploads);
        
        const { error: imagesError } = await supabase
          .from('product_images')
          .insert(imageData);

        if (imagesError) throw imagesError;
      }

      // Upload video if provided
      if (videoFile && newProduct) {
        const fileExt = videoFile.name.split('.').pop();
        const fileName = `${newProduct.id}/${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('product-videos')
          .upload(fileName, videoFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('product-videos')
          .getPublicUrl(fileName);

        // Update product with video URL
        const { error: updateError } = await supabase
          .from('products')
          .update({ video_url: publicUrl })
          .eq('id', newProduct.id);

        if (updateError) throw updateError;
      }

      // Insert classifications
      if (selectedClassificationIds.length > 0 && newProduct) {
        const classificationInserts = selectedClassificationIds.map(classId => ({
          product_id: newProduct.id,
          classification_id: classId,
        }));

        const { error: classError } = await supabase
          .from('product_classifications')
          .insert(classificationInserts);

        if (classError) throw classError;
      }

      toast({
        title: "Success",
        description: "Product added successfully",
      });

      // Reset form
      setFormData({
        "Super Category Description": "",
        "Material Desc": "",
        "Barcode (UPC/EAN)": "",
        "MRP (INR)": "",
        QTY: "",
        "Elec/ Non Elec": "Non Elec",
        age_range: "",
        "Sku length": "",
        "Sku Width": "",
        "Sku Height": "",
        "Unit of measure of SKU length Width and Height": "cm",
        description: "",
      });
      setSelectedBrandId("");
      setSelectedSubBrandId("");
      setSelectedClassificationIds([]);
      setImageFiles([]);
      setImagePreviews([]);
      setVideoFile(null);
      setVideoPreview("");
      setOpen(false);
      
      if (onProductAdded) {
        onProductAdded();
      }
    } catch (error: any) {
      console.error('Error adding product:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add product",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Fill in all the product details below
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

          {/* Product Images (Multiple) */}
          <div className="space-y-2">
            <Label htmlFor="images">Product Images (Multiple)</Label>
            <Input
              id="images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
            />
            {imagePreviews.length > 0 && (
              <div className="mt-2 grid grid-cols-4 gap-2">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img 
                      src={preview} 
                      alt={`Preview ${index + 1}`} 
                      className="w-full h-24 object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Video (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="video">Product Video (Optional)</Label>
            <Input
              id="video"
              type="file"
              accept="video/*"
              onChange={handleVideoChange}
            />
            {videoPreview && (
              <div className="mt-2 relative">
                <video 
                  src={videoPreview} 
                  controls 
                  className="w-full h-48 object-cover rounded border"
                />
                <button
                  type="button"
                  onClick={removeVideo}
                  className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full px-3 py-1 text-sm"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
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

          {/* Product Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Product Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter product description..."
              rows={4}
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
              {loading ? "Adding..." : "Add Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};