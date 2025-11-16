import { Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";

const Wishlist = () => {
  const navigate = useNavigate();
  const { wishlistItems, removeFromWishlist, loading } = useWishlist();
  const { addToCart, isInCart } = useCart();
  const { toast } = useToast();

  const handleMoveToCart = async (productId: string) => {
    await addToCart(productId);
    await removeFromWishlist(productId);
    toast({
      title: "Moved to Cart",
      description: "Product moved from wishlist to cart",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="h-8 w-8 text-primary" />
          <h1 className="text-3xl md:text-4xl font-bold font-display">My Wishlist</h1>
        </div>

        {wishlistItems.length === 0 ? (
          <Card className="p-8 md:p-12 text-center rounded-3xl border-4 border-foreground shadow-sticker">
            <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold font-display mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-6">
              Start adding products you love to your wishlist
            </p>
            <Link to="/">
              <Button size="lg" className="rounded-full font-display font-bold border-2 border-foreground shadow-lg hover-pop">Continue Shopping</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            <p className="text-muted-foreground font-display">
              {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} in your wishlist
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {wishlistItems.map((product) => {
                const inCart = isInCart(product.id);

                return (
                  <div 
                    key={product.id} 
                    className="group bg-white rounded-3xl border-4 border-foreground shadow-sticker hover:shadow-glow hover:scale-105 hover:-rotate-1 transition-all duration-300 overflow-hidden"
                  >
                    <div className="relative p-4">
                      <Link to={`/product/${product.id}`}>
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product["Material Desc"] || "Product"}
                            className="w-full h-52 object-cover rounded-2xl border-2 border-foreground group-hover:animate-wiggle"
                          />
                        ) : (
                          <div className="w-full h-52 bg-muted rounded-2xl border-2 border-foreground flex items-center justify-center">
                            <span className="text-muted-foreground font-display">No Image</span>
                          </div>
                        )}
                      </Link>
                      
                      {/* Badges */}
                      <Badge className="absolute top-6 left-6 bg-destructive text-destructive-foreground font-bold text-xs px-3 py-1 shadow-lg border-2 border-foreground">
                        ❤️ Wishlist
                      </Badge>
                      
                      {product.QTY && product.QTY <= 3 && product.QTY > 0 && (
                        <Badge className="absolute top-6 right-6 bg-secondary text-secondary-foreground font-bold text-xs px-3 py-1 shadow-lg border-2 border-foreground">
                          🔥 Low Stock
                        </Badge>
                      )}
                    </div>

                    <div className="px-6 pb-6">
                      <div className="text-xs font-bold text-muted-foreground mb-1 font-display uppercase">
                        {product["Brand Desc"]} {product.SubBrand && `• ${product.SubBrand}`}
                      </div>
                      
                      <Link to={`/product/${product.id}`}>
                        <h3 className="font-display font-bold text-foreground text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {product["Material Desc"]}
                        </h3>
                      </Link>
                      
                      {product.age_range && (
                        <Badge variant="outline" className="text-xs mb-3 font-display border-2">
                          Age: {product.age_range}
                        </Badge>
                      )}
                      
                      {/* Price */}
                      <div className="flex items-center gap-2 mb-4 flex-wrap">
                        {product.discount_price ? (
                          <>
                            <span className="text-base font-display text-muted-foreground line-through">
                              ₹{product["MRP (INR)"]}
                            </span>
                            <span className="text-2xl font-display font-bold text-primary">
                              ₹{product.discount_price}
                            </span>
                            <Badge className="bg-destructive text-destructive-foreground font-bold text-xs border-2 border-foreground">
                              {Math.round((1 - product.discount_price / product["MRP (INR)"]) * 100)}% OFF
                            </Badge>
                          </>
                        ) : (
                          <span className="text-2xl font-display font-bold text-primary">
                            ₹{product["MRP (INR)"]}
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {inCart ? (
                          <Button 
                            onClick={() => navigate('/cart')}
                            className="flex-1 rounded-full h-12 font-display font-bold text-base shadow-lg hover-pop border-2 border-foreground"
                          >
                            Go to Cart 🛒
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleMoveToCart(product.id)}
                            className="flex-1 rounded-full h-12 font-display font-bold text-base shadow-lg hover-pop border-2 border-foreground"
                          >
                            <ShoppingCart className="h-5 w-5 mr-2" />
                            Add to Cart
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => removeFromWishlist(product.id)}
                          className="h-12 w-12 rounded-full border-2 border-foreground shadow-lg hover-pop"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Wishlist;
