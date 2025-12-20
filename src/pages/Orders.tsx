import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Package, ArrowLeft, Clock, CheckCircle, XCircle, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  products: {
    "Material Desc": string;
    "Brand Desc": string;
    "Funskool Code": string;
  } | null;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  shipping_amount: number;
  discount_amount: number;
  created_at: string;
  order_items: OrderItem[];
  coupons: {
    code: string;
  } | null;
}

const Orders = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuthAndFetchOrders = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please login to view your orders",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      setUser(session.user);
      await fetchOrders(session.user.id);
    };

    checkAuthAndFetchOrders();
  }, [navigate, toast]);

  const fetchOrders = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            quantity,
            price,
            products (
              "Material Desc",
              "Brand Desc",
              "Funskool Code"
            )
          ),
          coupons (
            code
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOrders(data || []);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to load orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'out for delivery':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case 'out for delivery':
        return "bg-blue-100 text-blue-800 border-blue-200";
      case 'delivered':
        return "bg-green-100 text-green-800 border-green-200";
      case 'cancelled':
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 text-center">
          <p>Loading orders...</p>
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
          <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold">My Orders</h1>
          <p className="text-muted-foreground mt-2">
            Track and manage your orders
          </p>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
              <h2 className="text-2xl font-bold mb-4">No orders yet</h2>
              <p className="text-muted-foreground mb-6">
                You haven't placed any orders yet. Start shopping to see your orders here.
              </p>
              <Button onClick={() => navigate('/')}>
                Start Shopping
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl">
                        Order #{order.order_number}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Placed on {formatDate(order.created_at)}
                      </p>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(order.status)}
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Order Items */}
                    <div className="space-y-3">
                      {order.order_items.map((item) => {
                        if (!item.products) return null;
                        
                        return (
                          <div key={item.id} className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-medium">
                                {item.products["Material Desc"]}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {item.products["Brand Desc"]} • SKU: {item.products["Funskool Code"]}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Quantity: {item.quantity} × ₹{item.price}
                              </p>
                            </div>
                            <p className="font-semibold">
                              ₹{(item.quantity * item.price).toFixed(2)}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    <Separator />

                    {/* Pricing Breakdown */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>₹{(order.total_amount - order.shipping_amount + (order.discount_amount || 0)).toFixed(2)}</span>
                      </div>
                      {order.shipping_amount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Shipping</span>
                          <span>₹{order.shipping_amount.toFixed(2)}</span>
                        </div>
                      )}
                      {order.discount_amount > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Discount {order.coupons ? `(${order.coupons.code})` : ''}</span>
                          <span>-₹{order.discount_amount.toFixed(2)}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between items-center font-bold text-lg">
                        <span>Total Amount</span>
                        <span>₹{order.total_amount.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Refund Button for Delivered Orders */}
                    {order.status === 'delivered' && (
                      <div className="mt-4 pt-4 border-t flex justify-end">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => navigate('/refund-policy')}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          Request Refund
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Orders;
