"use client";
import Link from "next/link";
import React, { useMemo } from "react";

// ------------------------------------------------------------
// Elvarra / Elvara — Guide: Materials & Plating
// Route: app/guides/materials-guide/page.tsx
// ------------------------------------------------------------

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

export default function MaterialsGuidePage() {
  const theme: ThemeMode = "dark";
  const palette = useMemo(() => paletteForTheme(theme), [theme]);

  const rows = [
    {
      material: "Stainless Steel (316L)",
      durability: "High",
      color: "Silver base; PVD/Gold plating options",
      hypo: "Good (nickel-safe grades)",
      care: "Low",
      notes: "Sweat/water resistant, great for daily wear",
    },
    {
      material: "Brass",
      durability: "Medium",
      color: "Warm yellow base",
      hypo: "Varies",
      care: "Medium",
      notes: "Affordable; requires care to reduce tarnish",
    },
    {
      material: "Sterling Silver (925)",
      durability: "Medium",
      color: "Bright silver",
      hypo: "Good",
      care: "Medium",
      notes: "May tarnish; easy to polish",
    },
    {
      material: "Gold Plated",
      durability: "Medium",
      color: "Depends on karat tone",
      hypo: "Depends on base",
      care: "Medium",
      notes: "Avoid chemicals; remove before shower/swim",
    },
    {
      material: "Gold Vermeil",
      durability: "Medium-High",
      color: "Gold over sterling silver",
      hypo: "Good",
      care: "Medium",
      notes: ">=2.5µm gold recommended for longevity",
    },
    {
      material: "Rhodium Plated",
      durability: "High",
      color: "Cool bright finish",
      hypo: "Good",
      care: "Low",
      notes: "Applied over silver/white gold for shine & protection",
    },
  ];

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
          / <span>Materials & Plating</span>
        </nav>

        <header className="mt-2 mb-6">
          <h1 className="text-3xl font-semibold">Guide: Materials & Plating</h1>
          <p className={`mt-1 text-sm ${palette.subfg}`}>
            Understand base metals, plating types, and how to care for fashion
            jewelry so it looks great longer.
          </p>
        </header>

        {/* TOC */}
        <section
          className={`mb-6 rounded-2xl ${palette.card} ${palette.ring} p-4`}
        >
          <div className="text-sm font-medium">On this page</div>
          <ol
            className={`mt-2 list-decimal space-y-1 pl-5 text-sm ${palette.subfg}`}
          >
            <li>
              <a className="underline" href="#bases">
                Base Metals
              </a>
            </li>
            <li>
              <a className="underline" href="#plating">
                Plating Types
              </a>
            </li>
            <li>
              <a className="underline" href="#hypo">
                Hypoallergenic
              </a>
            </li>
            <li>
              <a className="underline" href="#water">
                Water & Sweat
              </a>
            </li>
            <li>
              <a className="underline" href="#care">
                Care Checklist
              </a>
            </li>
            <li>
              <a className="underline" href="#compare">
                Comparison Table
              </a>
            </li>
            <li>
              <a className="underline" href="#faq">
                FAQ
              </a>
            </li>
          </ol>
        </section>

        {/* Sections */}
        <section id="bases" className="grid gap-4 md:grid-cols-2">
          <div className={`rounded-2xl ${palette.card} ${palette.ring} p-6`}>
            <h2 className="text-lg font-semibold">Base Metals</h2>
            <ul className={`mt-2 list-disc pl-5 text-sm ${palette.subfg}`}>
              <li>
                <span className="text-white">Stainless Steel (316L):</span>{" "}
                Durable, corrosion resistant, great for everyday wear; often
                PVD-coated for color.
              </li>
              <li>
                <span className="text-white">Brass:</span> Popular for fashion
                pieces; warm tone. Can tarnish—store dry and wipe after wear.
              </li>
              <li>
                <span className="text-white">Sterling Silver (925):</span>{" "}
                Precious metal; can oxidize over time but polishes back to
                shine.
              </li>
              <li>
                <span className="text-white">Alloys:</span> Blends optimize
                color/strength; look for nickel-safe compositions.
              </li>
            </ul>
          </div>

          <div className={`rounded-2xl ${palette.card} ${palette.ring} p-6`}>
            <h2 className="text-lg font-semibold">Why base metal matters</h2>
            <p className={`mt-2 text-sm ${palette.subfg}`}>
              The base metal affects weight, longevity, cost, and how well
              plating adheres. Stainless steel and sterling silver are reliable
              choices for sensitive skin and daily wear.
            </p>
          </div>
        </section>

        <section id="plating" className="mt-6 grid gap-4 md:grid-cols-2">
          <div className={`rounded-2xl ${palette.card} ${palette.ring} p-6`}>
            <h2 className="text-lg font-semibold">Plating Types</h2>
            <ul className={`mt-2 list-disc pl-5 text-sm ${palette.subfg}`}>
              <li>
                <span className="text-white">Gold Plated:</span> Thin gold layer
                over base metal. Remove before shower/swim to extend life.
              </li>
              <li>
                <span className="text-white">Gold Vermeil:</span> Gold over
                sterling silver; thicker (often ≥2.5µm). Longer lasting than
                standard plating.
              </li>
              <li>
                <span className="text-white">PVD Coating:</span> Durable color
                layer (e.g., gold tone) used commonly on 316L steel; highly
                wear-resistant.
              </li>
              <li>
                <span className="text-white">Rhodium Plating:</span> Bright,
                cool finish applied over silver/white gold to boost shine and
                reduce tarnish.
              </li>
            </ul>
          </div>
          <div className={`rounded-2xl ${palette.card} ${palette.ring} p-6`}>
            <h2 className="text-lg font-semibold">Karat Tone & Color</h2>
            <p className={`mt-2 text-sm ${palette.subfg}`}>
              Gold tone is about color, not purity in plated jewelry. 18K tone
              is slightly warmer than 14K; rose gold adds copper for blush hues.
              Choose based on skin undertone and wardrobe.
            </p>
          </div>
        </section>

        <section id="hypo" className="mt-6 grid gap-4 md:grid-cols-2">
          <div className={`rounded-2xl ${palette.card} ${palette.ring} p-6`}>
            <h2 className="text-lg font-semibold">
              Hypoallergenic Considerations
            </h2>
            <p className={`mt-2 text-sm ${palette.subfg}`}>
              Look for nickel-safe materials and high-quality plating. 316L
              steel, sterling silver, and rhodium finishes are friendly choices
              for most skin types.
            </p>
          </div>
          <div className={`rounded-2xl ${palette.card} ${palette.ring} p-6`}>
            <h2 className="text-lg font-semibold">Sensitive Skin Tips</h2>
            <ul className={`mt-2 list-disc pl-5 text-sm ${palette.subfg}`}>
              <li>Start with 316L steel or sterling silver cores.</li>
              <li>Choose rhodium plating for cool-tone silver looks.</li>
              <li>
                Keep skin and jewelry dry; avoid lotions/perfumes on contact
                areas.
              </li>
            </ul>
          </div>
        </section>

        <section id="water" className="mt-6 grid gap-4 md:grid-cols-2">
          <div className={`rounded-2xl ${palette.card} ${palette.ring} p-6`}>
            <h2 className="text-lg font-semibold">Water & Sweat</h2>
            <p className={`mt-2 text-sm ${palette.subfg}`}>
              “Waterproof” claims vary. Stainless steel with PVD holds up well,
              but standard gold plating lasts longer if kept dry. Always dry
              thoroughly if exposed to moisture.
            </p>
          </div>
          <div className={`rounded-2xl ${palette.card} ${palette.ring} p-6`}>
            <h2 className="text-lg font-semibold">Tarnish & Oxidation</h2>
            <p className={`mt-2 text-sm ${palette.subfg}`}>
              Silver may oxidize; polish with a soft cloth. Brass can darken;
              store airtight to slow it down. Plated pieces benefit from gentle
              handling and dry storage.
            </p>
          </div>
        </section>

        <section
          id="care"
          className="mt-6 rounded-2xl p-6 ${palette.card} ${palette.ring}"
        >
          <h2 className="text-lg font-semibold">Care Checklist</h2>
          <ul
            className={`mt-2 grid list-disc grid-cols-1 gap-2 pl-5 text-sm ${palette.subfg} sm:grid-cols-2`}
          >
            <li>
              Last on, first off (avoid contact with lotions, perfume,
              hairspray).
            </li>
            <li>
              Remove before shower, swim, or workouts unless stainless/PVD.
            </li>
            <li>Wipe with a soft cloth after wear; store in a dry pouch.</li>
            <li>Keep pieces separated to prevent scratches and tangles.</li>
          </ul>
        </section>

        <section
          id="compare"
          className="mt-6 rounded-2xl ${palette.card} ${palette.ring} overflow-hidden"
        >
          <div className="p-4">
            <h2 className="text-lg font-semibold">Comparison Table</h2>
          </div>
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
                  <tr
                    key={r.material}
                    className="odd:bg-white/5 even:bg-white/0"
                  >
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
        </section>

        <section id="faq" className={`mt-6 grid gap-4 md:grid-cols-2`}>
          <div className={`rounded-2xl ${palette.card} ${palette.ring} p-6`}>
            <h2 className="text-lg font-semibold">FAQ</h2>
            <details className="mt-2">
              <summary className="cursor-pointer text-sm">
                Will my jewelry tarnish?
              </summary>
              <p className={`mt-1 text-sm ${palette.subfg}`}>
                Silver can oxidize and brass can darken; plating helps but care
                habits matter most. Keep pieces dry and wipe after wear.
              </p>
            </details>
            <details className="mt-2">
              <summary className="cursor-pointer text-sm">
                Can I shower with fashion jewelry?
              </summary>
              <p className={`mt-1 text-sm ${palette.subfg}`}>
                Stainless/PVD holds up best. For plated brass or vermeil, remove
                before shower/swim to prolong finish.
              </p>
            </details>
            <details className="mt-2">
              <summary className="cursor-pointer text-sm">
                What if I have sensitive skin?
              </summary>
              <p className={`mt-1 text-sm ${palette.subfg}`}>
                Start with 316L steel or sterling silver bases, and rhodium
                finishes. Test new styles for short periods first.
              </p>
            </details>
          </div>

          <div className={`rounded-2xl ${palette.card} ${palette.ring} p-6`}>
            <h2 className="text-lg font-semibold">Next Steps</h2>
            <p className={`mt-2 text-sm ${palette.subfg}`}>
              Ready to pick? Explore our premium and everyday pieces by
              material.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              <Link
                href="/collections/premium"
                className={`rounded-xl px-3 py-1.5 ${palette.button}`}
              >
                Premium Collection
              </Link>
              <Link
                href="/products?material=stainless"
                className={`rounded-xl px-3 py-1.5 ${palette.button}`}
              >
                Stainless Steel
              </Link>
              <Link
                href="/products?material=vermeil"
                className={`rounded-xl px-3 py-1.5 ${palette.button}`}
              >
                Gold Vermeil
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

/*
------------------------------------------------------------
TESTS (snippets)
// tests/materials-guide.test.ts
// it("renders comparison rows", () => { const rows = [1,2,3]; expect(rows.length > 0).toBe(true); });
// it("toc anchors exist", () => { const ids = ["bases","plating","hypo","water","care","compare","faq"]; expect(ids.every(Boolean)).toBe(true); });
//------------------------------------------------------------
*/
