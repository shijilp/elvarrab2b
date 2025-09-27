import Link from "next/link";
import { useState } from "react";
import { Spinner } from "./Spinner";

export function Topbar({
  onSearch,
  pending,
}: {
  onSearch: (q: string) => void;
  pending?: boolean;
}) {
  const [q, setQ] = useState("");
  return (
    <header className="sticky top-0 z-10 -mx-4 mb-4 border-b border-neutral-200 bg-white/70 px-4 py-3 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/50">
      <div className="flex items-center justify-between gap-3">
        <div className="flex w-full max-w-xl items-center gap-2 rounded-2xl border border-neutral-200 bg-white/90 px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-amber-500 dark:border-neutral-800 dark:bg-neutral-900/70">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            className="opacity-60"
            aria-hidden
          >
            <path
              d="M10 4a6 6 0 1 1 0 12A6 6 0 0 1 10 4Zm8.65 14.24-3.5-3.5"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch(q)}
            placeholder="Search orders, products, customers..."
            className="w-full bg-transparent outline-none placeholder:opacity-60"
          />
          <button
            onClick={() => onSearch(q)}
            className="rounded-xl  px-3 py-1.5 text-xs text-white btn-gradient-accent dark:text-neutral-900"
          >
            {pending ? <Spinner size={14} /> : "Search"}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="rounded-xl px-3 py-1.5 text-xs ring-1 ring-neutral-200 dark:ring-neutral-800"
          >
            View Store
          </Link>
          <Link
            href="/account"
            className="rounded-xl px-3 py-1.5 text-xs ring-1 ring-neutral-200 dark:ring-neutral-800"
          >
            Account
          </Link>
        </div>
      </div>
    </header>
  );
}
