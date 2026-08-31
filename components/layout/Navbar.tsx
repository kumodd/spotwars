"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Menu, X } from "lucide-react";
import type { User } from "@supabase/supabase-js";

const navLinks = [
  { href: "/", label: "Live Board", exact: true },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/battles", label: "Battles" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/activity", label: "Activity" },
  { href: "/for-founders", label: "For Founders" },
];

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <header
      className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-150 ${
        scrolled
          ? "bg-bg shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]"
          : "bg-bg border-t border-transparent"
      }`}
    >
      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="absolute bottom-full left-0 right-0 lg:hidden border-t border-bg-border bg-bg animate-fade-in">
          <div className="max-w-7xl mx-auto px-4 py-3 space-y-2 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block py-2 text-sm font-bold uppercase tracking-wider transition-colors border-b border-bg-border ${
                  isActive(link.href, link.exact)
                    ? "text-ink"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 space-y-2">
              {user ? (
                <>
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-bold uppercase tracking-wider text-ink-muted hover:text-ink border-b border-bg-border">Dashboard</Link>
                  <button onClick={handleSignOut} className="block w-full text-left py-2 text-sm font-bold uppercase tracking-wider text-ink-muted hover:text-ink">Sign out</button>
                </>
              ) : (
                <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="block py-2 text-sm font-bold uppercase tracking-wider text-ink-muted hover:text-ink">Sign in</Link>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 border-t border-bg-border">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="font-display font-black text-lg sm:text-xl text-ink tracking-tight uppercase">
              InternetBillboard.space
            </span>
            <span className="hidden sm:flex items-center gap-1 ml-1">
              <span className="live-dot" />
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-semibold transition-colors uppercase tracking-wider ${
                  isActive(link.href, link.exact)
                    ? "text-ink border-b border-bg-border"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className={`hidden sm:block text-sm font-semibold transition-colors uppercase tracking-wider ${
                    pathname.startsWith("/dashboard")
                      ? "text-ink border-b border-bg-border"
                      : "text-ink-muted hover:text-ink"
                  }`}
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="hidden sm:block text-sm text-ink-muted hover:text-ink transition-colors uppercase tracking-wider font-semibold"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="hidden sm:block text-sm text-ink-muted hover:text-ink transition-colors uppercase tracking-wider font-semibold"
              >
                Sign in
              </Link>
            )}

            <Link
              href="/submit"
              id="nav-submit-btn"
              className="flex items-center gap-1.5 px-3.5 py-1.5 btn-primary"
            >
              <span className="hidden sm:inline">List Your Product</span>
              <span className="sm:hidden">List</span>
            </Link>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-1.5 text-ink hover:bg-bg-elevated transition-all"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

    </header>
  );
}
