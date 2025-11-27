import { useState, useEffect } from "react";
import { ShoppingCart, Search, Menu, User, LogOut, X, Heart, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import leadShineLogo from "@/assets/leadshine-logo.png";

interface AnnouncementBanner {
  text: string;
  button_text: string | null;
  button_link: string | null;
  is_active: boolean;
  bg_color: string;
  text_color: string;
}

const Header = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { cartCount } = useCart();
  const { wishlistItems } = useWishlist();
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false); // desktop search popover
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false); // mobile search sheet
  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState("all");
  const [ageFilter, setAgeFilter] = useState("all");
  const [banner, setBanner] = useState<AnnouncementBanner | null>(null);

  useEffect(() => {
    fetchBanner();
  }, []);

  const fetchBanner = async () => {
    try {
      const { data, error } = await supabase
        .from("announcement_banner")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (data) setBanner(data);
    } catch (error) {
      console.error("Error fetching banner:", error);
    }
  };

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      // Clear local user state first
      setUser(null);
      
      // Then attempt to sign out from Supabase
      await supabase.auth.signOut();
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      navigate("/");
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      navigate("/");
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (priceFilter !== "all") params.set("price", priceFilter);
    if (ageFilter !== "all") params.set("age", ageFilter);
    
    navigate(`/shop-all?${params.toString()}`);
    setSearchOpen(false);
    setMobileSearchOpen(false);
    setSearchTerm("");
    setPriceFilter("all");
    setAgeFilter("all");
  };

  return (
    <>
      {/* Top banner - Non-sticky */}
      {banner && (
        <div className={`${banner.bg_color} ${banner.text_color} text-center py-2 px-4 border-b-2 border-foreground`}>
          <div className="flex items-center justify-center gap-4">
            <p className="text-sm font-display font-bold">{banner.text}</p>
            {banner.button_text && banner.button_link && (
              <Link to={banner.button_link}>
                <Button size="sm" variant="secondary" className="h-7 text-xs">
                  {banner.button_text}
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Main header - Sticky */}
      <header className="bg-white shadow-sticker border-b-4 border-foreground sticky top-0 z-50">
        <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo */}
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            <a href="/" className="flex items-center space-x-2 sm:space-x-3 hover-pop">
              <img 
                src={leadShineLogo} 
                alt="Leadshine Logo" 
                className="h-8 sm:h-10 md:h-12 w-auto"
              />
              <span className="font-display font-bold text-lg sm:text-xl md:text-2xl text-primary">
                Leadshine
              </span>
            </a>
          </div>

          {/* Search bar */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-4">
            <Popover open={searchOpen} onOpenChange={setSearchOpen}>
              <PopoverTrigger asChild>
                <div className="relative w-full cursor-pointer group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary h-5 w-5 pointer-events-none" />
                  <Input
                    placeholder="Search toys, games, and more... 🔍"
                    className="pl-12 pr-12 h-12 bg-muted/50 border-2 border-foreground rounded-full font-display focus:bg-background focus:shadow-glow cursor-pointer"
                    readOnly
                  />
                  <Filter className="absolute right-4 top-1/2 transform -translate-y-1/2 text-primary h-5 w-5 pointer-events-none" />
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-4 border-2 border-foreground shadow-sticker rounded-3xl" align="start">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-display font-bold mb-2 block">Search Products</label>
                    <Input
                      placeholder="Enter product name, brand..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      className="border-2 border-foreground rounded-2xl font-display"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-display font-bold mb-2 block">Price Range</label>
                    <Select value={priceFilter} onValueChange={setPriceFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select price range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Prices</SelectItem>
                        <SelectItem value="0-500">Under ₹500</SelectItem>
                        <SelectItem value="500-1000">₹500 - ₹1000</SelectItem>
                        <SelectItem value="1000-2000">₹1000 - ₹2000</SelectItem>
                        <SelectItem value="2000-5000">₹2000 - ₹5000</SelectItem>
                        <SelectItem value="5000+">Above ₹5000</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-display font-bold mb-2 block">Age Range</label>
                    <Select value={ageFilter} onValueChange={setAgeFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select age range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Ages</SelectItem>
                        <SelectItem value="0-2 Years">0-2 Years</SelectItem>
                        <SelectItem value="3-5 Years">3-5 Years</SelectItem>
                        <SelectItem value="6-8 Years">6-8 Years</SelectItem>
                        <SelectItem value="9-12 Years">9-12 Years</SelectItem>
                        <SelectItem value="13+ Years">13+ Years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button onClick={handleSearch} className="w-full font-display">
                    <Search className="h-4 w-4 mr-2" />
                    Search Products 🎯
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Right actions */}
          <div className="flex items-center space-x-1 md:space-x-2">
            {/* Mobile Search Button */}
            <Sheet open={mobileSearchOpen} onOpenChange={setMobileSearchOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden hover-pop">
                  <Search className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="top" className="h-auto max-h-[90vh] overflow-y-auto">
                <SheetHeader className="mb-2">
                  <SheetTitle className="font-display">Search Products</SheetTitle>
                  <SheetDescription>Find toys by name, price range, and age group.</SheetDescription>
                </SheetHeader>
                <div className="space-y-4 pb-4">
                  <div>
                    <label className="text-sm font-display font-bold mb-2 block">Product Name</label>
                    <Input
                      placeholder="Enter product name, brand..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      className="border-2 border-foreground rounded-2xl font-display"
                      autoFocus
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-display font-bold mb-2 block">Price Range</label>
                    <Select value={priceFilter} onValueChange={setPriceFilter}>
                      <SelectTrigger className="border-2 border-foreground rounded-2xl">
                        <SelectValue placeholder="Select price range" />
                      </SelectTrigger>
                      <SelectContent className="z-[100]">
                        <SelectItem value="all">All Prices</SelectItem>
                        <SelectItem value="0-500">Under ₹500</SelectItem>
                        <SelectItem value="500-1000">₹500 - ₹1000</SelectItem>
                        <SelectItem value="1000-2000">₹1000 - ₹2000</SelectItem>
                        <SelectItem value="2000-5000">₹2000 - ₹5000</SelectItem>
                        <SelectItem value="5000+">Above ₹5000</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-display font-bold mb-2 block">Age Range</label>
                    <Select value={ageFilter} onValueChange={setAgeFilter}>
                      <SelectTrigger className="border-2 border-foreground rounded-2xl">
                        <SelectValue placeholder="Select age range" />
                      </SelectTrigger>
                      <SelectContent className="z-[100]">
                        <SelectItem value="all">All Ages</SelectItem>
                        <SelectItem value="0-2 Years">0-2 Years</SelectItem>
                        <SelectItem value="3-5 Years">3-5 Years</SelectItem>
                        <SelectItem value="6-8 Years">6-8 Years</SelectItem>
                        <SelectItem value="9-12 Years">9-12 Years</SelectItem>
                        <SelectItem value="13+ Years">13+ Years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button onClick={handleSearch} className="w-full font-display h-12 rounded-full border-2 border-foreground">
                    <Search className="h-4 w-4 mr-2" />
                    Search Products 🎯
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            {user ? (
              <>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate('/orders')}
                  className="hidden lg:flex font-display"
                >
                  Orders
                </Button>
                <Button variant="ghost" size="icon" onClick={() => navigate('/profile')} className="hover-pop hidden sm:flex">
                  <User className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="relative hover-pop" onClick={() => navigate('/wishlist')}>
                  <Heart className="h-5 w-5 fill-primary text-primary" />
                  {wishlistItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-accent text-foreground rounded-full text-xs w-5 h-5 flex items-center justify-center font-display font-bold border-2 border-foreground">
                      {wishlistItems.length}
                    </span>
                  )}
                </Button>
                <Button variant="ghost" size="icon" className="relative hover-pop" onClick={() => navigate('/cart')}>
                  <ShoppingCart className="h-5 w-5 fill-primary text-primary" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-accent text-foreground rounded-full text-xs w-5 h-5 flex items-center justify-center font-display font-bold border-2 border-foreground">
                      {cartCount}
                    </span>
                  )}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout}
                  className="hidden lg:flex font-display"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => navigate('/auth')}
                className="font-display text-xs sm:text-sm px-2 sm:px-4"
              >
                Login 🔐
              </Button>
            )}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col space-y-4 mt-8">
                  <a 
                    href="/shop-all" 
                    className="text-foreground hover:text-primary font-medium transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Shop All Products
                  </a>
                  <a 
                    href="/new-arrivals" 
                    className="text-foreground hover:text-primary font-medium transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    New Arrivals
                  </a>
                  <a 
                    href="/trending" 
                    className="text-foreground hover:text-primary font-medium transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Trending
                  </a>
                  <a 
                    href="/school-essentials" 
                    className="text-foreground hover:text-primary font-medium transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    School Essentials
                  </a>
                  <a 
                    href="/toys-and-games" 
                    className="text-foreground hover:text-primary font-medium transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Toys & Games
                  </a>
                  <a 
                    href="/kids-accessories" 
                    className="text-foreground hover:text-primary font-medium transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Kids Accessories
                  </a>
                  <a 
                    href="/art-and-crafts" 
                    className="text-foreground hover:text-primary font-medium transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Art & Crafts
                  </a>
                  {user && (
                    <>
                      <a 
                        href="/wishlist" 
                        className="text-foreground hover:text-primary font-medium transition-colors py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Wishlist
                      </a>
                      <a 
                        href="/orders" 
                        className="text-foreground hover:text-primary font-medium transition-colors py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Orders
                      </a>
                      <Button 
                        variant="ghost" 
                        onClick={() => {
                          handleLogout();
                          setMobileMenuOpen(false);
                        }}
                        className="justify-start px-0"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </Button>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 hidden md:block border-t-2 border-foreground/10 pt-4">
          <ul className="flex space-x-6 justify-center">
            <li>
              <a href="/shop-all" className="text-foreground hover:text-primary font-display font-semibold transition-colors hover-pop inline-block">
                Shop All 🛍️
              </a>
            </li>
            <li>
              <a href="/new-arrivals" className="text-foreground hover:text-primary font-display font-semibold transition-colors hover-pop inline-block">
                New Arrivals ✨
              </a>
            </li>
            <li>
              <a href="/trending" className="text-foreground hover:text-primary font-display font-semibold transition-colors hover-pop inline-block">
                Trending 🔥
              </a>
            </li>
            <li>
              <a href="/school-essentials" className="text-foreground hover:text-primary font-display font-semibold transition-colors hover-pop inline-block">
                School 📚
              </a>
            </li>
            <li>
              <a href="/toys-and-games" className="text-foreground hover:text-primary font-display font-semibold transition-colors hover-pop inline-block">
                Toys & Games 🎮
              </a>
            </li>
            <li>
              <a href="/kids-accessories" className="text-foreground hover:text-primary font-display font-semibold transition-colors hover-pop inline-block">
                Accessories 👒
              </a>
            </li>
            <li>
              <a href="/art-and-crafts" className="text-foreground hover:text-primary font-display font-semibold transition-colors hover-pop inline-block">
                Art & Crafts 🎨
              </a>
            </li>
          </ul>
        </nav>
        </div>
      </header>
    </>
  );
};

export default Header;