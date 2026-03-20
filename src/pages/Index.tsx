import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import CategorySection from "@/components/CategorySection";
import FeaturedProducts from "@/components/FeaturedProducts";
import SpecialOffers from "@/components/SpecialOffers";
import ShopByAge from "@/components/ShopByAge";
import ShopByPrice from "@/components/ShopByPrice";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO title="Buy Kids Toys, Educational Toys & Games Online" description="Discover a world of fun, creativity, and imagination at Leadshine Toys. Shop toys for kids of all ages – educational toys, games, art supplies & more." path="/" />
      <Header />
      <main>
        <HeroSection />
        <FeaturedProducts />
        <CategorySection />
        <ShopByAge />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
