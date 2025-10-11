"use client";
import Link from "next/link";
import PageShell, { paletteForTheme } from "@/components/PageShell";
import type { Metadata } from "next";

const metadata: Metadata = {
  title: "Guide: Materials & Plating | Elvarra",
  description:
    "Understand stainless steel, sterling silver, brass, vermeil, rhodium, and PVD—plus plating thickness, sensitivity tips, and care routines.",
};

export default function MaterialsGuidePage() {
  const theme = "dark" as const; // switch to "light" for Chic Light
  const palette = paletteForTheme(theme);

  const Section = ({
    title,
    eyebrow,
    children,
  }: {
    title: string;
    eyebrow?: string;
    children: React.ReactNode;
  }) => (
    <section className={`${palette.card} ${palette.ring} rounded-2xl p-6`}>
      {eyebrow && (
        <div className="text-[10px] uppercase tracking-wider opacity-70">
          {eyebrow}
        </div>
      )}
      <h2 className="mt-1 text-lg font-semibold">{title}</h2>
      <div className={`mt-3 text-sm leading-6 ${palette.subfg}`}>
        {children}
      </div>
    </section>
  );

  const Chip = ({ children }: { children: React.ReactNode }) => (
    <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-2 py-0.5 text-[10px] font-medium text-yellow-300">
      {children}
    </span>
  );

  type Row = {
    material: string;
    durability: string;
    color: string;
    hypo: string;
    care: string;
    notes: string;
  };

  const rows: Row[] = [
    {
      material: "Stainless Steel (316L)",
      durability: "High",
      color: "Silver base; PVD gold/black options",
      hypo: "Great (nickel-safe grades)",
      care: "Low",
      notes: "Sweat/water tolerant—ideal for daily wear",
    },
    {
      material: "Brass",
      durability: "Medium",
      color: "Warm yellow base",
      hypo: "Varies",
      care: "Medium",
      notes: "Affordable; can tarnish—keep dry, store airtight",
    },
    {
      material: "Sterling Silver (925)",
      durability: "Medium",
      color: "Bright silver",
      hypo: "Good",
      care: "Medium",
      notes: "Oxidizes over time; polishes back to shine",
    },
    {
      material: "Gold Plated (electroplated)",
      durability: "Medium",
      color: "Varies by karat tone",
      hypo: "Depends on base",
      care: "Medium",
      notes: "Remove for shower/swim; minimize friction",
    },
    {
      material: "Gold Vermeil (over 925)",
      durability: "Medium‑High",
      color: "Gold over sterling silver",
      hypo: "Good",
      care: "Medium",
      notes: ">=2.5µm recommended for longevity",
    },
    {
      material: "Rhodium Plated",
      durability: "High",
      color: "Cool, bright, anti‑tarnish",
      hypo: "Good",
      care: "Low",
      notes: "Applied over silver/white gold for protection",
    },
  ];

  return (
    <PageShell
      theme={theme}
      trail="Materials & Plating"
      title="Guide: Materials & Plating"
      subtitle="Know your metals, finishes, and what lasts—so you can buy smart and care with confidence."
      ctaSlot={
        <Link
          href="/collections/materials"
          className="rounded-2xl bg-gradient-to-r from-yellow-500 to-amber-500 px-4 py-2 text-sm font-semibold text-neutral-900 hover:brightness-110"
        >
          Shop by Material
        </Link>
      }
    >
      {/* Intro band */}
      <div
        className={`${palette.card} ${palette.ring} relative overflow-hidden rounded-2xl p-6 sm:p-7`}
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-amber-500/0" />
        <div className="relative">
          <p className={`text-sm ${palette.subfg} max-w-3xl`}>
            Material choice affects color, weight, skin comfort, and longevity.
            This guide breaks down the most common fashion‑jewelry cores and
            finishes—plus how to keep each looking its best.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Chip>Daily‑wear tips</Chip>
            <Chip>Allergy notes</Chip>
            <Chip>Plating thickness</Chip>
          </div>
        </div>
      </div>

      {/* Base metals */}
      <Section title="Base Metals" eyebrow="The foundation">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-neutral-800 p-4">
            <div className="text-sm font-semibold">Stainless Steel (316L)</div>
            <p className="mt-1">
              Corrosion‑resistant and sturdy. Often PVD‑colored (gold/black).
              Great for sensitive skin.
            </p>
            <p className="mt-2 text-xs opacity-80">
              Look for 316L/304 grades; avoid harsh abrasives.
            </p>
          </div>
          <div className="rounded-xl border border-neutral-800 p-4">
            <div className="text-sm font-semibold">Sterling Silver (925)</div>
            <p className="mt-1">
              Precious metal with bright luster. Can oxidize; quick polish
              restores shine.
            </p>
            <p className="mt-2 text-xs opacity-80">
              Rhodium‑plated silver = easier upkeep.
            </p>
          </div>
          <div className="rounded-xl border border-neutral-800 p-4">
            <div className="text-sm font-semibold">Brass</div>
            <p className="mt-1">
              Warm tone, highly formable (great shapes). Needs dry storage to
              minimize tarnish.
            </p>
            <p className="mt-2 text-xs opacity-80">
              Choose thicker plating over brass for longevity.
            </p>
          </div>
          <div className="rounded-xl border border-neutral-800 p-4">
            <div className="text-sm font-semibold">Titanium (posts)</div>
            <p className="mt-1">
              Light, strong, and nickel‑free—popular for sensitive ear posts.
            </p>
            <p className="mt-2 text-xs opacity-80">
              Pairs well with stainless or silver stacks.
            </p>
          </div>
        </div>
      </Section>

      {/* Plating & coatings */}
      <Section title="Plating & Color Finishes" eyebrow="How color is applied">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-neutral-800 p-4">
            <div className="text-sm font-semibold">
              Electroplating (Gold‑plated)
            </div>
            <ul className="mt-2 list-disc pl-5">
              <li>Thin gold layer over base metal (brass/steel/silver).</li>
              <li>Economical; avoid constant friction and moisture.</li>
              <li>Thickness varies widely—see table below.</li>
            </ul>
          </div>
          <div className="rounded-xl border border-neutral-800 p-4">
            <div className="text-sm font-semibold">
              PVD (Physical Vapor Deposition)
            </div>
            <ul className="mt-2 list-disc pl-5">
              <li>Vapor‑bonded color film (common on 316L steel).</li>
              <li>Highly wear‑resistant; better sweat/water tolerance.</li>
              <li>Great for black/gold colorways that last.</li>
            </ul>
          </div>
          <div className="rounded-xl border border-neutral-800 p-4">
            <div className="text-sm font-semibold">Vermeil</div>
            <p className="mt-1">
              Gold plated over sterling silver with a thicker layer (often
              ≥2.5µm) for improved durability.
            </p>
            <p className="mt-2 text-xs opacity-80">
              Feels premium; treat gently to protect the layer.
            </p>
          </div>
          <div className="rounded-xl border border-neutral-800 p-4">
            <div className="text-sm font-semibold">Rhodium (on silver)</div>
            <p className="mt-1">
              Bright, cool finish that resists tarnish and scratching.
            </p>
            <p className="mt-2 text-xs opacity-80">
              Excellent for low‑maintenance silver looks.
            </p>
          </div>
        </div>
      </Section>

      {/* Thickness table */}
      <Section
        title="Plating Thickness at a Glance"
        eyebrow="What lasts longer"
      >
        <table className="w-full text-left text-xs">
          <thead className="text-white/80">
            <tr>
              <th className="py-1 pr-3">Term</th>
              <th className="py-1 pr-3">Approx. Thickness</th>
              <th className="py-1 pr-3">Typical Base</th>
              <th className="py-1 pr-3">Notes</th>
            </tr>
          </thead>
          <tbody className="opacity-90">
            {[
              [
                "Flash/Light plate",
                "< 0.5µm",
                "Brass/Steel",
                "Color only—treat as occasional wear",
              ],
              [
                "Standard plate",
                "≈ 0.5–1.0µm",
                "Brass/Steel/Silver",
                "Everyday with careful use",
              ],
              [
                "Heavy plate",
                "≈ 1.0–2.5µm",
                "Brass/Silver",
                "Better friction resistance",
              ],
              [
                "Vermeil",
                ">= 2.5µm",
                "Sterling Silver",
                "Premium; gentler care extends life",
              ],
            ].map(([t, th, b, n]) => (
              <tr key={t as string} className="border-t border-neutral-800">
                <td className="py-1 pr-3">{t as string}</td>
                <td className="py-1 pr-3">{th as string}</td>
                <td className="py-1 pr-3">{b as string}</td>
                <td className="py-1 pr-3">{n as string}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* Sensitivity & care */}
      <Section
        title="Sensitivity & Skin Comfort"
        eyebrow="Hypoallergenic picks"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-neutral-800 p-4">
            <div className="text-sm font-semibold">Best bets</div>
            <ul className="mt-2 list-disc pl-5">
              <li>316L stainless or titanium posts</li>
              <li>Sterling silver, rhodium‑plated silver</li>
              <li>Rinse sweat; keep skin and jewelry dry</li>
            </ul>
          </div>
          <div className="rounded-xl border border-neutral-800 p-4">
            <div className="text-sm font-semibold">If irritation occurs</div>
            <ul className="mt-2 list-disc pl-5">
              <li>Pause wear; clean piece and skin</li>
              <li>Switch to verified nickel‑free posts</li>
              <li>Try clear barrier on contact points (short term)</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* Water, sweat, tarnish */}
      <Section title="Water, Sweat & Tarnish" eyebrow="What to expect">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-neutral-800 p-4">
            <div className="text-sm font-semibold">Real‑world tolerance</div>
            <p className="mt-1">
              Stainless/PVD handles moisture best. Electroplated gold over
              brass/silver lasts longer if kept dry.
            </p>
            <p className="mt-2 text-xs opacity-80">
              Always dry fully after exposure; avoid chlorine/salt.
            </p>
          </div>
          <div className="rounded-xl border border-neutral-800 p-4">
            <div className="text-sm font-semibold">Oxidation</div>
            <p className="mt-1">
              Silver naturally darkens; a polishing cloth restores brightness.
              Brass darkens faster—store airtight.
            </p>
          </div>
        </div>
      </Section>

      {/* Care checklist */}
      <Section title="Care Checklist" eyebrow="Minimal routine, big results">
        <div className="grid gap-4 md:grid-cols-2">
          <ul className="list-disc pl-5">
            <li>Last on, first off (after skincare; before sleep).</li>
            <li>Keep dry; wipe with microfiber after wear.</li>
            <li>Store in separate pouches; avoid bathroom humidity.</li>
            <li>Skip abrasive cleaners on plated/PVD pieces.</li>
          </ul>
          <ul className="list-disc pl-5">
            <li>Monthly: mild soap + lukewarm rinse (stainless/silver).</li>
            <li>Seasonal: check clasps, replace worn backs.</li>
            <li>Consider re‑plating high‑wear favorites every 6–12 months.</li>
          </ul>
        </div>
      </Section>

      {/* Comparison table */}
      <Section title="Comparison Table" eyebrow="Side‑by‑side">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-black/20">
              <tr>
                <th className="p-3">Material</th>
                <th className="p-3">Durability</th>
                <th className="p-3">Color/Finish</th>
                <th className="p-3">Hypoallergenic</th>
                <th className="p-3">Care</th>
                <th className="p-3">Notes</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.material} className="odd:bg-white/5 even:bg-white/0">
                  <td className="p-3 font-medium">{r.material}</td>
                  <td className="p-3">{r.durability}</td>
                  <td className="p-3">{r.color}</td>
                  <td className="p-3">{r.hypo}</td>
                  <td className="p-3">{r.care}</td>
                  <td className="p-3">{r.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* FAQ + Next steps */}
      <div className="grid gap-6 md:grid-cols-2">
        <Section title="FAQs" eyebrow="Quick answers">
          <details className="group rounded-xl border border-neutral-800 p-4 open:bg-transparent">
            <summary className="cursor-pointer list-none font-medium">
              Will my jewelry tarnish?
            </summary>
            <p className="mt-2">
              Silver oxidizes and brass darkens. Plating helps, but habits
              matter most—keep pieces dry and wipe after wear.
            </p>
          </details>
          <details className="group mt-3 rounded-xl border border-neutral-800 p-4">
            <summary className="cursor-pointer list-none font-medium">
              Can I shower with fashion jewelry?
            </summary>
            <p className="mt-2">
              Stainless/PVD tolerates moisture; plated brass/vermeil lasts
              longer if you remove before shower/swim.
            </p>
          </details>
          <details className="group mt-3 rounded-xl border border-neutral-800 p-4">
            <summary className="cursor-pointer list-none font-medium">
              What if I have sensitive skin?
            </summary>
            <p className="mt-2">
              Start with 316L stainless, titanium posts, or rhodium‑plated
              silver. Test new styles briefly first.
            </p>
          </details>
        </Section>

        <Section title="Next Steps" eyebrow="Shop by material">
          <p>
            Ready to pick? Explore premium and everyday pieces organized by
            material.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <Link
              href="/collections/premium"
              className="rounded-full border border-yellow-500/40 bg-yellow-500/10 px-3 py-1 text-yellow-300"
            >
              Premium Collection
            </Link>
            <Link
              href="/products?material=stainless"
              className="rounded-full border border-neutral-700 px-3 py-1 hover:bg-white/5"
            >
              Stainless Steel
            </Link>
            <Link
              href="/products?material=vermeil"
              className="rounded-full border border-neutral-700 px-3 py-1 hover:bg-white/5"
            >
              Gold Vermeil
            </Link>
            <Link
              href="/products?material=silver"
              className="rounded-full border border-neutral-700 px-3 py-1 hover:bg-white/5"
            >
              Sterling Silver
            </Link>
          </div>
        </Section>
      </div>

      {/* Closing CTA */}
      <div
        className={`${palette.card} ${palette.ring} rounded-2xl p-6 text-sm flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between`}
      >
        <div>
          <div className="text-base font-semibold">
            Want low‑maintenance shine?
          </div>
          <p className={`${palette.subfg}`}>
            Discover stainless/PVD sets and rhodium‑finished silver designed for
            everyday wear.
          </p>
        </div>
        <Link
          href="/collections/materials"
          className="rounded-2xl bg-gradient-to-r from-yellow-500 to-amber-500 px-4 py-2 text-sm font-semibold text-neutral-900 hover:brightness-110"
        >
          Shop by Material
        </Link>
      </div>
    </PageShell>
  );
}
