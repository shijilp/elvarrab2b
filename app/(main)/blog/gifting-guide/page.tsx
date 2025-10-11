"use client";
import Link from "next/link";
import PageShell, { paletteForTheme } from "@/components/PageShell";
import type { Metadata } from "next";
import Image from "next/image";
import { useEffect, useState } from "react";

const metadata: Metadata = {
  title: "Guide: Gifting | Elvarra",
  description:
    "Occasion-based gifting guide for fashion jewelry: safe picks, size tips, budgets, personalization, presentation checklist, and FAQs.",
};

// -----------------------------
// Inline product callouts (client fetch to your API)
// -----------------------------

type Product = {
  id: number | string;
  slug: string;
  title: string;
  price: number;
  image: string;
  badge?: string;
};

function ProductCallouts({
  query = "/api/products?collection=gifts&limit=6",
}: {
  query?: string;
}) {
  const [items, setItems] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    setLoading(true);
    setErr(null);
    fetch(query, { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json();
        // adapt if your API shape differs
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const list: Product[] = (data?.results || data || []).map((p: any) => ({
          id: p.id ?? p.slug ?? Math.random(),
          slug: p.slug ?? String(p.id ?? ""),
          title: p.title ?? p.name ?? "Untitled",
          price: Number(p.price ?? p.unit_price ?? 0),
          image: p.image ?? p.thumbnail ?? "/placeholder.png",
          badge: p.badge ?? p.tagline ?? undefined,
        }));
        if (live) setItems(list);
      })
      .catch((e) => live && setErr(e.message))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [query]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl border border-rose-200/60 bg-white/60 p-3"
          >
            <div className="aspect-square w-full rounded-xl bg-neutral-200" />
            <div className="mt-3 h-3 w-3/4 rounded bg-neutral-200" />
            <div className="mt-2 h-3 w-1/3 rounded bg-neutral-200" />
          </div>
        ))}
      </div>
    );
  }
  if (err) {
    return (
      <div className="rounded-xl border border-rose-200/80 bg-rose-50/70 p-4 text-sm text-rose-700">
        Couldn’t load gifts right now. Please refresh.
      </div>
    );
  }
  if (!items || items.length === 0) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white/70 p-4 text-sm text-neutral-600">
        No gift picks found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {items.map((p) => (
        <Link
          key={p.id}
          href={`/product/${p.slug}`}
          className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white/90 shadow-sm transition hover:shadow-md"
        >
          <div className="relative">
            <Image
              src={p.image}
              alt={p.title}
              width={600}
              height={600}
              className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
            {p.badge && (
              <span className="absolute left-2 top-2 rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                {p.badge}
              </span>
            )}
          </div>
          <div className="p-3">
            <div className="line-clamp-1 text-sm font-medium text-neutral-900">
              {p.title}
            </div>
            <div className="mt-0.5 text-xs text-neutral-600">
              ₹{p.price?.toLocaleString?.("en-IN") ?? p.price}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function GiftingGuidePage() {
  // Switch to Chic Light palette
  const theme = "light" as const;
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
        <div className="text-[10px] uppercase tracking-wider text-neutral-500">
          {eyebrow}
        </div>
      )}
      <h2 className="mt-1 text-lg font-semibold text-neutral-900">{title}</h2>
      <div className={`mt-3 text-sm leading-6 ${"text-neutral-600"}`}>
        {children}
      </div>
    </section>
  );

  const Chip = ({ children }: { children: React.ReactNode }) => (
    <span className="rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-medium text-rose-700">
      {children}
    </span>
  );

  const QuickLink = ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <Link
      href={href}
      className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs text-rose-700 hover:bg-rose-100"
    >
      {children}
    </Link>
  );

  return (
    <PageShell
      theme={theme}
      trail="Gifting Guide"
      title="Guide: Gifting"
      subtitle="Occasion-based picks, sizing tips, personalization ideas, and a presentation that feels premium."
      ctaSlot={
        <Link
          href="/collections/gifts"
          className="rounded-2xl bg-gradient-to-r from-rose-400 to-pink-500 px-4 py-2 text-sm font-semibold text-white hover:brightness-110"
        >
          Shop Gift Picks
        </Link>
      }
    >
      {/* Intro band */}
      <div
        className={`${palette.card} ${palette.ring} relative overflow-hidden rounded-2xl p-6 sm:p-7`}
      >
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(244,114,182,0.12),rgba(255,255,255,0))]" />
        <div className="relative">
          <p className={`text-sm text-neutral-600 max-w-3xl`}>
            Jewelry gifts feel personal when they echo the recipient’s style and
            story. Use these shortcuts to choose a safe style, match sizes, and
            present it beautifully.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Chip>Occasion-ready</Chip>
            <Chip>Size-safe picks</Chip>
            <Chip>Under 24-hour prep</Chip>
          </div>
        </div>
      </div>

      {/* Personas */}
      <Section title="Find Their Style in 10 Seconds" eyebrow="Personas">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Minimal Classic", "Tiny hoops, fine chains, bar pendant"],
            ["Romantic", "Pearls, pavé, heart/initial charms"],
            ["Bold Trend", "Chunky hoops, dome rings, paperclip chains"],
          ].map(([label, picks]) => (
            <div
              key={label}
              className="rounded-xl border border-neutral-200 bg-white/90 p-4"
            >
              <div className="text-sm font-semibold text-neutral-900">
                {label}
              </div>
              <p className="mt-1 text-neutral-600">{picks}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <QuickLink
                  href={`/products?style=${encodeURIComponent(
                    label.toLowerCase()
                  )}`}
                >
                  Shop {label}
                </QuickLink>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Occasions */}
      <Section title="Occasion Guide" eyebrow="What to gift when">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Birthday", "Birthstone color, zodiac charm, initial necklace"],
            ["Anniversary", "Pearls, pavé set, engraved pendant"],
            ["Wedding / Bridesmaid", "Necklace + studs set in warm tones"],
          ].map(([label, tip]) => (
            <div
              key={label}
              className="rounded-xl border border-neutral-200 bg-white/90 p-4"
            >
              <div className="text-sm font-semibold text-neutral-900">
                {label}
              </div>
              <p className="mt-1 text-neutral-600">{tip}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Budget tiers */}
      <Section title="Budget Tiers" eyebrow="Choose your range">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Under ₹1,500", "Everyday hoops, fine chain, charm bracelet"],
            ["₹1,500–₹3,000", "Layering set, pearl drops, dome ring"],
            ["₹3,000+", "Statement necklace, premium set, engravables"],
          ].map(([label, tip]) => (
            <div
              key={label}
              className="rounded-xl border border-neutral-200 bg-white/90 p-4"
            >
              <div className="text-sm font-semibold text-neutral-900">
                {label}
              </div>
              <p className="mt-1 text-neutral-600">{tip}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <QuickLink
                  href={`/products?max=${encodeURIComponent(
                    label.includes("Under")
                      ? "1500"
                      : label.includes("3,000+")
                      ? "999999"
                      : "3000"
                  )}`}
                >
                  See picks
                </QuickLink>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Inline Product Callouts (live) */}
      <Section title="Curated Gift Picks" eyebrow="From our catalog">
        <ProductCallouts query="/api/products?collection=gifts&limit=6" />
      </Section>

      {/* Size-safe picks */}
      <Section title="Size-Safe Picks" eyebrow="When you don't know sizes">
        <ul className="list-disc pl-5">
          <li>Adjustable bracelets (17–19cm) and open rings</li>
          <li>Necklaces 45–50cm (18–20\&quot;)—safe for most necklines</li>
          <li>Earrings: small/medium hoops or studs—universally wearable</li>
        </ul>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <QuickLink href="/collections/adjustable">
            Adjustable styles
          </QuickLink>
          <QuickLink href="/collections/hoops">Everyday hoops</QuickLink>
          <QuickLink href="/collections/pendants">Pendants</QuickLink>
        </div>
      </Section>

      {/* Personalization */}
      <Section title="Make It Personal" eyebrow="Small touches, big impact">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            [
              "Initials & Charms",
              "Add their initial, birthstone color, or a tiny motif that means something.",
            ],
            [
              "Engraving",
              "Dates, coordinates, or a short message on plates and lockets.",
            ],
            [
              "Mix a Set",
              "Pair a delicate necklace with matching studs for a gift-ready duo.",
            ],
          ].map(([label, tip]) => (
            <div
              key={label}
              className="rounded-xl border border-neutral-200 bg-white/90 p-4"
            >
              <div className="text-sm font-semibold text-neutral-900">
                {label}
              </div>
              <p className="mt-1 text-neutral-600">{tip}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Sizing Quick Tips */}
      <Section title="Sizing Quick Tips" eyebrow="Fit at a glance">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-neutral-200 bg-white/90 p-4">
            <div className="text-sm font-semibold text-neutral-900">
              Necklaces
            </div>
            <table className="mt-2 w-full text-left text-xs">
              <thead className="text-neutral-900/80">
                <tr>
                  <th className="py-1">Length</th>
                  <th className="py-1">Sits at</th>
                  <th className="py-1">Safe pick</th>
                </tr>
              </thead>
              <tbody className="text-neutral-700">
                {[
                  ['45cm (18")', "Collarbone", "Most outfits"],
                  ['50cm (20")', "Below collarbone", "Layering"],
                  ['60cm (24")', "Mid chest", "Statement pendants"],
                ].map(([a, b, c]) => (
                  <tr key={a} className="border-t border-neutral-200">
                    <td className="py-1">{a}</td>
                    <td className="py-1">{b}</td>
                    <td className="py-1">{c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white/90 p-4">
            <div className="text-sm font-semibold text-neutral-900">
              Bracelets
            </div>
            <p className="mt-2 text-neutral-600">
              17–19cm with extender covers most wrists. For petite, 16–18cm.
            </p>
            <div className="mt-3 text-xs text-neutral-500">
              Open designs and chain extenders = gift-safe.
            </div>
          </div>
        </div>
      </Section>

      {/* Presentation */}
      <Section title="Presentation Checklist" eyebrow="Make it feel premium">
        <ul className="list-disc pl-5">
          <li>Gift box or pouch + tissue wrap</li>
          <li>Handwritten note (why you chose it)</li>
          <li>Care card + polishing cloth</li>
          <li>Receipt emailed, not in the box</li>
        </ul>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <QuickLink href="/gift-wrap">Add gift wrap</QuickLink>
          <QuickLink href="/guides/care">Care guide</QuickLink>
        </div>
      </Section>

      {/* Last-minute */}
      <Section title="Need a Last‑Minute Gift?" eyebrow="Under 24 hours">
        <p className="text-neutral-600">
          Choose e‑gift cards or in‑stock picks with express shipping. Pair with
          a printed card and you still have a thoughtful present.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <QuickLink href="/gift-card">E‑Gift Card</QuickLink>
          <QuickLink href="/collections/fast-ship">Fast‑ship styles</QuickLink>
        </div>
      </Section>

      {/* FAQs */}
      <Section title="FAQs" eyebrow="Quick answers">
        <details className="group rounded-xl border border-neutral-200 bg-white/90 p-4 open:bg-white/90">
          <summary className="cursor-pointer list-none font-medium text-neutral-900">
            What if they don’t like the style?
          </summary>
          <p className="mt-2 text-neutral-600">
            Include a gift receipt and choose adjustable, easy‑to‑swap pieces
            (hoops, pendants). Our returns make exchanges simple.
          </p>
        </details>
        <details className="group mt-3 rounded-xl border border-neutral-200 bg-white/90 p-4">
          <summary className="cursor-pointer list-none font-medium text-neutral-900">
            Is mixing metals OK for a gift?
          </summary>
          <p className="mt-2 text-neutral-600">
            Yes—choose one dominant metal and echo it in two spots for cohesion.
            Mixed sets are modern and versatile.
          </p>
        </details>
      </Section>

      {/* Closing CTA */}
      <div
        className={`${palette.card} ${palette.ring} rounded-2xl p-6 text-sm flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between`}
      >
        <div>
          <div className="text-base font-semibold text-neutral-900">
            Ready to wrap it up?
          </div>
          <p className={`text-neutral-600`}>
            Explore curated gifts by style, budget, and occasion.
          </p>
        </div>
        <Link
          href="/collections/gifts"
          className="rounded-2xl bg-gradient-to-r from-rose-400 to-pink-500 px-4 py-2 text-sm font-semibold text-white hover:brightness-110"
        >
          Shop Gifts
        </Link>
      </div>
    </PageShell>
  );
}
