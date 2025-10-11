"use client";
import Link from "next/link";
import PageShell, { paletteForTheme } from "@/components/PageShell";
import type { Metadata } from "next";

export default function CareGuidePage() {
  const theme = "dark" as const;
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

  const Badge = ({ children }: { children: React.ReactNode }) => (
    <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-2 py-0.5 text-[10px] font-medium text-yellow-300">
      {children}
    </span>
  );

  const Note = ({ children }: { children: React.ReactNode }) => (
    <div className="mt-3 rounded-lg border border-yellow-500/25 bg-yellow-500/5 p-3 text-xs text-yellow-200">
      {children}
    </div>
  );

  return (
    <PageShell
      theme={theme}
      trail="Care & Maintenance"
      title="Guide: Care & Maintenance"
      subtitle="Daily habits and simple routines that keep your shine."
      ctaSlot={
        <Link
          href="/collections/essentials"
          className="rounded-2xl bg-gradient-to-r from-yellow-500 to-amber-500 px-4 py-2 text-sm font-semibold text-neutral-900 hover:brightness-110"
        >
          Shop Care-Friendly Essentials
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
            A little care goes a long way. Follow these quick routines to
            minimize wear, keep plating intact, and make stainless and silver
            pieces look new for longer.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge>2-minute routine</Badge>
            <Badge>Metal-specific tips</Badge>
            <Badge>Travel safe</Badge>
          </div>
        </div>
      </div>

      {/* Everyday care + Do/Don’t */}
      <Section title="Everyday Care" eyebrow="Daily habits">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-neutral-800 p-4">
            <div className="text-sm font-semibold">Do</div>
            <ul className="mt-2 list-disc pl-5">
              <li>Wear jewelry after skincare, perfume, and hair products.</li>
              <li>Wipe with a soft microfiber after each wear.</li>
              <li>Store pieces separately in dry pouches/zip bags.</li>
            </ul>
          </div>
          <div className="rounded-xl border border-neutral-800 p-4">
            <div className="text-sm font-semibold">Don’t</div>
            <ul className="mt-2 list-disc pl-5">
              <li>Swim, shower, or work out in plated pieces.</li>
              <li>Leave chains in bathrooms or direct sun.</li>
              <li>Toss jewelry together—scratches happen fast.</li>
            </ul>
          </div>
        </div>
        <Note>
          Rule of thumb: <strong>Last on, first off.</strong> Jewelry goes on
          last when getting ready, and comes off first at night.
        </Note>
      </Section>

      {/* Metal-specific care */}
      <Section title="Metal-Specific Care" eyebrow="Know your base">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-neutral-800 p-4">
            <div className="text-sm font-semibold">316L Stainless / PVD</div>
            <p className="mt-1">
              Highly durable and moisture-tolerant. Rinse sweat/salt promptly
              and dry. PVD color holds well—still avoid abrasives.
            </p>
            <p className="mt-2 text-xs opacity-80">
              Weekly wipe; monthly soap rinse.
            </p>
          </div>
          <div className="rounded-xl border border-neutral-800 p-4">
            <div className="text-sm font-semibold">Plated Brass / Vermeil</div>
            <p className="mt-1">
              Keep <em>dry</em>. Limit friction (stack thoughtfully). Use only a
              dry cloth; avoid soaking. Expect re-plating with heavy use.
            </p>
            <p className="mt-2 text-xs opacity-80">
              Treat as “occasion wear” to extend life.
            </p>
          </div>
          <div className="rounded-xl border border-neutral-800 p-4">
            <div className="text-sm font-semibold">Sterling Silver (925)</div>
            <p className="mt-1">
              May oxidize—polish cloth restores shine. Store in anti-tarnish
              bags. Mild soap is OK; dry fully.
            </p>
            <p className="mt-2 text-xs opacity-80">
              Consider rhodium-plated silver for lower upkeep.
            </p>
          </div>
        </div>
      </Section>

      {/* Quick clean recipes */}
      <Section title="Quick Clean Recipes" eyebrow="2-minute fixes">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-neutral-800 p-4">
            <div className="text-sm font-semibold">Basic Refresh</div>
            <ol className="mt-2 list-decimal pl-5">
              <li>Mix a drop of mild soap with lukewarm water.</li>
              <li>Dip soft cloth (or soft brush for chains), wipe gently.</li>
              <li>Rinse briefly, pat dry, then air-dry fully.</li>
            </ol>
            <p className="mt-2 text-xs opacity-80">
              For plated pieces, skip soaking; use a damp cloth only.
            </p>
          </div>
          <div className="rounded-xl border border-neutral-800 p-4">
            <div className="text-sm font-semibold">
              Tarnish Touch-Up (Silver)
            </div>
            <ol className="mt-2 list-decimal pl-5">
              <li>Use a silver polishing cloth on dark areas.</li>
              <li>Rinse quickly if residue remains; dry completely.</li>
              <li>Store in anti-tarnish pouch with silica gel.</li>
            </ol>
            <p className="mt-2 text-xs opacity-80">
              Avoid baking soda/aluminum hacks on plated items.
            </p>
          </div>
        </div>
      </Section>

      {/* Storage */}
      <Section title="Smart Storage" eyebrow="Prevent dullness">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Anti-tarnish pouches", "Great for silver—add silica gel."],
            ["Separate compartments", "Stops tangling and micro-scratches."],
            ["Cool, dry place", "Avoid bathrooms and sunny windowsills."],
          ].map(([label, tip]) => (
            <div
              key={label}
              className="rounded-xl border border-neutral-800 p-4"
            >
              <div className="text-sm font-semibold">{label}</div>
              <p className="mt-1">{tip}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Care schedule */}
      <Section title="Care Schedule" eyebrow="Minimal effort">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-neutral-800 p-4">
            <div className="text-sm font-semibold">After Each Wear</div>
            <ul className="mt-2 list-disc pl-5">
              <li>Microfiber wipe; return to pouch.</li>
              <li>Check clasps and kinks in chains.</li>
            </ul>
          </div>
          <div className="rounded-xl border border-neutral-800 p-4">
            <div className="text-sm font-semibold">Weekly</div>
            <ul className="mt-2 list-disc pl-5">
              <li>Soap-and-water refresh (stainless/silver).</li>
              <li>Inspect plating; reduce friction points.</li>
            </ul>
          </div>
          <div className="rounded-xl border border-neutral-800 p-4">
            <div className="text-sm font-semibold">Seasonal</div>
            <ul className="mt-2 list-disc pl-5">
              <li>Professional re-plate for high-wear favorites.</li>
              <li>Replace worn earring backs and clasps.</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* Travel */}
      <Section title="Travel Tips" eyebrow="On the go">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-neutral-800 p-4">
            <div className="text-sm font-semibold">Pack Smart</div>
            <ul className="mt-2 list-disc pl-5">
              <li>Use a flat travel case with separators.</li>
              <li>Thread chains through straws or cards to prevent tangles.</li>
              <li>Carry-on only; avoid checked-bag pressure.</li>
            </ul>
          </div>
          <div className="rounded-xl border border-neutral-800 p-4">
            <div className="text-sm font-semibold">Beach & Pool</div>
            <ul className="mt-2 list-disc pl-5">
              <li>Remove plated pieces before water activities.</li>
              <li>Rinse stainless after salt/chlorine; dry fully.</li>
              <li>Reapply SPF before jewelry goes back on.</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* When to re-plate */}
      <Section title="When to Re-plate" eyebrow="Refresh the finish">
        <p>
          If you notice a brassy undertone, matte patches, or color fade on
          high-touch areas (ring undersides, chain clasp), it’s time to
          re-plate. Heavy daily wear can require service every 6–12 months;
          occasional wear lasts longer.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <Link
            href="/support/replate"
            className="rounded-full border border-yellow-500/40 bg-yellow-500/10 px-3 py-1 text-yellow-300"
          >
            Elvarra Re-plating Help
          </Link>
          <Link
            href="/guides/materials-guide"
            className="rounded-full border border-neutral-700 px-3 py-1 hover:bg-white/5"
          >
            Learn About Plating
          </Link>
        </div>
      </Section>

      {/* FAQs */}
      <Section title="FAQs" eyebrow="Quick answers">
        <details className="group rounded-xl border border-neutral-800 p-4 open:bg-transparent">
          <summary className="cursor-pointer list-none font-medium">
            Can I work out in my jewelry?
          </summary>
          <p className="mt-2">
            Avoid for plated pieces—sweat + friction = faster wear. Stainless
            can handle more, but rinse and dry promptly.
          </p>
        </details>
        <details className="group mt-3 rounded-xl border border-neutral-800 p-4">
          <summary className="cursor-pointer list-none font-medium">
            How do I fix a tangled chain?
          </summary>
          <p className="mt-2">
            Lay on a flat surface, add a drop of baby oil, and tease apart with
            two pins. Clean and dry after.
          </p>
        </details>
        <details className="group mt-3 rounded-xl border border-neutral-800 p-4">
          <summary className="cursor-pointer list-none font-medium">
            What if my skin is sensitive?
          </summary>
          <p className="mt-2">
            Choose 316L stainless, titanium posts, or rhodium-plated silver.
            Look for “nickel-free” labels.
          </p>
        </details>
      </Section>

      {/* Closing CTA */}
      <div
        className={`${palette.card} ${palette.ring} rounded-2xl p-6 text-sm flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between`}
      >
        <div>
          <div className="text-base font-semibold">Ready for a refresh?</div>
          <p className={`${palette.subfg}`}>
            Explore low-maintenance chains, hoops, and stacks curated by
            Elvarra.
          </p>
        </div>
        <Link
          href="/products"
          className="rounded-2xl bg-gradient-to-r from-yellow-500 to-amber-500 px-4 py-2 text-sm font-semibold text-neutral-900 hover:brightness-110"
        >
          Shop jewelry
        </Link>
      </div>
    </PageShell>
  );
}
