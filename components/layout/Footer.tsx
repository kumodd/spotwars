import Link from "next/link";
import { Sword } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-bg-border bg-bg-surface/50 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-purple to-accent-red flex items-center justify-center">
                <Sword className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-white">
                Spot<span className="text-gradient-purple">Wars</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              The internet's live attention market. Put your product in the arena, 
              fight for position, and let the internet decide who wins.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a href="https://twitter.com/spotwars_in" target="_blank" rel="noreferrer"
                className="p-2 rounded-lg bg-bg-elevated text-slate-400 hover:text-white hover:bg-accent-purple/20 transition-all" title="X (Twitter)">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.713 5.867zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="https://linkedin.com/company/spotwars" target="_blank" rel="noreferrer"
                className="p-2 rounded-lg bg-bg-elevated text-slate-400 hover:text-white hover:bg-accent-blue/20 transition-all" title="LinkedIn">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Product</h4>
            <ul className="space-y-2">
              {[
                { href: "/board", label: "Live Board" },
                { href: "/battles", label: "Battles" },
                { href: "/submit", label: "List Your Product" },
                { href: "/categories", label: "Categories" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-slate-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Company</h4>
            <ul className="space-y-2">
              {[
                { href: "/about", label: "About" },
                { href: "/blog", label: "Blog" },
                { href: "/pricing", label: "Pricing" },
                { href: "/terms", label: "Terms" },
                { href: "/privacy", label: "Privacy" },
                { href: "/contact", label: "Contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-slate-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-bg-border mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-xs">
            © {new Date().getFullYear()} SpotWars. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <span className="live-dot w-1.5 h-1.5 inline-block mr-1" />
            Live marketplace — positions update in real time
          </div>
        </div>
      </div>
    </footer>
  );
}
