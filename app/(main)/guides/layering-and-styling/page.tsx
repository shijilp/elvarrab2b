"use client";
import Link from "next/link";
import React, { useMemo } from "react";
import { ca } from "zod/locales";

// ==================================================================
// Elvarra / Elvara — Guides (4 pages in one file for preview)
// Create these files in your app (copy the matching component):
//   1) app/guides/fashion-jewelry/page.tsx        → export default FashionJewelryGuidePage
//   2) app/guides/care/page.tsx                    → export default CareGuidePage
//   3) app/guides/layering-and-styling/page.tsx   → export default LayeringAndStylingGuidePage
//   4) app/guides/gifting-guide/page.tsx          → export default GiftingGuidePage
// Keep only a single default export per file in your app.
// ==================================================================

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

function PageShell({
  title,
  subtitle,
  children,
  theme = "dark" as ThemeMode,
  trail,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  theme?: ThemeMode;
  trail: string;
}) {
  const palette = useMemo(() => paletteForTheme(theme), [theme]);
  return (
    <main className={`${palette.bg} ${palette.fg} min-h-screen antialiased`}>
      <div className="container py-10">
        <nav className={`text-xs ${palette.subfg}`}>
          <Link href="/" className="underline">
            Home
          </Link>{" "}
          /{" "}
          <Link href="/guides" className="underline">
            Guides
          </Link>{" "}
          / <span>{trail}</span>
        </nav>
        <header className="mt-2 mb-8">
          <h1 className="text-3xl font-semibold">{title}</h1>
          <p className={`mt-1 text-sm ${palette.subfg}`}>{subtitle}</p>
        </header>
        <div className="grid gap-6 md:grid-cols-2">{children}</div>
        <div className="mt-10 flex justify-center">
          <Link
            href="/products"
            className={`rounded-xl px-6 py-2 font-medium ${palette.button}`}
          >
            Shop Jewelry
          </Link>
        </div>
      </div>
    </main>
  );
}

const Page = () => {
  const theme: ThemeMode = "dark";
  const palette = useMemo(() => paletteForTheme(theme), [theme]);

  return (
    <PageShell
      theme={theme}
      trail="Layering & Styling"
      title="Guide: Layering & Styling"
      subtitle="Build balanced stacks for everyday to occasion looks."
    >
      <div className={`${palette.card} ${palette.ring} rounded-2xl p-6`}>
        <h2 className="text-lg font-semibold">Necklace Layering</h2>
        <ul className={`mt-2 list-disc pl-5 text-sm ${palette.subfg}`}>
          <li>
            3-tier rule: 35–40cm (choker) + 45–50cm (mid) + 55–60cm (pendant).
          </li>
          <li>Mix textures (herringbone + cable + pendant) for depth.</li>
        </ul>
      </div>
      <div className={`${palette.card} ${palette.ring} rounded-2xl p-6`}>
        <h2 className="text-lg font-semibold">Bracelets & Rings</h2>
        <ul className={`mt-2 list-disc pl-5 text-sm ${palette.subfg}`}>
          <li>Balance chunky cuffs with delicate chains.</li>
          <li>Use one statement ring per hand, stack the rest slim.</li>
        </ul>
      </div>
      <div className={`${palette.card} ${palette.ring} rounded-2xl p-6`}>
        <h2 className="text-lg font-semibold">Color & Metal Mix</h2>
        <p className={`mt-2 text-sm ${palette.subfg}`}>
          Warm wardrobes love 18K/rose tones; cooler palettes pop with
          rhodium/silver. Mix metals intentionally (e.g., 70/30 split).
        </p>
      </div>
      <div className={`${palette.card} ${palette.ring} rounded-2xl p-6`}>
        <h2 className="text-lg font-semibold">Occasion Playbook</h2>
        <p className={`mt-2 text-sm ${palette.subfg}`}>
          Office: minimal stacks. Party: bold pendants & hoops. Weddings:
          pearls, pavé, and subtle sparkle.
        </p>
      </div>
    </PageShell>
  );
};

export default Page;
