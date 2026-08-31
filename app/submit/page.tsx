"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { createClient } from "@/lib/supabase/client";
import { loadRazorpay, formatINR, formatCurrency } from "@/lib/utils";
import { CATEGORIES, PRICING_OPTIONS, COUNTRIES, type RazorpayPaymentResponse } from "@/lib/types";
import { ChevronRight, ChevronLeft, CheckCircle2, Loader2, Zap, Globe, Tag, DollarSign, Swords, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

const GLOBAL_BOARD_ID = process.env.NEXT_PUBLIC_GLOBAL_BOARD_ID || "";


const STEPS = [
  { id: 1, label: "Product Details", icon: <Tag className="w-4 h-4" /> },
  { id: 2, label: "Choose Board", icon: <Globe className="w-4 h-4" /> },
  { id: 3, label: "Set Budget", icon: <DollarSign className="w-4 h-4" /> },
  { id: 4, label: "Launch", icon: <Zap className="w-4 h-4" /> },
];

interface FormData {
  name: string;
  url: string;
  tagline: string;
  description: string;
  category: string;
  country: string;
  pricing: string;
  tags: string;
  founder_name: string;
  company_name: string;
  board_slug: string;
  board_id: string;
  amount: number;
  currency: "INR" | "USD";
}

const DEFAULT_FORM: FormData = {
  name: "",
  url: "",
  tagline: "",
  description: "",
  category: "",
  country: "IN",
  pricing: "Free",
  tags: "",
  founder_name: "",
  company_name: "",
  board_slug: "global",
  board_id: "",
  amount: 2900, // ₹29 in paise (minimum)
  currency: "INR",
};

const BOARD_OPTIONS = [
  { slug: "global", name: "🌐 Global Board", desc: "Compete with all products across every category", hot: true },
  { slug: "ai-ml", name: "🤖 AI & ML Board", desc: "For AI, machine learning & automation products" },
  { slug: "saas", name: "☁️ SaaS Board", desc: "For cloud software and subscription tools" },
  { slug: "dev-tools", name: "🛠️ Developer Tools", desc: "Built by devs, for devs" },
  { slug: "ecommerce", name: "🛒 E-commerce", desc: "Online stores, D2C, retail tech" },
  { slug: "fintech", name: "💰 Fintech", desc: "Financial tech and payments" },
  { slug: "education", name: "🎓 Education", desc: "EdTech and learning platforms" },
  { slug: "consumer-apps", name: "📱 Consumer Apps", desc: "Apps for everyday users" },
  { slug: "creator-tools", name: "🎨 Creator Tools", desc: "For content creators and media makers" },
];

const POSITION_PREVIEW_INR = [
  { position: 10, amount: 29 },
  { position: 7, amount: 150 },
  { position: 5, amount: 300 },
  { position: 3, amount: 700 },
  { position: 1, amount: 2000 },
];

const POSITION_PREVIEW_USD = [
  { position: 10, amount: 1 },
  { position: 7, amount: 5 },
  { position: 5, amount: 15 },
  { position: 3, amount: 35 },
  { position: 1, amount: 100 },
];

export default function SubmitPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalyzedUrl, setLastAnalyzedUrl] = useState("");
  const [error, setError] = useState("");
  const [productId, setProductId] = useState<string | null>(null);
  const [bidId, setBidId] = useState<string | null>(null);
  const [estimates, setEstimates] = useState<{ position: number, amount_paise: number }[]>([]);
  const [fetchingEstimates, setFetchingEstimates] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const update = (key: keyof FormData, value: string | number) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleAnalyzeUrl = async () => {
    if (!form.url) {
      setError("Please enter a URL to auto-fill.");
      return;
    }
    if (form.url === lastAnalyzedUrl) return; // Prevent duplicate triggers
    
    setIsAnalyzing(true);
    setError("");
    setLastAnalyzedUrl(form.url);
    try {
      const res = await fetch("/api/analyze-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: form.url }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Map AI category to our categories if possible, else default to global
      const aiCat = data.data.category;
      let matchedCategory: string = CATEGORIES[0];
      if (aiCat && aiCat !== 'global') {
        const found = CATEGORIES.find(c => c.toLowerCase().includes(aiCat.toLowerCase().replace('-', ' ')));
        if (found) matchedCategory = found;
      }

      setForm((prev) => ({
        ...prev,
        name: prev.name || data.data.name || "",
        tagline: prev.tagline || data.data.tagline || "",
        description: prev.description || data.data.description || "",
        category: prev.category || matchedCategory,
        tags: prev.tags || data.data.tags || "",
      }));
    } catch (err: any) {
      setError(err.message || "Failed to analyze URL.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const validateStep1 = () => {
    if (!form.name.trim()) return "Product name is required";
    let urlStr = form.url.trim();
    if (!urlStr) return "Product URL is required";
    if (!/^https?:\/\//i.test(urlStr)) urlStr = `https://${urlStr}`;
    try { new URL(urlStr); } catch { return "Please enter a valid URL (e.g. https://myproduct.com)"; }
    if (!form.tagline.trim()) return "Tagline is required";
    if (!form.category) return "Category is required";
    return null;
  };

  const handleStep1 = () => {
    const err = validateStep1();
    if (err) { setError(err); return; }
    setError("");
    setStep(2);
  };

  const handleStep2 = async (boardSlug: string) => {
    setLoading(true);
    const supabaseServer = createClient();
    const { data: board } = await supabaseServer.from("boards").select("id, slug").eq("slug", boardSlug).single();
    if (!board) { setError("Board not found"); setLoading(false); return; }
    update("board_slug", boardSlug);
    update("board_id", board.id);

    // Fetch estimates
    setFetchingEstimates(true);
    try {
      const res = await fetch(`/api/boards/estimates?board_id=${board.id}`);
      const estData = await res.json();
      if (estData.success) {
        setEstimates(estData.data);
      }
    } catch (e) {
      console.error(e);
    }
    setFetchingEstimates(false);

    setLoading(false);
    setStep(3);
  };

  const createProduct = async (): Promise<string | null> => {
    if (productId) return productId;
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        url: form.url.startsWith("http") ? form.url : `https://${form.url}`,
        tagline: form.tagline,
        description: form.description,
        category: form.category,
        country: form.country,
        pricing: form.pricing,
        tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
        founder_name: form.founder_name,
        company_name: form.company_name,
      }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.details ? `${data.error}: ${JSON.stringify(data.details)}` : data.error);
    setProductId(data.product.id);
    return data.product.id;
  };

  const handleLaunch = async () => {
    setLoading(true);
    setError("");
    const supabase = createClient();
    try {
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Could not load payment gateway");

      // Create product first
      const pid = await createProduct();
      if (!pid) throw new Error("Failed to create product");

      // Create Razorpay order
      const orderRes = await fetch("/api/bids/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: pid,
          board_id: form.board_id,
          amount: form.amount,
          type: "entry",
          currency: form.currency,
        }),
      });
      const { order, bid_id, error: orderErr } = await orderRes.json();
      if (orderErr || !order) throw new Error(orderErr || "Failed to create order");
      setBidId(bid_id);

      const { data: { user } } = await supabase.auth.getUser();

      await new Promise<void>((resolve, reject) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const RazorpayConstructor = (window as any).Razorpay as new (opts: Record<string, unknown>) => { open(): void; on(event: string, cb: (res: any) => void): void };
        const rzp = new RazorpayConstructor({
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: "INR",
          name: "SpotWars",
          description: `List ${form.name} on ${form.board_slug} board`,
          order_id: order.id,
          prefill: { email: user?.email || "" },
          theme: { color: "#7C3AED" },
          handler: async (response: RazorpayPaymentResponse) => {
            const verifyRes = await fetch("/api/bids/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                bid_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const vd = await verifyRes.json();
            if (vd.error) reject(new Error(vd.error));
            else resolve();
          },
          modal: { ondismiss: () => reject(new Error("cancelled")) },
        });

        rzp.on('payment.failed', (response: any) => {
          reject(new Error(`Payment failed: ${response.error.description || response.error.reason || 'Unknown error'}`));
        });

        rzp.open();
      });

      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      if (msg === "cancelled") {
        setError("Payment was cancelled or interrupted. Your product has been saved as 'Pending' in your dashboard. You can retry paying from there, or click Launch again below.");
      } else {
        setError(msg);
      }
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <div className="text-center animate-in fade-in zoom-in-95 duration-500 max-w-md">
          <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4 animate-bounce" />
          <h2 className="font-display font-bold text-3xl text-white mb-2">You're live! 🚀</h2>
          <p className="text-slate-400">Your product is now competing. Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center flex-1">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  step === s.id ? "bg-accent-purple text-white" :
                  step > s.id ? "bg-emerald-500/20 text-emerald-400" :
                  "bg-bg-elevated text-slate-500"
                }`}>
                  {step > s.id ? <CheckCircle2 className="w-3 h-3" /> : s.icon}
                  <span className="hidden sm:inline">{s.label}</span>
                  <span className="sm:hidden">{s.id}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-px mx-2 ${step > s.id ? "bg-emerald-500/30" : "bg-bg-border"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Card */}
        <div className="glass-elevated rounded-2xl border border-bg-border overflow-hidden">
          {/* Step 1: Product Details */}
          {step === 1 && (
            <div className="p-6">
              <h2 className="font-display font-bold text-2xl text-white mb-1">Your Product</h2>
              <p className="text-slate-400 text-sm mb-6">Tell the internet what you've built.</p>

              {error && <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm">{error}</div>}

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Product Name</label>
                    <input
                      id="product-name-input"
                      type="text"
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      placeholder="e.g. VoiceAI"
                      className="w-full bg-bg-elevated border border-bg-border rounded-xl px-4 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-accent-purple/60 transition-colors text-sm"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-medium text-slate-400">Product URL *</label>
                      <button 
                        type="button" 
                        onClick={handleAnalyzeUrl}
                        disabled={isAnalyzing || !form.url}
                        className="text-xs flex items-center gap-1 text-accent-purple hover:text-accent-purple-light transition-colors disabled:opacity-50"
                      >
                        {isAnalyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                        {isAnalyzing ? "Analyzing..." : "Auto-Fill with AI"}
                      </button>
                    </div>
                    <input
                      id="product-url-input"
                      type="url"
                      value={form.url}
                      onChange={(e) => update("url", e.target.value)}
                      onBlur={() => {
                        if (form.url && form.url !== lastAnalyzedUrl) {
                          handleAnalyzeUrl();
                        }
                      }}
                      placeholder="https://yourproduct.com"
                      className="w-full bg-bg-elevated border border-bg-border rounded-xl px-4 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-accent-purple/60 transition-colors text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Tagline</label>
                  <input
                    id="product-tagline-input"
                    type="text"
                    value={form.tagline}
                    onChange={(e) => update("tagline", e.target.value)}
                    placeholder="e.g. The AI that answers your customer calls"
                    maxLength={100}
                    className="w-full bg-bg-elevated border border-bg-border rounded-xl px-4 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-accent-purple/60 transition-colors text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Description</label>
                  <textarea
                    id="product-description-input"
                    value={form.description}
                    onChange={(e) => update("description", e.target.value)}
                    placeholder="Tell visitors more about your product..."
                    rows={3}
                    className="w-full bg-bg-elevated border border-bg-border rounded-xl px-4 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-accent-purple/60 transition-colors text-sm resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Category *</label>
                    <select
                      id="product-category-select"
                      value={form.category}
                      onChange={(e) => update("category", e.target.value)}
                      className="w-full bg-bg-elevated border border-bg-border rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-accent-purple/60 transition-colors text-sm appearance-none"
                    >
                      <option value="">Select...</option>
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Country</label>
                    <select
                      id="product-country-select"
                      value={form.country}
                      onChange={(e) => update("country", e.target.value)}
                      className="w-full bg-bg-elevated border border-bg-border rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-accent-purple/60 transition-colors text-sm appearance-none"
                    >
                      {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Pricing</label>
                    <select
                      id="product-pricing-select"
                      value={form.pricing}
                      onChange={(e) => update("pricing", e.target.value)}
                      className="w-full bg-bg-elevated border border-bg-border rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-accent-purple/60 transition-colors text-sm appearance-none"
                    >
                      {PRICING_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Tags <span className="text-slate-600">(comma separated)</span></label>
                    <input
                      id="product-tags-input"
                      type="text"
                      value={form.tags}
                      onChange={(e) => update("tags", e.target.value)}
                      placeholder="productivity, AI, SaaS"
                      className="w-full bg-bg-elevated border border-bg-border rounded-xl px-4 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-accent-purple/60 transition-colors text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Your Name / Company</label>
                    <input
                      id="product-founder-input"
                      type="text"
                      value={form.founder_name}
                      onChange={(e) => update("founder_name", e.target.value)}
                      placeholder="Founder / Company name"
                      className="w-full bg-bg-elevated border border-bg-border rounded-xl px-4 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-accent-purple/60 transition-colors text-sm"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleStep1}
                id="step1-continue-btn"
                className="w-full mt-6 py-3.5 rounded-xl bg-accent-purple hover:bg-accent-purple-light text-white font-bold font-display flex items-center justify-center gap-2 transition-all"
              >
                Continue to Board Selection <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Step 2: Choose Board */}
          {step === 2 && (
            <div className="p-6">
              <button onClick={() => setStep(1)} className="flex items-center gap-1 text-slate-500 hover:text-slate-300 text-sm mb-5 transition-colors">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <h2 className="font-display font-bold text-2xl text-white mb-1">Choose Your Arena</h2>
              <p className="text-slate-400 text-sm mb-6">Select which board your product will compete on.</p>
              <div className="space-y-2">
                {BOARD_OPTIONS.map((board) => (
                  <button
                    key={board.slug}
                    onClick={() => handleStep2(board.slug)}
                    disabled={loading}
                    className="w-full flex items-center gap-4 p-4 rounded-xl border border-bg-border bg-bg-elevated hover:border-accent-purple/40 hover:bg-accent-purple/5 transition-all text-left group"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white group-hover:text-accent-purple-light transition-colors">{board.name}</span>
                        {board.hot && <span className="px-1.5 py-0.5 rounded bg-accent-red/20 text-accent-red text-xs font-bold">🔥 HOT</span>}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{board.desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-accent-purple-light transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Set Budget */}
          {step === 3 && (
            <div className="p-6">
              <button onClick={() => setStep(2)} className="flex items-center gap-1 text-slate-500 hover:text-slate-300 text-sm mb-5 transition-colors">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <h2 className="font-display font-bold text-2xl text-white mb-1">Set Your Attention Budget</h2>
              <p className="text-slate-400 text-sm mb-6">
                Higher spend = higher position. See what your budget gets you.
              </p>

              {/* Currency selector */}
              <div className="flex items-center gap-2 bg-bg-elevated p-1 rounded-xl w-max mb-6 border border-bg-border">
                <button
                  onClick={() => update("currency", "INR")}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                    form.currency === "INR" ? "bg-accent-purple text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  INR (₹)
                </button>
                <button
                  onClick={() => update("currency", "USD")}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                    form.currency === "USD" ? "bg-accent-purple text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  USD ($)
                </button>
              </div>

              {/* Position preview */}
              <div className="space-y-2 mb-6">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Estimated Positions</p>
                {fetchingEstimates ? (
                  <div className="flex items-center justify-center py-8 text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    <span className="text-sm">Calculating real-time estimates...</span>
                  </div>
                ) : (
                  estimates.map((p) => {
                    const displayAmount = form.currency === "USD" 
                      ? Math.max(100, Math.ceil(p.amount_paise / 84)) 
                      : p.amount_paise;

                    return (
                      <button
                        key={p.position}
                        onClick={() => update("amount", displayAmount)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                          form.amount === displayAmount
                            ? "border-accent-purple bg-accent-purple/10 shadow-sm shadow-accent-purple/10"
                            : "border-bg-border bg-bg-elevated hover:border-accent-purple/40"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`font-display font-bold text-lg ${p.position <= 3 ? "text-accent-gold" : "text-slate-300"}`}>
                            {p.position === 1 ? "🥇 #1" : p.position === 2 ? "🥈 #2" : p.position === 3 ? "🥉 #3" : `#${p.position}`}
                          </span>
                          <span className="text-slate-400 text-sm">Estimated position</span>
                        </div>
                        <span className="font-bold text-white">{formatCurrency(displayAmount, form.currency)}</span>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Custom amount */}
              <div className="mb-6">
                <label className="block text-xs font-medium text-slate-400 mb-2">Or enter custom amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">{form.currency === "USD" ? "$" : "₹"}</span>
                  <input
                    id="custom-amount-input"
                    type="number"
                    min={form.currency === "USD" ? 1 : 29}
                    step={1}
                    value={form.amount / 100}
                    onChange={(e) => update("amount", Math.max(form.currency === "USD" ? 1 : 29, parseInt(e.target.value || (form.currency === "USD" ? "1" : "29"))) * 100)}
                    className="w-full bg-bg-elevated border border-bg-border rounded-xl pl-8 pr-4 py-2.5 text-white focus:outline-none focus:border-accent-purple/60 transition-colors text-sm"
                  />
                </div>
                <p className="text-xs text-slate-600 mt-1">Minimum {form.currency === "USD" ? "$1" : "₹29"} · Position updates in real-time after payment</p>
              </div>

              <button
                onClick={() => setStep(4)}
                id="step3-continue-btn"
                className="w-full py-3.5 rounded-xl bg-accent-purple hover:bg-accent-purple-light text-white font-bold font-display flex items-center justify-center gap-2 transition-all"
              >
                Review & Launch <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Step 4: Launch */}
          {step === 4 && (
            <div className="p-6">
              <button onClick={() => setStep(3)} className="flex items-center gap-1 text-slate-500 hover:text-slate-300 text-sm mb-5 transition-colors">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <h2 className="font-display font-bold text-2xl text-white mb-6">Review & Launch</h2>

              {error && <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm">{error}</div>}

              <div className="space-y-3 mb-6">
                <div className="flex justify-between py-2 border-b border-bg-border">
                  <span className="text-slate-400 text-sm">Product</span>
                  <span className="text-white font-medium text-sm">{form.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-bg-border">
                  <span className="text-slate-400 text-sm">URL</span>
                  <span className="text-white font-medium text-sm truncate max-w-48">{form.url}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-bg-border">
                  <span className="text-slate-400 text-sm">Board</span>
                  <span className="text-white font-medium text-sm capitalize">{form.board_slug}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-bg-border">
                  <span className="text-slate-400 text-sm">Category</span>
                  <span className="text-white font-medium text-sm">{form.category}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-400 text-sm">Entry Budget</span>
                  <span className="font-display font-bold text-xl text-white">{formatCurrency(form.amount, form.currency)}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-accent-purple/10 border border-accent-purple/20 mb-5 text-xs text-slate-300">
                <strong>Sponsored position</strong> — Your rank reflects your payment, not product quality. This will be clearly labeled on the board.
              </div>

              <button
                onClick={handleLaunch}
                disabled={loading}
                id="launch-btn"
                className="w-full py-4 rounded-xl attack-btn text-white font-bold font-display text-xl flex items-center justify-center gap-2 transition-all disabled:opacity-60"
              >
                {loading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                ) : (
                  <><Swords className="w-5 h-5" /> ⚔️ Launch on SpotWars — {formatCurrency(form.amount, form.currency)}</>
                )}
              </button>
              <p className="text-center text-xs text-slate-600 mt-2">Secure payment via Razorpay · {form.currency} only for testing</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
