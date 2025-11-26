import { useEffect } from "react";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, loading, updateQuantity, removeFromCart } = useCart();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
      }
    };
    checkAuth();
  }, [navigate]);

  const subtotal = cartItems.reduce((sum, item) => {
    const product = item.products;
    const price = product?.discount_price || product?.["MRP (INR)"] || 0;
    return sum + (price * item.quantity);
  }, 0);
  
  const shipping = subtotal > 500 ? 0 : 50;
  const total = subtotal + shipping;

  // Check if any items are out of stock
  const hasOutOfStock = cartItems.some(item => !item.products?.QTY || item.products.QTY === 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 text-center">
          <p>Loading cart...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-8 text-center">
          <div className="max-w-md mx-auto">
            <ShoppingBag className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-foreground mb-4">Your cart is empty</h1>
            <p className="text-muted-foreground mb-6">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Link to="/">
              <Button className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Continue Shopping
              </Button>
            </Link>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Shopping Cart</h1>
          <p className="text-muted-foreground">{cartItems.length} items in your cart</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => {
              const product = item.products;
              if (!product) return null;

              return (
                <Card key={item.id}>
                  <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {product.product_images && product.product_images.length > 0 ? (
                        <img
                          src={product.product_images[0].image_url}
                          alt={product["Material Desc"] || "Product"}
                          className="w-full sm:w-20 h-40 sm:h-20 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full sm:w-20 h-40 sm:h-20 bg-muted flex items-center justify-center rounded-lg">
                          <span className="text-xs text-muted-foreground">No Image</span>
                        </div>
                      )}
                      
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground text-sm md:text-base">
                            {product["Brand Desc"]} {product.SubBrand}
                          </h3>
                          <p className="text-xs md:text-sm text-muted-foreground truncate">
                            {product["Super Category Description"]}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            SKU: {product["Funskool Code"]}
                          </p>
                          {(!product.QTY || product.QTY === 0) && (
                            <Badge variant="destructive" className="mt-1">⚠️ Out of Stock</Badge>
                          )}
                          {product.discount_price ? (
                            <div className="flex items-center gap-2 mt-1 md:mt-2">
                              <span className="text-base md:text-lg font-bold text-primary">
                                ₹{product.discount_price}
                              </span>
                              <span className="text-sm text-muted-foreground line-through">
                                ₹{product["MRP (INR)"]}
                              </span>
                            </div>
                          ) : (
                            <p className="text-base md:text-lg font-bold text-primary mt-1 md:mt-2">
                              ₹{product["MRP (INR)"]}
                            </p>
                          )}
                        </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 md:h-8 md:w-8"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3 md:h-4 md:w-4" />
                          </Button>
                          <span className="w-8 md:w-12 text-center font-medium text-sm">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 md:h-8 md:w-8"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3 md:h-4 md:w-4" />
                          </Button>
                        </div>

                        <div className="text-right">
                          <p className="font-bold text-base md:text-lg">
                            ₹{(product.discount_price || product["MRP (INR)"]) * item.quantity}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                            className="text-destructive hover:text-destructive h-8 p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
                </div>

                <Separator />

                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>

                <Separator />

                {hasOutOfStock && (
                  <div className="text-sm text-destructive text-center">
                    ⚠️ Some items in your cart are out of stock. Please remove them to continue.
                  </div>
                )}

                <Button 
                  className="w-full" 
                  size="lg" 
                  onClick={() => navigate('/checkout')}
                  disabled={hasOutOfStock}
                >
                  Proceed to Checkout
                </Button>

                <div className="mt-4">
                  <Link to="/">
                    <Button variant="outline" className="w-full">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cart;
