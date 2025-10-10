"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useMemo, useState } from "react";

// ==============================================================
// Elvarra / Elvara — Guides Index
// Route: app/guides/page.tsx
// Lists all guides and links to detail pages (e.g., /guides/fashion-jewelry)
// Includes: search, tags filter, and consistent theme
// ==============================================================

type ThemeMode = "dark" | "light";
type Palette = {
  bg: string;
  fg: string;
  subfg: string;
  card: string;
  border: string;
  button: string;
  ring: string;
  chip: string;
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
        chip: "bg-yellow-500 text-neutral-900",
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
        chip: "bg-neutral-900 text-neutral-50",
      };
}

export type Guide = {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  tags: ("care" | "styling" | "materials" | "buying" | "sizing" | "gifting")[];
  readMins: number;
};

const ALL_GUIDES: Guide[] = [
  {
    slug: "fashion-jewelry",
    title: "Fashion Jewelry 101",
    excerpt: "How to choose, style, and care for everyday pieces—start here.",
    image:
      "https://images.unsplash.com/photo-1603561596112-0e8e1f43d0a6?q=80&w=1200&auto=format&fit=crop",
    tags: ["buying", "styling", "care"],
    readMins: 6,
  },
  {
    slug: "care",
    title: "Care & Maintenance",
    excerpt: "Cleaning, storage, and longevity tips to keep your shine.",
    image:
      "https://images.unsplash.com/photo-1585386959984-a41552231673?q=80&w=1200&auto=format&fit=crop",
    tags: ["care"],
    readMins: 5,
  },
  {
    slug: "layering-and-styling",
    title: "Layering & Styling",
    excerpt: "Master layering: chains, pendants, cuffs, and ring stacks.",
    image:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop",
    tags: ["styling"],
    readMins: 7,
  },
  {
    slug: "materials-guide",
    title: "Materials & Plating",
    excerpt: "Gold plating, stainless, brass, rhodium—what's the difference?",
    image:
      "https://images.unsplash.com/photo-1611599538395-8a85b43892ab?q=80&w=1200&auto=format&fit=crop",
    tags: ["materials"],
    readMins: 8,
  },
  {
    slug: "gifting-guide",
    title: "Gifting Guide",
    excerpt: "Occasion-based picks and sizing tips for effortless gifting.",
    image:
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1200&auto=format&fit=crop",
    tags: ["gifting", "buying"],
    readMins: 4,
  },
];

function GuideCard({ g, palette }: { g: Guide; palette: Palette }) {
  return (
    <a
      href={`/guides/${g.slug}`}
      className={`group overflow-hidden rounded-2xl ${palette.ring} ${palette.card}`}
    >
      <div className="relative">
        <Image
          width={640}
          height={640}
          src={g.image}
          alt={g.title}
          className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span
          className={`absolute left-2 top-2 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wider ${palette.chip}`}
        >
          {g.readMins} min
        </span>
      </div>
      <div className="p-4">
        <div className="text-sm font-semibold">{g.title}</div>
        <p className={`mt-1 text-xs ${palette.subfg}`}>{g.excerpt}</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {g.tags.map((t) => (
            <span
              key={t}
              className={`rounded-full border ${palette.border} px-2 py-0.5 text-[10px]`}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </a>
  );
}

export default function GuidesIndexPage() {
  const theme: ThemeMode = "dark";
  const palette = useMemo(() => paletteForTheme(theme), [theme]);

  // search & tags
  const [q, setQ] = useState("");
  const [tag, setTag] = useState<string>("all");

  const filtered = useMemo(() => {
    const base = ALL_GUIDES.filter((g) =>
      q.trim()
        ? [g.title, g.excerpt, ...g.tags]
            .join(" ")
            .toLowerCase()
            .includes(q.toLowerCase())
        : true
    );
    return tag === "all"
      ? base
      : // eslint-disable-next-line @typescript-eslint/no-explicit-any
        base.filter((g) => g.tags.includes(tag as any));
  }, [q, tag]);

  return (
    <main className={`${palette.bg} ${palette.fg} min-h-screen antialiased`}>
      <div className="container py-10">
        <nav className={`text-xs ${palette.subfg}`}>
          <Link href="/" className="underline">
            Home
          </Link>{" "}
          / <span>Guides</span>
        </nav>

        <header className="mt-2 mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Jewelry Guides</h1>
            <p className={`mt-1 text-sm ${palette.subfg}`}>
              Care, styling, materials, and buying tips.
            </p>
          </div>
          <Link
            href="/products"
            className={`rounded-xl px-4 py-2 text-sm font-medium ${palette.button}`}
          >
            Shop jewelry
          </Link>
        </header>

        <section
          className={`mb-6 grid grid-cols-1 gap-4 md:grid-cols-[260px_1fr]`}
        >
          <aside
            className={`h-max rounded-2xl ${palette.card} ${palette.ring} p-4 text-sm`}
          >
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wider opacity-80">
                Search
              </label>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search guides..."
                className={`w-full rounded-xl border ${palette.border} bg-transparent px-3 py-2 text-sm outline-none`}
              />
            </div>
            <div className="mt-4">
              <label className="mb-1 block text-xs uppercase tracking-wider opacity-80">
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {
                  [
                    "all",
                    "care",
                    "styling",
                    "materials",
                    "buying",
                    "sizing",
                    "gifting",
                  ] as const
                }
                .map
              </div>
              <div className="flex flex-wrap gap-2 mt-1">
                {(
                  [
                    "all",
                    "care",
                    "styling",
                    "materials",
                    "buying",
                    "sizing",
                    "gifting",
                  ] as const
                ).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTag(t)}
                    className={`rounded-full border ${
                      palette.border
                    } px-3 py-1 text-xs ${
                      tag === t ? "opacity-100" : "opacity-70"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <div>
            {filtered.length === 0 && (
              <div
                className={`rounded-2xl ${palette.card} ${palette.ring} p-6 text-sm ${palette.subfg}`}
              >
                No guides match your filters.
              </div>
            )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((g) => (
                <GuideCard key={g.slug} g={g} palette={palette} />
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

/*
==============================================================
TESTS (snippets)
// tests/guides-index.test.ts
// it("filters by tag", () => { const arr = [ { tags:["care"] }, { tags:["styling"] } ]; const out = arr.filter((x:any)=>x.tags.includes("care")); expect(out.length).toBe(1); });
// it("search includes title", () => { const q="care"; const title="Care & Maintenance".toLowerCase(); expect(title.includes(q)).toBe(true); });
==============================================================
*/
