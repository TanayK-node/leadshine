import Header from "@/components/Header";
import Footer from "@/components/Footer";

const RefundPolicy = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-foreground mb-8">Refund Policy</h1>
        
        <div className="prose prose-lg max-w-none space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Returns & Refunds</h2>
            <p>
              At Leadshine, we want you to be completely satisfied with your purchase. If you're not happy with your order,
              we offer a hassle-free return and refund policy within 30 days of delivery.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Eligibility for Returns</h2>
            <p>To be eligible for a return, your item must be:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Unused and in the same condition that you received it</li>
              <li>In the original packaging with all tags attached</li>
              <li>Accompanied by the original receipt or proof of purchase</li>
              <li>Returned within 30 days of delivery</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Non-Returnable Items</h2>
            <p>Certain items cannot be returned, including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Personalized or customized products</li>
              <li>Items marked as final sale</li>
              <li>Gift cards</li>
              <li>Downloadable products or digital content</li>
              <li>Opened hygiene products for safety reasons</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Refund Process</h2>
            <p>Once we receive your returned item, we will:</p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Inspect the item to ensure it meets our return criteria</li>
              <li>Process your refund within 5-7 business days</li>
              <li>Send you an email confirmation when the refund has been processed</li>
              <li>Credit the refund to your original payment method within 7-10 business days</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Shipping Costs</h2>
            <p>
              Original shipping charges are non-refundable. If you receive a refund, the cost of return shipping will be
              deducted from your refund, unless the return is due to our error (wrong item, defective product, etc.).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Exchanges</h2>
            <p>
              We only replace items if they are defective or damaged. If you need to exchange an item for the same product,
              please contact our customer service team and we'll arrange for a replacement to be sent as quickly as possible.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">How to Initiate a Return</h2>
            <p>To start a return:</p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Contact our customer service team with your order number</li>
              <li>Provide the reason for the return</li>
              <li>Wait for return authorization and instructions</li>
              <li>Pack the item securely in its original packaging</li>
              <li>Ship the item to the address provided in the return authorization</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Us</h2>
            <p className="mb-4">
              If you have any questions about our refund policy or need assistance with a refund request, please contact our customer service team. We're here to help make your shopping experience as smooth as possible.
            </p>
            <a 
              href="https://wa.me/919820142014"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20BA5A] text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              <svg 
                viewBox="0 0 24 24" 
                className="h-6 w-6 fill-current"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Chat on WhatsApp
            </a>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RefundPolicy;
