"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { formatINR, formatNumber, costToTake } from "@/lib/utils";
import type { BoardEntry } from "@/lib/types";
import AttackModal from "@/components/battle/AttackModal";

interface ProductRowProps {
  entry: BoardEntry;
  boardId: string;
  boardSlug: string;
  rank: number;
  isAuthenticated: boolean;
  userProductIds?: string[];
  onAttackSuccess?: () => void;
  allEntries?: BoardEntry[];
  topSpend?: number;
}

function MovementBadge({ movement }: { movement: number }) {
  if (movement > 0)
    return (
      <div className="flex items-center gap-0.5 text-[#059669]" title={`Moved up ${movement} position(s)`}>
        <TrendingUp className="w-3 h-3" />
        <span className="text-[10px] font-bold num leading-none">{movement}</span>
      </div>
    );
  if (movement < 0)
    return (
      <div className="flex items-center gap-0.5 text-[#DC2626]" title={`Moved down ${Math.abs(movement)} position(s)`}>
        <TrendingDown className="w-3 h-3" />
        <span className="text-[10px] font-bold num leading-none">{Math.abs(movement)}</span>
      </div>
    );
  return (
    <div className="flex items-center gap-0.5 text-[#5A5A5A]" title="No change">
      <Minus className="w-3 h-3" />
    </div>
  );
}

function RankNumber({ position }: { position: number }) {
  const isTop = position === 1;
  return (
    <span className={`num font-mono font-black leading-none ${isTop ? 'text-4xl text-ink tracking-tighter' : 'text-2xl text-ink-muted'}`}>
      {position < 10 ? `0${position}` : position}
    </span>
  );
}

// Procedural sparkline based on movement to visualize momentum
function MomentumSparkline({ movement }: { movement: number }) {
  const points = movement > 0 
    ? "0,12 4,14 8,8 12,12 16,4 20,6 24,0" 
    : movement < 0 
    ? "0,0 4,2 8,8 12,6 16,14 20,12 24,16" 
    : "0,8 4,7 8,9 12,8 16,7 20,9 24,8";
    
  const color = movement > 0 ? "#111111" : movement < 0 ? "#5A5A5A" : "#D1CCC2";

  return (
    <div className="flex flex-col items-end gap-1">
      <span className="text-[9px] font-bold uppercase tracking-widest text-ink-muted leading-none">Momentum</span>
      <svg width="24" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polyline points={points} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export default function ProductRow({
  entry,
  boardId,
  boardSlug,
  rank,
  isAuthenticated,
  userProductIds = [],
  onAttackSuccess,
  allEntries = [],
  topSpend = 1,
}: ProductRowProps) {
  const { product, position, spend_on_board, movement } = entry;
  const [showAttack, setShowAttack] = useState(false);
  const [justMoved, setJustMoved] = useState<"up" | "down" | null>(null);
  const prevPositionRef = useRef(position);

  useEffect(() => {
    if (prevPositionRef.current !== position) {
      const dir = position < prevPositionRef.current ? "up" : "down";
      setJustMoved(dir);
      const t = setTimeout(() => setJustMoved(null), 700);
      prevPositionRef.current = position;
      return () => clearTimeout(t);
    }
  }, [position]);

  const isOwner = userProductIds.includes(product.id);
  const canTake = isAuthenticated && !isOwner;
  const isTop = position === 1;

  const flashClass =
    justMoved === "up" ? "row-flash-up" :
    justMoved === "down" ? "row-flash-down" : "";

  const takeAmount = costToTake(spend_on_board);
  const relativeSpendPercentage = Math.min(100, Math.max(2, (spend_on_board / Math.max(1, topSpend)) * 100));

  return (
    <>
      <div
        className={`product-card-premium elevation-1 rounded-md overflow-hidden ${flashClass} ${isTop ? 'border-2 border-ink shadow-[0_8px_24px_-8px_rgba(0,0,0,0.12)]' : ''}`}
        id={`product-row-${product.id}`}
      >
        <div className={`p-4 sm:p-5 flex flex-col md:flex-row gap-5 md:gap-6 items-start md:items-center ${isTop ? 'bg-gradient-to-r from-white to-[#FDFBF7]' : ''}`}>
          
          {/* ── Left: Rank, Logo, Name ── */}
          <div className="flex items-center gap-4 flex-1 min-w-0 w-full md:w-auto">
            {/* Rank */}
            <div className={`w-8 sm:w-12 text-center flex-shrink-0 ${isTop ? 'w-12 sm:w-16' : ''}`} aria-label={`Position ${position}`}>
              <RankNumber position={position} />
            </div>

            {/* Logo */}
            <div className={`flex-shrink-0 bg-bg-surface border border-bg-border overflow-hidden rounded-sm ${isTop ? 'w-12 h-12 sm:w-14 sm:h-14' : 'w-10 h-10 sm:w-12 sm:h-12'}`}>
              {product.logo_url ? (
                <Image src={product.logo_url} alt={`${product.name} logo`} width={56} height={56} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm font-black text-ink">
                  {product.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <Link
                  href={`/product/${product.id}`}
                  className={`font-black text-ink hover:text-ink-muted transition-colors truncate uppercase tracking-wide leading-none ${isTop ? 'text-lg sm:text-xl' : 'text-sm sm:text-base'}`}
                >
                  {product.name}
                </Link>
                {/* External link — subtle */}
                <a
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => fetch(`/api/clicks/${product.id}`, { method: "POST" }).catch(() => {})}
                  className="text-ink-muted hover:text-ink transition-colors"
                  title={`Visit ${product.name}`}
                  aria-label={`Visit ${product.name}`}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <p className={`text-ink-muted truncate max-w-[280px] sm:max-w-[400px] leading-snug ${isTop ? 'text-xs' : 'text-[11px]'}`}>
                {product.tagline}
              </p>
            </div>
          </div>

          {/* ── Middle: Data Viz & Stats ── */}
          <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto px-12 md:px-0">
            
            {/* Momentum Sparkline */}
            <div className="hidden sm:block">
              <MomentumSparkline movement={movement} />
            </div>

            {/* Stats */}
            <div className="flex gap-6">
              <div className="text-right">
                <span className="block text-[9px] font-bold uppercase tracking-widest text-ink-muted leading-none mb-1">Spend</span>
                <div className={`font-black text-ink num leading-none ${isTop ? 'text-lg' : 'text-sm'}`}>
                  {formatINR(spend_on_board, true)}
                </div>
                {/* Relative Spend Bar */}
                <div className="mt-1.5 w-full max-w-[80px] ml-auto">
                  <div className="spend-bar-bg rounded-full">
                    <div className="spend-bar-fill rounded-full" style={{ width: `${relativeSpendPercentage}%` }} />
                  </div>
                </div>
              </div>

              <div className="text-right hidden sm:block">
                <span className="block text-[9px] font-bold uppercase tracking-widest text-ink-muted leading-none mb-1">Clicks</span>
                <div className={`font-bold text-ink num leading-none ${isTop ? 'text-base' : 'text-xs'}`}>
                  {formatNumber(product.click_count)}
                </div>
                <div className="mt-1.5 flex justify-end">
                  <MovementBadge movement={movement} />
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: Dominant CTA ── */}
          <div className="w-full md:w-auto flex-shrink-0 mt-2 md:mt-0 flex justify-end">
            {canTake && isTop && (
              <button
                onClick={() => setShowAttack(true)}
                className="btn-take-hero w-full md:w-auto"
                title={`Take position #1 for ${formatINR(takeAmount)}`}
              >
                TAKE #1 · {formatINR(takeAmount, true)}
              </button>
            )}
            
            {canTake && !isTop && (
              <button
                onClick={() => setShowAttack(true)}
                className="btn-secondary px-4 py-2 text-xs w-full md:w-auto"
                title={`Take position #${position} for ${formatINR(takeAmount)}`}
              >
                Take #{position} · {formatINR(takeAmount, true)}
              </button>
            )}

            {!isAuthenticated && (
              <Link
                href="/auth/login"
                className={`${isTop ? 'btn-take-hero' : 'btn-secondary px-4 py-2 text-xs'} w-full md:w-auto text-center inline-block`}
                title={`Sign in to take position #${position}`}
              >
                Take #{position}
              </Link>
            )}

            {isOwner && (
              <span className="owner-badge px-4 py-2 text-xs bg-bg-surface border-bg-border rounded-sm block w-full text-center md:w-auto md:inline-block">
                Your Product
              </span>
            )}
          </div>
        </div>
      </div>

      {showAttack && (
        <AttackModal
          targetProduct={product}
          targetPosition={position}
          targetSpend={spend_on_board}
          boardId={boardId}
          boardSlug={boardSlug}
          onClose={() => setShowAttack(false)}
          onSuccess={() => {
            setShowAttack(false);
            onAttackSuccess?.();
          }}
        />
      )}
    </>
  );
}
