"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { TrendingUp, TrendingDown, Minus, ExternalLink, Swords } from "lucide-react";
import { formatINR, formatNumber, getMovement } from "@/lib/utils";
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
}

function MovementBadge({ movement }: { movement: number }) {
  if (movement > 0) {
    return (
      <span className="flex items-center gap-0.5 text-emerald-400 text-xs font-semibold">
        <TrendingUp className="w-3 h-3" />↑{movement}
      </span>
    );
  }
  if (movement < 0) {
    return (
      <span className="flex items-center gap-0.5 text-red-400 text-xs font-semibold">
        <TrendingDown className="w-3 h-3" />↓{Math.abs(movement)}
      </span>
    );
  }
  return <span className="text-slate-600 text-xs"><Minus className="w-3 h-3 inline" /></span>;
}

function RankBadge({ position }: { position: number }) {
  if (position === 1) return <span className="text-2xl font-display font-black rank-1">🥇</span>;
  if (position === 2) return <span className="text-2xl font-display font-black rank-2">🥈</span>;
  if (position === 3) return <span className="text-2xl font-display font-black rank-3">🥉</span>;
  return (
    <span className="text-base font-display font-bold text-slate-400 w-8 text-center">
      #{position}
    </span>
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
}: ProductRowProps) {
  const { product, position, previous_position, spend_on_board, movement } = entry;
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
  const canAttack = isAuthenticated && !isOwner;

  const rowBg = justMoved === "up"
    ? "bg-emerald-500/10"
    : justMoved === "down"
    ? "bg-red-500/10"
    : "";

  return (
    <>
      <div
        className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border border-bg-border card-hover group transition-all duration-500 ${rowBg} ${
          position <= 3 ? "bg-bg-elevated" : "bg-bg-surface/50"
        }`}
        id={`product-row-${product.id}`}
      >
        {/* Rank */}
        <div className="w-10 flex-shrink-0 flex justify-center">
          <RankBadge position={position} />
        </div>

        {/* Logo */}
        <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-xl overflow-hidden bg-bg-elevated border border-bg-border">
          {product.logo_url ? (
            <Image
              src={product.logo_url}
              alt={product.name}
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-lg font-bold text-accent-purple">
              {product.name.charAt(0)}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/product/${product.id}`}
              className="font-display font-semibold text-white hover:text-accent-purple-light transition-colors truncate text-sm sm:text-base"
            >
              {product.name}
            </Link>
            <span className="hidden sm:inline text-xs px-1.5 py-0.5 rounded-md bg-bg-elevated text-slate-500 border border-bg-border">
              {product.category}
            </span>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm truncate mt-0.5">{product.tagline}</p>
        </div>

        {/* Stats */}
        <div className="hidden sm:flex items-center gap-6 flex-shrink-0">
          <div className="text-right">
            <div className="text-white font-semibold text-sm">{formatINR(spend_on_board, true)}</div>
            <div className="text-slate-500 text-xs">spend</div>
          </div>
          <div className="text-right">
            <div className="text-white font-semibold text-sm">{formatNumber(product.click_count)}</div>
            <div className="text-slate-500 text-xs">clicks</div>
          </div>
          <div className="text-right w-10">
            <MovementBadge movement={movement} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <a
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              // Fire click tracking
              fetch(`/api/clicks/${product.id}`, { method: "POST" }).catch(() => {});
            }}
            className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-bg-elevated transition-all"
            title={`Visit ${product.name}`}
          >
            <ExternalLink className="w-4 h-4" />
          </a>

          {canAttack && (
            <button
              onClick={() => setShowAttack(true)}
              className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg attack-btn text-white text-xs sm:text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all"
              title={`Attack #${position}`}
              id={`attack-btn-${product.id}`}
            >
              <Swords className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">⚔️ Attack</span>
            </button>
          )}

          {isOwner && (
            <span className="px-2 py-1 rounded-lg bg-accent-purple/20 text-accent-purple-light text-xs font-medium border border-accent-purple/30">
              Yours
            </span>
          )}
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
