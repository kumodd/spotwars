"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2, AlertTriangle, X } from "lucide-react";

interface DeleteProductButtonProps {
  productId: string;
}

export default function DeleteProductButton({ productId }: DeleteProductButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      
      if (!res.ok) {
        alert(data.error || "Failed to delete product.");
      } else {
        setShowConfirm(false);
        router.refresh(); // Refresh the dashboard to remove the product
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while deleting the product.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={isDeleting}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-red/10 hover:bg-accent-red/20 text-accent-red text-sm font-medium transition-all disabled:opacity-50"
        title="Delete product"
      >
        <Trash2 className="w-4 h-4" />
        Delete
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg/80 backdrop-blur-sm">
          <div className="w-full max-w-md glass-elevated rounded-2xl border border-bg-border overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowConfirm(false)}
              disabled={isDeleting}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-bg-elevated transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="p-6">
              <div className="w-12 h-12 rounded-xl bg-accent-red/20 text-accent-red flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-xl text-white mb-2">Delete Product</h3>
              <p className="text-slate-400 text-sm mb-6">
                Are you sure you want to delete this product? This action cannot be undone and will permanently remove it from your dashboard and any live boards.
              </p>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowConfirm(false)}
                  disabled={isDeleting}
                  className="px-5 py-2.5 rounded-xl bg-bg-elevated text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-red hover:bg-red-500 text-white text-sm font-semibold transition-colors shadow-lg shadow-accent-red/20 disabled:opacity-70"
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Yes, Delete Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
