"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { createClient } from "@/lib/supabase/client";
import { loadRazorpay, formatCurrency } from "@/lib/utils";
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
  amount: 4900, // ₹49 in paise (minimum)
  currency: "INR",
};

const BOARD_OPTIONS = [
  { slug: "global", name: "Global Board", desc: "Compete with all products across every category", hot: true },
  { slug: "ai-ml", name: "AI & ML Board", desc: "For AI, machine learning & automation products" },
  { slug: "saas", name: "SaaS Board", desc: "For cloud software and subscription tools" },
  { slug: "dev-tools", name: "Developer Tools", desc: "Built by devs, for devs" },
  { slug: "ecommerce", name: "E-commerce", desc: "Online stores, D2C, retail tech" },
  { slug: "fintech", name: "Fintech", desc: "Financial tech and payments" },
  { slug: "education", name: "Education", desc: "EdTech and learning platforms" },
  { slug: "consumer-apps", name: "Consumer Apps", desc: "Apps for everyday users" },
  { slug: "creator-tools", name: "Creator Tools", desc: "For content creators and media makers" },
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
          name: "InternetBillboard.space",
          description: `List ${form.name} on ${form.board_slug} board`,
          order_id: order.id,
          prefill: { email: user?.email || "" },
          theme: { color: "#111111" },
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
        <div className="text-center animate-in fade-in duration-500 max-w-md border border-bg-border p-10 bg-bg-surface shadow-[8px_8px_0px_0px_rgba(17,17,17,1)]">
          <CheckCircle2 className="w-16 h-16 text-ink mx-auto mb-6" />
          <h2 className="font-display font-black text-4xl text-ink mb-4 uppercase">You're live.</h2>
          <p className="text-ink-muted font-bold uppercase tracking-wider text-sm">Your product is now competing. Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-ink">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-16">
        {/* Progress */}
        <div className="mb-10">
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-y-4">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center sm:flex-1">
                <div className={`flex items-center gap-2 px-3 py-1.5 border transition-all ${step === s.id ? "bg-ink text-bg border-bg-border" :
                    step > s.id ? "bg-bg text-ink border-bg-border" :
                      "bg-bg-surface text-ink-muted border-bg-border/30"
                  }`}>
                  {step > s.id ? <CheckCircle2 className="w-3 h-3" /> : <span className="font-black text-xs num">{s.id}</span>}
                  <span className="hidden sm:inline text-xs font-black uppercase tracking-widest">{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`hidden sm:block flex-1 h-0.5 mx-2 ${step > s.id ? "bg-ink" : "bg-ink/30"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Card */}
        <div className="border border-bg-border bg-bg-surface overflow-hidden shadow-[8px_8px_0px_0px_rgba(17,17,17,1)]">
          {/* Step 1: Product Details */}
          {step === 1 && (
            <div className="p-8">
              <h2 className="font-display font-black text-3xl text-ink mb-2 uppercase tracking-wide">Your Product</h2>
              <p className="text-ink-muted text-sm font-bold uppercase tracking-wider mb-8">Tell the internet what you've built.</p>

              {error && <div className="mb-6 p-4 border border-bg-border bg-bg text-ink font-bold uppercase tracking-wider text-xs">{error}</div>}

              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-ink uppercase tracking-widest mb-2">Product Name</label>
                    <input
                      id="product-name-input"
                      type="text"
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      placeholder="e.g. VoiceAI"
                      className="w-full bg-bg border border-bg-border px-4 py-3 text-ink placeholder:text-ink-muted focus:outline-none transition-colors text-sm font-medium"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-black text-ink uppercase tracking-widest">Product URL *</label>
                      <button
                        type="button"
                        onClick={handleAnalyzeUrl}
                        disabled={isAnalyzing || !form.url}
                        className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1 text-ink hover:text-ink-muted transition-colors disabled:opacity-50"
                      >
                        {isAnalyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                        {isAnalyzing ? "Analyzing..." : "Auto-Fill"}
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
                      className="w-full bg-bg border border-bg-border px-4 py-3 text-ink placeholder:text-ink-muted focus:outline-none transition-colors text-sm font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-ink uppercase tracking-widest mb-2">Tagline</label>
                  <input
                    id="product-tagline-input"
                    type="text"
                    value={form.tagline}
                    onChange={(e) => update("tagline", e.target.value)}
                    placeholder="e.g. The AI that answers your customer calls"
                    maxLength={100}
                    className="w-full bg-bg border border-bg-border px-4 py-3 text-ink placeholder:text-ink-muted focus:outline-none transition-colors text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-ink uppercase tracking-widest mb-2">Description</label>
                  <textarea
                    id="product-description-input"
                    value={form.description}
                    onChange={(e) => update("description", e.target.value)}
                    placeholder="Tell visitors more about your product..."
                    rows={4}
                    className="w-full bg-bg border border-bg-border px-4 py-3 text-ink placeholder:text-ink-muted focus:outline-none transition-colors text-sm font-medium resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-black text-ink uppercase tracking-widest mb-2">Category *</label>
                    <select
                      id="product-category-select"
                      value={form.category}
                      onChange={(e) => update("category", e.target.value)}
                      className="w-full bg-bg border border-bg-border px-4 py-3 text-ink focus:outline-none transition-colors text-sm font-medium"
                    >
                      <option value="">Select...</option>
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-ink uppercase tracking-widest mb-2">Country</label>
                    <select
                      id="product-country-select"
                      value={form.country}
                      onChange={(e) => update("country", e.target.value)}
                      className="w-full bg-bg border border-bg-border px-4 py-3 text-ink focus:outline-none transition-colors text-sm font-medium"
                    >
                      {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-ink uppercase tracking-widest mb-2">Pricing</label>
                    <select
                      id="product-pricing-select"
                      value={form.pricing}
                      onChange={(e) => update("pricing", e.target.value)}
                      className="w-full bg-bg border border-bg-border px-4 py-3 text-ink focus:outline-none transition-colors text-sm font-medium"
                    >
                      {PRICING_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-ink uppercase tracking-widest mb-2">Tags <span className="text-ink-muted font-bold">(comma separated)</span></label>
                    <input
                      id="product-tags-input"
                      type="text"
                      value={form.tags}
                      onChange={(e) => update("tags", e.target.value)}
                      placeholder="productivity, AI, SaaS"
                      className="w-full bg-bg border border-bg-border px-4 py-3 text-ink placeholder:text-ink-muted focus:outline-none transition-colors text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-ink uppercase tracking-widest mb-2">Your Name / Company</label>
                    <input
                      id="product-founder-input"
                      type="text"
                      value={form.founder_name}
                      onChange={(e) => update("founder_name", e.target.value)}
                      placeholder="Founder / Company name"
                      className="w-full bg-bg border border-bg-border px-4 py-3 text-ink placeholder:text-ink-muted focus:outline-none transition-colors text-sm font-medium"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleStep1}
                id="step1-continue-btn"
                className="btn-primary w-full py-4 mt-8 flex items-center justify-center gap-2 text-base"
              >
                Continue to Board Selection <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Step 2: Choose Board */}
          {step === 2 && (
            <div className="p-8">
              <button onClick={() => setStep(1)} className="flex items-center gap-1 text-ink hover:text-ink-muted text-xs font-black uppercase tracking-widest mb-6 transition-colors">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <h2 className="font-display font-black text-3xl text-ink mb-2 uppercase tracking-wide">Choose Your Arena</h2>
              <p className="text-ink-muted text-sm font-bold uppercase tracking-wider mb-8">Select which board your product will compete on.</p>
              <div className="space-y-4">
                {BOARD_OPTIONS.map((board) => (
                  <button
                    key={board.slug}
                    onClick={() => handleStep2(board.slug)}
                    disabled={loading}
                    className="w-full flex items-center gap-4 p-5 border border-bg-border bg-bg hover:bg-ink hover:text-bg transition-colors text-left group"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-black text-lg uppercase tracking-wide">{board.name}</span>
                        {board.hot && <span className="px-2 py-0.5 border border-current text-[10px] font-black uppercase tracking-widest">HOT</span>}
                      </div>
                      <p className="text-xs font-bold uppercase tracking-wider opacity-70 group-hover:opacity-90">{board.desc}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Set Budget */}
          {step === 3 && (
            <div className="p-8">
              <button onClick={() => setStep(2)} className="flex items-center gap-1 text-ink hover:text-ink-muted text-xs font-black uppercase tracking-widest mb-6 transition-colors">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <h2 className="font-display font-black text-3xl text-ink mb-2 uppercase tracking-wide">Set Your Attention Budget</h2>
              <p className="text-ink-muted text-sm font-bold uppercase tracking-wider mb-8">
                Higher spend = higher position. See what your budget gets you.
              </p>

              {/* Currency selector */}
              <div className="flex items-center gap-0 border border-bg-border w-max mb-8 bg-bg">
                <button
                  onClick={() => update("currency", "INR")}
                  className={`px-6 py-2 text-xs font-black uppercase tracking-widest transition-all ${form.currency === "INR" ? "bg-ink text-bg" : "text-ink hover:bg-bg-surface"
                    }`}
                >
                  INR (₹)
                </button>
                <button
                  onClick={() => update("currency", "USD")}
                  className={`px-6 py-2 text-xs font-black uppercase tracking-widest transition-all border-l border-bg-border ${form.currency === "USD" ? "bg-ink text-bg" : "text-ink hover:bg-bg-surface"
                    }`}
                >
                  USD ($)
                </button>
              </div>

              {/* Position preview */}
              <div className="space-y-3 mb-10">
                <p className="text-xs font-black text-ink uppercase tracking-widest mb-4">Estimated Positions</p>
                {fetchingEstimates ? (
                  <div className="flex items-center justify-center py-10 border border-bg-border bg-bg">
                    <Loader2 className="w-6 h-6 animate-spin text-ink mr-3" />
                    <span className="text-xs font-bold uppercase tracking-wider text-ink">Calculating real-time estimates...</span>
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
                        className={`w-full flex items-center justify-between px-6 py-4 border transition-all ${form.amount === displayAmount
                            ? "border-bg-border bg-ink text-bg"
                            : "border-bg-border bg-bg text-ink hover:bg-bg-surface"
                          }`}
                      >
                        <div className="flex items-center gap-4">
                          <span className="font-display font-black text-xl num">
                            #{p.position}
                          </span>
                          <span className={`text-[10px] font-bold uppercase tracking-widest ${form.amount === displayAmount ? "opacity-80" : "text-ink-muted"}`}>Estimated rank</span>
                        </div>
                        <span className="font-black text-lg num">{formatCurrency(displayAmount, form.currency)}</span>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Custom amount */}
              <div className="mb-8">
                <label className="block text-xs font-black text-ink uppercase tracking-widest mb-3">Or enter custom amount</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-ink font-black text-lg">{form.currency === "USD" ? "$" : "₹"}</span>
                  <input
                    id="custom-amount-input"
                    type="number"
                    min={form.currency === "USD" ? 1 : 49}
                    step={1}
                    value={form.amount / 100}
                    onChange={(e) => update("amount", Math.max(form.currency === "USD" ? 1 : 49, parseInt(e.target.value || (form.currency === "USD" ? "1" : "49"))) * 100)}
                    className="w-full bg-bg border border-bg-border pl-10 pr-4 py-4 text-ink font-black text-lg focus:outline-none transition-colors num"
                  />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-ink-muted mt-2">Minimum {form.currency === "USD" ? "$1" : "₹49"} · Position updates in real-time after payment</p>
              </div>

              <button
                onClick={() => setStep(4)}
                id="step3-continue-btn"
                className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-base"
              >
                Review & Launch <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Step 4: Launch */}
          {step === 4 && (
            <div className="p-8">
              <button onClick={() => setStep(3)} className="flex items-center gap-1 text-ink hover:text-ink-muted text-xs font-black uppercase tracking-widest mb-6 transition-colors">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <h2 className="font-display font-black text-3xl text-ink mb-8 uppercase tracking-wide">Review & Launch</h2>

              {error && <div className="mb-6 p-4 border border-bg-border bg-bg text-ink font-bold uppercase tracking-wider text-xs">{error}</div>}

              <div className="border border-bg-border bg-bg mb-8">
                <div className="flex justify-between p-4 border-b border-bg-border">
                  <span className="text-ink-muted text-xs font-black uppercase tracking-widest">Product</span>
                  <span className="text-ink font-black text-sm uppercase tracking-wide">{form.name}</span>
                </div>
                <div className="flex justify-between p-4 border-b border-bg-border">
                  <span className="text-ink-muted text-xs font-black uppercase tracking-widest">URL</span>
                  <span className="text-ink font-bold text-sm truncate max-w-48">{form.url}</span>
                </div>
                <div className="flex justify-between p-4 border-b border-bg-border">
                  <span className="text-ink-muted text-xs font-black uppercase tracking-widest">Board</span>
                  <span className="text-ink font-black text-sm uppercase tracking-wide">{form.board_slug}</span>
                </div>
                <div className="flex justify-between p-4 border-b border-bg-border">
                  <span className="text-ink-muted text-xs font-black uppercase tracking-widest">Category</span>
                  <span className="text-ink font-black text-sm uppercase tracking-wide">{form.category}</span>
                </div>
                <div className="flex justify-between p-6 bg-bg-surface">
                  <span className="text-ink text-sm font-black uppercase tracking-widest">Entry Budget</span>
                  <span className="font-display font-black text-3xl text-ink num">{formatCurrency(form.amount, form.currency)}</span>
                </div>
              </div>

              <div className="p-5 border border-bg-border mb-8 bg-bg">
                <p className="text-xs font-bold uppercase tracking-wider text-ink leading-relaxed">
                  <strong className="font-black text-ink">Sponsored position</strong> — Your rank reflects your payment, not product quality. This will be clearly labeled on the board.
                </p>
              </div>

              <button
                onClick={handleLaunch}
                disabled={loading}
                id="launch-btn"
                className="w-full py-5 border border-bg-border bg-ink text-bg font-black font-display text-xl uppercase tracking-wide flex items-center justify-center gap-3 hover:bg-bg hover:text-ink transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <><Loader2 className="w-6 h-6 animate-spin" /> Processing...</>
                ) : (
                  <>Launch on InternetBillboard.space — {formatCurrency(form.amount, form.currency)}</>
                )}
              </button>
              <p className="text-center text-[10px] font-bold uppercase tracking-widest text-ink-muted mt-4">Secure payment via Razorpay · {form.currency} only for testing</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
