import React, { useEffect, useMemo, useState } from "react";
// --------------------------------------------------------------
// PromoBanner (dismissible, persists via localStorage)
// --------------------------------------------------------------
type ThemeMode = "dark" | "light";

export type PromoBannerProps = {
  id: string; // stable id to persist dismissal (e.g., "fall-25")
  message: string; // banner text
  ctaText?: string; // default "Shop deals"
  href?: string; // default "/deals"
  accent?: "yellow" | "pink" | "emerald" | "blue"; // visual accent
  theme?: ThemeMode; // default "dark"
  sticky?: boolean; // if true, sticks to top
};

export function PromoBanner({
  id,
  message,
  ctaText = "Shop deals",
  href = "/deals",
  accent = "yellow",
  theme = "dark",
  sticky = false,
}: PromoBannerProps) {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    try {
      const k = `elvara:banners:${id}:dismissed`;
      const dismissed = localStorage.getItem(k) === "1";
      setHidden(dismissed);
    } catch {
      setHidden(false);
    }
  }, [id]);

  function dismiss() {
    try {
      localStorage.setItem(`elvara:banners:${id}:dismissed`, "1");
    } catch {}
    setHidden(true);
  }

  const accentBg = {
    yellow: "from-amber-400 to-yellow-500",
    pink: "from-rose-400 to-pink-500",
    emerald: "from-emerald-400 to-green-500",
    blue: "from-sky-400 to-blue-500",
  }[accent];

  if (hidden) return null;

  return (
    <div className={`${sticky ? "sticky top-0 z-40" : ""} w-full`}>
      <div
        className={`relative isolate overflow-hidden bg-gradient-to-r ${accentBg} text-neutral-900`}
      >
        <div className="container">
          <div className="flex flex-wrap items-center justify-between gap-3 py-2 text-sm">
            <p className="font-medium">{message}</p>
            <div className="flex items-center gap-2">
              <a
                href={href}
                className={`rounded-xl bg-black/10 px-3 py-1.5 text-sm font-semibold hover:bg-black/20`}
              >
                {ctaText}
              </a>
              <button
                onClick={dismiss}
                aria-label="Dismiss"
                className={`rounded-full bg-black/10 p-1 hover:bg-black/20`}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 6l12 12M6 18L18 6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
