import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Award, Globe, Heart } from "lucide-react";
import SEO from "@/components/SEO";

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="About Us"
        description="Learn about Leadshine Toys – your trusted online destination for quality kids toys, educational games, and creative supplies."
        path="/about-us"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "name": "About Leadshine Toys",
          "description": "Your trusted partner in providing premium quality toys and educational products for children worldwide.",
          "mainEntity": {
            "@type": "Organization",
            "name": "Leadshine Toys",
            "url": "https://leadshine-main.lovable.app"
          }
        }}
      />
      <Header />
      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">
            About Leadshine
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Your trusted partner in providing premium quality toys and educational products
            for children worldwide.
          </p>
        </section>

        {/* Story Section */}
        <section className="mb-16">
          <Card>
            <CardContent className="p-8 md:p-12">
              <h2 className="text-3xl font-display font-bold mb-6">Our Story</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Founded with a passion for childhood development and learning, Leadshine has been
                  dedicated to bringing joy and education to children through carefully curated toys
                  and games. We believe that play is essential for growth, creativity, and
                  imagination.
                </p>
                <p>
                  Over the years, we've built strong partnerships with manufacturers and retailers
                  worldwide, ensuring that quality, safety, and innovation remain at the heart of
                  everything we do. Our commitment to excellence has made us a trusted name in the
                  wholesale toy industry.
                </p>
                <p>
                  Today, we continue to expand our product range, focusing on educational value,
                  sustainability, and creating memorable experiences for children of all ages.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Values Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-display font-bold text-center mb-12">
            Our Core Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">Quality</h3>
                <p className="text-sm text-muted-foreground">
                  We ensure every product meets the highest safety and quality standards.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">Passion</h3>
                <p className="text-sm text-muted-foreground">
                  We're passionate about creating joyful learning experiences for children.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">Global Reach</h3>
                <p className="text-sm text-muted-foreground">
                  Serving retailers and educators across the world with reliable shipping.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">Partnership</h3>
                <p className="text-sm text-muted-foreground">
                  Building lasting relationships with our clients and suppliers.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Mission Section */}
        <section>
          <Card className="bg-gradient-primary">
            <CardContent className="p-8 md:p-12 text-center">
              <h2 className="text-3xl font-display font-bold text-primary-foreground mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-primary-foreground/90 max-w-3xl mx-auto">
                To empower children's growth and imagination by providing safe, innovative, and
                educational toys that inspire creativity, learning, and endless fun. We're
                committed to making quality playtime accessible to every child.
              </p>
            </CardContent>
          </Card>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AboutUs;
