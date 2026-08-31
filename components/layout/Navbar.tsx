"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Sword, Bell, Menu, X, ChevronDown, Zap } from "lucide-react";
import type { User } from "@supabase/supabase-js";

const navLinks = [
  { href: "/board", label: "Live Board" },
  { href: "/board?tab=ai-ml", label: "AI" },
  { href: "/board?tab=saas", label: "SaaS" },
  { href: "/battles", label: "⚔️ Battles" },
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
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass border-b border-bg-border shadow-lg shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-purple to-accent-red flex items-center justify-center shadow-lg shadow-accent-purple/30 group-hover:shadow-accent-purple/50 transition-shadow">
                <Sword className="w-4 h-4 text-white" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-accent-red rounded-full live-dot" />
            </div>
            <span className="font-display font-bold text-xl text-white">
              Spot<span className="text-gradient-purple">Wars</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  pathname === link.href
                    ? "bg-accent-purple/20 text-accent-purple-light"
                    : "text-slate-400 hover:text-white hover:bg-bg-elevated"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <button
                  className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-bg-elevated transition-all"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-accent-red rounded-full" />
                </button>
                <Link
                  href="/dashboard"
                  className={`hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    pathname.startsWith("/dashboard")
                      ? "bg-accent-purple text-white"
                      : "text-slate-300 hover:text-white hover:bg-bg-elevated"
                  }`}
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="hidden sm:block text-sm text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="text-sm text-slate-400 hover:text-white transition-colors hidden sm:block"
              >
                Sign in
              </Link>
            )}

            <Link
              href="/submit"
              id="nav-submit-btn"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent-purple hover:bg-accent-purple-light text-white text-sm font-semibold transition-all shadow-lg shadow-accent-purple/25 hover:shadow-accent-purple/40"
            >
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">List Product</span>
              <span className="sm:hidden">List</span>
            </Link>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-bg-elevated transition-all"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden glass border-t border-bg-border animate-fade-in">
          <div className="max-w-7xl mx-auto px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-bg-elevated transition-all"
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-bg-elevated">Dashboard</Link>
                <button onClick={handleSignOut} className="block w-full text-left px-3 py-2 rounded-lg text-sm text-slate-500 hover:text-slate-300">Sign out</button>
              </>
            ) : (
              <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-bg-elevated">Sign in</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
