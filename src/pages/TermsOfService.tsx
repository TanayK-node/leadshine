import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO title="Terms of Service" description="Read the terms and conditions for using Leadshine Toys website and services." path="/terms-of-service" />
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-foreground mb-8">Terms of Service</h1>
        
        <div className="prose prose-lg max-w-none space-y-6 text-muted-foreground">
          <section>
            <p className="text-sm mb-4">Last updated: {new Date().toLocaleDateString()}</p>
            <p>
              Welcome to Leadshine. By accessing or using our website and services, you agree to be bound by these Terms of
              Service. Please read them carefully before making a purchase or using our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Acceptance of Terms</h2>
            <p>
              By accessing and using this website, you accept and agree to be bound by these Terms of Service and all
              applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or
              accessing this site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Use of Website</h2>
            <h3 className="text-xl font-semibold text-foreground mb-3">Permitted Use</h3>
            <p>You may use our website for lawful purposes only. You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the website in any way that violates any applicable law or regulation</li>
              <li>Engage in any conduct that restricts or inhibits anyone's use of the website</li>
              <li>Attempt to gain unauthorized access to any portion of the website</li>
              <li>Use any robot, spider, or other automatic device to access the website</li>
              <li>Introduce viruses, trojans, or other malicious code</li>
              <li>Interfere with the proper working of the website</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Account Registration</h2>
            <p>To access certain features of our website, you may be required to create an account. You agree to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and promptly update your account information</li>
              <li>Maintain the security of your password and account</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Product Information and Pricing</h2>
            <p>
              We strive to provide accurate product descriptions and pricing information. However, we do not warrant that
              product descriptions, pricing, or other content is accurate, complete, reliable, current, or error-free.
            </p>
            <p className="mt-4">We reserve the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Limit quantities of any products or services</li>
              <li>Refuse any order for any reason</li>
              <li>Correct errors in pricing or product information</li>
              <li>Discontinue any product at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Orders and Payment</h2>
            <p>
              All orders are subject to acceptance and availability. We reserve the right to refuse or cancel any order for
              any reason, including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Product unavailability</li>
              <li>Pricing or product information errors</li>
              <li>Suspected fraudulent transactions</li>
              <li>Orders that violate our terms</li>
            </ul>
            <p className="mt-4">
              Payment must be received before orders are processed. We accept various payment methods as indicated at
              checkout. All payments are processed securely through trusted payment providers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Shipping and Delivery</h2>
            <p>
              We will make reasonable efforts to deliver products within the estimated timeframes provided. However, delivery
              times are not guaranteed and may be affected by factors beyond our control. We are not liable for any delays in
              shipping or delivery.
            </p>
            <p className="mt-4">
              Risk of loss and title for products purchased pass to you upon delivery to the carrier.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Returns and Refunds</h2>
            <p>
              Our return and refund policy is outlined in our Refund Policy. Please review it carefully before making a
              purchase. By placing an order, you agree to our Refund Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Intellectual Property</h2>
            <p>
              All content on this website, including text, graphics, logos, images, and software, is the property of
              Leadshine or its content suppliers and is protected by intellectual property laws. You may not reproduce,
              distribute, or create derivative works without our express written permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, Leadshine shall not be liable for any indirect, incidental, special,
              consequential, or punitive damages arising out of or relating to your use of the website or products purchased.
              Our total liability shall not exceed the amount paid by you for the product giving rise to the claim.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Disclaimer of Warranties</h2>
            <p>
              The website and products are provided "as is" without warranties of any kind, either express or implied. We do
              not warrant that the website will be uninterrupted, error-free, or free of viruses or other harmful components.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless Leadshine, its affiliates, officers, directors, employees, and agents
              from any claims, damages, losses, liabilities, and expenses arising out of your use of the website or violation
              of these Terms of Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Governing Law</h2>
            <p>
              These Terms of Service shall be governed by and construed in accordance with the laws of the jurisdiction in
              which Leadshine operates, without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon
              posting to the website. Your continued use of the website following any changes constitutes acceptance of those
              changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Severability</h2>
            <p>
              If any provision of these Terms of Service is found to be invalid or unenforceable, the remaining provisions
              shall remain in full force and effect.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact our customer service team. We're here to
              help clarify any concerns you may have.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;
