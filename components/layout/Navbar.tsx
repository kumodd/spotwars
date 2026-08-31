"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Menu, X, Swords } from "lucide-react";
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-150 ${
        scrolled
          ? "bg-[#0C0C0C] border-b border-[#1A1A1A]"
          : "bg-[#0C0C0C]/95"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-7 h-7 border border-[#2A2A2A] rounded flex items-center justify-center bg-[#181818]">
              <Swords className="w-3.5 h-3.5 text-[#E85D27]" />
            </div>
            <span className="font-display font-bold text-lg text-white tracking-tight">
              SpotWars
            </span>
            <span className="hidden sm:flex items-center gap-1 ml-1">
              <span className="live-dot" />
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 text-sm font-medium transition-colors rounded-sm ${
                  isActive(link.href, link.exact)
                    ? "text-white bg-[#181818]"
                    : "text-[#777777] hover:text-[#CCCCCC]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className={`hidden sm:block text-sm font-medium transition-colors px-3 py-1.5 rounded-sm ${
                    pathname.startsWith("/dashboard")
                      ? "text-white bg-[#181818]"
                      : "text-[#777777] hover:text-white"
                  }`}
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="hidden sm:block text-sm text-[#555555] hover:text-[#999999] transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="hidden sm:block text-sm text-[#666666] hover:text-[#CCCCCC] transition-colors"
              >
                Sign in
              </Link>
            )}

            <Link
              href="/submit"
              id="nav-submit-btn"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-sm btn-primary text-sm font-semibold"
            >
              <span className="hidden sm:inline">List Your Product</span>
              <span className="sm:hidden">List</span>
            </Link>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-1.5 rounded-sm text-[#777777] hover:text-white hover:bg-[#181818] transition-all"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-[#1A1A1A] bg-[#0C0C0C] animate-fade-in">
          <div className="max-w-7xl mx-auto px-4 py-3 space-y-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2 text-sm font-medium transition-colors rounded-sm ${
                  isActive(link.href, link.exact)
                    ? "text-white bg-[#181818]"
                    : "text-[#777777] hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-[#1A1A1A] mt-2 pt-2 space-y-0.5">
              {user ? (
                <>
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm text-[#777777] hover:text-white rounded-sm">Dashboard</Link>
                  <button onClick={handleSignOut} className="block w-full text-left px-3 py-2 text-sm text-[#555555] hover:text-[#999999] rounded-sm">Sign out</button>
                </>
              ) : (
                <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm text-[#777777] hover:text-white rounded-sm">Sign in</Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
