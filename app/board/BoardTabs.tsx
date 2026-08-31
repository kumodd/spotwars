"use client";

import Link from "next/link";

interface BoardTab {
  slug: string;
  label: string;
  icon?: string;
}

interface BoardTabsProps {
  boards: BoardTab[];
  currentSlug: string;
}

export default function BoardTabs({ boards, currentSlug }: BoardTabsProps) {
  return (
    <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-1 scrollbar-none">
      {boards.map((board) => (
        <Link
          key={board.slug}
          href={`/board?board=${board.slug}`}
          className={`filter-tab flex-shrink-0 whitespace-nowrap ${
            currentSlug === board.slug ? "active" : ""
          }`}
        >
          {board.label}
        </Link>
      ))}
    </div>
  );
}
