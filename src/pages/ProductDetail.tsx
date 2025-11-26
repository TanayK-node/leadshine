import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, ShoppingCart, Heart, Share2, Package, Truck, Shield, ZoomIn, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import type { Tables } from "@/integrations/supabase/types";

type Product = Tables<"products">;

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addToCart: addToCartContext, isInCart } = useCart();
  const { addToWishlist: addToWishlistContext, removeFromWishlist, isInWishlist } = useWishlist();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [mediaItems, setMediaItems] = useState<Array<{ type: 'image' | 'video', url: string }>>([]);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .eq('is_deleted', false)
          .single();

        if (error) throw error;
        setProduct(data);
        setVideoUrl(data.video_url || "");

        // Fetch product images
        const { data: images } = await supabase
          .from('product_images')
          .select('image_url')
          .eq('product_id', id)
          .order('display_order');
        
        const imageUrls = images && images.length > 0 ? images.map(img => img.image_url) : [];
        setProductImages(imageUrls);

        // Combine images and video into media items
        const items: Array<{ type: 'image' | 'video', url: string }> = imageUrls.map(url => ({ type: 'image' as const, url }));
        if (data.video_url) {
          items.push({ type: 'video' as const, url: data.video_url });
        }
        setMediaItems(items);
      } catch (error) {
        console.error('Error fetching product:', error);
        toast({
          title: "Error",
          description: "Failed to load product details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, toast]);

  const addToCart = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast({
        title: "Login required",
        description: "Please login to add items to cart",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (!id) return;

    try {
      // Add to cart multiple times based on quantity
      for (let i = 0; i < quantity; i++) {
        await addToCartContext(id);
      }
      toast({
        title: "Added to Cart",
        description: `${quantity} item(s) added to your cart`,
      });
    } catch (error) {
      // Error already handled in context
    }
  };

  const addToWishlist = async () => {
    if (!id) return;
    
    if (isInWishlist(id)) {
      await removeFromWishlist(id);
    } else {
      await addToWishlistContext(id);
    }
  };

  const shareProduct = async () => {
    const shareData = {
      title: product?.["Material Desc"] || "Product",
      text: `Check out ${product?.["Material Desc"]} from ${product?.["Brand Desc"]}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link Copied",
          description: "Product link copied to clipboard",
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="h-96 bg-muted rounded"></div>
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-6 bg-muted rounded w-1/4"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <Link to="/">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <span className="text-foreground">{product["Material Desc"]}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-8">
          {/* Product Media Carousel */}
          <div className="space-y-3 md:space-y-4 lg:sticky lg:top-4 lg:self-start">
            <div className="relative group">
              <div className="max-w-md mx-auto bg-white rounded-lg overflow-hidden border border-border">
                <div className="aspect-square flex items-center justify-center p-4">
                  {mediaItems.length > 0 ? (
                    mediaItems[currentImageIndex].type === 'image' ? (
                      <img 
                        src={mediaItems[currentImageIndex].url} 
                        alt={product["Material Desc"] || "Product"} 
                        className="max-w-full max-h-full object-contain cursor-pointer"
                        onClick={() => setZoomOpen(true)}
                      />
                    ) : (
                      <video 
                        src={mediaItems[currentImageIndex].url} 
                        controls 
                        className="max-w-full max-h-full object-contain"
                      />
                    )
                  ) : (
                    <Package className="h-16 md:h-24 w-16 md:w-24 text-muted-foreground" />
                  )}
                </div>

                {/* Navigation Arrows */}
                {mediaItems.length > 1 && (
                  <>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                      onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? mediaItems.length - 1 : prev - 1))}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                      onClick={() => setCurrentImageIndex((prev) => (prev === mediaItems.length - 1 ? 0 : prev + 1))}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </>
                )}

                {/* Dot Indicators */}
                {mediaItems.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {mediaItems.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentImageIndex 
                            ? 'bg-primary w-6' 
                            : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                        }`}
                        aria-label={`View image ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
              {mediaItems[currentImageIndex]?.type === 'image' && (
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => setZoomOpen(true)}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-4 md:space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                {product["Material Desc"]}
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                {product["Brand Desc"]} {product.SubBrand && `• ${product.SubBrand}`}
              </p>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                Category: {product["Super Category Description"]}
              </p>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                SKU: {product["Funskool Code"]}
              </p>
              {product.age_range && (
                <p className="text-xs md:text-sm text-muted-foreground mt-1">
                  Age Range: {product.age_range}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 md:gap-4 flex-wrap sm:flex-nowrap">
              {product.discount_price ? (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-2xl md:text-3xl font-bold text-primary">
                      ₹{product.discount_price}
                    </span>
                    <Badge variant="default" className="text-sm bg-primary text-primary-foreground">
                      {Math.round((1 - product.discount_price / product["MRP (INR)"]) * 100)}% OFF
                    </Badge>
                    <Badge variant={product.QTY && product.QTY > 0 ? (product.QTY <= 3 ? "destructive" : "secondary") : "destructive"}>
                      {product.QTY && product.QTY > 0 
                        ? (product.QTY <= 3 ? "Low in Stock" : "In Stock") 
                        : "Out of Stock"}
                    </Badge>
                  </div>
                  <span className="text-lg text-muted-foreground line-through">
                    ₹{product["MRP (INR)"]}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-2xl md:text-3xl font-bold text-primary">
                    ₹{product["MRP (INR)"]}
                  </span>
                  <Badge variant={product.QTY && product.QTY > 0 ? (product.QTY <= 3 ? "destructive" : "secondary") : "destructive"}>
                    {product.QTY && product.QTY > 0 
                      ? (product.QTY <= 3 ? "Low in Stock" : "In Stock") 
                      : "Out of Stock"}
                  </Badge>
                </div>
              )}
            </div>

            {/* Key Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 text-sm">
              <div>
                <span className="text-muted-foreground text-xs md:text-sm">Product Name:</span>
                <p className="font-medium text-sm md:text-base">{product["Material Desc"]}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-xs md:text-sm">Brand:</span>
                <p className="font-medium text-sm md:text-base">{product["Brand Desc"]}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-xs md:text-sm">Sub-Brand:</span>
                <p className="font-medium text-sm md:text-base">{product.SubBrand || "N/A"}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-xs md:text-sm">Type:</span>
                <p className="font-medium text-sm md:text-base">{product["Elec/ Non Elec"]}</p>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Quantity:</label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.min(product.QTY || 0, quantity + 1))}
                >
                  +
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              {isInCart(id || '') ? (
                <Button 
                  className="flex-1" 
                  size="lg"
                  onClick={() => navigate('/cart')}
                  variant="secondary"
                >
                  Go to Cart 🛒
                </Button>
              ) : (
                <Button 
                  className="flex-1" 
                  size="lg"
                  onClick={addToCart}
                  disabled={!product.QTY || product.QTY === 0}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              )}
              <div className="flex gap-3">
                <Button 
                  variant={isInWishlist(id || '') ? "default" : "outline"} 
                  size="lg" 
                  onClick={addToWishlist} 
                  className="flex-1 sm:flex-none"
                >
                  <Heart className={`h-4 w-4 ${isInWishlist(id || '') ? 'fill-current' : ''}`} />
                </Button>
                <Button variant="outline" size="lg" onClick={shareProduct} className="flex-1 sm:flex-none">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Features */}
            <div className="flex flex-col gap-3 pt-4">
              <div className="flex items-center gap-2 text-sm">
                <Truck className="h-4 w-4 text-primary" />
                <span>Free shipping on orders over ₹500</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-primary" />
                <span>1 year warranty included</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <Tabs defaultValue="specifications" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="specifications" className="text-xs sm:text-sm">Specifications</TabsTrigger>
            <TabsTrigger value="description" className="text-xs sm:text-sm">Description</TabsTrigger>
            <TabsTrigger value="shipping" className="text-xs sm:text-sm">Shipping Info</TabsTrigger>
          </TabsList>
          
          <TabsContent value="specifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Specifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Dimensions</h4>
                    <p className="text-sm text-muted-foreground">
                      Length: {product["Sku length"]} {product["Unit of measure of SKU length Width and Height"]}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Width: {product["Sku Width"]} {product["Unit of measure of SKU length Width and Height"]}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Height: {product["Sku Height"]} {product["Unit of measure of SKU length Width and Height"]}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Product Details</h4>
                    <p className="text-sm text-muted-foreground">
                      Name: {product["Material Desc"]}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Brand: {product["Brand Desc"]}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Sub-Brand: {product.SubBrand || "N/A"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Type: {product["Elec/ Non Elec"]}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="description" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  High-quality {product["Material Desc"]}. 
                  From {product["Brand Desc"]} {product.SubBrand && `(${product.SubBrand})`}. 
                  This {product["Elec/ Non Elec"]} product is perfect for its intended use and meets all safety standards.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="shipping" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Delivery Options</h4>
                  <p className="text-sm text-muted-foreground">
                    • Standard Delivery: 3-5 business days
                  </p>
                  <p className="text-sm text-muted-foreground">
                    • Express Delivery: 1-2 business days
                  </p>
                  <p className="text-sm text-muted-foreground">
                    • Free shipping on orders over ₹500
                  </p>
                </div>
                <Separator />
                <div>
                  <h4 className="font-medium mb-2">Return Policy</h4>
                  <p className="text-sm text-muted-foreground">
                    Easy returns within 30 days of purchase. Product must be in original condition.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Zoom Dialog */}
      <Dialog open={zoomOpen} onOpenChange={setZoomOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95">
          <div className="relative w-full h-[95vh] flex items-center justify-center overflow-hidden">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
              onClick={() => setZoomOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>
            
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2 bg-black/50 rounded-lg p-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={() => setZoomScale(Math.max(0.5, zoomScale - 0.25))}
              >
                Zoom Out
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={() => setZoomScale(1)}
              >
                Reset
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={() => setZoomScale(Math.min(3, zoomScale + 0.25))}
              >
                Zoom In
              </Button>
            </div>

            <div className="w-full h-full flex items-center justify-center p-8 overflow-auto">
              {mediaItems.length > 0 && mediaItems[currentImageIndex]?.type === 'image' && (
                <img
                  src={mediaItems[currentImageIndex].url}
                  alt={product["Material Desc"] || "Product"}
                  className="max-w-full max-h-full object-contain transition-transform duration-200"
                  style={{ transform: `scale(${zoomScale})` }}
                />
              )}
            </div>

            {/* Navigation arrows for zoom view */}
            {mediaItems.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                  onClick={() => {
                    setCurrentImageIndex((prev) => (prev === 0 ? mediaItems.length - 1 : prev - 1));
                    setZoomScale(1);
                  }}
                >
                  <ArrowLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                  onClick={() => {
                    setCurrentImageIndex((prev) => (prev === mediaItems.length - 1 ? 0 : prev + 1));
                    setZoomScale(1);
                  }}
                >
                  <Share2 className="h-6 w-6 rotate-180" />
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default ProductDetail;