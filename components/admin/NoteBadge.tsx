"use client";

import { useState } from "react";

export function NoteBadge({
  note,
  onEdit,
}: {
  note?: string | null;
  onEdit: () => void;
}) {
  const [show, setShow] = useState(false);
  const hasNote = !!(note && note.trim());

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => hasNote && setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <button
        type="button"
        onClick={onEdit}
        className={[
          "inline-flex h-7 w-7 items-center justify-center rounded-md border text-xs transition",
          hasNote
            ? "border-amber-300 bg-amber-100 text-amber-900 dark:border-amber-700/50 dark:bg-amber-900/30 dark:text-amber-200"
            : "border-neutral-200 text-neutral-500 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800/50",
        ].join(" ")}
        title={hasNote ? "View / edit note" : "Add note"}
      >
        {/* simple icon: notepad */}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 21H5a2 2 0 0 1-2-2V7h2v12h14V7h2v12a2 2 0 0 1-2 2ZM19 3h-3.5l-1-1h-5l-1 1H5v2h14V3ZM7 10h10v2H7v-2Zm0 4h10v2H7v-2Z" />
        </svg>
      </button>

      {/* hover preview tooltip (only when there is a note) */}
      {show && hasNote && (
        <div className="absolute left-1/2 z-20 mt-2 w-64 -translate-x-1/2 rounded-lg border border-neutral-200 bg-white p-2 text-xs shadow-lg ring-1 ring-black/5 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200">
          <div className="max-h-40 overflow-auto whitespace-pre-wrap">
            {note}
          </div>
          <div className="pointer-events-none absolute -top-2 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-l border-t border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900" />
        </div>
      )}
    </div>
  );
}
