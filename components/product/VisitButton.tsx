"use client";

import { ExternalLink } from "lucide-react";

interface VisitButtonProps {
  productId: string;
  url: string;
}

export default function VisitButton({ productId, url }: VisitButtonProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => fetch(`/api/clicks/${productId}`, { method: "POST" }).catch(() => {})}
      id="product-visit-btn"
      className="flex items-center gap-2 px-4 py-2 rounded-sm btn-primary text-sm font-semibold"
    >
      <ExternalLink className="w-4 h-4" />
      Visit Product
    </a>
  );
}
