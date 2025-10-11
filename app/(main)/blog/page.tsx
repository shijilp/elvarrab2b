"use client";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

// ==============================================================
// Elvarra / Elvara — Guides Index (Redesigned)
// Route suggestion: app/guides/page.tsx
// - Luxury dark theme (black + gold)
// - Featured hero card + grid
// - Search, tag filters (with counts), sort, view toggle
// - Polished card hovers, focus rings, and empty state
// - No external UI libs required
// ==============================================================

type ThemeMode = "dark" | "light";
type Palette = {
  bg: string;
  fg: string;
  subfg: string;
  card: string;
  border: string;
  ring: string;
  chip: string;
  chipFg: string;
  accentFrom: string;
  accentTo: string;
  btnFg: string;
  mutedCard: string;
};

function paletteForTheme(theme: ThemeMode): Palette {
  return theme === "dark"
    ? {
        bg: "bg-neutral-950",
        fg: "text-neutral-50",
        subfg: "text-neutral-300",
        card: "bg-neutral-900/70",
        border: "border-neutral-800",
        ring: "ring-1 ring-neutral-800",
        chip: "bg-yellow-500/20",
        chipFg: "text-yellow-300",
        accentFrom: "from-yellow-500",
        accentTo: "to-amber-500",
        btnFg: "text-neutral-900",
        mutedCard: "bg-neutral-900/50",
      }
    : {
        bg: "bg-neutral-50",
        fg: "text-neutral-900",
        subfg: "text-neutral-600",
        card: "bg-white/90",
        border: "border-neutral-200",
        ring: "ring-1 ring-neutral-200",
        chip: "bg-neutral-900/10",
        chipFg: "text-neutral-900",
        accentFrom: "from-rose-400",
        accentTo: "to-pink-500",
        btnFg: "text-white",
        mutedCard: "bg-white/70",
      };
}

export type Guide = {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  tags: ("care" | "styling" | "materials" | "buying" | "sizing" | "gifting")[];
  readMins: number;
  featured?: boolean;
};

const ALL_GUIDES: Guide[] = [
  {
    slug: "fashion-jewelry",
    title: "Fashion Jewelry 101",
    excerpt: "How to choose, style, and care for everyday pieces—start here.",
    image: "/images/about-2.jpg",
    tags: ["buying", "styling", "care"],
    readMins: 6,
    featured: true,
  },
  {
    slug: "care",
    title: "Care & Maintenance",
    excerpt: "Cleaning, storage, and longevity tips to keep your shine.",
    image: "/images/about-3.jpg",
    tags: ["care"],
    readMins: 5,
  },
  {
    slug: "layering-and-styling",
    title: "Layering & Styling",
    excerpt: "Master layering: chains, pendants, cuffs, and ring stacks.",
    image: "/images/about-4.jpg",
    tags: ["styling"],
    readMins: 7,
  },
  {
    slug: "materials-guide",
    title: "Materials & Plating",
    excerpt: "Gold plating, stainless, brass, rhodium—what's the difference?",
    image: "/images/about-1.jpg",
    tags: ["materials"],
    readMins: 8,
  },
  {
    slug: "gifting-guide",
    title: "Gifting Guide",
    excerpt: "Occasion-based picks and sizing tips for effortless gifting.",
    image: "/images/product-08.jpg",
    tags: ["gifting", "buying"],
    readMins: 4,
  },
];

const TAGS = [
  "all",
  "care",
  "styling",
  "materials",
  "buying",
  "sizing",
  "gifting",
] as const;

type SortKey = "recent" | "readtime" | "title";

function GuideCard({
  g,
  palette,
  view,
}: {
  g: Guide;
  palette: Palette;
  view: "grid" | "list";
}) {
  return (
    <Link
      href={`/blog/${g.slug}`}
      className={`group overflow-hidden rounded-2xl ${palette.ring} ${palette.card} focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500/60 transition-shadow`}
    >
      <div className={`relative ${view === "list" ? "sm:flex" : ""}`}>
        <Image
          width={800}
          height={600}
          src={g.image}
          alt={g.title}
          className={`${
            view === "list" ? "sm:w-64 sm:h-44" : "w-full"
          } aspect-[4/3] object-cover transition-transform duration-300 group-hover:scale-105`}
          priority={g.featured}
        />
        <span
          className={`absolute left-2 top-2 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wider ${palette.chip} ${palette.chipFg} backdrop-blur`}
        >
          {g.readMins} min read
        </span>
      </div>
      <div className={`p-4 ${view === "list" ? "sm:pl-6" : ""}`}>
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold leading-tight line-clamp-2">
            {g.title}
          </h3>
          <span
            className={`hidden sm:inline-block rounded-full border ${palette.border} px-2 py-0.5 text-[10px] ${palette.subfg}`}
          >
            {g.tags[0]}
          </span>
        </div>
        <p className={`mt-2 text-sm ${palette.subfg} line-clamp-2`}>
          {g.excerpt}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
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
    </Link>
  );
}

function FeaturedCard({ g, palette }: { g: Guide; palette: Palette }) {
  return (
    <Link
      href={`/blog/${g.slug}`}
      className={`relative overflow-hidden rounded-3xl ${palette.ring} ${palette.card} block`}
    >
      <div className="relative">
        <Image
          width={1600}
          height={900}
          src={"/images/about-2.jpg"}
          alt={g.title}
          className="aspect-[21/9] w-full object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-yellow-500 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-900 shadow">
            Editor’s pick • {g.readMins} min read
          </span>
          <h2 className="mt-3 text-2xl sm:text-3xl font-semibold text-white drop-shadow-lg">
            {g.title}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-neutral-200 line-clamp-2">
            {g.excerpt}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default function GuidesIndexPage() {
  const theme: ThemeMode = "dark";
  const palette = useMemo(() => paletteForTheme(theme), [theme]);

  // search, tag, sort, view
  const [q, setQ] = useState("");
  const [tag, setTag] = useState<(typeof TAGS)[number]>("all");
  const [sort, setSort] = useState<SortKey>("recent");
  const [view, setView] = useState<"grid" | "list">("grid");

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of TAGS) map.set(t, 0);
    for (const g of ALL_GUIDES) {
      for (const t of g.tags) map.set(t, (map.get(t) || 0) + 1);
    }
    map.set("all", ALL_GUIDES.length);
    return map;
  }, []);

  const filtered = useMemo(() => {
    let base = ALL_GUIDES.filter((g) =>
      q.trim()
        ? [g.title, g.excerpt, ...g.tags]
            .join(" ")
            .toLowerCase()
            .includes(q.toLowerCase())
        : true
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (tag !== "all") base = base.filter((g) => g.tags.includes(tag as any));
    switch (sort) {
      case "readtime":
        base = [...base].sort((a, b) => a.readMins - b.readMins);
        break;
      case "title":
        base = [...base].sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        // "recent" — keep original order (pretend data is newest-first)
        break;
    }
    return base;
  }, [q, tag, sort]);

  const featured = useMemo(
    () =>
      filtered.find((g) => g.featured) || ALL_GUIDES.find((g) => g.featured),
    [filtered]
  );
  const rest = useMemo(
    () => filtered.filter((g) => g.slug !== featured?.slug),
    [filtered, featured]
  );

  return (
    <main className={`${palette.bg} ${palette.fg} min-h-screen antialiased`}>
      <div className="container mx-auto px-4 py-10">
        {/* Breadcrumbs */}
        <nav className={`text-xs ${palette.subfg}`} aria-label="Breadcrumb">
          <Link
            href="/"
            className="underline underline-offset-2 hover:opacity-80"
          >
            Home
          </Link>
          <span className="mx-1">/</span>
          <span>Blogs</span>
        </nav>

        {/* Header */}
        <header className="mt-3 mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Jewelry Guides
            </h1>
            <p className={`mt-1 text-sm ${palette.subfg}`}>
              Care, styling, materials, and buying tips curated by Elvarra.
            </p>
          </div>
          <Link
            href="/products"
            className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium bg-gradient-to-r ${palette.accentFrom} ${palette.accentTo} ${palette.btnFg} shadow hover:brightness-110 transition`}
          >
            Shop jewelry
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path
                fillRule="evenodd"
                d="M3 10a.75.75 0 0 1 .75-.75h9.638L10.23 6.293a.75.75 0 1 1 1.06-1.06l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 1 1-1.06-1.06l3.158-2.957H3.75A.75.75 0 0 1 3 10Z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </header>

        {/* Controls */}
        <section
          className={`mb-6 grid grid-cols-1 gap-4 md:grid-cols-[260px_1fr]`}
        >
          {/* Sidebar */}
          <aside
            className={`h-max rounded-2xl ${palette.card} ${palette.ring} p-4 text-sm`}
          >
            {/* Search */}
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wider opacity-80">
                Search
              </label>
              <div className={`relative`}>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search guides…"
                  className={`w-full rounded-xl border ${palette.border} bg-transparent px-3 py-2 pl-9 text-sm outline-none focus:ring-2 focus:ring-yellow-500/40`}
                />
                <svg
                  className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 opacity-60"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m21 21-4.35-4.35M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z"
                  />
                </svg>
              </div>
            </div>

            {/* Tags */}
            <div className="mt-4">
              <label className="mb-1 block text-xs uppercase tracking-wider opacity-80">
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {TAGS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTag(t)}
                    className={`inline-flex items-center gap-1 rounded-full border ${
                      palette.border
                    } px-3 py-1 text-xs transition ${
                      tag === t
                        ? "bg-yellow-500/10 ring-1 ring-yellow-500/40"
                        : "opacity-80 hover:opacity-100"
                    }`}
                    aria-pressed={tag === t}
                  >
                    <span className={tag === t ? "text-yellow-300" : ""}>
                      {t}
                    </span>
                    <span className={`text-[10px] ${palette.subfg}`}>
                      • {counts.get(t)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* View & Sort */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider opacity-80">
                  View
                </label>
                <div className="flex rounded-xl overflow-hidden border ${palette.border}">
                  <button
                    onClick={() => setView("grid")}
                    className={`flex-1 px-3 py-1.5 text-xs ${
                      view === "grid" ? "bg-yellow-500/20" : "hover:bg-white/5"
                    }`}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setView("list")}
                    className={`flex-1 px-3 py-1.5 text-xs ${
                      view === "list" ? "bg-yellow-500/20" : "hover:bg-white/5"
                    }`}
                  >
                    List
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider opacity-80">
                  Sort
                </label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className={`w-full rounded-xl border ${palette.border} bg-transparent px-3 py-2 text-xs focus:ring-2 focus:ring-yellow-500/40`}
                >
                  <option value="recent">Most recent</option>
                  <option value="readtime">Shortest read</option>
                  <option value="title">Title A–Z</option>
                </select>
              </div>
            </div>
          </aside>

          {/* Content */}
          <div className="space-y-4">
            {/* Featured */}
            {featured && <FeaturedCard g={featured} palette={palette} />}

            {/* Results */}
            {rest.length === 0 ? (
              <div
                className={`rounded-2xl ${palette.mutedCard} ${palette.ring} p-8 text-sm ${palette.subfg}`}
              >
                No guides match your filters.
              </div>
            ) : view === "grid" ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {rest.map((g) => (
                  <GuideCard key={g.slug} g={g} palette={palette} view="grid" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {rest.map((g) => (
                  <GuideCard key={g.slug} g={g} palette={palette} view="list" />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA band */}
        <section
          className={`mt-10 overflow-hidden rounded-3xl ${palette.ring} ${palette.card}`}
        >
          <div className={`relative isolate px-6 py-8 sm:px-10 sm:py-10`}>
            <div
              className={`pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r ${palette.accentFrom} ${palette.accentTo} opacity-10`}
            />
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  New arrivals: the Elvarra Edit
                </h3>
                <p className={`mt-1 text-sm ${palette.subfg}`}>
                  Curated pieces that pair perfectly with this season’s looks.
                </p>
              </div>
              <Link
                href="/collections/new"
                className={`rounded-2xl px-4 py-2 text-sm font-medium bg-gradient-to-r ${palette.accentFrom} ${palette.accentTo} ${palette.btnFg} shadow hover:brightness-110 transition`}
              >
                Explore collection
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
