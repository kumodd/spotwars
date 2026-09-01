import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-bg-border bg-bg-surface mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xs font-black text-ink uppercase tracking-widest mb-4">Discover</h3>
            <ul className="space-y-3">
              <li><Link href="/internet-billboard" className="text-[10px] font-bold text-ink-muted hover:text-ink uppercase tracking-wider transition-colors">Internet Billboard</Link></li>
              <li><Link href="/product-visibility" className="text-[10px] font-bold text-ink-muted hover:text-ink uppercase tracking-wider transition-colors">Product Visibility</Link></li>
              <li><Link href="/product-promotion" className="text-[10px] font-bold text-ink-muted hover:text-ink uppercase tracking-wider transition-colors">Product Promotion</Link></li>
              <li><Link href="/product-discovery" className="text-[10px] font-bold text-ink-muted hover:text-ink uppercase tracking-wider transition-colors">Product Discovery</Link></li>
              <li><Link href="/online-billboard" className="text-[10px] font-bold text-ink-muted hover:text-ink uppercase tracking-wider transition-colors">Online Billboard</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-black text-ink uppercase tracking-widest mb-4">Rankings</h3>
            <ul className="space-y-3">
              <li><Link href="/" className="text-[10px] font-bold text-ink-muted hover:text-ink uppercase tracking-wider transition-colors">Live Board</Link></li>
              <li><Link href="/trending" className="text-[10px] font-bold text-ink-muted hover:text-ink uppercase tracking-wider transition-colors">Trending</Link></li>
              <li><Link href="/new-products" className="text-[10px] font-bold text-ink-muted hover:text-ink uppercase tracking-wider transition-colors">New Products</Link></li>
              <li><Link href="/leaderboard" className="text-[10px] font-bold text-ink-muted hover:text-ink uppercase tracking-wider transition-colors">Leaderboard</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-black text-ink uppercase tracking-widest mb-4">Compare</h3>
            <ul className="space-y-3">
              <li><Link href="/compare/internetbillboard-vs-ownspot" className="text-[10px] font-bold text-ink-muted hover:text-ink uppercase tracking-wider transition-colors">vs OwnSpot</Link></li>
              <li><Link href="/compare/internetbillboard-vs-spotwars" className="text-[10px] font-bold text-ink-muted hover:text-ink uppercase tracking-wider transition-colors">vs SpotWars</Link></li>
              <li><Link href="/alternatives/ownspot" className="text-[10px] font-bold text-ink-muted hover:text-ink uppercase tracking-wider transition-colors">OwnSpot Alternatives</Link></li>
              <li><Link href="/alternatives/spotwars" className="text-[10px] font-bold text-ink-muted hover:text-ink uppercase tracking-wider transition-colors">SpotWars Alternatives</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-black text-ink uppercase tracking-widest mb-4">Platform</h3>
            <ul className="space-y-3">
              <li><Link href="/submit" className="text-[10px] font-bold text-ink-muted hover:text-ink uppercase tracking-wider transition-colors">List Your Product</Link></li>
              <li><Link href="/for-founders" className="text-[10px] font-bold text-ink-muted hover:text-ink uppercase tracking-wider transition-colors">For Founders</Link></li>
              <li><Link href="/how-it-works" className="text-[10px] font-bold text-ink-muted hover:text-ink uppercase tracking-wider transition-colors">How It Works</Link></li>
              <li><Link href="/terms" className="text-[10px] font-bold text-ink-muted hover:text-ink uppercase tracking-wider transition-colors">Terms</Link></li>
              <li><Link href="/privacy" className="text-[10px] font-bold text-ink-muted hover:text-ink uppercase tracking-wider transition-colors">Privacy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-bg-border py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-1.5 flex-shrink-0">
            <span className="font-display font-black text-xs text-ink uppercase tracking-tight">
              InternetBillboard.space
            </span>
            <span className="live-dot w-[5px] h-[5px]" aria-hidden="true" />
          </Link>

          <p className="text-[10px] font-semibold text-ink-muted uppercase tracking-wider">
            © {new Date().getFullYear()} InternetBillboard.space
          </p>
        </div>
      </div>
    </footer>
  );
}
