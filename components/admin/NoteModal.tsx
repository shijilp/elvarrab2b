"use client";

import { useEffect, useRef, useState } from "react";

export function NoteModal({
  open,
  initialNote,
  onClose,
  onSave,
  saving,
}: {
  open: boolean;
  initialNote?: string | null;
  onClose: () => void;
  onSave: (val: string) => void;
  saving?: boolean;
}) {
  const [val, setVal] = useState(initialNote || "");
  const ref = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (open) {
      setVal(initialNote || "");
      // focus when open
      setTimeout(() => ref.current?.focus(), 50);
    }
  }, [open, initialNote]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-50 w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-4 shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Order Note</h3>
          <button
            className="rounded-md px-2 py-1 text-xs text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <textarea
          ref={ref}
          rows={8}
          className="w-full resize-y rounded-lg border border-neutral-200 bg-white p-2 text-sm outline-none focus:ring-2 focus:ring-amber-500 dark:border-neutral-800 dark:bg-neutral-950"
          placeholder="Type a note for this order…"
          value={val}
          onChange={(e) => setVal(e.target.value)}
        />

        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs opacity-70">
            {val.trim().length}/1000 chars
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-lg px-3 py-1.5 text-xs ring-1 ring-neutral-300 hover:bg-neutral-50 dark:ring-neutral-700 dark:hover:bg-neutral-800"
              disabled={!!saving}
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(val)}
              className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs text-white hover:brightness-110 disabled:opacity-50"
              disabled={!!saving}
            >
              {saving ? "Saving…" : "Save Note"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
