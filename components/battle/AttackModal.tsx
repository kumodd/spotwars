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
      const loaded = await loadRazorpay();
      if (!loaded)
        throw new Error("Could not load payment gateway. Please try again.");

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
          description: `Attack #${targetPosition} (${targetProduct.name})`,
          order_id: order.id,
          prefill: { email: user?.email || "" },
          theme: { color: "#E85D27" },
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#111111] border border-[#2A2A2A] rounded-sm w-full max-w-md shadow-2xl shadow-black/60 animate-slide-in-right">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1A1A1A]">
          <div className="flex items-center gap-2.5">
            <Swords className="w-4 h-4 text-[#EF4444]" />
            <div>
              <h3 className="font-display font-semibold text-white text-sm">
                Attack Position
              </h3>
              <p className="text-xs text-[#555555]">
                Take #{targetPosition} from {targetProduct.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-sm text-[#555555] hover:text-white hover:bg-[#1A1A1A] transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">
          {/* Target info */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#181818] border border-[#242424] rounded-sm mb-5">
            <div>
              <p className="text-[10px] text-[#444444] uppercase tracking-wide mb-0.5">Target</p>
              <p className="text-sm font-semibold text-white">
                #{targetPosition} · {targetProduct.name}
              </p>
              <p className="text-xs text-[#666666] mt-0.5 truncate max-w-[200px]">
                {targetProduct.tagline}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-[10px] text-[#444444] uppercase tracking-wide mb-0.5">
                Current spend
              </p>
              <p className="text-sm font-bold text-[#D4A017] num">
                {formatINR(targetSpend)}
              </p>
            </div>
          </div>

          {/* Select product */}
          {step === "select_product" && (
            <div>
              <p className="text-xs text-[#888888] mb-3">
                Select which of your products will attack:
              </p>
              {userProducts.length === 0 ? (
                <div className="text-center py-6 text-[#444444] text-xs">
                  You need an active product on this board to attack.
                  <br />
                  <a
                    href="/submit"
                    className="text-[#E85D27] hover:text-[#D44E1E] underline mt-2 inline-block transition-colors"
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
                      className={`w-full flex items-center gap-3 p-3 border rounded-sm transition-all text-left ${
                        selectedProductId === p.id
                          ? "border-[#E85D27] bg-[#E85D2710]"
                          : "border-[#242424] bg-[#181818] hover:border-[#3A3A3A]"
                      }`}
                    >
                      <div className="w-7 h-7 rounded bg-[#242424] flex items-center justify-center font-bold text-[#E85D27] text-xs flex-shrink-0">
                        {p.name.charAt(0)}
                      </div>
                      <span className="text-[#CCCCCC] text-sm font-medium">
                        {p.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              <button
                onClick={() => selectedProductId && setStep("confirm")}
                disabled={!selectedProductId}
                className="w-full py-2.5 rounded-sm btn-primary text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          )}

          {/* Confirm */}
          {step === "confirm" && (
            <div>
              <div className="flex items-start gap-2.5 p-3 bg-[#1A1200] border border-[#3A2A00] rounded-sm mb-5">
                <AlertTriangle className="w-4 h-4 text-[#D4A017] flex-shrink-0 mt-0.5" />
                <p className="text-xs text-[#AAAAAA]">
                  You are about to spend{" "}
                  <strong className="text-white">{formatINR(attackCost)}</strong> to take
                  #{targetPosition}. This payment is non-refundable.
                </p>
              </div>

              <div className="flex items-center justify-between mb-5 py-3 border-t border-[#1A1A1A] border-b">
                <span className="text-[#888888] text-sm">Cost to attack</span>
                <span className="font-display font-bold text-2xl text-white num">
                  {formatINR(attackCost)}
                </span>
              </div>

              <button
                onClick={handleAttack}
                className="w-full py-3 rounded-sm attack-btn text-sm font-bold flex items-center justify-center gap-2"
                id="confirm-attack-btn"
              >
                <Swords className="w-4 h-4" />
                Take #{targetPosition} — {formatINR(attackCost)}
              </button>
              <button
                onClick={() =>
                  setStep(attackerProductId ? "confirm" : "select_product")
                }
                className="w-full mt-2 py-2 text-xs text-[#444444] hover:text-[#888888] transition-colors"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Paying */}
          {step === "paying" && (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-[#E85D27] mx-auto mb-3" />
              <p className="text-[#CCCCCC] text-sm font-medium">Processing payment...</p>
              <p className="text-[#555555] text-xs mt-1">
                Complete the payment to attack the position
              </p>
            </div>
          )}

          {/* Success */}
          {step === "success" && (
            <div className="text-center py-8">
              <CheckCircle2 className="w-10 h-10 text-[#22C55E] mx-auto mb-3" />
              <p className="text-white font-semibold">Attack successful!</p>
              <p className="text-[#555555] text-xs mt-1">The board is updating...</p>
            </div>
          )}

          {/* Error */}
          {step === "error" && (
            <div>
              <div className="text-center py-4 mb-4">
                <AlertTriangle className="w-8 h-8 text-[#EF4444] mx-auto mb-2" />
                <p className="text-[#CCCCCC] text-sm font-medium">Payment failed</p>
                <p className="text-[#555555] text-xs mt-1">{error}</p>
              </div>
              <button
                onClick={() => setStep("confirm")}
                className="w-full py-2.5 rounded-sm btn-secondary text-sm font-semibold"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
