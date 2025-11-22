import Header from "@/components/Header";
import Footer from "@/components/Footer";

const ShippingPolicy = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-foreground mb-8">Shipping Policy</h1>
        
        <div className="prose prose-lg max-w-none space-y-6 text-muted-foreground">
          <p className="text-sm text-muted-foreground mb-6">Last updated on Nov 22nd 2025</p>
          
          <section>
            <p className="leading-relaxed">
              For International buyers, orders are shipped and delivered through registered international courier companies and/or International speed post only. For domestic buyers, orders are shipped through registered domestic courier companies and /or speed post only. Orders are shipped within 0-7 days or as per the delivery date agreed at the time of order confirmation and delivering of the shipment subject to Courier Company / post office norms.
            </p>
          </section>

          <section>
            <p className="leading-relaxed">
              LEAD SHINE MARKETING is not liable for any delay in delivery by the courier company / postal authorities and only guarantees to hand over the consignment to the courier company or postal authorities within 0-7 days from the date of the order and payment or as per the delivery date agreed at the time of order confirmation.
            </p>
          </section>

          <section>
            <p className="leading-relaxed">
              Delivery of all orders will be to the address provided by the buyer. Delivery of our services will be confirmed on your mail ID as specified during registration.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Us</h2>
            <p className="mb-4">
              For any issues in utilizing our services you may contact our helpdesk:
            </p>
            <div className="space-y-2">
              <p>Phone: <a href="tel:+919820142014" className="text-primary hover:underline">+91 9820142014</a></p>
              <p>Email: <a href="mailto:leadshinemarketing@gmail.com" className="text-primary hover:underline">leadshinemarketing@gmail.com</a></p>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ShippingPolicy;
