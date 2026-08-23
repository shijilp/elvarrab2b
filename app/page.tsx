"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import SectionTitle from "@/components/SectionTitle";
import { trackEvent } from "@/lib/analytics";
import { getWholesaleRules } from "@/lib/wholesaleRules";
import { formatMoney, money } from "@/lib/utils";

export default function Page() {
  const [tier, setTier] = useState<"starter" | "growth" | "enterprise">(
    "starter",
  );
  useEffect(() => {
    trackEvent({
      event_type: "B2b_entry",
    });
  }, []);

  const pricing = useMemo(() => {
    switch (tier) {
      // case "growth":
      //   return {
      //     title: "Growth Retailers",
      //     subtitle: "Better margins + faster replenishment",
      //     bullets: [
      //       "MOQ 10 per SKU, mix allowed",
      //       "Tiered wholesale slabs",
      //       "Priority restock alerts",
      //       "Custom pouch + thank-you cards",
      //     ],
      //     cta: {
      //       label: "Request Growth Pricing",
      //       href: "/wholesale-inquiry?tier=growth",
      //     },
      //   };
      // case "enterprise":
      //   return {
      //     title: "Enterprise / Private Label",
      //     subtitle: "Branding + consistent bulk supply",
      //     bullets: [
      //       "MOQ 25–50 per SKU based on style",
      //       "Private-label packaging options",
      //       "Dedicated account support",
      //       "Batch-level QC + documentation",
      //     ],
      //     cta: {
      //       label: "Talk to Sales",
      //       href: "/contact",
      //     },
      //   };
      default:
        return {
          title: "Starter Trade Account",
          subtitle: "Small MOQ to test demand",
          bullets: [
            "MOQ 1-2 per SKU",
            "Starter wholesale slabs",
            "Fast dispatch for in-stock pieces",
            "Simple reorder workflow",
          ],
          cta: {
            label: "Open Trade Catalog",
            href: "/products",
          },
        };
    }
  }, [tier]);
  const minOrder = getWholesaleRules(100).minOrderValue;

  return (
    <>
      <main className="min-h-screen overflow-hidden bg-[#06111f] text-slate-100">
        {/* HERO */}
        <section className="relative isolate overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.22),transparent_38%),radial-gradient(circle_at_80%_20%,rgba(14,165,233,0.14),transparent_32%),linear-gradient(180deg,#06111f_0%,#081827_52%,#020617_100%)]" />
            <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.8)_1px,transparent_1px)] [background-size:48px_48px]" />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#020617] to-transparent" />
          </div>

          <div className="container mx-auto grid grid-cols-1 gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-20">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-blue-200">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Elvarra Trade Portal
              </div>

              <h1 className="mt-5 max-w-2xl text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
                Anti Tarnish Jewellery Wholesale Supplier in{" "}
                <span className="bg-gradient-to-r from-blue-200 via-sky-300 to-cyan-200 bg-clip-text text-transparent">
                  India
                </span>
              </h1>

              <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">
                Elvarra Wholesale supplies anti tarnish fashion jewellery in
                India for retailers, resellers, boutiques and online sellers.
                Shop wholesale rings, earrings, bracelets, necklaces and
                accessories with B2B pricing and MOQ rules.
              </p>
              <div className="mt-6 inline-flex items-start gap-3 rounded-2xl border border-amber-500/25 bg-gradient-to-r from-amber-500/10 to-orange-500/10 px-5 py-4">
                <div className="mt-0.5 rounded-full bg-amber-400 p-1">
                  <div className="h-2 w-2 rounded-full bg-[#06111f]" />
                </div>

                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-300">
                    Trade Policy
                  </div>

                  <p className="mt-1 text-sm leading-6 text-slate-200">
                    Minimum wholesale order value:
                    <span className="ml-2 font-bold text-white">
                      {formatMoney(minOrder)}
                    </span>
                  </p>

                  <p className="text-xs text-slate-400">
                    Orders below {formatMoney(minOrder)} are not eligible for
                    wholesale checkout.
                  </p>
                </div>
              </div>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  href="/catalog"
                  className="group relative overflow-hidden rounded-2xl border border-blue-500/40 bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3 text-sm font-bold text-white shadow-[0_18px_55px_-22px_rgba(59,130,246,.95)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_65px_-22px_rgba(59,130,246,1)]"
                >
                  <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />
                  <span className="relative z-10">Open Wholesale Catalog</span>
                </Link>

                <Link
                  href="/login"
                  className="rounded-2xl border border-slate-700 bg-slate-950/60 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-blue-400/70 hover:bg-blue-500/10 hover:text-white"
                >
                  Request Trade Access
                </Link>

                <Link
                  href="https://whatsapp.com/channel/0029Vb7xcDhEKyZKRpiYxa3v"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-2xl border border-emerald-400/40 bg-emerald-500/10 px-6 py-3 text-sm font-semibold text-emerald-300 transition hover:border-emerald-300 hover:bg-emerald-500/20 hover:text-emerald-200"
                >
                  Join WhatsApp Channel
                </Link>
              </div>

              <div className="mt-7 grid max-w-xl grid-cols-1 gap-3 text-xs text-slate-300 sm:grid-cols-3">
                {[
                  "MOQ from 1-3 / SKU",
                  "Trade pricing slabs",
                  "Fast reorder support",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3"
                  >
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { k: "200+", v: "Trade SKUs" },
                  { k: "QC", v: "Batch Check" },
                  { k: "3–5", v: "Price Slabs" },
                  { k: "Fast", v: "Reorders" },
                ].map((x) => (
                  <div
                    key={x.k}
                    className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-center shadow-[0_12px_40px_-28px_rgba(59,130,246,.7)]"
                  >
                    <div className="text-xl font-bold text-white">{x.k}</div>
                    <div className="mt-1 text-xs text-slate-400">{x.v}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-[2rem] bg-blue-500/10 blur-2xl" />
              <div className="relative overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-950/80 p-2 shadow-2xl">
                <Image
                  src="/images/hero2.jpg"
                  alt="Elvarra wholesale jewellery supply"
                  width={900}
                  height={900}
                  className="h-[420px] w-full rounded-[1.5rem] object-cover opacity-90"
                  priority
                />

                <div className="absolute left-5 top-5 rounded-2xl border border-blue-400/30 bg-slate-950/80 px-4 py-3 backdrop-blur">
                  <div className="text-[10px] uppercase tracking-[0.25em] text-blue-300">
                    Trade Account
                  </div>
                  <div className="mt-1 text-sm font-semibold text-white">
                    Approved B2B Buyers
                  </div>
                </div>

                <div className="absolute bottom-5 right-5 rounded-2xl border border-slate-700 bg-slate-950/85 px-4 py-3 backdrop-blur">
                  <div className="text-[10px] uppercase tracking-[0.25em] text-slate-400">
                    Order Flow
                  </div>
                  <div className="mt-1 text-sm font-semibold text-white">
                    Catalog → MOQ → Checkout
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* VALUE PROPS */}
        <section className="container mx-auto px-4 py-12 sm:px-6 lg:py-16">
          <div className="mb-6">
            <B2BSectionTitle>Built for B2B Buying</B2BSectionTitle>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Separate from retail shopping — this experience is made for stock
              planning, bulk decisions, reorders, and business margins.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              {
                title: "Trade Pricing",
                desc: "Wholesale slabs designed for resellers, boutiques, gift sellers, and repeat buyers.",
              },
              {
                title: "MOQ Control",
                desc: "Clear quantity and SKU rules before checkout to avoid order rejection.",
              },
              {
                title: "Replenishment Ready",
                desc: "A catalog workflow built for repeat stock movement and fast restocking.",
              },
              {
                title: "Quality Consistency",
                desc: "Standardized material, plating, and QC checks for repeatable selling confidence.",
              },
              {
                title: "Account Support",
                desc: "Trade buyers can request quotes, pricing support, and order clarification.",
              },
              {
                title: "Bulk Checkout Flow",
                desc: "A wholesale cart, eligibility rules, and payment flow separated from retail.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="group rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/80 to-slate-950/80 p-6 transition hover:-translate-y-1 hover:border-blue-500/40 hover:shadow-[0_20px_70px_-40px_rgba(59,130,246,.75)]"
              >
                <div className="mb-4 h-10 w-10 rounded-2xl border border-blue-500/30 bg-blue-500/10" />
                <div className="text-lg font-semibold text-white">
                  {f.title}
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* PRICING TIERS */}
        <section
          id="tiers"
          className="container mx-auto px-4 py-12 sm:px-6 lg:py-16"
        >
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <B2BSectionTitle>Trade Pricing Tiers</B2BSectionTitle>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Choose the buying level that matches your current business
                volume.
              </p>
            </div>

            <TierTabs value={tier} onChange={setTier} />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-[2rem] border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-8 lg:col-span-2">
              <div className="inline-flex rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-300">
                Selected Tier
              </div>

              <div className="mt-4 text-2xl font-bold text-white">
                {pricing.title}
              </div>
              <div className="mt-1 text-sm text-slate-400">
                {pricing.subtitle}
              </div>

              <ul className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {pricing.bullets.map((b) => (
                  <li
                    key={b}
                    className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-200"
                  >
                    <span className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full bg-cyan-300" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={pricing.cta.href}
                  className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-500"
                >
                  {pricing.cta.label}
                </Link>
                <Link
                  href="/catalog"
                  className="rounded-2xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-blue-400 hover:bg-blue-500/10"
                >
                  Browse Catalog
                </Link>
              </div>

              <div className="mt-6 text-xs text-slate-500">
                * Slabs & MOQ may vary by collection. Final confirmation is
                shared on quote/order approval.
              </div>
            </div>

            <div className="rounded-[2rem] border border-blue-500/20 bg-blue-950/20 p-8">
              <div className="text-[11px] font-semibold uppercase tracking-[0.25em] text-blue-300">
                Quick Quote
              </div>
              <div className="mt-3 text-2xl font-bold text-white">
                Get a trade line sheet
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Share your store name, country, and expected monthly quantity.
                We’ll respond with pricing and lead time.
              </p>

              <div className="mt-6 grid gap-3">
                <Link
                  href="/catalog"
                  className="inline-flex items-center justify-center rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
                >
                  Catalog
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-blue-400 hover:bg-blue-500/10"
                >
                  Already approved? Login
                </Link>
              </div>

              <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-xs leading-5 text-slate-400">
                WhatsApp support + email confirmations are available for
                approved wholesale buyers.
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section
          id="how"
          className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16"
        >
          <B2BSectionTitle>How Wholesale Works</B2BSectionTitle>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            A simple trade flow from account access to bulk dispatch.
          </p>

          <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Apply / Login",
                desc: "Trade buyers access the wholesale catalog after login or inquiry approval.",
              },
              {
                step: "02",
                title: "Build Bulk Order",
                desc: "Add SKUs, meet wholesale value and Qty/SKU rules, then proceed to checkout.",
              },
              {
                step: "03",
                title: "Confirm + Dispatch",
                desc: "Order is confirmed, packed with QC, and tracking is shared after dispatch.",
              },
            ].map((s) => (
              <div
                key={s.step}
                className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6"
              >
                <div className="text-4xl font-black text-blue-500/30">
                  {s.step}
                </div>
                <div className="mt-4 text-lg font-semibold text-white">
                  {s.title}
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="container mx-auto px-4 py-12 sm:px-6 lg:py-16">
          <div className="mb-6">
            <B2BSectionTitle>Wholesale FAQs</B2BSectionTitle>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Quick answers for retailers, resellers, and bulk buyers.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FaqItem
              q="Do users need to login?"
              a="Yes. Wholesale pages can be protected so only logged-in trade users can access catalog and checkout."
            />
            <FaqItem
              q="What is the minimum wholesale order?"
              a="The minimum wholesale order value is ₹2,000. Orders should also meet the required Qty/SKU ratio before checkout."
            />
            <FaqItem
              q="Can I request special pricing?"
              a="Yes. Growth and enterprise buyers can request pricing based on order volume and repeat purchase plan."
            />
            <FaqItem
              q="Is this different from retail shopping?"
              a="Yes. This B2B flow uses a separate trade theme, wholesale cart, eligibility checks, and business-focused checkout."
            />
          </div>
        </section>
      </main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Elvarra Wholesale",
            url: "https://b2b.elvarra.in",
            logo: "https://b2b.elvarra.in/Logo.svg",
            description:
              "Anti tarnish jewellery wholesale supplier in India for retailers, resellers and boutiques.",
            sameAs: ["https://whatsapp.com/channel/0029Vb7xcDhEKyZKRpiYxa3v"],
            areaServed: {
              "@type": "Country",
              name: "India",
            },

          }),
        }}
      />
    </>
  );
}

/* ---------------- Components ---------------- */

function B2BSectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-blue-300">
        Elvarra Wholesale
      </div>
      <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
        {children}
      </h2>
    </div>
  );
}

function TierTabs({
  value,
  onChange,
}: {
  value: "starter" | "growth" | "enterprise";
  onChange: (v: "starter" | "growth" | "enterprise") => void;
}) {
  const tabs: { key: "starter" | "growth" | "enterprise"; label: string }[] = [
    { key: "starter", label: "Starter" },
    { key: "growth", label: "Growth" },
    { key: "enterprise", label: "Enterprise" },
  ];

  return (
    <div className="inline-flex rounded-2xl border border-slate-800 bg-slate-950/70 p-1">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
            value === t.key
              ? "bg-blue-600 text-white shadow-lg shadow-blue-950/40"
              : "text-slate-400 hover:bg-slate-900 hover:text-white"
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
    <div className="rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/70 to-slate-950/70 p-6">
      <div className="text-sm font-semibold text-white">{q}</div>
      <p className="mt-2 text-sm leading-6 text-slate-400">{a}</p>
    </div>
  );
}
