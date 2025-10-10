"use client";
import React, { useId } from "react";

// ------------------------------------------------------------
// Elvarra Spinner (accessible, theme‑aware, and flexible)
// FIX: Removed missing "./utils" import and inlined a tiny `cn` helper.
// ------------------------------------------------------------

// Minimal classnames combiner (no deps)
function cn(...args: Array<string | false | null | undefined>) {
  return args.filter(Boolean).join(" ");
}

export type SpinnerProps = {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "gold" | "neutral" | "white";
  label?: string;
  showLabel?: boolean; // show text next to spinner
  className?: string;
  thickness?: number; // SVG stroke width
};

const sizeMap: Record<NonNullable<SpinnerProps["size"]>, string> = {
  xs: "h-4 w-4",
  sm: "h-5 w-5",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
};

const defaultStrokeBySize: Record<NonNullable<SpinnerProps["size"]>, number> = {
  xs: 3,
  sm: 3.5,
  md: 4,
  lg: 5,
  xl: 6,
};

export function Spinner({
  size = "md",
  variant = "gold",
  label = "Loading",
  showLabel = false,
  className,
  thickness,
}: SpinnerProps) {
  const id = useId();
  const stroke = thickness ?? defaultStrokeBySize[size];
  const gradId = `elv-${id}-grad`;

  const gradient = (() => {
    switch (variant) {
      case "neutral":
        return (
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#9ca3af" />
            <stop offset="100%" stopColor="#6b7280" />
          </linearGradient>
        );
      case "white":
        return (
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e5e7eb" />
          </linearGradient>
        );
      case "gold":
      default:
        return (
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="50%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#eab308" />
          </linearGradient>
        );
    }
  })();

  return (
    <span
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cn("inline-flex items-center gap-2", className)}
    >
      <svg
        viewBox="0 0 50 50"
        className={cn("animate-spin", sizeMap[size])}
        aria-hidden="true"
      >
        <defs>{gradient}</defs>
        {/* Track (faint ring) for contrast on light backgrounds */}
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="currentColor"
          opacity="0.12"
          strokeWidth={stroke}
          className="text-neutral-400 dark:text-neutral-700"
        />
        {/* Active arc */}
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke={`url(#${gradId})`}
          strokeLinecap="round"
          strokeWidth={stroke}
          strokeDasharray="80 200"
          strokeDashoffset="0"
        />
      </svg>
      {showLabel ? (
        <span className="text-sm text-neutral-600 dark:text-neutral-300">
          {label}
        </span>
      ) : (
        // Screen‑reader only label
        <span className="sr-only">{label}</span>
      )}
    </span>
  );
}

Spinner.Fullscreen = function Fullscreen({
  label = "Loading",
  variant = "gold",
}: Pick<SpinnerProps, "label" | "variant">) {
  return (
    <div className="fixed inset-0 z-[9999] grid place-items-center bg-white/80 dark:bg-black/70 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="xl" variant={variant} label={label} />
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          {label}
        </p>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------
// Demo + lightweight self‑tests (run only in dev). Safe to delete.
// ------------------------------------------------------------------
export default function SpinnerDemo() {
  return (
    <div className="min-h-[60vh] bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50 p-8 grid gap-10">
      <h1 className="text-2xl font-semibold">Elvarra Spinner</h1>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        <div className="flex items-center gap-3">
          <Spinner size="xs" variant="gold" label="Loading" />
          <span className="text-sm opacity-80">xs</span>
        </div>
        <div className="flex items-center gap-3">
          <Spinner size="sm" variant="gold" label="Loading" />
          <span className="text-sm opacity-80">sm</span>
        </div>
        <div className="flex items-center gap-3">
          <Spinner size="md" variant="gold" label="Loading" />
          <span className="text-sm opacity-80">md</span>
        </div>
        <div className="flex items-center gap-3">
          <Spinner size="lg" variant="gold" label="Loading" />
          <span className="text-sm opacity-80">lg</span>
        </div>
        <div className="flex items-center gap-3">
          <Spinner size="xl" variant="gold" label="Loading" />
          <span className="text-sm opacity-80">xl</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl p-6 ring-1 ring-neutral-200 dark:ring-neutral-800 bg-white dark:bg-neutral-900/70 flex items-center gap-4">
          <Spinner variant="gold" label="Loading products" />
          <span className="text-sm">Gold (Elvarra)</span>
        </div>
        <div className="rounded-2xl p-6 ring-1 ring-neutral-200 dark:ring-neutral-800 bg-white dark:bg-neutral-900/70 flex items-center gap-4">
          <Spinner variant="neutral" label="Syncing" />
          <span className="text-sm">Neutral</span>
        </div>
        <div className="rounded-2xl p-6 ring-1 ring-neutral-200 dark:ring-neutral-800 bg-neutral-900/70 text-white flex items-center gap-4">
          <Spinner variant="white" label="Fetching" />
          <span className="text-sm">White (dark surfaces)</span>
        </div>
      </div>

      <div className="rounded-2xl p-6 ring-1 ring-neutral-200 dark:ring-neutral-800 bg-white dark:bg-neutral-900/70 space-y-4">
        <h2 className="font-medium">With label</h2>
        <Spinner variant="gold" showLabel label="Loading Elvarra picks…" />
      </div>

      <div className="rounded-2xl p-6 ring-1 ring-neutral-200 dark:ring-neutral-800 bg-white dark:bg-neutral-900/70 space-y-4">
        <h2 className="font-medium">Fullscreen overlay</h2>
        <div className="relative h-40 grid place-items-center rounded-xl bg-neutral-100 dark:bg-black/40">
          {/* Example trigger visually */}
          <Spinner.Fullscreen label="Building your look…" />
        </div>
      </div>
    </div>
  );
}

// Lightweight test cases to validate config (dev only)
export function __runSpinnerSelfTests() {
  const issues: string[] = [];
  const sizes = ["xs", "sm", "md", "lg", "xl"] as const;
  sizes.forEach((s) => {
    if (!sizeMap[s]) issues.push(`sizeMap missing: ${s}`);
    if (typeof defaultStrokeBySize[s] !== "number")
      issues.push(`stroke missing: ${s}`);
  });
  if (issues.length === 0) {
    return { ok: true, message: "Spinner config tests passed" };
  }
  return { ok: false, message: issues.join(", ") };
}

if (process.env.NODE_ENV !== "production") {
  // Auto-run once in the browser to surface dev mistakes
  // (safe no-op on server / prod)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (typeof window !== "undefined" && !window.__ELVARRA_SPINNER_TESTS_RAN__) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.__ELVARRA_SPINNER_TESTS_RAN__ = true;
    try {
      const res = __runSpinnerSelfTests();
      if (!res.ok) console.warn("[Elvarra Spinner]", res.message);
    } catch (e) {
      console.warn("[Elvarra Spinner] tests failed to run", e);
    }
  }
}
