"use client";
import React from "react";

// ------------------------------------------------------------
// Elvara / Elvarra — WHOLESALE PRODUCT PAGE (B2B)
// Save as: app/product/[slug]/page.tsx
// ------------------------------------------------------------

export type ThemeMode = "dark" | "light";
export type Palette = {
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

function computeSavings(compareAt: number, price: number): number {
  const diff = Math.max(0, compareAt - price);
  return Math.round(diff * 100) / 100;
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className={`h-4 w-4 ${filled ? "fill-current" : "fill-transparent stroke-current"}`}
    >
      <path d="M10 1.6l2.35 4.76 5.25.76-3.8 3.7.9 5.22L10 13.95 5.3 16.04l.9-5.22-3.8-3.7 5.25-.76L10 1.6z" />
    </svg>
  );
}

export function StarRating({ value = 4.7, count = 128 }: { value?: number; count?: number }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  const stars = Array.from({ length: 5 }).map((_, i) => {
    const filled = i < full || (i === full && half);
    return <StarIcon key={i} filled={filled} />;
  });
  return (
    <div className="flex items-center gap-2 text-xs" aria-label={`Rating ${value.toFixed(1)} out of 5`}>
      <div className="flex items-center text-yellow-500">{stars}</div>
      <span className="opacity-80">{value.toFixed(1)} ({count})</span>
    </div>
  );
}

export default function ProductPage() {
  const theme: ThemeMode = "dark";
  const palette = paletteForTheme(theme);

  const product = {
    title: "Aurelia Pendant Necklace",
    sku: "ELV-AUR-PND-18G",
    priceRetail: 89,
    compareAtRetail: 109,
    tierPrices: [
      { min: 25, unit: 48 },
      { min: 100, unit: 42 },
      { min: 300, unit: 39 },
      { min: 1000, unit: 35 },
    ],
    moq: 25,
    leadTimeDays: "7–12 days (in‑stock)",
    origin: "KSA / India",
    plating: "18k gold‑plated brass, 0.5–1.0μm",
    compliance: "Nickel‑safe, hypoallergenic",
    shipping: "DDP/DAP available",
    description:
      "Wholesale‑ready pendant with lab‑grown stone. Consistent finish, batch QC, and shelf‑ready packaging options.",
    images: [
      "https://images.unsplash.com/photo-1603561596112-0e8e1f43d0a6?q=80&w=1400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1612392061783-45e1df9f0d4e?q=80&w=1400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=1400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1603575449153-8dd4f0a2f0f8?q=80&w=1400&auto=format&fit=crop",
    ],
    options: {
      metal: ["18k Gold", "Silver Rhodium", "Rose Gold"],
      length: ['16"', '18"', '20"'],
      packaging: ["Polybag", "Elvarra box", "Custom brand box"],
    },
    highlights: ["MOQ 25", "Tier pricing", "Private‑label ready", "Fast replenish"],
  } as const;

  const saveRetail = computeSavings(product.compareAtRetail, product.priceRetail);

  return (
    <main className={`${palette.bg} ${palette.fg} min-h-screen antialiased`}>
      {/* Breadcrumbs */}
      <nav className="mx-auto max-w-7xl px-4 pt-6 text-xs sm:px-6" aria-label="Breadcrumb">
        <ol className="flex flex-wrap gap-2 opacity-80">
          <li><a href="/" className="underline hover:opacity-100">Home</a></li>
          <li>/</li>
          <li><a href="/products" className="underline hover:opacity-100">Catalog</a></li>
          <li>/</li>
          <li aria-current="page" className="opacity-100">{product.title}</li>
        </ol>
      </nav>

      {/* Gallery + Info */}
      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-8 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:py-12">
        {/* Image gallery */}
        <div>
          <div className={`overflow-hidden rounded-3xl ${palette.ring} ${palette.card} p-2`}> 
            <img
              src={product.images[0]}
              alt={product.title}
              className="aspect-square w-full rounded-2xl object-cover transition-transform duration-300 hover:scale-[1.02]"
            />
          </div>
          <div className="mt-3 grid grid-cols-4 gap-3">
            {product.images.slice(1).map((src, i) => (
              <div key={i} className={`overflow-hidden rounded-2xl ${palette.ring}`}> 
                <img src={src} alt={`thumb-${i}`} className="aspect-square w-full object-cover transition-transform duration-300 hover:scale-105" />
              </div>
            ))}
          </div>
        </div>

        {/* Sticky info panel */}
        <div className="lg:sticky lg:top-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wider ${palette.chip}`}>Wholesale</span>
            <StarRating value={4.8} count={214} />
            <span className="text-xs opacity-80">SKU: {product.sku}</span>
          </div>

          <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">{product.title}</h1>
          <p className={`mt-2 ${palette.subfg}`}>{product.description}</p>

          {/* Retail reference (optional) */}
          <div className="mt-2 text-sm opacity-80">
            <span>Suggested retail: ${product.priceRetail}</span>
            <span className="ml-2 line-through">${product.compareAtRetail}</span>
            <span className="ml-2">(save ${saveRetail})</span>
          </div>

          {/* Tiered pricing */}
          <div className="mt-4">
            <h2 className="text-sm font-medium uppercase tracking-wider opacity-80">Tiered pricing</h2>
            <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {product.tierPrices.map((t) => (
                <div key={t.min} className={`rounded-2xl ${palette.ring} ${palette.card} p-4 text-center`}>
                  <div className="text-xs opacity-80">{t.min}+ units</div>
                  <div className="text-lg font-semibold">${t.unit}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider opacity-80">Metal</label>
              <div className="grid grid-cols-3 gap-2">
                {product.options.metal.map((opt) => (
                  <button key={opt} className={`rounded-xl border ${palette.border} px-3 py-2 text-sm hover:bg-white/5`} aria-label={`Choose ${opt}`}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider opacity-80">Length</label>
              <div className="grid grid-cols-3 gap-2">
                {product.options.length.map((opt) => (
                  <button key={opt} className={`rounded-xl border ${palette.border} px-3 py-2 text-sm hover:bg-white/5`} aria-label={`Choose length ${opt}`}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-xs uppercase tracking-wider opacity-80">Packaging</label>
              <div className="grid grid-cols-3 gap-2">
                {product.options.packaging.map((opt) => (
                  <button key={opt} className={`rounded-xl border ${palette.border} px-3 py-2 text-sm hover:bg-white/5`} aria-label={`Choose packaging ${opt}`}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Purchase / Quote Row */}
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-[120px_1fr_auto]">
            <div>
              <label className="mb-1 block text-xs opacity-80">Quantity (MOQ {product.moq})</label>
              <input
                type="number"
                defaultValue={product.moq}
                min={product.moq}
                step={product.moq}
                className={`w-full rounded-xl border ${palette.border} bg-transparent px-3 py-3 text-sm outline-none`}
                aria-label="Quantity"
              />
            </div>
            <a href="/wholesale-inquiry" className={`flex items-center justify-center rounded-xl px-5 py-3 text-sm font-medium ${palette.button}`}>
              Request Quote
            </a>
            <button className={`rounded-xl border ${palette.border} px-4 py-3 text-sm`}>Add to List</button>
          </div>

          {/* Logistics & Specs */}
          <div className={`mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm ${palette.subfg}`}>
            <div className={`rounded-2xl ${palette.ring} ${palette.card} p-4`}>
              <div className="font-medium text-base mb-1 text-current">Production</div>
              <div>Lead time: {product.leadTimeDays}</div>
              <div>Origin: {product.origin}</div>
              <div>Plating: {product.plating}</div>
              <div>Compliance: {product.compliance}</div>
            </div>
            <div className={`rounded-2xl ${palette.ring} ${palette.card} p-4`}>
              <div className="font-medium text-base mb-1 text-current">Logistics</div>
              <div>Shipping: {product.shipping}</div>
              <div>Trade terms: EXW / FOB / DAP / DDP</div>
              <div>Payment: 50% advance, 50% before dispatch</div>
            </div>
          </div>

          {/* Collapsible details */}
          <div className="mt-6 space-y-3">
            {[
              { q: "QC & Batch Consistency", a: "Batch QC with visual inspection and random pull testing. Finish tolerance within plating spec per SKU." },
              { q: "Private‑label Options", a: "Custom cards/boxes, barcode/price label, and outer cartons with your brand." },
              { q: "Returns & Warranty", a: "Manufacturing defects covered. Replacement in next batch or credit note." },
            ].map((item, i) => (
              <details key={i} className={`group rounded-2xl ${palette.ring} ${palette.card} p-4`}>
                <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium">
                  <span>{item.q}</span>
                  <span className="ml-4 transition group-open:rotate-45 opacity-60">＋</span>
                </summary>
                <p className={`mt-2 text-sm ${palette.subfg}`}>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Related wholesale SKUs */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <h2 className="text-2xl font-semibold">Related SKUs</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <a key={i} href="#" className={`group rounded-2xl ${palette.ring} ${palette.card} p-2`}>
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1589924641763-c68a3abf2f40?q=80&w=1200&auto=format&fit=crop"
                  className="aspect-[4/5] w-full rounded-xl object-cover"
                  alt="Related product"
                />
                <span className={`absolute left-2 top-2 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wider ${palette.chip}`}>
                  Fast‑moving
                </span>
              </div>
              <div className="p-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Seren Band Ring</span>
                  <span className="opacity-80">From $12</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
