import Link from "next/link";

const links = [
  { href: "/", label: "Live Board" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/submit", label: "List Your Product" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
];

export default function Footer() {
  return (
    <footer className="border-t border-bg-border bg-bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3">

          {/* Brand */}
          <Link href="/" className="flex items-center gap-1.5 flex-shrink-0">
            <span className="font-display font-black text-xs text-ink uppercase tracking-tight">
              InternetBillboard.space
            </span>
            <span className="live-dot w-[5px] h-[5px]" aria-hidden="true" />
          </Link>

          {/* Links — inline */}
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-1" aria-label="Footer navigation">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[10px] font-bold text-ink-muted hover:text-ink uppercase tracking-wider transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Copyright */}
          <p className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider flex-shrink-0">
            © {new Date().getFullYear()} InternetBillboard.space
          </p>

        </div>
      </div>
    </footer>
  );
}
