import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-bg-border bg-bg mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <span className="font-display font-black text-base text-ink uppercase tracking-tight">
                InternetBillboard.space
              </span>
            </Link>
            <p className="text-ink-muted text-xs leading-relaxed max-w-[180px] font-semibold uppercase tracking-wider">
              The live internet attention market. Products compete. The board decides.
            </p>
            <div className="flex items-center gap-2 mt-4">
              <a
                href="https://twitter.com/internetbillboard"
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-none border border-bg-border text-ink hover:bg-ink hover:text-bg transition-all"
                title="X (Twitter)"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.713 5.867zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Board */}
          <div>
            <h4 className="text-xs font-black text-ink mb-3 uppercase tracking-widest border-b border-bg-border pb-1 inline-block">Board</h4>
            <ul className="space-y-2 mt-2">
              {[
                { href: "/", label: "Live Board" },
                { href: "/leaderboard", label: "Leaderboard" },
                { href: "/battles", label: "Battles" },
                { href: "/activity", label: "Activity" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-xs text-ink-muted font-bold hover:text-ink transition-colors uppercase tracking-wider">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Founders */}
          <div>
            <h4 className="text-xs font-black text-ink mb-3 uppercase tracking-widest border-b border-bg-border pb-1 inline-block">Founders</h4>
            <ul className="space-y-2 mt-2">
              {[
                { href: "/for-founders", label: "For Founders" },
                { href: "/how-it-works", label: "How It Works" },
                { href: "/submit", label: "List Your Product" },
                { href: "/dashboard", label: "Dashboard" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-xs text-ink-muted font-bold hover:text-ink transition-colors uppercase tracking-wider">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-black text-ink mb-3 uppercase tracking-widest border-b border-bg-border pb-1 inline-block">Legal</h4>
            <ul className="space-y-2 mt-2">
              {[
                { href: "/terms", label: "Terms" },
                { href: "/privacy", label: "Privacy" },
                { href: "/contact", label: "Contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-xs text-ink-muted font-bold hover:text-ink transition-colors uppercase tracking-wider">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-bg-border mt-8 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-ink font-bold uppercase tracking-wider text-xs">
            © {new Date().getFullYear()} INTERNETBILLBOARD.SPACE. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ink">
            <span className="live-dot w-[6px] h-[6px]" />
            Positions update in real time
          </div>
        </div>
      </div>
    </footer>
  );
}
