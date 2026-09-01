"use client";

import { useState } from "react";
import { X, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
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
  const [step, setStep] = useState<ModalStep>(
    attackerProductId ? "confirm" : "select_product"
  );
  const [userProducts, setUserProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState(
    attackerProductId || ""
  );
  const [error, setError] = useState("");
  const supabase = typeof window !== "undefined" ? createClient() : null;

  const takeCost = costToTake(targetSpend);

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

  const handleTake = async () => {
    if (!selectedProductId) return;
    setStep("paying");
    setError("");

    try {
      const loaded = await loadRazorpay();
      if (!loaded)
        throw new Error("Could not load payment gateway. Please try again.");

      const res = await fetch("/api/bids/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: selectedProductId,
          board_id: boardId,
          amount: takeCost,
          type: "attack",
          target_product_id: targetProduct.id,
        }),
      });

      const { order, bid_id, error: apiError } = await res.json();
      if (apiError || !order)
        throw new Error(apiError || "Failed to create order");

      if (!supabase) throw new Error("Supabase not initialized");
      const {
        data: { user },
      } = await supabase.auth.getUser();

      await new Promise<void>((resolve, reject) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const RazorpayConstructor = (window as any).Razorpay as new (
          opts: Record<string, unknown>
        ) => { open(): void };
        const rzp = new RazorpayConstructor({
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: "INR",
          name: "InternetBillboard.space",
          description: `Take #${targetPosition} (${targetProduct.name})`,
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label={`Take position #${targetPosition}`}
    >
      <div className="bg-bg border border-bg-border w-full max-w-sm shadow-xl animate-slide-in-right">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-bg-border bg-bg-surface">
          <div>
            <p className="text-[10px] font-bold text-ink-muted uppercase tracking-widest mb-0.5">
              Competitive Move
            </p>
            <h3 className="font-display font-black text-base text-ink uppercase tracking-tight">
              Take Position #{targetPosition}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-ink-muted hover:text-ink hover:bg-bg-elevated transition-all border border-transparent hover:border-bg-border"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">
          {/* Target info card */}
          <div className="flex items-center justify-between px-3.5 py-3 bg-bg-surface border border-bg-border mb-5">
            <div className="min-w-0 flex-1 mr-3">
              <p className="board-col-header mb-0.5">Currently Holding #{targetPosition}</p>
              <p className="text-sm font-black text-ink uppercase tracking-wide truncate">
                {targetProduct.name}
              </p>
              <p className="text-xs text-ink-muted mt-0.5 truncate max-w-[180px]">
                {targetProduct.tagline}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="board-col-header mb-0.5">Their Spend</p>
              <p className="text-base font-black text-ink num">
                {formatINR(targetSpend, true)}
              </p>
            </div>
          </div>

          {/* Step: Select product */}
          {step === "select_product" && (
            <div>
              <p className="text-xs text-ink-muted font-semibold uppercase tracking-wider mb-3">
                Which product takes this position?
              </p>
              {userProducts.length === 0 ? (
                <div className="text-center py-6 border border-bg-border bg-bg-surface">
                  <p className="text-xs text-ink-muted font-semibold uppercase tracking-wider mb-3">
                    You need an active product on the board to take a position.
                  </p>
                  <a
                    href="/submit"
                    className="text-xs font-black text-ink uppercase tracking-wider underline underline-offset-2"
                  >
                    List your product →
                  </a>
                </div>
              ) : (
                <div className="space-y-1.5 mb-4">
                  {userProducts.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedProductId(p.id)}
                      className={`w-full flex items-center gap-3 p-3 border transition-all text-left ${
                        selectedProductId === p.id
                          ? "border-ink bg-bg-elevated"
                          : "border-bg-border bg-bg-surface hover:border-ink-muted"
                      }`}
                    >
                      <div className="w-7 h-7 bg-bg-elevated border border-bg-border flex items-center justify-center font-black text-ink text-xs flex-shrink-0">
                        {p.name.charAt(0)}
                      </div>
                      <span className="text-sm font-black text-ink uppercase tracking-wide">
                        {p.name}
                      </span>
                      {selectedProductId === p.id && (
                        <span className="ml-auto board-col-header">Selected</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
              <button
                onClick={() => selectedProductId && setStep("confirm")}
                disabled={!selectedProductId}
                className="w-full py-2.5 btn-primary text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue →
              </button>
            </div>
          )}

          {/* Step: Confirm */}
          {step === "confirm" && (
            <div>
              {/* Payment breakdown */}
              <div className="border border-bg-border bg-bg-surface mb-4">
                <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-bg-border">
                  <span className="text-xs text-ink-muted font-semibold uppercase tracking-wider">Current position spend</span>
                  <span className="text-sm font-black text-ink num">{formatINR(targetSpend, true)}</span>
                </div>
                <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-bg-border">
                  <span className="text-xs text-ink-muted font-semibold uppercase tracking-wider">Minimum increment</span>
                  <span className="text-sm font-bold text-ink num">+₹1</span>
                </div>
                <div className="flex items-center justify-between px-3.5 py-3">
                  <span className="text-xs font-black text-ink uppercase tracking-wider">You pay</span>
                  <span className="font-display font-black text-2xl text-ink num">
                    {formatINR(takeCost)}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-bg-surface border border-bg-border mb-4">
                <AlertTriangle className="w-3.5 h-3.5 text-ink-muted flex-shrink-0 mt-0.5" />
                <p className="text-xs text-ink-muted leading-relaxed">
                  This payment is <strong className="text-ink">non-refundable</strong>. Your position is secured immediately after payment is verified. Others can overtake you by spending more.
                </p>
              </div>

              <button
                onClick={handleTake}
                className="w-full py-3 btn-primary text-sm font-black flex items-center justify-center gap-2"
                id="confirm-take-btn"
              >
                Pay {formatINR(takeCost)} · Take #{targetPosition}
              </button>
              <button
                onClick={() =>
                  setStep(attackerProductId ? "confirm" : "select_product")
                }
                className="w-full mt-2 py-2 text-xs text-ink-muted hover:text-ink transition-colors font-bold uppercase tracking-wider"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Step: Paying */}
          {step === "paying" && (
            <div className="text-center py-10">
              <Loader2 className="w-7 h-7 animate-spin text-ink mx-auto mb-3" />
              <p className="text-sm font-black text-ink uppercase tracking-wide">Processing payment...</p>
              <p className="text-xs text-ink-muted mt-1 font-semibold uppercase tracking-wider">
                Complete the payment window to secure #{targetPosition}
              </p>
            </div>
          )}

          {/* Step: Success */}
          {step === "success" && (
            <div className="text-center py-10">
              <CheckCircle2 className="w-10 h-10 text-accent-green mx-auto mb-3" />
              <p className="font-display font-black text-xl text-ink uppercase tracking-tight">
                Position Taken!
              </p>
              <p className="text-xs text-ink-muted mt-1.5 font-semibold uppercase tracking-widest">
                #{targetPosition} is now yours. The board is updating...
              </p>
            </div>
          )}

          {/* Step: Error */}
          {step === "error" && (
            <div>
              <div className="text-center py-6 mb-4">
                <AlertTriangle className="w-8 h-8 text-accent-red mx-auto mb-2" />
                <p className="text-sm font-black text-ink uppercase tracking-wide">Payment Failed</p>
                <p className="text-xs text-ink-muted mt-1 font-semibold">{error}</p>
              </div>
              <button
                onClick={() => setStep("confirm")}
                className="w-full py-2.5 btn-secondary text-xs font-bold"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Footer note */}
        {(step === "confirm" || step === "select_product") && (
          <div className="px-5 py-3 border-t border-bg-border bg-bg-surface">
            <p className="text-[10px] text-ink-muted font-semibold uppercase tracking-wider text-center">
              Paid placement · Not a quality score ·{" "}
              <a href="/how-it-works" className="underline underline-offset-2 hover:text-ink transition-colors">
                How ranking works
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
