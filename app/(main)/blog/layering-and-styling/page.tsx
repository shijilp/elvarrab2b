"use client";
import Link from "next/link";
import PageShell, { paletteForTheme } from "@/components/PageShell";
import type { Metadata } from "next";
import { useTheme } from "@/context/ThemeContext";

const metadata: Metadata = {
  title: "Blog: Layering & Styling | Elvarra",
  description:
    "Build balanced necklace, ring, bracelet, and ear stacks with luxe-dark styling: lengths matrix, neckline pairings, visual weight, color/metal mix, and occasion formulas.",
};

export default function LayeringAndStylingGuidePage() {
  const { theme } = useTheme();
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
        <div className="text-[10px] uppercase tracking-wider dark:opacity-70 dark:text-neutral-500 ">
          {eyebrow}
        </div>
      )}
      <h2 className="mt-1 text-lg font-semibold ">{title}</h2>
      <div className={`mt-3 text-sm leading-6 ${palette.subfg}`}>
        {children}
      </div>
    </section>
  );

  const Chip = ({ children }: { children: React.ReactNode }) => (
    <span className="rounded-full border border-rose-200 bg-rose-50   dark:border-yellow-500/30 dark:bg-yellow-500/10 px-2 py-0.5 text-[10px] font-medium text-rose-700 dark:text-yellow-300">
      {children}
    </span>
  );

  return (
    <PageShell
      theme={theme}
      trail="Layering & Styling"
      title="Guide: Layering & Styling"
      subtitle="Build balanced stacks from everyday minimal to event-ready statements."
      ctaSlot={
        <Link
          href="/collections/stacking"
          className={`rounded-2xl px-4 py-2 text-sm font-semibold text-neutral-900 hover:brightness-110 ${palette.button}`}
        >
          Shop Stacking Essentials
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
            Layering is about <em>proportion</em>, <em>texture</em>, and{" "}
            <em>rhythm</em>. Use these quick formulas to stack necklaces, rings,
            bracelets, and earrings—without overwhelming your look.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Chip>3‑tier necklace rule</Chip>
            <Chip>Visual weight balance</Chip>
            <Chip>Neckline pairings</Chip>
          </div>
        </div>
      </div>

      {/* Necklace Layering */}
      <Section title="Necklace Layering" eyebrow="3‑tier rule">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-neutral-800 p-4">
            <div className="text-sm font-semibold">Lengths Matrix</div>
            <table className="mt-2 w-full text-left text-xs">
              <thead className="text-white/80">
                <tr>
                  <th className="py-1">Tier</th>
                  <th className="py-1">Length</th>
                  <th className="py-1">Tip</th>
                </tr>
              </thead>
              <tbody className="opacity-90">
                {[
                  [
                    "Choker",
                    '35–40cm (14–16")',
                    "Flat herringbone or slim snake",
                  ],
                  ["Middle", '45–50cm (18–20")', "Cable/rope; add tiny charm"],
                  ["Pendant", '55–60cm (22–24")', "Drop or locket as focal"],
                ].map(([tier, len, tip]) => (
                  <tr key={tier} className="border-t border-neutral-800">
                    <td className="py-1">{tier}</td>
                    <td className="py-1">{len}</td>
                    <td className="py-1">{tip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="rounded-xl border border-neutral-800 p-4">
            <div className="text-sm font-semibold">Texture & Spacing</div>
            <ul className="mt-2 list-disc pl-5">
              <li>
                Vary <strong>profile</strong>: one flat, one rounded, one
                pendant.
              </li>
              <li>Keep ~2–4cm between tiers so each reads clearly.</li>
              <li>One statement texture at a time; others stay minimal.</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* Neckline pairings */}
      <Section title="Neckline Pairings" eyebrow="Match the frame">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-neutral-800 p-4">
            <div className="text-sm font-semibold">Quick Map</div>
            <table className="mt-2 w-full text-left text-xs">
              <thead className="text-white/80">
                <tr>
                  <th className="py-1">Neckline</th>
                  <th className="py-1">Best Layers</th>
                </tr>
              </thead>
              <tbody className="opacity-90">
                {[
                  ["Crew", "Choker + 45cm chain"],
                  ["V‑neck", "Pendant that mirrors the V"],
                  ["Shirt collar", "45–50cm chain + 55–60cm pendant"],
                  [
                    "Square/Strapless",
                    "Choker + mid chain; skip long pendants",
                  ],
                ].map(([nl, rec]) => (
                  <tr key={nl} className="border-t border-neutral-800">
                    <td className="py-1">{nl}</td>
                    <td className="py-1">{rec}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="rounded-xl border border-neutral-800 p-4">
            <div className="text-sm font-semibold">Rule of Thirds</div>
            <p className="mt-2">
              Aim for 1 focal + 2 supporting pieces. If your neckline is busy
              (ruffles, bows), reduce to 1–2 layers.
            </p>
            <p className="mt-2 text-xs opacity-80">
              Pro tip: match pendant shape to neckline (V, curve, square) for
              harmony.
            </p>
          </div>
        </div>
      </Section>

      {/* Wrist + Rings */}
      <Section title="Bracelets & Rings" eyebrow="Balance visual weight">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-neutral-800 p-4">
            <div className="text-sm font-semibold">Wrist Stack</div>
            <ul className="mt-2 list-disc pl-5">
              <li>1 cuff or bangle + 1 chain + 1 texture (beads/mesh).</li>
              <li>Anchor near the watch; keep movement comfortable.</li>
              <li>Mix finishes lightly; repeat one element for cohesion.</li>
            </ul>
          </div>
          <div className="rounded-xl border border-neutral-800 p-4">
            <div className="text-sm font-semibold">Ring Rhythm</div>
            <ul className="mt-2 list-disc pl-5">
              <li>One statement per hand; others slim bands.</li>
              <li>Vary heights (midi + standard) to add dimension.</li>
              <li>Leave at least one finger bare to avoid crowding.</li>
            </ul>
          </div>
          <div className="rounded-xl border border-neutral-800 p-4">
            <div className="text-sm font-semibold">Ear Stack</div>
            <ul className="mt-2 list-disc pl-5">
              <li>Main hoop or drop + micro hoops/studs up the ear.</li>
              <li>If earrings are bold, keep neckline minimal.</li>
              <li>Earcuffs add height without extra piercings.</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* Color & Metal */}
      <Section title="Color & Metal Mix" eyebrow="Modern blends">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-neutral-800 p-4">
            <div className="text-sm font-semibold">Metal Matrix</div>
            <div className="mt-2 grid grid-cols-2 gap-3 text-xs">
              {[
                ["All‑Gold", "Warm, dressy, cohesive"],
                ["All‑Silver", "Cool, minimal, clean"],
                ["Gold + Steel", "Balanced, everyday, on‑trend"],
                ["Gold + Black", "Graphic, evening‑ready"],
              ].map(([label, note]) => (
                <div
                  key={label}
                  className="rounded-lg border border-neutral-800 p-3"
                >
                  <div className="font-medium">{label}</div>
                  <p className="opacity-80">{note}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-neutral-800 p-4">
            <div className="text-sm font-semibold">Palette Pairing</div>
            <ul className="mt-2 list-disc pl-5">
              <li>
                Warm wardrobes → yellow/rose tones; add champagne crystals.
              </li>
              <li>
                Cool wardrobes → silver/rhodium; lean into clear/ice stones.
              </li>
              <li>
                Neutral → feel free to mix; anchor with one dominant metal
                (≈70/30).
              </li>
            </ul>
          </div>
        </div>
      </Section>

      {/* Occasion formulas */}
      <Section title="Occasion Formulas" eyebrow="Plug‑and‑play">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            [
              "Office Minimal",
              ["Choker + 45cm chain", "Small hoops", "1–2 slim rings"],
            ],
            [
              "Weekend Casual",
              ["45cm pendant + 55cm chain", "Medium hoops", "Bracelet stack"],
            ],
            [
              "Evening Statement",
              ["Choker + pendant", "Bold hoops or drops", "One statement ring"],
            ],
          ].map(([label, items]) => (
            <div
              key={label as string}
              className="rounded-xl border border-neutral-800 p-4"
            >
              <div className="text-sm font-semibold">{label as string}</div>
              <ul className="mt-2 list-disc pl-5 text-xs">
                {(items as string[]).map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      {/* Do / Don't */}
      <Section title="Do & Don’t" eyebrow="Keep it refined">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-neutral-800 p-4">
            <div className="text-sm font-semibold">Do</div>
            <ul className="mt-2 list-disc pl-5">
              <li>Repeat one element (metal, shape, texture) for cohesion.</li>
              <li>Mind proportions: balance chunky with sleek.</li>
              <li>Use extenders to fine‑tune spacing.</li>
            </ul>
          </div>
          <div className="rounded-xl border border-neutral-800 p-4">
            <div className="text-sm font-semibold">Don’t</div>
            <ul className="mt-2 list-disc pl-5">
              <li>Let every piece shout—choose a single focal.</li>
              <li>Stack rings so tightly they restrict movement.</li>
              <li>Ignore neckline or sleeve volume when stacking.</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* Closing CTA */}
      <div
        className={`${palette.card} ${palette.ring} rounded-2xl p-6 text-sm flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between`}
      >
        <div>
          <div className="text-base font-semibold">
            Ready to build your signature stack?
          </div>
          <p className={`${palette.subfg}`}>
            Explore chains, hoops, cuffs, and ring sets designed to layer
            beautifully.
          </p>
        </div>
        <Link
          href="/collections/stacking"
          className="rounded-2xl bg-gradient-to-r from-yellow-500 to-amber-500 px-4 py-2 text-sm font-semibold text-neutral-900 hover:brightness-110"
        >
          Shop Stacking Essentials
        </Link>
      </div>
    </PageShell>
  );
}
