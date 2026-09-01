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
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-bg border-b border-bg-border transition-shadow duration-150 ${
        scrolled ? "shadow-[0_1px_4px_rgba(0,0,0,0.07)]" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-10">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5 flex-shrink-0">
            <span className="font-display font-black text-sm text-ink tracking-tight uppercase leading-none">
              InternetBillboard.space
            </span>
            <span className="live-dot" aria-label="live" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center" aria-label="Main navigation">
            {navLinks.map((link) => {
              const active = isActive(link.href, link.exact);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider transition-all ${
                    active ? "text-ink border-b-2 border-ink" : "text-ink-muted hover:text-ink"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className={`hidden sm:block text-[11px] font-bold uppercase tracking-wider transition-colors px-2 ${
                    pathname.startsWith("/dashboard") ? "text-ink" : "text-ink-muted hover:text-ink"
                  }`}
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="hidden sm:block text-[11px] text-ink-muted hover:text-ink transition-colors uppercase tracking-wider font-bold"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="hidden sm:block text-[11px] text-ink-muted hover:text-ink transition-colors uppercase tracking-wider font-bold"
              >
                Sign in
              </Link>
            )}

            <Link
              href="/submit"
              id="nav-submit-btn"
              className="btn-primary px-3 py-1 text-[11px]"
            >
              List Your Product
            </Link>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-1 text-ink hover:bg-bg-surface transition-all"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-bg-border bg-bg animate-fade-in" role="dialog" aria-label="Mobile navigation">
          <div className="max-w-7xl mx-auto px-4 py-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center py-2.5 text-xs font-bold uppercase tracking-wider border-b border-bg-border transition-colors ${
                  isActive(link.href, link.exact) ? "text-ink" : "text-ink-muted hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="py-1">
              {user ? (
                <>
                  <Link href="/dashboard" className="flex items-center py-2.5 text-xs font-bold uppercase tracking-wider text-ink-muted hover:text-ink border-b border-bg-border">
                    Dashboard
                  </Link>
                  <button onClick={handleSignOut} className="text-left w-full py-2.5 text-xs font-bold uppercase tracking-wider text-ink-muted hover:text-ink">
                    Sign out
                  </button>
                </>
              ) : (
                <Link href="/auth/login" className="flex items-center py-2.5 text-xs font-bold uppercase tracking-wider text-ink-muted hover:text-ink">
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
