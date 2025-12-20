import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2, GripVertical, Eye, EyeOff } from "lucide-react";

interface Category {
  id: string;
  name: string;
  description: string | null;
  slug: string | null;
  emoji: string | null;
  image_url: string | null;
  display_order: number | null;
  show_in_navbar: boolean | null;
  item_count_label: string | null;
}

const CategoryManagement = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    slug: "",
    emoji: "",
    image_url: "",
    display_order: 0,
    show_in_navbar: true,
    item_count_label: "items"
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("classifications")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: prev.slug || generateSlug(name)
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      slug: "",
      emoji: "",
      image_url: "",
      display_order: categories.length,
      show_in_navbar: true,
      item_count_label: "items"
    });
    setEditingCategory(null);
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      slug: category.slug || "",
      emoji: category.emoji || "",
      image_url: category.image_url || "",
      display_order: category.display_order || 0,
      show_in_navbar: category.show_in_navbar ?? true,
      item_count_label: category.item_count_label || "items"
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive"
      });
      return;
    }

    if (!formData.slug.trim()) {
      toast({
        title: "Error",
        description: "Category slug is required",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingCategory) {
        // Update existing category
        const { error } = await supabase
          .from("classifications")
          .update({
            name: formData.name,
            description: formData.description || null,
            slug: formData.slug,
            emoji: formData.emoji || null,
            image_url: formData.image_url || null,
            display_order: formData.display_order,
            show_in_navbar: formData.show_in_navbar,
            item_count_label: formData.item_count_label || "items"
          })
          .eq("id", editingCategory.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Category updated successfully"
        });
      } else {
        // Create new category
        const { error } = await supabase
          .from("classifications")
          .insert({
            name: formData.name,
            description: formData.description || null,
            slug: formData.slug,
            emoji: formData.emoji || null,
            image_url: formData.image_url || null,
            display_order: formData.display_order,
            show_in_navbar: formData.show_in_navbar,
            item_count_label: formData.item_count_label || "items"
          });

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Category created successfully"
        });
      }

      setDialogOpen(false);
      resetForm();
      fetchCategories();
    } catch (error: any) {
      console.error("Error saving category:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save category",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (category: Category) => {
    if (!confirm(`Are you sure you want to delete "${category.name}"? Products in this category will remain but won't be associated with this category anymore.`)) {
      return;
    }

    try {
      // First, remove category association from products
      await supabase
        .from("products")
        .update({ classification_id: null })
        .eq("classification_id", category.id);

      // Then delete the category
      const { error } = await supabase
        .from("classifications")
        .delete()
        .eq("id", category.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Category deleted successfully"
      });
      
      fetchCategories();
    } catch (error: any) {
      console.error("Error deleting category:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete category",
        variant: "destructive"
      });
    }
  };

  const toggleNavbarVisibility = async (category: Category) => {
    try {
      const { error } = await supabase
        .from("classifications")
        .update({ show_in_navbar: !category.show_in_navbar })
        .eq("id", category.id);

      if (error) throw error;
      fetchCategories();
    } catch (error) {
      console.error("Error updating category:", error);
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading categories...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Category Management</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Edit Category" : "Add New Category"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g., Toys & Games"
                />
              </div>
              
              <div>
                <Label htmlFor="slug">URL Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="e.g., toys-and-games"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This will be used in the URL: /category/{formData.slug || "slug"}
                </p>
              </div>
              
              <div>
                <Label htmlFor="emoji">Emoji</Label>
                <Input
                  id="emoji"
                  value={formData.emoji}
                  onChange={(e) => setFormData(prev => ({ ...prev, emoji: e.target.value }))}
                  placeholder="e.g., 🎮"
                  className="text-xl"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this category"
                  rows={2}
                />
              </div>
              
              <div>
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
              
              <div>
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="show_in_navbar">Show in Navbar</Label>
                <Switch
                  id="show_in_navbar"
                  checked={formData.show_in_navbar}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, show_in_navbar: checked }))}
                />
              </div>
              
              <Button onClick={handleSubmit} className="w-full">
                {editingCategory ? "Update Category" : "Create Category"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Order</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Emoji</TableHead>
              <TableHead className="text-center">In Navbar</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    {category.display_order}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                <TableCell className="text-xl">{category.emoji}</TableCell>
                <TableCell className="text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleNavbarVisibility(category)}
                  >
                    {category.show_in_navbar ? (
                      <Eye className="h-4 w-4 text-green-600" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(category)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(category)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {categories.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No categories found. Add your first category above.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CategoryManagement;
