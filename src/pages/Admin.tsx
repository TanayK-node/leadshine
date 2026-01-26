import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrderManagement } from "@/components/admin/OrderManagement";
import { InventoryManagement } from "@/components/admin/InventoryManagement";
import { CouponManagement } from "@/components/admin/CouponManagement";
import { AdminManagement } from "@/components/admin/AdminManagement";
import { AnnouncementBannerManagement } from "@/components/admin/AnnouncementBannerManagement";
import { HeroBannerManagement } from "@/components/admin/HeroBannerManagement";
import { BrandManagement } from "@/components/admin/BrandManagement";
import CategoryManagement from "@/components/admin/CategoryManagement";
import { FeaturedProductManagement } from "@/components/admin/FeaturedProductManagement";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Package, TrendingUp, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Admin = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
    totalCustomers: 0,
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please login to access the admin dashboard");
        navigate("/auth");
        return;
      }

      // Check if user has admin role
      const { data: isAdmin, error } = await supabase.rpc('is_admin');
      
      if (error) {
        console.error('Error checking admin status:', error);
        toast.error("Failed to verify admin access");
        navigate("/");
        return;
      }

      if (!isAdmin) {
        toast.error("Access denied. Admin privileges required.");
        navigate("/");
        return;
      }
      
      await fetchStats();
      setIsLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const fetchStats = async () => {
    try {
      // Fetch total orders
      const { count: ordersCount, error: ordersError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      if (ordersError) throw ordersError;

      // Fetch total products
      const { count: productsCount, error: productsError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      if (productsError) throw productsError;

      // Fetch total revenue
      const { data: ordersData, error: revenueError } = await supabase
        .from('orders')
        .select('total_amount');

      if (revenueError) throw revenueError;

      const totalRevenue = ordersData?.reduce((sum, order) => sum + Number(order.total_amount || 0), 0) || 0;

      // Fetch unique customers count
      const { data: customersData, error: customersError } = await supabase
        .from('orders')
        .select('user_id');

      if (customersError) throw customersError;

      const uniqueCustomers = new Set(customersData?.map(order => order.user_id)).size;

      setStats({
        totalOrders: ordersCount || 0,
        totalProducts: productsCount || 0,
        totalRevenue: totalRevenue,
        totalCustomers: uniqueCustomers,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error("Failed to load dashboard statistics");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your toy wholesale business</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">Total orders placed</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-secondary/10 to-secondary/5 border-secondary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <Package className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">Available in inventory</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-accent/10 to-accent/5 border-accent/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">₹{stats.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Total revenue from orders</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-muted/20 to-muted/10 border-muted/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customers</CardTitle>
              <Users className="h-4 w-4 text-foreground/70" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCustomers}</div>
              <p className="text-xs text-muted-foreground">Unique customers</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-9 bg-card border">
            <TabsTrigger value="orders" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Orders
            </TabsTrigger>
            <TabsTrigger value="inventory" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Inventory
            </TabsTrigger>
            <TabsTrigger value="featured" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Featured
            </TabsTrigger>
            <TabsTrigger value="categories" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Categories
            </TabsTrigger>
            <TabsTrigger value="brands" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Brands
            </TabsTrigger>
            <TabsTrigger value="coupons" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Coupons
            </TabsTrigger>
            <TabsTrigger value="hero-banners" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Hero
            </TabsTrigger>
            <TabsTrigger value="banner" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Announce
            </TabsTrigger>
            <TabsTrigger value="admins" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Admins
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="orders">
            <OrderManagement />
          </TabsContent>
          
          <TabsContent value="inventory">
            <InventoryManagement />
          </TabsContent>

          <TabsContent value="featured">
            <FeaturedProductManagement />
          </TabsContent>

          <TabsContent value="categories">
            <CategoryManagement />
          </TabsContent>

          <TabsContent value="brands">
            <BrandManagement />
          </TabsContent>

          <TabsContent value="coupons">
            <CouponManagement />
          </TabsContent>

          <TabsContent value="hero-banners">
            <HeroBannerManagement />
          </TabsContent>

          <TabsContent value="banner">
            <AnnouncementBannerManagement />
          </TabsContent>

          <TabsContent value="admins">
            <AdminManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;