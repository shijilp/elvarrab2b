import Link from "next/link";
import React from "react";

type ThemeMode = "dark" | "light";
type Palette = {
  bg: string;
  fg: string;
  subfg: string;
  card: string;
  border: string;
  button: string;
  ring: string;
};

function paletteForTheme(theme: ThemeMode): Palette {
  return theme === "dark"
    ? {
        bg: "bg-neutral-950",
        fg: "text-neutral-50",
        subfg: "text-neutral-300",
        card: "bg-neutral-900/70",
        border: "border-neutral-800",
        button:
          "bg-gradient-to-r from-yellow-500 to-amber-500 text-neutral-900 hover:brightness-110",
        ring: "ring-1 ring-neutral-800",
      }
    : {
        bg: "bg-neutral-50",
        fg: "text-neutral-900",
        subfg: "text-neutral-600",
        card: "bg-white/90",
        border: "border-neutral-200",
        button:
          "bg-gradient-to-r from-rose-400 to-pink-500 text-white hover:brightness-110",
        ring: "ring-1 ring-neutral-200",
      };
}

export default function PageShell({
  title,
  subtitle,
  children,
  theme = "dark",
  trail,
  ctaSlot,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  theme?: ThemeMode;
  trail: string;
  ctaSlot?: React.ReactNode;
}) {
  const palette = paletteForTheme(theme);

  return (
    <main className={`${palette.bg} ${palette.fg} min-h-screen antialiased`}>
      {/* Safe padding + max width for all screens */}

      <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* Breadcrumbs: wrap gracefully on narrow screens */}

        <section className="relative isolate">
          <div className="absolute inset-0 -z-10 opacity-40 blur-3xl  max-w-[100vw] overflow-hidden">
            <div className="pointer-events-none absolute -inset-20 rounded-[100px] gradient-accent" />
          </div>
          <nav
            aria-label="Breadcrumb"
            className={`text-xs ${palette.subfg} flex flex-wrap gap-x-1 gap-y-1`}
          >
            <Link
              href="/"
              className="underline underline-offset-2 hover:opacity-80"
            >
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <Link
              href="/blog"
              className="underline underline-offset-2 hover:opacity-80"
            >
              Blogs
            </Link>
            <span aria-hidden="true">/</span>
            <span className="truncate max-w-full">{trail}</span>
          </nav>

          {/* Header with optional CTA */}
          <header className="mt-3 mb-6 flex flex-col gap-3 sm:mt-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              {/* Responsive title sizes so it doesn’t overflow */}
              <h1 className="text-2xl font-semibold leading-tight sm:text-3xl">
                {title}
              </h1>
              <p className={`mt-1 text-sm ${palette.subfg}`}>{subtitle}</p>
            </div>

            {/* CTA: full-width button on mobile, shrink on desktop */}
            {ctaSlot && (
              <div className="flex w-full items-center sm:w-auto">
                <div className="w-full sm:w-auto">{ctaSlot}</div>
              </div>
            )}
          </header>
        </section>

        {/* Content grid:
            - single column on phones
            - 2 columns from large screens to avoid cramped md/tablets */}
        <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-2">
          {children}
        </div>
      </div>
    </main>
  );
}

export { paletteForTheme };
