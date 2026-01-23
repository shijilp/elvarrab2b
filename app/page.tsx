"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import SectionTitle from "@/components/SectionTitle";

export default function Page() {
  const [tier, setTier] = useState<"starter" | "growth" | "enterprise">(
    "starter",
  );

  const pricing = useMemo(() => {
    switch (tier) {
      case "growth":
        return {
          title: "Growth Retailers",
          subtitle: "Better margins + faster replenishment",
          bullets: [
            "MOQ 10 per SKU (mix allowed)",
            "Tiered pricing (deeper slabs)",
            "Priority restock alerts",
            "Custom pouch + thank-you cards",
          ],
          cta: {
            label: "Request Growth Pricing",
            href: "/wholesale-inquiry?tier=growth",
          },
        };
      case "enterprise":
        return {
          title: "Enterprise / Private Label",
          subtitle: "Branding + consistent bulk supply",
          bullets: [
            "MOQ 25–50 per SKU (based on style)",
            "Private-label packaging options",
            "Dedicated account manager",
            "Batch-level QC + compliance documentation",
          ],
          cta: {
            label: "Talk to Sales",
            href: "/contact",
          },
        };
      default:
        return {
          title: "Starter (New Retailers)",
          subtitle: "Small MOQ to test demand",
          bullets: [
            "MOQ 3 per SKU",
            "Starter pricing slabs",
            "Fast dispatch for in-stock pieces",
            "Simple reorder workflow",
          ],
          cta: {
            label: "Request Pricing",
            href: "/products",
          },
        };
    }
  }, [tier]);

  return (
    <main>
      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="pointer-events-none absolute -inset-24 opacity-40 blur-3xl gradient-accent rounded-[120px]" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/5 dark:to-black/30" />
        </div>

        <div className="container mx-auto grid grid-cols-1 gap-10 py-14 lg:grid-cols-2 lg:items-center lg:py-20">
          <div>
            <p className="text-xs tracking-[0.28em] opacity-80">
              ELVARRA WHOLESALE • B2B SUPPLY
            </p>

            <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
              Premium Jewellery Supply{" "}
              <span className="opacity-80">for Modern Retailers</span>
            </h1>

            <p className="mt-4 max-w-xl text-base text-neutral-600 dark:text-neutral-300">
              Flexible MOQ, tiered pricing, consistent plating specs, and
              packaging options — built for boutiques, resellers, and gifting
              businesses.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/products"
                className="rounded-full px-5 py-3 text-sm font-medium text-neutral-900 hover:brightness-110 dark:text-neutral-900 btn-gradient-accent"
              >
                Open Wholesale Catalog
              </Link>

              <Link
                href="/products"
                className="rounded-full border border-neutral-200 px-5 py-3 text-sm hover:bg-white/5 dark:border-neutral-800"
              >
                Request quote
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs opacity-80">
              <span className="rounded-full border border-neutral-200 px-3 py-1.5 dark:border-neutral-800">
                MOQ from 3 / SKU
              </span>
              <span className="rounded-full border border-neutral-200 px-3 py-1.5 dark:border-neutral-800">
                Dispatch 2–10 days
              </span>
              {/* <span className="rounded-full border border-neutral-200 px-3 py-1.5 dark:border-neutral-800">
                DDP / DAP Options
              </span> */}
              <span className="rounded-full border border-neutral-200 px-3 py-1.5 dark:border-neutral-800">
                Nickel-safe finishes
              </span>
            </div>

            {/* Quick trust row */}
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { k: "200+", v: "Styles" },
                { k: "QC", v: "Quality Products" },
                { k: "3–5", v: "Pricing slabs" },
                { k: "Fast", v: "Reorders" },
              ].map((x) => (
                <div
                  key={x.k}
                  className="rounded-2xl border border-neutral-200 bg-white/70 p-4 text-center dark:border-neutral-800 dark:bg-neutral-900/50"
                >
                  <div className="text-lg font-semibold">{x.k}</div>
                  <div className="mt-1 text-xs opacity-70">{x.v}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl p-2 shadow-2xl ring-1 ring-neutral-200 dark:ring-neutral-800 bg-white/90 dark:bg-neutral-900/70">
              <Image
                src="/images/hero2.jpg"
                alt="Elvarra B2B hero"
                width={900}
                height={900}
                className="h-[420px] w-full rounded-2xl object-cover"
                priority
              />
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-5 left-6 rounded-2xl border border-neutral-200 bg-white/90 px-4 py-3 shadow-lg dark:border-neutral-800 dark:bg-neutral-950/70">
              <div className="text-xs opacity-70">Wholesale Program</div>
              <div className="text-sm font-medium">
                Boutiques • Resellers • Gifts
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VALUE PROPS */}
      <section className="container mx-auto py-12 lg:py-16">
        <div className="mb-6">
          <SectionTitle>Built for B2B</SectionTitle>
          <p className="mt-2 max-w-2xl text-sm text-neutral-600 dark:text-neutral-300">
            Everything you need to stock confidently — from consistency to
            packaging and reorder speed.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            {
              title: "Consistent Quality",
              desc: "Standardized plating specs, nickel-safe finishes, and batch QC checks to reduce returns.",
            },
            {
              title: "Tiered Pricing",
              desc: "Slabs that improve with volume — designed to protect your margins and simplify reordering.",
            },
            // {
            //   title: "Packaging Options",
            //   desc: "Branded boxes, pouches, and insert cards available for gifting-ready presentation.",
            // },
            {
              title: "Fast Replenishment",
              desc: "In-stock dispatch with quick restocks for best sellers and seasonal spikes.",
            },
            {
              title: "Catalog-First Workflow",
              desc: "Browse by collection, place bulk orders, and generate a clean RFQ for approval.",
            },
            {
              title: "Support That Responds",
              desc: "Quotes and confirmations within 48 hours. Clear lead times, no surprises.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl ring-1 ring-neutral-200 bg-white/80 p-6 dark:ring-neutral-800 dark:bg-neutral-900/50"
            >
              <div className="text-lg font-medium">{f.title}</div>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING TIERS (NO PRODUCT LIST) */}
      <section id="tiers" className="container mx-auto py-12 lg:py-16">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <SectionTitle>Tiered Pricing</SectionTitle>
            <p className="mt-2 max-w-2xl text-sm text-neutral-600 dark:text-neutral-300">
              Choose a tier that matches your scale. You can upgrade anytime.
            </p>
          </div>

          {/* <TierTabs value={tier} onChange={setTier} /> */}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-3xl p-8 ring-1 ring-neutral-200 bg-white/80 dark:ring-neutral-800 dark:bg-neutral-900/50">
            <div className="text-xl font-semibold">{pricing.title}</div>
            <div className="mt-1 text-sm opacity-70">{pricing.subtitle}</div>

            <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {pricing.bullets.map((b) => (
                <li
                  key={b}
                  className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-200"
                >
                  <span className="mt-1 inline-block h-2 w-2 rounded-full btn-gradient-accent" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={pricing.cta.href}
                className="rounded-full px-5 py-3 text-sm font-medium text-neutral-900 dark:text-neutral-900 btn-gradient-accent"
              >
                {pricing.cta.label}
              </Link>
              <Link
                href="/b2b/catalog"
                className="rounded-full border border-neutral-200 px-5 py-3 text-sm hover:bg-white/5 dark:border-neutral-800"
              >
                Browse Catalog
              </Link>
            </div>

            <div className="mt-6 text-xs opacity-70">
              * Slabs & MOQ may vary by collection. Final confirmation shared on
              quote.
            </div>
          </div>

          <div className="rounded-3xl p-8 ring-1 ring-neutral-800 bg-neutral-900/70">
            <div className="text-sm tracking-[0.22em] opacity-70">
              QUICK QUOTE
            </div>
            <div className="mt-2 text-xl font-semibold">
              Get a line sheet in 24h
            </div>
            <p className="mt-2 text-sm text-neutral-300">
              Share your store name, country, and expected monthly quantity —
              we’ll respond with pricing + lead time.
            </p>

            <div className="mt-6 grid gap-3">
              <Link
                href="/wholesale-inquiry"
                className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-medium text-neutral-900 dark:text-neutral-900 btn-gradient-accent"
              >
                Request Quote
              </Link>
              <Link
                href="/b2b/login"
                className="inline-flex items-center justify-center rounded-xl border border-neutral-800 px-5 py-3 text-sm hover:bg-white/5"
              >
                Already approved? Login
              </Link>
            </div>

            <div className="mt-6 text-xs text-neutral-300/80">
              WhatsApp support + email confirmations available for bulk orders.
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how"
        className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16"
      >
        <h2 className="text-2xl font-semibold">How wholesale works</h2>
        <p className="mt-2 max-w-2xl text-sm text-neutral-600 dark:text-neutral-300">
          Simple, clear steps — from inquiry to delivery.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            {
              step: "1",
              title: "Apply / Inquiry",
              desc: "Tell us your business details, country, and what you plan to stock. We reply within 24 hours.",
            },
            {
              step: "2",
              title: "Quote + Tier",
              desc: "We share tiered pricing, MOQ, and lead time. You confirm the tier and packaging requirements.",
            },
            {
              step: "3",
              title: "QC + Dispatch",
              desc: "Batch QC → packing → shipping options (DDP/DAP). Tracking shared as soon as dispatched.",
            },
          ].map((s) => (
            <div
              key={s.step}
              className="rounded-2xl ring-1 ring-neutral-200 bg-white/90 p-6 dark:ring-neutral-800 dark:bg-neutral-900/70"
            >
              <div className="text-3xl font-semibold">{s.step}</div>
              <div className="mt-2 text-lg font-medium">{s.title}</div>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT (keep, but rewrite as B2B oriented) */}

      {/* FAQ */}
      <section className="container mx-auto py-12 lg:py-16">
        <div className="mb-6">
          <SectionTitle>Wholesale FAQs</SectionTitle>
          <p className="mt-2 max-w-2xl text-sm text-neutral-600 dark:text-neutral-300">
            Quick answers for retailers and resellers.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FaqItem
            q="Do you require a business registration?"
            a="For standard wholesale access, yes (GST / business proof helps). For starter tier, we can review on a case-by-case basis."
          />
          <FaqItem
            q="What’s the MOQ?"
            a="MOQ starts from 5 per SKU for starter. Higher tiers have better slabs and packaging options."
          />
          <FaqItem
            q="Do you offer private label?"
            a="Yes. Packaging and inserts can be customized on enterprise tier, subject to MOQ and lead time."
          />
          <FaqItem
            q="Where do you ship from?"
            a="We support dispatch from KSA/India depending on stock and order type. DDP/DAP options can be arranged."
          />
        </div>
      </section>
    </main>
  );
}

/* ---------------- Components ---------------- */

function TierTabs({
  value,
  onChange,
}: {
  value: "starter" | "growth" | "enterprise";
  onChange: (v: "starter" | "growth" | "enterprise") => void;
}) {
  const tabs: { key: typeof value; label: string }[] = [
    { key: "starter", label: "Starter" },
    { key: "growth", label: "Growth" },
    { key: "enterprise", label: "Enterprise" },
  ];

  return (
    <div className="inline-flex rounded-full border border-neutral-200 p-1 dark:border-neutral-800">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`rounded-full px-4 py-2 text-xs transition ${
            value === t.key
              ? "btn-gradient-accent text-neutral-900"
              : "hover:bg-white/5"
          }`}
          aria-pressed={value === t.key}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <div className="rounded-2xl ring-1 ring-neutral-200 bg-white/80 p-6 dark:ring-neutral-800 dark:bg-neutral-900/50">
      <div className="text-sm font-medium">{q}</div>
      <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">{a}</p>
    </div>
  );
}

function InstagramIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      viewBox="0 0 24 24"
      className="h-5 w-5"
    >
      <path
        d="M7 2C4.24 2 2 4.24 2 7v10c0 2.76 2.24 5 5 5h10c2.76 
      0 5-2.24 5-5V7c0-2.76-2.24-5-5-5H7zm0-2h10c3.87 
      0 7 3.13 7 7v10c0 3.87-3.13 7-7 7H7c-3.87 
      0-7-3.13-7-7V7c0-3.87 3.13-7 7-7zm5 
      7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 
      2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm4.5-3a1.5 
      1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z"
      />
    </svg>
  );
}
