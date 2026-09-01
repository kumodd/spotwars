import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/server";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

function formatCategoryName(slug: string) {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const categoryName = formatCategoryName(slug);
  return {
    title: `${categoryName} Products — Live Rankings & Discovery`,
    description: `Discover the top ${categoryName} products and startups. See live rankings, visibility scores, and trending tools on InternetBillboard.space.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const categoryName = formatCategoryName(slug);
  
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, name, tagline, logo_url, category, spot_score, status, total_spend")
    .ilike("category", categoryName)
    .eq("status", "active")
    .order("total_spend", { ascending: false })
    .limit(50);

  if (!products || products.length === 0) {
    // Optionally return notFound() if strict, or just show empty state.
    // We will show empty state for now to allow new categories to populate.
  }

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col">
      <Navbar />
      
      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 pt-12 pb-16 w-full">
        <header className="mb-12 border-b border-bg-border pb-8 text-center sm:text-left">
          <Link href="/product-discovery" className="text-xs font-bold text-ink hover:text-ink-muted transition-colors mb-4 inline-block uppercase tracking-wider">
            ← Discovery
          </Link>
          <h1 className="font-display font-black text-4xl sm:text-5xl text-ink tracking-tight mb-4 uppercase">
            {categoryName} Products
          </h1>
          <p className="text-ink-muted text-base font-bold uppercase tracking-wider leading-relaxed max-w-2xl">
            Live rankings and discovery for {categoryName} startups and tools.
          </p>
        </header>

        <section className="mb-12">
          {(!products || products.length === 0) ? (
            <div className="text-center py-10 border border-bg-border bg-bg-surface">
              <p className="text-ink-muted font-bold uppercase tracking-widest text-sm mb-4">No products found in this category yet.</p>
              <Link href="/submit" className="btn-primary px-6 py-2">List the first one</Link>
            </div>
          ) : (
            <div className="flex flex-col border border-bg-border bg-bg-surface">
              {products.map((product, i) => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-bg transition-colors ${i !== products.length - 1 ? "border-b border-bg-border" : ""}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 font-black text-xl text-ink num text-center">
                      #{i + 1}
                    </div>
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
