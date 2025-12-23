import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { MessageCircle } from "lucide-react";

const RefundPolicy = () => {
  const whatsappNumber = "919820142014";
  const whatsappMessage = encodeURIComponent("Hi, I would like to inquire about a refund for my order.");
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-foreground mb-8">Refund Policy</h1>
        
        <div className="prose prose-lg max-w-none space-y-6 text-muted-foreground">
          <p className="text-sm text-muted-foreground mb-6">Last updated on Nov 22nd 2025</p>
          
          {/* WhatsApp Contact Box */}
          <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-3 mb-3">
              <MessageCircle className="h-6 w-6 text-green-600" />
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 m-0">Need a Refund?</h3>
            </div>
            <p className="text-green-700 dark:text-green-300 mb-4">
              For any refund inquiries, please contact us directly on WhatsApp for quick assistance.
            </p>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
              Message us on WhatsApp
            </a>
          </div>
          
          <section>
            <p className="leading-relaxed">
              LEAD SHINE MARKETING believes in helping its customers as far as possible, and has therefore a liberal cancellation policy. Under this policy:
            </p>
          </section>

          <section>
            <p className="leading-relaxed">
              Cancellations will be considered only if the request is made within Not Applicable of placing the order. However, the cancellation request may not be entertained if the orders have been communicated to the vendors/merchants and they have initiated the process of shipping them.
            </p>
          </section>

          <section>
            <p className="leading-relaxed">
              LEAD SHINE MARKETING does not accept cancellation requests for perishable items like flowers, eatables etc. However, refund/replacement can be made if the customer establishes that the quality of product delivered is not good.
            </p>
          </section>

          <section>
            <p className="leading-relaxed">
              In case of receipt of damaged or defective items please report the same to our Customer Service team. The request will, however, be entertained once the merchant has checked and determined the same at his own end. This should be reported within Not Applicable of receipt of the products.
            </p>
          </section>

          <section>
            <p className="leading-relaxed">
              In case you feel that the product received is not as shown on the site or as per your expectations, you must bring it to the notice of our customer service within Not Applicable of receiving the product. The Customer Service Team after looking into your complaint will take an appropriate decision.
            </p>
          </section>

          <section>
            <p className="leading-relaxed">
              In case of complaints regarding products that come with a warranty from manufacturers, please refer the issue to them.
            </p>
          </section>

          <section>
            <p className="leading-relaxed">
              In case of any Refunds approved by the LEAD SHINE MARKETING, it'll take Not Applicable for the refund to be processed to the end customer.
            </p>
          </section>

          <section>
            <p className="text-sm italic">
              Disclaimer: The above content is created at LEAD SHINE MARKETING's sole discretion.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Us</h2>
            <p className="mb-4">
              If you have any questions about our refund policy or need assistance with a refund request, please contact our customer service team.
            </p>
            <div className="space-y-2">
              <p>Phone: <a href="tel:+919820142014" className="text-primary hover:underline">+91 9820142014</a></p>
              <p>Email: <a href="mailto:leadshinemarketing@gmail.com" className="text-primary hover:underline">leadshinemarketing@gmail.com</a></p>
              <p>
                WhatsApp: <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">+91 9820142014</a>
              </p>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RefundPolicy;
