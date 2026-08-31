import Link from "next/link";
import { Sword } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4 bg-grid">
      <div className="text-center">
        <div className="text-8xl font-display font-black text-bg-elevated mb-2">404</div>
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-purple to-accent-red flex items-center justify-center mx-auto mb-6 shadow-xl shadow-accent-purple/20">
          <Sword className="w-8 h-8 text-white" />
        </div>
        <h1 className="font-display font-bold text-3xl text-white mb-3">Position Not Found</h1>
        <p className="text-slate-400 mb-8 max-w-xs mx-auto">
          This spot doesn't exist — or someone already claimed it and moved on.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/" className="px-5 py-2.5 rounded-xl bg-accent-purple text-white font-semibold hover:bg-accent-purple-light transition-all">
            Back to Home
          </Link>
          <Link href="/board" className="px-5 py-2.5 rounded-xl glass border border-bg-border text-white font-semibold hover:border-accent-purple/40 transition-all">
            View Live Board
          </Link>
        </div>
      </div>
    </div>
  );
}
