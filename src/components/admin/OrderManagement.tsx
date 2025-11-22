import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Search, Package, Eye, FileDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  products: {
    "Material Desc": string;
    "Brand Desc": string;
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
  user_id: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_pincode: string | null;
  order_items: OrderItem[];
}

interface OrderDetails extends Order {
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_pincode: string | null;
}

export const OrderManagement = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
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
              "Brand Desc"
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId: string) => {
    try {
      const { data: orderData, error: orderError } = await supabase
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
          )
        `)
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;

      setSelectedOrder(orderData as OrderDetails);
      setDetailsOpen(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast({
        title: "Error",
        description: "Failed to load order details",
        variant: "destructive",
      });
    }
  };

  const exportAllOrdersToExcel = () => {
    if (filteredOrders.length === 0) {
      toast({
        title: "No orders to export",
        description: "Apply filters to see orders",
        variant: "destructive",
      });
      return;
    }

    const exportData: any[] = [];
    
    filteredOrders.forEach((order) => {
      order.order_items.forEach((item) => {
        const shippingAddress = order.shipping_address && order.shipping_city && order.shipping_state && order.shipping_pincode
          ? `${order.shipping_address}, ${order.shipping_city}, ${order.shipping_state} - ${order.shipping_pincode}`
          : 'N/A';

        exportData.push({
          'Order Number': order.order_number,
          'Date': formatDate(order.created_at),
          'Status': order.status,
          'Customer Name': order.customer_name || 'N/A',
          'Customer Email': order.customer_email || 'N/A',
          'Customer Phone': order.customer_phone || 'N/A',
          'Shipping Address': shippingAddress,
          'Product Code': item.products?.["Funskool Code"] || 'N/A',
          'Product Name': item.products?.["Material Desc"] || 'N/A',
          'Brand': item.products?.["Brand Desc"] || 'N/A',
          'Quantity': item.quantity,
          'Unit Price': `₹${item.price.toFixed(2)}`,
          'Line Total': `₹${(item.price * item.quantity).toFixed(2)}`,
          'Shipping Amount': `₹${(order.shipping_amount || 0).toFixed(2)}`,
          'Discount Amount': `₹${(order.discount_amount || 0).toFixed(2)}`,
          'Order Total': `₹${order.total_amount.toFixed(2)}`,
        });
      });
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'All Orders');
    
    // Auto-size columns
    const maxWidth = 50;
    ws['!cols'] = [
      { wch: 20 }, { wch: 18 }, { wch: 12 }, { wch: 20 }, { wch: 25 },
      { wch: 15 }, { wch: 50 }, { wch: 15 }, { wch: 30 }, { wch: 15 },
      { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 15 },
      { wch: 12 }
    ];

    const fileName = `All_Orders_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
    
    toast({
      title: "Success",
      description: `Exported ${filteredOrders.length} orders to Excel`,
    });
  };

  const exportOrderToExcel = (order: OrderDetails) => {
    const shippingAddress = order.shipping_address && order.shipping_city && order.shipping_state && order.shipping_pincode
      ? `${order.shipping_address}, ${order.shipping_city}, ${order.shipping_state} - ${order.shipping_pincode}`
      : 'N/A';

    const exportData = order.order_items.map((item) => ({
      'Order Number': order.order_number,
      'Date': formatDate(order.created_at),
      'Status': order.status,
      'Customer Name': order.customer_name || 'N/A',
      'Customer Email': order.customer_email || 'N/A',
      'Customer Phone': order.customer_phone || 'N/A',
      'Shipping Address': shippingAddress,
      'Product Code': item.products?.["Funskool Code"] || 'N/A',
      'Product Name': item.products?.["Material Desc"] || 'N/A',
      'Brand': item.products?.["Brand Desc"] || 'N/A',
      'Quantity': item.quantity,
      'Unit Price': `₹${item.price.toFixed(2)}`,
      'Line Total': `₹${(item.price * item.quantity).toFixed(2)}`,
      'Subtotal': `₹${order.total_amount.toFixed(2)}`,
      'Shipping': `₹${(order.shipping_amount || 0).toFixed(2)}`,
      'Discount': `₹${(order.discount_amount || 0).toFixed(2)}`,
      'Total Amount': `₹${order.total_amount.toFixed(2)}`,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Order Details');
    
    // Auto-size columns
    const maxWidth = exportData.reduce((w, r) => Math.max(w, r['Product Name'].length), 10);
    ws['!cols'] = [
      { wch: 20 }, { wch: 18 }, { wch: 12 }, { wch: 20 }, { wch: 25 },
      { wch: 15 }, { wch: 40 }, { wch: 15 }, { wch: maxWidth }, { wch: 15 },
      { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
      { wch: 12 }, { wch: 12 }
    ];

    XLSX.writeFile(wb, `Order_${order.order_number}.xlsx`);
    
    toast({
      title: "Success",
      description: "Order exported to Excel successfully",
    });
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      // Get order details before updating
      const order = orders.find(o => o.id === orderId);
      
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      // Send email notification if status is changed to delivered
      if (newStatus === 'delivered' && order) {
        try {
          const productNames = order.order_items.map(item => 
            item.products?.["Material Desc"] || "Product"
          );

          await supabase.functions.invoke('send-delivery-notification', {
            body: {
              customerEmail: order.customer_email,
              customerName: order.customer_name || 'Valued Customer',
              orderNumber: order.order_number,
              productNames: productNames,
            }
          });

          console.log('Delivery notification email sent');
        } catch (emailError) {
          console.error('Failed to send delivery notification:', emailError);
          // Don't fail the status update if email fails
        }
      }

      toast({
        title: "Success",
        description: "Order status updated successfully",
      });

      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.status.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    const orderDate = new Date(order.created_at);
    const matchesDateFrom = !dateFrom || orderDate >= new Date(dateFrom);
    const matchesDateTo = !dateTo || orderDate <= new Date(dateTo + "T23:59:59");
    
    return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case 'processing':
        return "bg-blue-100 text-blue-800 border-blue-200";
      case 'shipped':
        return "bg-purple-100 text-purple-800 border-purple-200";
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Order Management</CardTitle>
            <CardDescription>View and manage all customer orders</CardDescription>
          </div>
          <Button onClick={exportAllOrdersToExcel} variant="default">
            <FileDown className="h-4 w-4 mr-2" />
            Export All Orders
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders by order number or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">From Date</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">To Date</label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Number</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.order_number}</TableCell>
                  <TableCell>{formatDate(order.created_at)}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {order.order_items.map((item) => (
                        <div key={item.id} className="text-sm">
                          {item.products?.["Material Desc"]} ({item.quantity}x)
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">
                    ₹{order.total_amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchOrderDetails(order.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Select
                        value={order.status}
                        onValueChange={(value) => handleStatusUpdate(order.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover">
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
            No orders found
          </div>
        )}
      </CardContent>

      {/* Order Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details - {selectedOrder?.order_number}</DialogTitle>
            <DialogDescription>
              Complete order information and customer details
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Information */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Order Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Order Number:</span>
                    <p className="font-medium">{selectedOrder.order_number}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Order Date:</span>
                    <p className="font-medium">{formatDate(selectedOrder.created_at)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <Badge className={getStatusColor(selectedOrder.status)}>
                      {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Amount:</span>
                    <p className="font-medium text-lg">₹{selectedOrder.total_amount.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Customer Information */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>
                    <p className="font-medium">{selectedOrder.customer_name || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <p className="font-medium">{selectedOrder.customer_email || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone:</span>
                    <p className="font-medium">{selectedOrder.customer_phone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {selectedOrder.shipping_address && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Shipping Address</h3>
                    <div className="text-sm">
                      <p>{selectedOrder.shipping_address}</p>
                      <p>{selectedOrder.shipping_city}, {selectedOrder.shipping_state}</p>
                      <p>PIN: {selectedOrder.shipping_pincode}</p>
                    </div>
                  </div>
                </>
              )}

              <Separator />

              {/* Order Items */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Order Items</h3>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Brand</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.order_items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            {item.products?.["Material Desc"] || 'N/A'}
                          </TableCell>
                          <TableCell>{item.products?.["Brand Desc"] || 'N/A'}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">₹{item.price.toFixed(2)}</TableCell>
                          <TableCell className="text-right font-medium">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <Separator />

              {/* Order Summary */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{selectedOrder.total_amount.toFixed(2)}</span>
                  </div>
                  {selectedOrder.shipping_amount > 0 && (
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span>₹{selectedOrder.shipping_amount.toFixed(2)}</span>
                    </div>
                  )}
                  {selectedOrder.discount_amount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span>-₹{selectedOrder.discount_amount.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>₹{selectedOrder.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};
