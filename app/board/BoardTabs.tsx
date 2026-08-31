"use client";

import Link from "next/link";

interface BoardTab {
  slug: string;
  label: string;
  icon: string;
}

interface BoardTabsProps {
  boards: BoardTab[];
  currentSlug: string;
}

export default function BoardTabs({ boards, currentSlug }: BoardTabsProps) {
  return (
    <div className="flex items-center gap-1.5 mb-6 overflow-x-auto pb-2 scrollbar-none">
      {boards.map((board) => (
        <Link
          key={board.slug}
          href={`/board?board=${board.slug}`}
          className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
            currentSlug === board.slug
              ? "bg-accent-purple text-white shadow-md shadow-accent-purple/25"
              : "bg-bg-elevated text-slate-400 hover:text-white hover:bg-bg-border border border-bg-border"
          }`}
        >
          {board.label}
        </Link>
      ))}
    </div>
  );
}
