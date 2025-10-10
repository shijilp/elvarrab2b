"use client";

import { PromoBanner } from "@/components/PromoBanner";
import { api } from "@/lib/api";
import { money } from "@/lib/utils";
import { Product } from "@/types";
import Image from "next/image";
import Link from "next/link";
import React, { JSX, useEffect, useMemo, useState } from "react";

/** ---------- Config (tweak freely) ---------- */
const COUPON_CODE = "EXTRA10";
const FESTIVAL_NAME = "Diwali Mega Sale";
const SALE_DAYS = 7; // countdown length (days) — change if needed
const FESTIVAL_START = new Date("2025-10-20T00:00:00+03:00");
const FESTIVAL_END = new Date("2025-11-05T23:59:59+03:00");
export default function DealsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState<Date>(new Date());
  // Filters
  const [activeBand, setActiveBand] = useState<
    "all" | "u999" | "1kto2k" | "2kplus"
  >("all");
  const [festivalOnly, setFestivalOnly] = useState<boolean>(true); // toggle for tag=deal by default

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000); // tick every minute
    return () => clearInterval(id);
  }, []);
  const festivalMode = now >= FESTIVAL_START && now <= FESTIVAL_END;
  // Default filters behave smarter in festival window
  useEffect(() => {
    if (festivalMode) setFestivalOnly(true);
  }, [festivalMode]);

  useEffect(() => {
    let mounted = true;
    Promise.all([api.get("/portfolio/?tags_all=deal")])
      .then(([pRes]) => {
        if (!mounted) return;
        setProducts(pRes.data.results ?? pRes.data ?? []);
      })
      .catch((err) => console.error("Failed to fetch:", err))
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    let list = [...products];

    if (festivalOnly) {
      // keep “deal” items; if your Product has tags array/field adjust here
      list = list.filter(
        (p) =>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (p as any)?.tag?.toString()?.toLowerCase()?.includes("deal") || true
      );
    }

    if (activeBand === "u999") list = list.filter((p) => (p.price ?? 0) < 999);
    if (activeBand === "1kto2k")
      list = list.filter(
        (p) => (p.price ?? 0) >= 999 && (p.price ?? 0) <= 1999
      );
    if (activeBand === "2kplus")
      list = list.filter((p) => (p.price ?? 0) >= 2000);

    return list;
  }, [products, activeBand, festivalOnly]);

  return (
    <main className="relative min-h-screen bg-neutral-950 text-neutral-50 antialiased overflow-hidden">
      {/* Page-scoped festive aura */}
      {festivalMode && <FestiveBackdrop />}
      {/* Top promo (kept) */}
      <PromoBanner
        id={festivalMode ? "flash-deal-festival" : "flash-deal"}
        message={
          festivalMode
            ? `Festival is live: extra 10% off with ${COUPON_CODE}`
            : "Today’s best deals — limited stock"
        }
        ctaText={festivalMode ? `Use ${COUPON_CODE}` : "Shop deals"}
        href="/deals"
        accent={festivalMode ? "emerald" : "yellow"}
      />

      {festivalMode ? (
        <>
          {/* FESTIVAL-ONLY */}
          <FestiveHero
            endsAt={
              new Date(Math.min(+FESTIVAL_END, +now + 7 * 24 * 60 * 60 * 1000))
            }
          />
          <OfferMarquee
            items={[
              "🪔 Free Gift on ₹1,999+",
              `✨ Extra 10% with code ${COUPON_CODE}`,
              "🚚 Fast Shipping",
              "🎁 Gift Wrap Available",
            ]}
          />
        </>
      ) : (
        // NON-FESTIVAL hero (simple, neutral)
        <section className="container py-10 mx-auto">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950/50 p-6 text-center">
            <h1 className="text-3xl font-semibold">Today’s Deals</h1>
            <p className="mt-2 text-neutral-300">
              Fresh markdowns across bestsellers. Limited stock.
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <a
                href="/collections/premium"
                className="rounded-full border border-neutral-700 px-4 py-2"
              >
                Premium Collection
              </a>
              <a
                href="/new-arrivals"
                className="rounded-full bg-neutral-200 text-neutral-900 px-4 py-2"
              >
                New Arrivals
              </a>
            </div>
          </div>
        </section>
      )}

      <div className="container py-8 mx-auto">
        {/* Header Row */}
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Today’s Festival Deals</h1>
            <p className="mt-1 text-sm text-neutral-300">
              Hand-picked discounts across bestsellers — festival edition.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <FilterPill
              active={activeBand === "all"}
              onClick={() => setActiveBand("all")}
              label="All"
            />
            <FilterPill
              active={activeBand === "u999"}
              onClick={() => setActiveBand("u999")}
              label="Under ₹999"
            />
            <FilterPill
              active={activeBand === "1kto2k"}
              onClick={() => setActiveBand("1kto2k")}
              label="₹999–₹1,999"
            />
            <FilterPill
              active={activeBand === "2kplus"}
              onClick={() => setActiveBand("2kplus")}
              label="₹2,000+"
            />

            <ToggleChip
              checked={festivalOnly}
              onChange={setFestivalOnly}
              label="Festival Only"
            />
            <Link
              href="/"
              className="ml-auto rounded-xl px-4 py-2 text-sm font-medium bg-gradient-to-r from-amber-500 to-fuchsia-500 text-neutral-900 hover:brightness-110"
            >
              Back to shop
            </Link>
          </div>
        </header>

        {/* Products */}
        {loading ? (
          <GridSkeleton />
        ) : (
          <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((d) => {
              const pct =
                d.compare_at_price && d.compare_at_price > d.price
                  ? Math.round(
                      ((d.compare_at_price - d.price) / d.compare_at_price) *
                        100
                    )
                  : null;

              return (
                <a
                  key={d.slug}
                  href={`/products/${d.slug}`}
                  className="group relative overflow-hidden rounded-2xl ring-1 ring-neutral-800 bg-neutral-900/70 shadow-[0_0_0_0_rgba(0,0,0,0)]
                             hover:shadow-[0_0_40px_-10px_rgba(245,158,11,0.45)] transition-all duration-300"
                >
                  {/* Festive corner ribbon */}
                  {pct ? (
                    <PromoRibbon text={`${pct}% OFF`} color="festival" />
                  ) : (
                    <PromoRibbon text="Deal" color="emerald" />
                  )}

                  {/* Image */}
                  <Image
                    width={640}
                    height={640}
                    src={d.image}
                    alt={d.name}
                    className="aspect-[4/5] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />

                  {/* Body */}
                  <div className="p-3">
                    <div className="text-sm font-medium line-clamp-2">
                      {d.name}
                    </div>
                    <div className="mt-1 text-sm">
                      <span className="mr-2 font-semibold">
                        {money(d.price, "INR")}
                      </span>
                      {d.compare_at_price ? (
                        <span className="text-xs line-through text-neutral-400">
                          {money(d.compare_at_price)}
                        </span>
                      ) : null}
                    </div>

                    {/* Festival badge */}
                    <span
                      className="mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider
                                      bg-gradient-to-r from-amber-500 to-fuchsia-500 text-neutral-900"
                    >
                      🪔 Festival Price
                    </span>
                  </div>

                  {/* Glow border on hover */}
                  <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-transparent group-hover:ring-amber-400/30" />
                </a>
              );
            })}
          </section>
        )}
      </div>

      {/* Floating Festival Bar */}
      {festivalMode && <FloatingFestivalBar coupon={COUPON_CODE} />}
    </main>
  );
}

/* ---------- Backdrop ---------- */
function FestiveBackdrop(): JSX.Element {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10"
      style={{
        background:
          "radial-gradient(600px 200px at 15% -10%, rgba(245,158,11,0.25), transparent 60%), radial-gradient(600px 200px at 85% 0%, rgba(217,70,239,0.18), transparent 60%)",
        maskImage: "linear-gradient(#000, rgba(0,0,0,0.7))",
      }}
    />
  );
}

/* ---------- Hero ---------- */
function FestiveHero({ endsAt }: { endsAt: Date }) {
  return (
    <section className="relative ">
      <div className="container py-10 md:py-14 mx-auto">
        <div
          className="rounded-3xl border border-neutral-800 bg-neutral-950/40 p-6 md:p-10
                        ring-1 ring-neutral-800/60 backdrop-blur-sm overflow-hidden"
        >
          {/* Subtle confetti */}
          <div
            aria-hidden
            className="absolute inset-0 -z-10 opacity-[0.06]"
            style={{
              backgroundImage:
                "repeating-conic-gradient(from 45deg, rgba(255,255,255,0.6) 0 8deg, transparent 10deg 20deg)",
              maskImage:
                "radial-gradient(70% 100% at 50% 0%, #000 40%, transparent 100%)",
            }}
          />
          <div className="flex flex-col items-center text-center">
            <p className="text-xs tracking-widest uppercase text-amber-300/90">
              Limited Time • Festival Exclusive
            </p>
            <h1 className="mt-2 text-3xl md:text-5xl font-semibold leading-tight bg-gradient-to-r from-amber-400 via-yellow-200 to-fuchsia-400 bg-clip-text text-transparent">
              {FESTIVAL_NAME}
            </h1>
            <p className="mt-3 max-w-2xl text-neutral-300">
              Premium sparkle for celebration season — stack the{" "}
              <span className="text-amber-300 font-semibold">
                {COUPON_CODE}
              </span>{" "}
              coupon on already-reduced prices.
            </p>

            <div className="mt-6 flex flex-col items-center gap-4">
              <Countdown endsAt={endsAt} />
              <div className="flex flex-wrap justify-center gap-2">
                <Link
                  href="#"
                  className="rounded-full bg-gradient-to-r from-amber-500 to-fuchsia-500 px-5 py-2 font-semibold text-neutral-900 hover:scale-[1.03] transition-transform"
                >
                  Shop Festival Picks
                </Link>
                <Link
                  href="/products/premium"
                  className="rounded-full border border-neutral-700 px-5 py-2 font-semibold text-neutral-200 hover:bg-neutral-800 transition-colors"
                >
                  Premium Collection
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Countdown ---------- */
function Countdown({ endsAt }: { endsAt: Date }) {
  const [, setNow] = useState<number>(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, endsAt.getTime() - Date.now());
  const d = Math.floor(diff / (24 * 60 * 60 * 1000));
  const h = Math.floor((diff / (60 * 60 * 1000)) % 24);
  const m = Math.floor((diff / (60 * 1000)) % 60);
  const s = Math.floor((diff / 1000) % 60);

  const unit = (n: number, label: string) => (
    <div className="min-w-[64px] rounded-xl bg-neutral-900/70 ring-1 ring-neutral-800 px-3 py-2">
      <div className="text-xl font-bold tabular-nums">
        {n.toString().padStart(2, "0")}
      </div>
      <div className="text-[10px] uppercase tracking-wider text-neutral-400">
        {label}
      </div>
    </div>
  );

  return (
    <div className="flex items-center gap-2">
      {unit(d, "Days")}
      {unit(h, "Hours")}
      {unit(m, "Mins")}
      {unit(s, "Secs")}
    </div>
  );
}

/* ---------- Marquee ---------- */
function OfferMarquee({ items }: { items: string[] }) {
  return (
    <div className="border-y border-neutral-800 bg-neutral-950/60">
      <div className="relative overflow-hidden py-2">
        <div className="animate-[scroll_20s_linear_infinite] whitespace-nowrap text-sm text-neutral-300">
          {items.concat(items).map((it, idx) => (
            <span key={idx} className="mx-6">
              {it}
            </span>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
      `}</style>
    </div>
  );
}

/* ---------- Filter / Toggle Chips ---------- */
function FilterPill({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "rounded-full px-3 py-1 text-xs font-semibold ring-1 transition-colors",
        active
          ? "bg-gradient-to-r from-amber-500 to-fuchsia-500 text-neutral-900 ring-transparent"
          : "bg-neutral-900/60 text-neutral-200 ring-neutral-700 hover:bg-neutral-800",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function ToggleChip({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={[
        "rounded-full px-3 py-1 text-xs font-semibold ring-1 transition-colors inline-flex items-center gap-1",
        checked
          ? "bg-gradient-to-r from-emerald-400 to-teal-400 text-neutral-900 ring-transparent"
          : "bg-neutral-900/60 text-neutral-200 ring-neutral-700 hover:bg-neutral-800",
      ].join(" ")}
      aria-pressed={checked}
    >
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ background: checked ? "black" : "#22c55e" }}
      />
      {label}
    </button>
  );
}

/* ---------- Skeleton ---------- */
function GridSkeleton() {
  return (
    <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse overflow-hidden rounded-2xl ring-1 ring-neutral-800 bg-neutral-900/70"
        >
          <div className="aspect-[4/5] w-full bg-neutral-800/50" />
          <div className="p-3 space-y-2">
            <div className="h-4 w-3/4 bg-neutral-800/60 rounded" />
            <div className="h-3 w-1/2 bg-neutral-800/60 rounded" />
            <div className="h-5 w-24 bg-neutral-800/60 rounded-full" />
          </div>
        </div>
      ))}
    </section>
  );
}

/* ---------- Ribbon ---------- */
export type PromoRibbonProps = {
  text: string;
  color?: "yellow" | "pink" | "emerald" | "blue" | "festival";
};

function PromoRibbon({
  text,
  color = "yellow",
}: PromoRibbonProps): JSX.Element {
  const colorBg = (
    {
      yellow: "bg-amber-500 text-neutral-900",
      pink: "bg-pink-500 text-white",
      emerald: "bg-emerald-500 text-white",
      blue: "bg-sky-500 text-white",
      festival:
        "bg-gradient-to-r from-amber-500 to-fuchsia-500 text-neutral-900",
    } as const
  )[color];

  return (
    <div
      className={`absolute left-[-36px] top-4 rotate-[-45deg] ${colorBg} px-14 py-1 text-xs font-extrabold uppercase shadow`}
    >
      {text}
    </div>
  );
}

/* ---------- Floating Bottom Bar ---------- */
function FloatingFestivalBar({ coupon }: { coupon: string }) {
  return (
    <div className="fixed inset-x-3 bottom-3 z-50">
      <div className="mx-auto max-w-5xl rounded-2xl border border-neutral-800 bg-neutral-950/70 px-4 py-3 ring-1 ring-neutral-800 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/40">
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <div className="text-sm">
            <span className="mr-2 rounded-full bg-gradient-to-r from-amber-500 to-fuchsia-500 px-2 py-0.5 font-semibold text-neutral-900">
              Festival
            </span>
            <span className="text-neutral-300">
              Extra savings live. Use{" "}
              <span className="font-semibold text-amber-300">{coupon}</span> at
              checkout.
            </span>
          </div>
          <div className="flex gap-2">
            <a
              href="/deals"
              className="rounded-full bg-gradient-to-r from-amber-500 to-fuchsia-500 px-4 py-2 text-sm font-semibold text-neutral-900"
            >
              Shop Deals
            </a>
            <Link
              href="/"
              className="rounded-full border border-neutral-700 px-4 py-2 text-sm font-semibold text-neutral-200 hover:bg-neutral-800"
            >
              Back to Shop
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
