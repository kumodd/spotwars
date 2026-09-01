import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms and conditions for using InternetBillboard.space",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bg text-ink">
      <Navbar />

      <main className="flex-grow max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-20 w-full">
        <h1 className="font-display font-black text-4xl sm:text-5xl text-ink tracking-tight uppercase leading-none mb-8">
          Terms of Service
        </h1>
        
        <div className="prose prose-sm sm:prose-base prose-neutral text-ink-muted">
          <p className="font-bold uppercase tracking-widest text-xs mb-8">Last Updated: September 2026</p>

          <p className="mb-6 leading-relaxed">
            Welcome to InternetBillboard.space ("we," "our," or "us"). By accessing or using our website and services (the "Service"), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use the Service.
          </p>

          <h2 className="font-display font-black text-2xl text-ink uppercase tracking-tight mt-10 mb-4">1. Description of Service</h2>
          <p className="mb-6 leading-relaxed">
            InternetBillboard.space operates a competitive real-time attention market ("Live Board"). Users ("Founders" or "Advertisers") can pay to list their products on the board and "take" positions from other products by outbidding their current spend. The board is dynamic; positions are entirely dependent on user bids.
          </p>

          <h2 className="font-display font-black text-2xl text-ink uppercase tracking-tight mt-10 mb-4">2. Payments & Non-Refundable Nature</h2>
          <p className="mb-6 leading-relaxed">
            Due to the competitive and ephemeral nature of the Service, <strong>all payments and bids made on InternetBillboard.space are final and non-refundable</strong>. 
          </p>
          <ul className="list-disc pl-5 mb-6 space-y-2">
            <li>When you pay to "Take" a position, you are purchasing the immediate placement at that rank.</li>
            <li><strong>No Guarantee of Duration:</strong> We do not guarantee that your product will hold its position for any specific duration. Another user can outbid you and take your position at any moment, even immediately after your purchase.</li>
            <li>If your position is taken, you will not receive a refund or pro-rated credit.</li>
          </ul>

          <h2 className="font-display font-black text-2xl text-ink uppercase tracking-tight mt-10 mb-4">3. User-Generated Content & Conduct</h2>
          <p className="mb-6 leading-relaxed">
            You are solely responsible for the information, links, images (logos), and taglines you submit for your product. By submitting content, you grant us a worldwide, non-exclusive, royalty-free license to display it on the Service.
          </p>
          <p className="mb-6 leading-relaxed">You agree <strong>not</strong> to submit products or content that:</p>
          <ul className="list-disc pl-5 mb-6 space-y-2">
            <li>Are illegal, fraudulent, or promote illegal activities.</li>
            <li>Contain explicit, pornographic, or highly offensive material.</li>
            <li>Infringe upon the intellectual property rights of others.</li>
            <li>Are malicious, including sites distributing malware or phishing schemes.</li>
          </ul>
          <p className="mb-6 leading-relaxed">
            We reserve the right to remove, edit, or ban any product or user at our sole discretion, without notice and without refund, if we determine the content violates these Terms or harms the integrity of the Service.
          </p>

          <h2 className="font-display font-black text-2xl text-ink uppercase tracking-tight mt-10 mb-4">4. No Guarantee of Results</h2>
          <p className="mb-6 leading-relaxed">
            InternetBillboard.space provides a platform for visibility. We make <strong>no guarantees</strong> regarding the number of impressions, clicks, traffic, conversions, or return on investment (ROI) your product will receive by being listed on the Live Board.
          </p>

          <h2 className="font-display font-black text-2xl text-ink uppercase tracking-tight mt-10 mb-4">5. Disclaimer of Warranties</h2>
          <p className="mb-6 leading-relaxed">
            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE." WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
          </p>

          <h2 className="font-display font-black text-2xl text-ink uppercase tracking-tight mt-10 mb-4">6. Limitation of Liability</h2>
          <p className="mb-6 leading-relaxed">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, INTERNETBILLBOARD.SPACE AND ITS OPERATORS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM (A) YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICE; (B) ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON THE SERVICE; OR (C) UNAUTHORIZED ACCESS, USE, OR ALTERATION OF YOUR TRANSMISSIONS OR CONTENT.
          </p>

          <h2 className="font-display font-black text-2xl text-ink uppercase tracking-tight mt-10 mb-4">7. Indemnification</h2>
          <p className="mb-6 leading-relaxed">
            You agree to defend, indemnify, and hold harmless InternetBillboard.space and its operators from and against any claims, damages, obligations, losses, liabilities, costs, or debt, and expenses arising from your use of the Service or your violation of these Terms.
          </p>

          <h2 className="font-display font-black text-2xl text-ink uppercase tracking-tight mt-10 mb-4">8. Governing Law</h2>
          <p className="mb-6 leading-relaxed">
            These Terms shall be governed and construed in accordance with the laws of the applicable jurisdiction, without regard to its conflict of law provisions.
          </p>

          <h2 className="font-display font-black text-2xl text-ink uppercase tracking-tight mt-10 mb-4">9. Changes</h2>
          <p className="mb-6 leading-relaxed">
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
          </p>

          <div className="mt-12 pt-8 border-t border-bg-border">
            <p className="text-sm font-semibold uppercase tracking-widest text-ink">
              Questions? Contact us at legal@internetbillboard.space
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
