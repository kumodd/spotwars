import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "New Products — Live Rankings & Discovery",
  description:
    "Discover the newest products added to the live internet billboard. Be the first to see the latest startups, SaaS, and tools.",
};

async function getNewProducts() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, name, tagline, logo_url, category, created_at, status")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(30);

  return products || [];
}

export default async function NewProductsPage() {
  const products = await getNewProducts();

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col">
      <Navbar />
      
      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 pt-12 pb-16 w-full">
        <header className="mb-12 border-b border-bg-border pb-8 text-center sm:text-left">
          <p className="text-xs text-ink uppercase tracking-widest font-black mb-3">
            Product Discovery
          </p>
          <h1 className="font-display font-black text-4xl sm:text-5xl text-ink tracking-tight mb-4 uppercase">
            New Products
          </h1>
          <p className="text-ink-muted text-base font-bold uppercase tracking-wider leading-relaxed max-w-2xl">
            The latest products to enter the live board.
          </p>
        </header>

        <section className="mb-12">
          {products.length === 0 ? (
            <p className="text-ink-muted font-bold uppercase tracking-widest text-sm py-10 text-center">No new products found.</p>
          ) : (
            <div className="flex flex-col border border-bg-border bg-bg-surface">
              {products.map((product, i) => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-bg transition-colors ${i !== products.length - 1 ? "border-b border-bg-border" : ""}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex-shrink-0 bg-bg border border-bg-border flex items-center justify-center font-black text-xl">
                      {product.logo_url ? (
                        <img src={product.logo_url} alt={product.name} className="w-full h-full object-cover grayscale opacity-90" />
                      ) : (
                        product.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <h2 className="font-display font-black text-lg text-ink uppercase">{product.name}</h2>
                      <p className="text-ink-muted text-xs font-bold uppercase tracking-wider mt-1">{product.tagline}</p>
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-0 flex items-center gap-4 text-right">
                    <span className="badge">{product.category}</span>
                    <span className="text-[10px] text-ink-muted font-bold uppercase tracking-widest">
                      {new Date(product.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

      </main>
      <Footer />
    </div>
  );
}
