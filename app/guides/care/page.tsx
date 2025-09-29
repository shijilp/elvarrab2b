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

const page = () => {
  const theme: ThemeMode = "dark";

  return (
    <PageShell
      theme={theme}
      trail="Care & Maintenance"
      title="Guide: Care & Maintenance"
      subtitle="Keep your jewelry looking great with a few simple habits."
    >
      <div className={` el-card el-ring ring-1  rounded-2xl p-6`}>
        <h2 className="text-lg font-semibold">Everyday Care</h2>
        <ul className={`mt-2 list-disc pl-5 text-sm el-subfg`}>
          <li>Last on, first off (avoid lotions/perfume contact).</li>
          <li>Wipe with a soft cloth after wear.</li>
          <li>Store in a dry pouch; keep air exposure minimal.</li>
        </ul>
      </div>
      <div className={`el-card el-ring ring-1  rounded-2xl p-6`}>
        <h2 className="text-lg font-semibold">Water & Sweat</h2>
        <p className={`mt-2 text-sm el-subfg`}>
          Stainless/PVD tolerates moisture better; plated brass/vermeil lasts
          longer when kept dry.
        </p>
      </div>
      <div className={`el-card el-ring ring-1  rounded-2xl p-6`}>
        <h2 className="text-lg font-semibold">Deep Clean</h2>
        <p className={`mt-2 text-sm el-subfg`}>
          Use mild soap, lukewarm water, and a soft brush. Dry completely before
          storing.
        </p>
      </div>
      <div className={`el-card el-ring ring-1  rounded-2xl p-6`}>
        <h2 className="text-lg font-semibold">When to Re-plate</h2>
        <p className={`mt-2 text-sm el-subfg`}>
          Frequent-wear plated pieces may need periodic re-plating for a fresh
          finish.
        </p>
      </div>
    </PageShell>
  );
};

export default page;
