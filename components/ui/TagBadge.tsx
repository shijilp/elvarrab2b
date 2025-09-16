import { Crown } from "lucide-react";

import React from "react";

const TagBadge: React.FC<{ tag?: string }> = ({ tag }) => {
  if (!tag) return null;
  const isPremium =
    tag.toLowerCase() === "premiume" || tag.toLowerCase() === "premium";

  return (
    <span
      className={`absolute left-2 top-2 z-10
        flex items-center gap-1 px-2 py-1
        text-[10px] font-semibold uppercase tracking-wider
        rounded-full overflow-hidden
        ${
          isPremium
            ? "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white shadow-md ring-1 ring-yellow-400"
            : "bg-[var(--chip-bg)] text-[var(--chip-fg)]"
        }`}
      aria-label={`${tag} tag`}
    >
      {isPremium && (
        <Crown className="w-4 h-4 text-yellow-200 drop-shadow-sm" />
      )}
      {isPremium ? "Premium" : tag}
      {isPremium && (
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent rounded-full" />
      )}
    </span>
  );
};

export default TagBadge;
