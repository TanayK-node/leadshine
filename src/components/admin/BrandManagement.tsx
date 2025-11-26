import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Brand {
  id: string;
  name: string;
  created_at: string;
}

interface SubBrand {
  id: string;
  name: string;
  brand_id: string;
  brands: {
    name: string;
  } | null;
}

export const BrandManagement = () => {
  const { toast } = useToast();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [subbrands, setSubbrands] = useState<SubBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [brandDialogOpen, setBrandDialogOpen] = useState(false);
  const [subbrandDialogOpen, setSubbrandDialogOpen] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [newSubbrandName, setNewSubbrandName] = useState("");
  const [selectedBrandId, setSelectedBrandId] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [brandsResponse, subbrandsResponse] = await Promise.all([
        supabase.from('brands').select('*').order('name'),
        supabase.from('subbrands').select('*, brands(name)').order('name')
      ]);

      if (brandsResponse.error) throw brandsResponse.error;
      if (subbrandsResponse.error) throw subbrandsResponse.error;

      setBrands(brandsResponse.data || []);
      setSubbrands(subbrandsResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load brands and subbrands",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddBrand = async () => {
    if (!newBrandName.trim()) {
      toast({
        title: "Error",
        description: "Brand name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('brands')
        .insert({ name: newBrandName.trim() });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Brand added successfully",
      });

      setNewBrandName("");
      setBrandDialogOpen(false);
      fetchData();
    } catch (error: any) {
      console.error('Error adding brand:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add brand",
        variant: "destructive",
      });
    }
  };

  const handleAddSubbrand = async () => {
    if (!newSubbrandName.trim() || !selectedBrandId) {
      toast({
        title: "Error",
        description: "Please provide subbrand name and select a brand",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('subbrands')
        .insert({ 
          name: newSubbrandName.trim(),
          brand_id: selectedBrandId 
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Subbrand added successfully",
      });

      setNewSubbrandName("");
      setSelectedBrandId("");
      setSubbrandDialogOpen(false);
      fetchData();
    } catch (error: any) {
      console.error('Error adding subbrand:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add subbrand",
        variant: "destructive",
      });
    }
  };

  const handleDeleteBrand = async (brandId: string) => {
    if (!confirm("Are you sure? This will also delete all subbrands under this brand.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('brands')
        .delete()
        .eq('id', brandId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Brand deleted successfully",
      });

      fetchData();
    } catch (error: any) {
      console.error('Error deleting brand:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete brand",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSubbrand = async (subbrandId: string) => {
    if (!confirm("Are you sure you want to delete this subbrand?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('subbrands')
        .delete()
        .eq('id', subbrandId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Subbrand deleted successfully",
      });

      fetchData();
    } catch (error: any) {
      console.error('Error deleting subbrand:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete subbrand",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Brands Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Brands</CardTitle>
              <CardDescription>Manage product brands</CardDescription>
            </div>
            <Dialog open={brandDialogOpen} onOpenChange={setBrandDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Brand
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Brand</DialogTitle>
                  <DialogDescription>Enter the brand name</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="brand-name">Brand Name</Label>
                    <Input
                      id="brand-name"
                      placeholder="Enter brand name"
                      value={newBrandName}
                      onChange={(e) => setNewBrandName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddBrand();
                        }
                      }}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setBrandDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddBrand}>Add Brand</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Brand Name</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brands.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell className="font-medium">{brand.name}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteBrand(brand.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {brands.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No brands found. Add your first brand!
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subbrands Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Subbrands</CardTitle>
              <CardDescription>Manage subbrands under each brand</CardDescription>
            </div>
            <Dialog open={subbrandDialogOpen} onOpenChange={setSubbrandDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Subbrand
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Subbrand</DialogTitle>
                  <DialogDescription>Enter the subbrand name and select parent brand</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="brand-select">Parent Brand</Label>
                    <Select value={selectedBrandId} onValueChange={setSelectedBrandId}>
                      <SelectTrigger id="brand-select">
                        <SelectValue placeholder="Select a brand" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        {brands.map((brand) => (
                          <SelectItem key={brand.id} value={brand.id}>
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="subbrand-name">Subbrand Name</Label>
                    <Input
                      id="subbrand-name"
                      placeholder="Enter subbrand name"
                      value={newSubbrandName}
                      onChange={(e) => setNewSubbrandName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddSubbrand();
                        }
                      }}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setSubbrandDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddSubbrand}>Add Subbrand</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subbrand Name</TableHead>
                <TableHead>Parent Brand</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subbrands.map((subbrand) => (
                <TableRow key={subbrand.id}>
                  <TableCell className="font-medium">{subbrand.name}</TableCell>
                  <TableCell>{subbrand.brands?.name || 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSubbrand(subbrand.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {subbrands.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No subbrands found. Add your first subbrand!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
