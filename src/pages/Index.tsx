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
      <SEO
        title="Buy Kids Toys, Educational Toys & Games Online"
        description="Discover a world of fun, creativity, and imagination at Leadshine Toys. Shop toys for kids of all ages – educational toys, games, art supplies & more."
        path="/"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Leadshine Toys",
            "url": "https://leadshine-main.lovable.app",
            "logo": "https://storage.googleapis.com/gpt-engineer-file-uploads/Rj1PELJOwkaBxWt3yxqMWcoLADY2/social-images/social-1773679227750-social.webp",
            "description": "Your trusted online destination for quality kids toys, educational games, and creative supplies in India.",
            "sameAs": []
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Leadshine Toys",
            "url": "https://leadshine-main.lovable.app",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://leadshine-main.lovable.app/shop-all?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          }
        ]}
      />
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
