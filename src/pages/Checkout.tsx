import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const checkoutSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits").max(15),
  address: z.string().min(10, "Address is required").max(500),
  city: z.string().min(1, "City is required").max(100),
  state: z.string().min(1, "State is required").max(100),
  pincode: z.string().min(6, "Pincode must be 6 digits").max(6),
  notes: z.string().max(500).optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { cartItems, loading: cartLoading, clearCart } = useCart();
  const [user, setUser] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [discount, setDiscount] = useState(0);
  
  // Saved addresses state
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [saveAddress, setSaveAddress] = useState(false);
  
  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    notes: "",
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please login to continue checkout",
          variant: "destructive",
        });
        navigate("/auth");
      } else {
        setUser(session.user);
        // Pre-fill email from user profile
        setFormData(prev => ({ ...prev, email: session.user.email || "" }));
        // Fetch saved addresses
        fetchSavedAddresses(session.user.id);
      }
    };
    checkAuth();
  }, [navigate, toast]);

  const fetchSavedAddresses = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('saved_addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedAddresses(data || []);
    } catch (error: any) {
      console.error('Error fetching saved addresses:', error);
    }
  };

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId);
    const address = savedAddresses.find(a => a.id === addressId);
    if (address) {
      setFormData({
        fullName: address.name,
        email: address.email,
        phone: address.phone,
        address: address.address,
        city: address.city,
        state: address.state,
        pincode: address.zip_code,
        notes: formData.notes,
      });
    }
  };

  const subtotal = cartItems.reduce((sum, item) => {
    const product = item.products;
    const price = product?.discount_price || product?.["MRP (INR)"] || 0;
    return sum + (price * item.quantity);
  }, 0);
  
  const shipping = subtotal > 500 ? 0 : 50;
  const total = subtotal + shipping - discount;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a coupon code",
        variant: "destructive",
      });
      return;
    }

    setCouponLoading(true);
    try {
      const { data: coupon, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", couponCode.toUpperCase())
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;

      if (!coupon) {
        toast({
          title: "Error",
          description: "Invalid coupon code",
          variant: "destructive",
        });
        return;
      }

      const now = new Date();
      const validFrom = new Date(coupon.valid_from);
      const validUntil = new Date(coupon.valid_until);

      if (now < validFrom || now > validUntil) {
        toast({
          title: "Error",
          description: "This coupon has expired or is not yet valid",
          variant: "destructive",
        });
        return;
      }

      if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
        toast({
          title: "Error",
          description: "This coupon has reached its usage limit",
          variant: "destructive",
        });
        return;
      }

      if (coupon.min_purchase_amount && subtotal < coupon.min_purchase_amount) {
        toast({
          title: "Error",
          description: `Minimum purchase amount of ₹${coupon.min_purchase_amount} required`,
          variant: "destructive",
        });
        return;
      }

      let discountAmount = 0;
      if (coupon.discount_type === "percentage") {
        discountAmount = (subtotal * coupon.discount_value) / 100;
        if (coupon.max_discount_amount && discountAmount > coupon.max_discount_amount) {
          discountAmount = coupon.max_discount_amount;
        }
      } else {
        discountAmount = coupon.discount_value;
      }

      setAppliedCoupon(coupon);
      setDiscount(discountAmount);
      toast({
        title: "Success",
        description: `Coupon applied! You saved ₹${discountAmount.toFixed(2)}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to apply coupon: " + error.message,
        variant: "destructive",
      });
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscount(0);
    setCouponCode("");
    toast({
      title: "Success",
      description: "Coupon removed",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validate form data
      const validated = checkoutSchema.parse(formData);

      if (cartItems.length === 0) {
        toast({
          title: "Cart is empty",
          description: "Please add items to your cart before checkout",
          variant: "destructive",
        });
        return;
      }

      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Create order with shipping address
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          order_number: orderNumber,
          total_amount: total,
          shipping_amount: shipping,
          status: 'pending',
          coupon_id: appliedCoupon?.id || null,
          discount_amount: discount,
          customer_name: validated.fullName,
          customer_email: validated.email,
          customer_phone: validated.phone,
          shipping_address: validated.address,
          shipping_city: validated.city,
          shipping_state: validated.state,
          shipping_pincode: validated.pincode
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cartItems.map(item => {
        const product = item.products;
        const price = product?.discount_price || product?.["MRP (INR)"] || 0;
        return {
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: price,
        };
      });

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Update product stock quantities
      for (const item of cartItems) {
        const product = item.products;
        if (!product) continue;

        const currentStock = product.QTY || 0;
        const newStock = currentStock - item.quantity;

        // Check if sufficient stock is available
        if (newStock < 0) {
          throw new Error(`Insufficient stock for ${product["Material Desc"]}. Available: ${currentStock}, Requested: ${item.quantity}`);
        }

        const { error: stockError } = await supabase
          .from('products')
          .update({ QTY: newStock })
          .eq('id', item.product_id);

        if (stockError) throw stockError;
      }

      // Save address if checkbox is checked and it's a new address
      if (saveAddress && !selectedAddressId) {
        try {
          await supabase.from('saved_addresses').insert({
            user_id: user.id,
            name: validated.fullName,
            email: validated.email,
            phone: validated.phone,
            address: validated.address,
            city: validated.city,
            state: validated.state,
            zip_code: validated.pincode,
            is_default: savedAddresses.length === 0 // First address becomes default
          });
        } catch (error) {
          console.error('Failed to save address:', error);
          // Don't block order if address save fails
        }
      }

      // Update coupon usage if applied
      if (appliedCoupon) {
        const { error: couponError } = await supabase
          .from('coupons')
          .update({ current_uses: appliedCoupon.current_uses + 1 })
          .eq('id', appliedCoupon.id);

        if (couponError) console.error('Failed to update coupon usage:', couponError);

        // Record coupon usage
        await supabase.from('coupon_usage').insert({
          coupon_id: appliedCoupon.id,
          user_id: user.id,
          order_id: order.id,
          discount_amount: discount
        });
      }

      // Clear cart
      await clearCart();

      toast({
        title: "Order placed successfully!",
        description: `Your order number is ${orderNumber}`,
      });

      // Redirect to orders page
      navigate('/orders');
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: "Order failed",
        description: error.message || "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (cartLoading || !user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 text-center">
          <p>Loading...</p>
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
          <Package className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Continue Shopping
          </Button>
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
          <Button variant="ghost" onClick={() => navigate('/cart')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cart
          </Button>
          <h1 className="text-3xl font-bold">Checkout</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="9876543210"
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address *</Label>
                    <Textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="123 Main Street, Apartment 4B"
                      rows={3}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Mumbai"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="Maharashtra"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pincode">Pincode *</Label>
                      <Input
                        id="pincode"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        placeholder="400001"
                        maxLength={6}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Order Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Any special instructions for delivery"
                      rows={3}
                    />
                  </div>
                  
                  {/* Save Address Checkbox */}
                  {!selectedAddressId && (
                    <div className="flex items-center space-x-2 pt-2">
                      <Checkbox 
                        id="saveAddress" 
                        checked={saveAddress}
                        onCheckedChange={(checked) => setSaveAddress(checked as boolean)}
                      />
                      <Label 
                        htmlFor="saveAddress" 
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        Save this address for future orders
                      </Label>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Order Summary and Saved Addresses */}
            <div className="lg:col-span-1 space-y-6">
              {/* Saved Addresses */}
              {savedAddresses.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Saved Addresses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label htmlFor="savedAddress">Select a saved address</Label>
                      <Select value={selectedAddressId} onValueChange={handleAddressSelect}>
                        <SelectTrigger id="savedAddress">
                          <SelectValue placeholder="Choose from saved addresses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">Enter new address</SelectItem>
                          {savedAddresses.map((addr) => (
                            <SelectItem key={addr.id} value={addr.id}>
                              {addr.name} - {addr.address}, {addr.city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Order Summary */}
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                     {cartItems.map((item) => {
                      const product = item.products;
                      if (!product) return null;
                      const price = product.discount_price || product["MRP (INR)"];

                      return (
                        <div key={item.id} className="flex justify-between text-sm">
                          <div className="flex-1">
                            <p className="font-medium">{product["Material Desc"]}</p>
                            <p className="text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-medium">
                            ₹{(price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600 font-medium">
                        <span>Discount ({appliedCoupon?.code})</span>
                        <span>-₹{discount.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>

                  {/* Coupon Code Section */}
                  <div className="space-y-3 pt-4 border-t">
                    <Label htmlFor="coupon">Have a Coupon Code?</Label>
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div>
                          <p className="font-mono font-bold text-green-700">{appliedCoupon.code}</p>
                          <p className="text-sm text-green-600">
                            Saved ₹{discount.toFixed(2)}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={removeCoupon}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Input
                          id="coupon"
                          placeholder="Enter coupon code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          className="font-mono"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={applyCoupon}
                          disabled={couponLoading}
                        >
                          {couponLoading ? "Applying..." : "Apply"}
                        </Button>
                      </div>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={submitting}
                  >
                    {submitting ? "Placing Order..." : "Place Order"}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    By placing this order, you agree to our terms and conditions
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
