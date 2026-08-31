import Link from "next/link";
import { Swords } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0C0C0C] flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="font-display font-black text-[120px] leading-none text-[#1A1A1A] mb-4 num">
          404
        </div>
        <div className="w-10 h-10 border border-[#2A2A2A] rounded flex items-center justify-center bg-[#181818] mx-auto mb-5">
          <Swords className="w-5 h-5 text-[#E85D27]" />
        </div>
        <h1 className="font-display font-bold text-xl text-white mb-2">
          Position Not Found
        </h1>
        <p className="text-[#555555] text-sm mb-8 leading-relaxed">
          This spot doesn&apos;t exist — or someone already claimed it and moved on.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="btn-primary px-5 py-2.5 rounded-sm text-sm font-semibold"
          >
            Back to Live Board
          </Link>
        </div>
      </div>
    </div>
  );
}
