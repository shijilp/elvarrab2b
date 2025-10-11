import PageShell, { paletteForTheme } from "@/components/PageShell";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guide: Fashion Jewelry | Elvarra",
  description:
    "How to choose, style, and care for fashion jewelry—metal mixes, outfit formulas, size tips, and a simple care routine.",
};

export default function Page() {
  const theme = "dark" as const;
  const palette = paletteForTheme(theme);

  const Section = ({
    title,
    children,
    eyebrow,
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

  return (
    <PageShell
      theme={theme}
      trail="Fashion Jewelry"
      title="Guide: Fashion Jewelry"
      subtitle="Style with intention. Buy smart. Keep the shine."
      // Optional hero slot (if your PageShell supports it)
      ctaSlot={
        <Link
          href="/collections/new"
          className="rounded-2xl bg-gradient-to-r from-yellow-500 to-amber-500 px-4 py-2 text-sm font-semibold text-neutral-900 hover:brightness-110"
        >
          Shop the Elvarra Edit
        </Link>
      }
    >
      {/* Intro band */}
      <div
        className={`${palette.card} ${palette.ring} rounded-2xl p-6 sm:p-7 relative overflow-hidden`}
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-amber-500/0" />
        <div className="relative">
          <p className={`text-sm ${palette.subfg} max-w-3xl`}>
            Fashion jewelry lets you experiment with silhouette and
            shine—without fine-jewelry pricing. Use this guide to dial in your
            metal mix, choose lengths that flatter, and build outfits that feel
            intentional.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Chip>Beginner-friendly</Chip>
            <Chip>Styling formulas</Chip>
            <Chip>Care routine</Chip>
          </div>
        </div>
      </div>

      {/* Choosing */}
      <Section title="Choosing Fashion Jewelry" eyebrow="Buy smart">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
            <div className="text-sm font-semibold text-yellow-300">
              The 3-point check
            </div>
            <ul className="mt-2 list-disc pl-5">
              <li>
                <span className="font-medium text-white/90">Occasion:</span>{" "}
                everyday, work, or event?
              </li>
              <li>
                <span className="font-medium text-white/90">Signature:</span>{" "}
                minimal, classic, bold, or trend-led?
              </li>
              <li>
                <span className="font-medium text-white/90">Budget:</span> set a
                range; plan 1 statement + 2 essentials per season.
              </li>
            </ul>
          </div>
          <div className="rounded-xl border border-neutral-800 p-4">
            <div className="text-sm font-semibold">
              Metal & skin tone (quick guide)
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
              <div className="rounded-lg border border-neutral-800 p-3">
                <div className="font-medium">Warm</div>
                <p className="opacity-80">Gold, champagne, mixed gold/steel</p>
              </div>
              <div className="rounded-lg border border-neutral-800 p-3">
                <div className="font-medium">Cool</div>
                <p className="opacity-80">Silver, rhodium, white gold tones</p>
              </div>
              <div className="rounded-lg border border-neutral-800 p-3">
                <div className="font-medium">Neutral</div>
                <p className="opacity-80">Freely mix—anchor with one metal</p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Styling */}
      <Section title="Styling Formulas" eyebrow="Outfit building">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-neutral-800 p-4">
            <div className="text-sm font-semibold">Necklace Layer</div>
            <ul className="mt-2 list-disc pl-5">
              <li>14–16″ choker + 18″ pendant + 20–22″ fine chain</li>
              <li>Keep one texture bold; others minimal</li>
              <li>Match chain thickness to neckline weight</li>
            </ul>
          </div>
          <div className="rounded-xl border border-neutral-800 p-4">
            <div className="text-sm font-semibold">Ring Stack</div>
            <ul className="mt-2 list-disc pl-5">
              <li>1 statement ring + 2–3 slim bands</li>
              <li>Vary heights: midi + standard</li>
              <li>Balance both hands for symmetry</li>
            </ul>
          </div>
          <div className="rounded-xl border border-neutral-800 p-4">
            <div className="text-sm font-semibold">Earrings</div>
            <ul className="mt-2 list-disc pl-5">
              <li>Everyday: small hoops + studs</li>
              <li>Evening: drop earrings + bare neck or single chain</li>
              <li>Second piercings: micro hoops to frame the main piece</li>
            </ul>
          </div>
        </div>

        {/* Metal mix matrix */}
        <div className="mt-4 rounded-xl border border-neutral-800 p-4">
          <div className="text-sm font-semibold">Metal Mix Matrix</div>
          <div className="mt-2 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
            {[
              ["All-Gold", "Cohesive, warm, dressy"],
              ["All-Silver", "Clean, modern, cool"],
              ["Gold + Steel", "Fashion-forward, balanced"],
              ["Gold + Black", "Graphic, evening-ready"],
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
      </Section>

      {/* Sizes */}
      <Section title="Lengths & Sizing at a Glance" eyebrow="Fit matters">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-neutral-800 p-4">
            <div className="text-sm font-semibold">Necklace Lengths</div>
            <table className="mt-2 w-full text-left text-xs">
              <thead className="text-white/80">
                <tr>
                  <th className="py-1">Length</th>
                  <th className="py-1">Sits at</th>
                  <th className="py-1">Best with</th>
                </tr>
              </thead>
              <tbody className="opacity-90">
                {[
                  ["14–16″", "Base of neck", "Crew & V-neck"],
                  ["18″", "Collarbone", "Most necklines"],
                  ["20–22″", "Below collarbone", "Shirts & knits"],
                  ["24–30″", "Bust / mid", "Layers & dresses"],
                ].map(([a, b, c]) => (
                  <tr key={a} className="border-t border-neutral-800">
                    <td className="py-1">{a}</td>
                    <td className="py-1">{b}</td>
                    <td className="py-1">{c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-xl border border-neutral-800 p-4">
            <div className="text-sm font-semibold">Quick Ring Size Check</div>
            <ol className="mt-2 list-decimal pl-5">
              <li>Wrap a strip of paper around your finger—snug, not tight.</li>
              <li>Mark the overlap; measure in mm.</li>
              <li>Compare to a size chart; size up for wider bands.</li>
            </ol>
            <p className="mt-2 text-xs opacity-80">
              Pro tip: measure at day’s end when fingers are slightly larger.
            </p>
          </div>
        </div>
      </Section>

      {/* Materials */}
      <Section title="Materials Snapshot" eyebrow="Know your base">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-neutral-800 p-4">
            <div className="text-sm font-semibold">316L Stainless</div>
            <p className="mt-1 opacity-90">
              Durable and tarnish-resistant; great for daily wear. Often marked
              “hypoallergenic,” but check for nickel sensitivity.
            </p>
          </div>
          <div className="rounded-xl border border-neutral-800 p-4">
            <div className="text-sm font-semibold">Sterling Silver</div>
            <p className="mt-1 opacity-90">
              92.5% silver; may oxidize—polish restores shine. Timeless cool
              tone; easy to mix with rhodium finishes.
            </p>
          </div>
          <div className="rounded-xl border border-neutral-800 p-4">
            <div className="text-sm font-semibold">Brass + Plating</div>
            <p className="mt-1 opacity-90">
              Allows richer shapes at friendly price points. Choose thicker
              plating and avoid moisture for longevity.
            </p>
          </div>
        </div>
        <p className="mt-3">
          Deep dive in{" "}
          <Link
            className="underline underline-offset-2"
            href="/guides/materials-guide"
          >
            Materials Guide
          </Link>
          .
        </p>
      </Section>

      {/* Care */}
      <Section title="Care Essentials" eyebrow="Keep the shine">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-neutral-800 p-4">
            <div className="text-sm font-semibold">Golden rules</div>
            <ul className="mt-2 list-disc pl-5">
              <li>
                <span className="font-medium text-white/90">
                  Last on, first off.
                </span>{" "}
                Jewelry goes after skincare; off before gym & sleep.
              </li>
              <li>Keep dry; avoid perfume, chlorine, and salt water.</li>
              <li>Wipe after wear; store in individual pouches.</li>
            </ul>
          </div>
          <div className="rounded-xl border border-neutral-800 p-4">
            <div className="text-sm font-semibold">Simple routine</div>
            <ol className="mt-2 list-decimal pl-5">
              <li>Weekly: microfiber wipe to remove oils.</li>
              <li>
                Monthly: mild soap + lukewarm water for stainless & silver; dry
                fully. Avoid soaking plated pieces.
              </li>
              <li>Seasonal: check clasps, adjust chains, refresh polish.</li>
            </ol>
          </div>
        </div>
      </Section>

      {/* Buying checklist */}
      <Section title="Buying Checklist" eyebrow="Before you add to cart">
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            "Does this piece complement at least two outfits I already own?",
            "Is the length/size right for my neckline or finger?",
            "Will I wear this weekly (essential) or occasionally (statement)?",
            "Do I have a matching/contrasting piece to layer it with?",
          ].map((item) => (
            <label key={item} className="flex items-start gap-3">
              <input
                type="checkbox"
                className="mt-1 size-4 rounded border-neutral-700 bg-transparent checked:bg-yellow-400 checked:hover:bg-yellow-400"
              />
              <span>{item}</span>
            </label>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Link
            href="/collections/essentials"
            className="rounded-full border border-yellow-500/40 bg-yellow-500/10 px-3 py-1 text-yellow-300"
          >
            Explore Essentials
          </Link>
          <Link
            href="/collections/statement"
            className="rounded-full border border-neutral-700 px-3 py-1 hover:bg-white/5"
          >
            Statement Edit
          </Link>
        </div>
      </Section>

      {/* FAQ */}
      <Section title="FAQs" eyebrow="Quick answers">
        <details className="group rounded-xl border border-neutral-800 p-4 open:bg-white/0">
          <summary className="cursor-pointer list-none font-medium">
            Can I mix gold and silver?
          </summary>
          <p className="mt-2">
            Yes—anchor with one dominant metal (60–70%) and echo it in at least
            two points (ear/neck/wrist) for cohesion.
          </p>
        </details>
        <details className="group mt-3 rounded-xl border border-neutral-800 p-4">
          <summary className="cursor-pointer list-none font-medium">
            What’s best for sensitive skin?
          </summary>
          <p className="mt-2">
            Look for 316L stainless or rhodium-plated finishes. If you’re
            nickel-sensitive, verify “nickel-free” or choose sterling silver.
          </p>
        </details>
      </Section>

      {/* Closing CTA */}
      <div
        className={`${palette.card} ${palette.ring} rounded-2xl p-6 text-sm flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between`}
      >
        <div>
          <div className="text-base font-semibold">
            Ready to style it your way?
          </div>
          <p className={`${palette.subfg}`}>
            Discover new-in chains, hoops, and stacks curated by Elvarra.
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
