"use client";

import { useState } from "react";
import { X, Swords, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { formatINR, loadRazorpay, costToTake } from "@/lib/utils";
import type { Product, RazorpayPaymentResponse } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

interface AttackModalProps {
  targetProduct: Product;
  targetPosition: number;
  targetSpend: number;
  boardId: string;
  boardSlug: string;
  onClose: () => void;
  onSuccess: () => void;
  // If attacker's product is provided
  attackerProductId?: string;
}

type ModalStep = "confirm" | "select_product" | "paying" | "success" | "error";

export default function AttackModal({
  targetProduct,
  targetPosition,
  targetSpend,
  boardId,
  boardSlug,
  onClose,
  onSuccess,
  attackerProductId,
}: AttackModalProps) {
  const [step, setStep] = useState<ModalStep>(attackerProductId ? "confirm" : "select_product");
  const [userProducts, setUserProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState(attackerProductId || "");
  const [error, setError] = useState("");
  const supabase = typeof window !== "undefined" ? createClient() : null;

  const attackCost = costToTake(targetSpend);

  // Load user products if none pre-selected
  useState(() => {
    if (!attackerProductId && supabase) {
      supabase.auth.getUser().then(async ({ data }) => {
        if (!data.user || !supabase) return;
        const { data: products } = await supabase
          .from("products")
          .select("id, name, logo_url, tagline")
          .eq("founder_id", data.user.id)
          .eq("status", "active");
        if (products) setUserProducts(products as unknown as Product[]);
      });
    }
  });

  const handleAttack = async () => {
    if (!selectedProductId) return;
    setStep("paying");
    setError("");

    try {
      // Load Razorpay
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Could not load payment gateway. Please try again.");

      // Create order
      const res = await fetch("/api/bids/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: selectedProductId,
          board_id: boardId,
          amount: attackCost,
          type: "attack",
          target_product_id: targetProduct.id,
        }),
      });

      const { order, bid_id, error: apiError } = await res.json();
      if (apiError || !order) throw new Error(apiError || "Failed to create order");

      // Open Razorpay
      if (!supabase) throw new Error("Supabase not initialized");
      const { data: { user } } = await supabase.auth.getUser();
      await new Promise<void>((resolve, reject) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const RazorpayConstructor = (window as any).Razorpay as new (opts: Record<string, unknown>) => { open(): void };
        const rzp = new RazorpayConstructor({
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: "INR",
          name: "SpotWars",
          description: `Attack #${targetPosition} (${targetProduct.name})`,
          order_id: order.id,
          prefill: { email: user?.email || "" },
          theme: { color: "#7C3AED" },
          handler: async (response: RazorpayPaymentResponse) => {
            // Verify payment
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
            const verifyData = await verifyRes.json();
            if (verifyData.error) reject(new Error(verifyData.error));
            else resolve();
          },
          modal: { ondismiss: () => reject(new Error("Payment cancelled")) },
        });
        rzp.open();
      });

      setStep("success");
      setTimeout(() => onSuccess(), 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      if (msg === "Payment cancelled") {
        setStep("confirm");
      } else {
        setError(msg);
        setStep("error");
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="glass-elevated rounded-2xl border border-bg-border w-full max-w-md shadow-2xl shadow-black/50 animate-slide-in-up">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-bg-border">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-accent-red/20">
              <Swords className="w-5 h-5 text-accent-red" />
            </div>
            <div>
              <h3 className="font-display font-bold text-white">⚔️ Attack Position</h3>
              <p className="text-xs text-slate-500">Take #{targetPosition} from {targetProduct.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-bg-elevated transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">
          {/* Target info */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-bg-elevated border border-bg-border mb-5">
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Target</p>
              <p className="font-semibold text-white">#{targetPosition} · {targetProduct.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">{targetProduct.tagline}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 mb-0.5">Current spend</p>
              <p className="font-bold text-accent-gold">{formatINR(targetSpend)}</p>
            </div>
          </div>

          {/* Step: Select product */}
          {step === "select_product" && (
            <div>
              <p className="text-sm text-slate-400 mb-3">Select which of your products will attack:</p>
              {userProducts.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-sm">
                  You need an active product on this board to attack.
                  <br />
                  <a href="/submit" className="text-accent-purple-light underline mt-2 inline-block">List your product →</a>
                </div>
              ) : (
                <div className="space-y-2 mb-4">
                  {userProducts.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedProductId(p.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                        selectedProductId === p.id
                          ? "border-accent-purple bg-accent-purple/10"
                          : "border-bg-border bg-bg-elevated hover:border-accent-purple/50"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-bg-border flex items-center justify-center font-bold text-accent-purple text-sm flex-shrink-0">
                        {p.name.charAt(0)}
                      </div>
                      <span className="text-white text-sm font-medium">{p.name}</span>
                    </button>
                  ))}
                </div>
              )}
              <button
                onClick={() => selectedProductId && setStep("confirm")}
                disabled={!selectedProductId}
                className="w-full py-3 rounded-xl bg-accent-red hover:bg-red-500 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          )}

          {/* Step: Confirm */}
          {step === "confirm" && (
            <div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 mb-5">
                <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                <p className="text-xs text-yellow-300">
                  You are about to spend <strong>{formatINR(attackCost)}</strong> to take #{targetPosition}.
                  This payment is non-refundable.
                </p>
              </div>

              <div className="flex items-center justify-between mb-5">
                <span className="text-slate-400 text-sm">Cost to attack</span>
                <span className="font-display font-bold text-2xl text-white">{formatINR(attackCost)}</span>
              </div>

              <button
                onClick={handleAttack}
                className="w-full py-3.5 rounded-xl attack-btn text-white font-bold font-display text-lg transition-all flex items-center justify-center gap-2"
                id="confirm-attack-btn"
              >
                <Swords className="w-5 h-5" />
                ⚔️ Take #{targetPosition} — {formatINR(attackCost)}
              </button>
              <button onClick={() => setStep(attackerProductId ? "confirm" : "select_product")} className="w-full mt-2 py-2 text-sm text-slate-500 hover:text-slate-300 transition-colors">
                Cancel
              </button>
            </div>
          )}

          {/* Step: Paying */}
          {step === "paying" && (
            <div className="text-center py-6">
              <Loader2 className="w-10 h-10 animate-spin text-accent-purple mx-auto mb-3" />
              <p className="text-white font-medium">Processing payment...</p>
              <p className="text-slate-400 text-sm mt-1">Complete the payment to attack the position</p>
            </div>
          )}

          {/* Step: Success */}
          {step === "success" && (
            <div className="text-center py-6">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <p className="text-white font-bold text-lg">Attack successful!</p>
              <p className="text-slate-400 text-sm mt-1">The board is updating...</p>
            </div>
          )}

          {/* Step: Error */}
          {step === "error" && (
            <div>
              <div className="text-center py-4 mb-4">
                <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-2" />
                <p className="text-white font-medium">Payment failed</p>
                <p className="text-slate-400 text-sm mt-1">{error}</p>
              </div>
              <button onClick={() => setStep("confirm")} className="w-full py-3 rounded-xl bg-bg-elevated text-white font-semibold transition-all hover:bg-bg-border">
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
