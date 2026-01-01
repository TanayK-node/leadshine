import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, ArrowUp, ArrowDown, ImageIcon, Loader2 } from "lucide-react";

interface HeroBanner {
  id: string;
  image_url: string;
  link_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export function HeroBannerManagement() {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [newLinkUrl, setNewLinkUrl] = useState("");

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from("hero_banners")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      setBanners(data || []);
    } catch (error) {
      console.error("Error fetching banners:", error);
      toast.error("Failed to load banners");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `hero/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("banners")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("banners")
        .getPublicUrl(filePath);

      const maxOrder = banners.length > 0 
        ? Math.max(...banners.map(b => b.display_order)) 
        : -1;

      const { error: insertError } = await supabase
        .from("hero_banners")
        .insert({
          image_url: urlData.publicUrl,
          link_url: newLinkUrl || null,
          display_order: maxOrder + 1,
          is_active: true,
        });

      if (insertError) throw insertError;

      toast.success("Banner added successfully");
      setNewLinkUrl("");
      fetchBanners();
    } catch (error) {
      console.error("Error uploading banner:", error);
      toast.error("Failed to add banner");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (banner: HeroBanner) => {
    try {
      // Extract file path from URL
      const urlParts = banner.image_url.split("/banners/");
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage.from("banners").remove([filePath]);
      }

      const { error } = await supabase
        .from("hero_banners")
        .delete()
        .eq("id", banner.id);

      if (error) throw error;

      toast.success("Banner deleted successfully");
      fetchBanners();
    } catch (error) {
      console.error("Error deleting banner:", error);
      toast.error("Failed to delete banner");
    }
  };

  const handleToggleActive = async (banner: HeroBanner) => {
    try {
      const { error } = await supabase
        .from("hero_banners")
        .update({ is_active: !banner.is_active })
        .eq("id", banner.id);

      if (error) throw error;

      toast.success(`Banner ${!banner.is_active ? "activated" : "deactivated"}`);
      fetchBanners();
    } catch (error) {
      console.error("Error updating banner:", error);
      toast.error("Failed to update banner");
    }
  };

  const handleReorder = async (banner: HeroBanner, direction: "up" | "down") => {
    const currentIndex = banners.findIndex(b => b.id === banner.id);
    const swapIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (swapIndex < 0 || swapIndex >= banners.length) return;

    const swapBanner = banners[swapIndex];

    try {
      await supabase
        .from("hero_banners")
        .update({ display_order: swapBanner.display_order })
        .eq("id", banner.id);

      await supabase
        .from("hero_banners")
        .update({ display_order: banner.display_order })
        .eq("id", swapBanner.id);

      fetchBanners();
    } catch (error) {
      console.error("Error reordering banners:", error);
      toast.error("Failed to reorder banners");
    }
  };

  const handleLinkUpdate = async (banner: HeroBanner, newLink: string) => {
    try {
      const { error } = await supabase
        .from("hero_banners")
        .update({ link_url: newLink || null })
        .eq("id", banner.id);

      if (error) throw error;
      fetchBanners();
    } catch (error) {
      console.error("Error updating link:", error);
      toast.error("Failed to update link");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-10 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hero Banner Carousel</CardTitle>
        <CardDescription>
          Manage the banner images displayed in the hero carousel on the homepage
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add new banner */}
        <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
          <h3 className="font-medium">Add New Banner</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="link-url">Link URL (optional)</Label>
              <Input
                id="link-url"
                placeholder="https://example.com/page"
                value={newLinkUrl}
                onChange={(e) => setNewLinkUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="banner-image">Banner Image</Label>
              <div className="flex gap-2">
                <Input
                  id="banner-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                  className="cursor-pointer"
                />
                {isUploading && <Loader2 className="h-5 w-5 animate-spin" />}
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Recommended size: 1920x600 pixels for best display
          </p>
        </div>

        {/* Banners list */}
        {banners.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No banners added yet</p>
            <p className="text-sm">Upload your first banner image above</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Preview</TableHead>
                <TableHead>Link URL</TableHead>
                <TableHead className="w-[100px]">Active</TableHead>
                <TableHead className="w-[100px]">Order</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banners.map((banner, index) => (
                <TableRow key={banner.id}>
                  <TableCell>
                    <img
                      src={banner.image_url}
                      alt="Banner preview"
                      className="w-20 h-12 object-cover rounded border"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={banner.link_url || ""}
                      placeholder="No link"
                      onChange={(e) => handleLinkUpdate(banner, e.target.value)}
                      className="max-w-xs"
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={banner.is_active}
                      onCheckedChange={() => handleToggleActive(banner)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleReorder(banner, "up")}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleReorder(banner, "down")}
                        disabled={index === banners.length - 1}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(banner)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
