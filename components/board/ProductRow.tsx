"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink, Swords } from "lucide-react";
import { formatINR, formatNumber } from "@/lib/utils";
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
      <span className="move-up text-xs num">
        ↑{movement}
      </span>
    );
  }
  if (movement < 0) {
    return (
      <span className="move-down text-xs num">
        ↓{Math.abs(movement)}
      </span>
    );
  }
  return <span className="move-flat text-xs">—</span>;
}

function RankNumber({ position }: { position: number }) {
  const cls =
    position === 1
      ? "rank-gold"
      : position === 2
      ? "rank-silver"
      : position === 3
      ? "rank-bronze"
      : "rank-default";

  return (
    <span className={`text-sm num font-display ${cls}`}>
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
  const { product, position, spend_on_board, movement } = entry;
  const [showAttack, setShowAttack] = useState(false);
  const [justMoved, setJustMoved] = useState<"up" | "down" | null>(null);
  const prevPositionRef = useRef(position);

  useEffect(() => {
    if (prevPositionRef.current !== position) {
      const dir = position < prevPositionRef.current ? "up" : "down";
      setJustMoved(dir);
      const t = setTimeout(() => setJustMoved(null), 600);
      prevPositionRef.current = position;
      return () => clearTimeout(t);
    }
  }, [position]);

  const isOwner = userProductIds.includes(product.id);
  const canAttack = isAuthenticated && !isOwner;

  const flashClass =
    justMoved === "up"
      ? "row-flash-up"
      : justMoved === "down"
      ? "row-flash-down"
      : "";

  return (
    <>
      <div
        className={`board-row group ${flashClass}`}
        id={`product-row-${product.id}`}
      >
        {/* Rank — fixed width */}
        <div className="w-12 flex-shrink-0 text-right pr-3">
          <RankNumber position={position} />
        </div>

        {/* Logo — small */}
        <div className="w-8 h-8 flex-shrink-0 bg-bg border border-bg-border mr-3">
          {product.logo_url ? (
            <Image
              src={product.logo_url}
              alt={product.name}
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs font-black text-ink">
              {product.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Product info — flex-1 */}
        <div className="flex-1 min-w-0 mr-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/product/${product.id}`}
              className="text-sm font-black text-ink hover:text-ink-muted transition-colors truncate uppercase tracking-wide"
            >
              {product.name}
            </Link>
            <span className="hidden sm:inline badge">
              {product.category}
            </span>
          </div>
          <p className="text-ink-muted text-xs truncate mt-0.5 max-w-[340px] font-bold uppercase tracking-wider">
            {product.tagline}
          </p>
        </div>

        {/* Stats columns — desktop only */}
        <div className="hidden md:flex items-center gap-8 flex-shrink-0 mr-4">
          {/* Attention / Spend */}
          <div className="text-right w-20">
            <div className="text-sm font-black text-ink num">
              {formatINR(spend_on_board, true)}
            </div>
            <div className="text-ink-muted text-[10px] uppercase tracking-wide font-bold">attention</div>
          </div>

          {/* Movement */}
          <div className="text-right w-10">
            <MovementBadge movement={movement} />
          </div>

          {/* Clicks */}
          <div className="text-right w-16">
            <div className="text-sm font-black text-ink num">
              {formatNumber(product.click_count)}
            </div>
            <div className="text-ink-muted text-[10px] uppercase tracking-wide font-bold">clicks</div>
          </div>
        </div>

        {/* Mobile stats — compact */}
        <div className="flex md:hidden items-center gap-4 flex-shrink-0 mr-3">
          <div className="text-right">
            <div className="text-xs font-black text-ink num">{formatINR(spend_on_board, true)}</div>
            <MovementBadge movement={movement} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <a
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              fetch(`/api/clicks/${product.id}`, { method: "POST" }).catch(() => {});
            }}
            className="p-1.5 rounded-none text-ink-muted hover:text-ink hover:bg-bg-elevated transition-all border border-transparent hover:border-bg-border"
            title={`Visit ${product.name}`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {canAttack && (
            <button
              onClick={() => setShowAttack(true)}
              className="flex items-center gap-1 px-2 py-1 rounded-sm attack-btn text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
              title={`Attack #${position}`}
              id={`attack-btn-${product.id}`}
            >
              <Swords className="w-3 h-3" />
              <span className="hidden sm:inline">Attack</span>
            </button>
          )}

          {isOwner && (
            <span className="px-2 py-0.5 rounded-none bg-ink text-bg text-[10px] font-black border border-bg-border uppercase tracking-widest">
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
