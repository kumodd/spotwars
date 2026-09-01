import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy and data collection practices for InternetBillboard.space",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bg text-ink">
      <Navbar />

      <main className="flex-grow max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-20 w-full">
        <h1 className="font-display font-black text-4xl sm:text-5xl text-ink tracking-tight uppercase leading-none mb-8">
          Privacy Policy
        </h1>
        
        <div className="prose prose-sm sm:prose-base prose-neutral text-ink-muted">
          <p className="font-bold uppercase tracking-widest text-xs mb-8">Last Updated: September 2026</p>

          <p className="mb-6 leading-relaxed">
            InternetBillboard.space ("we," "our," or "us") respects your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our Service.
          </p>

          <h2 className="font-display font-black text-2xl text-ink uppercase tracking-tight mt-10 mb-4">1. Information We Collect</h2>
          <p className="mb-6 leading-relaxed">
            We collect information that you voluntarily provide to us when you register on the Service, express an interest in obtaining information about us or our products, or otherwise when you contact us.
          </p>
          <ul className="list-disc pl-5 mb-6 space-y-2">
            <li><strong>Personal Information:</strong> When you create an account, we collect your email address, name, and authentication data provided by third-party identity providers (e.g., Google, GitHub) through our authentication partner, Supabase.</li>
            <li><strong>Product Information:</strong> When you submit a product, we collect the product name, URL, tagline, logo, and related metadata.</li>
            <li><strong>Financial Data:</strong> When you make a payment to bid on a position, we collect data necessary to process your payment. <strong>We do not store full credit card numbers on our servers.</strong> All payments are securely processed by Razorpay.</li>
          </ul>

          <h2 className="font-display font-black text-2xl text-ink uppercase tracking-tight mt-10 mb-4">2. Publicly Available Information</h2>
          <p className="mb-6 leading-relaxed">
            The core premise of InternetBillboard.space is to publicly display products competing for attention. By submitting a product and making a payment, you acknowledge and agree that the following information will be <strong>publicly visible</strong> to anyone visiting the site:
          </p>
          <ul className="list-disc pl-5 mb-6 space-y-2">
            <li>Your product's name, logo, tagline, category, and URL.</li>
            <li>The total amount spent on the board ("Spend").</li>
            <li>Historical data regarding your product's rank, movement, and clicks.</li>
          </ul>

          <h2 className="font-display font-black text-2xl text-ink uppercase tracking-tight mt-10 mb-4">3. How We Use Your Information</h2>
          <p className="mb-6 leading-relaxed">
            We use the information we collect or receive:
          </p>
          <ul className="list-disc pl-5 mb-6 space-y-2">
            <li>To facilitate account creation and logon process.</li>
            <li>To provide, operate, and maintain our Service.</li>
            <li>To process your transactions and manage your bids.</li>
            <li>To track and analyze clicks and interactions with your listed products.</li>
            <li>To enforce our terms, conditions, and policies, including preventing fraudulent transactions or abuse of the Service.</li>
          </ul>

          <h2 className="font-display font-black text-2xl text-ink uppercase tracking-tight mt-10 mb-4">4. Cookies and Tracking Technologies</h2>
          <p className="mb-6 leading-relaxed">
            We use cookies and similar tracking technologies (like web beacons and pixels) to access or store information. This is primarily used to maintain your authenticated session, remember your preferences, and analyze aggregate traffic (e.g., counting total clicks on a product URL).
          </p>

          <h2 className="font-display font-black text-2xl text-ink uppercase tracking-tight mt-10 mb-4">5. Third-Party Service Providers</h2>
          <p className="mb-6 leading-relaxed">
            We share information with third-party vendors that perform services for us or on our behalf, including:
          </p>
          <ul className="list-disc pl-5 mb-6 space-y-2">
            <li><strong>Supabase:</strong> For secure database hosting and user authentication.</li>
            <li><strong>Razorpay:</strong> For secure payment processing.</li>
          </ul>
          <p className="mb-6 leading-relaxed">
            These third parties are bound by strict confidentiality obligations and are only authorized to use your information as necessary to provide these services to us.
          </p>

          <h2 className="font-display font-black text-2xl text-ink uppercase tracking-tight mt-10 mb-4">6. Data Retention</h2>
          <p className="mb-6 leading-relaxed">
            We will only keep your personal information for as long as it is necessary for the purposes set out in this Privacy Policy, unless a longer retention period is required or permitted by law (such as tax, accounting, or other legal requirements).
          </p>

          <h2 className="font-display font-black text-2xl text-ink uppercase tracking-tight mt-10 mb-4">7. Contact Us</h2>
          <p className="mb-6 leading-relaxed">
            If you have questions or comments about this Privacy Policy, please contact us at:
          </p>
          <div className="mt-12 pt-8 border-t border-bg-border">
            <p className="text-sm font-semibold uppercase tracking-widest text-ink">
              legal@internetbillboard.space
            </p>
          </div>
        </div>
      </main>

      <div className="mt-auto w-full">
        <Footer />
      </div>
    </div>
  );
}
