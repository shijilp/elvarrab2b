"use client";
import Link from "next/link";
import React, { useMemo, useEffect, useState } from "react";
// NOTE: We purposely avoid importing `useSearchParams` from `next/navigation`
// because some sandboxes/mock environments return a null-ish object that causes
// runtime crashes. We read from `window.location.search` inside an effect.

// ------------------------------------------------------------
// Elvarra / Elvara — RETAIL ORDER CONFIRMATION (Thank You)
// Route: app/thank-you/page.tsx
// Reads the serialized `order` payload from the querystring and
// displays a confirmation summary. Hardened against null palettes
// and null/undefined search param sources.
// ------------------------------------------------------------

type ThemeMode = "dark" | "light";

// Palette type + safe defaults
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

const DARK_PALETTE: Palette = {
  bg: "bg-neutral-950",
  fg: "text-neutral-50",
  subfg: "text-neutral-300",
  card: "bg-neutral-900/70",
  border: "border-neutral-800",
  button:
    "bg-gradient-to-r from-yellow-500 to-amber-500 text-neutral-900 hover:brightness-110",
  ring: "ring-1 ring-neutral-800",
  chip: "bg-yellow-500 text-neutral-900",
};

const LIGHT_PALETTE: Palette = {
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

const FALLBACK_PALETTE: Palette = DARK_PALETTE; // guaranteed non-null

function paletteForTheme(theme: ThemeMode | null | undefined): Palette {
  if (theme === "light") return LIGHT_PALETTE;
  if (theme === "dark") return DARK_PALETTE;
  return FALLBACK_PALETTE; // never return null/undefined
}

// ---------------------------
// Types
// ---------------------------

type CheckoutItem = { sku: string; qty: number };

export type CheckoutPayload = {
  email: string;
  phone: string;
  first: string;
  last: string;
  address1: string;
  address2?: string;
  city: string;
  province: string;
  zip: string;
  country: string;
  method: "standard" | "express" | string;
  payment: "card" | "apple" | "cash" | string;
  promo?: string;
  subtotal: number;
  discount: number;
  ship: number;
  vat: number;
  total: number;
  items: CheckoutItem[];
};

function money(n: number, currency = "USD") {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(n ?? 0);
  } catch {
    return `$${Number(n ?? 0).toFixed(2)}`;
  }
}

function generateOrderId(seed?: string) {
  // Deterministic-ish fallback using time + a bit of hash of payload
  const base = seed
    ? Array.from(seed).reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7)
    : Date.now();
  const num = (base % 900000) + 100000; // 6 digits
  return `R-${num}`;
}

// Robust parser that accepts plain JSON, single-encoded, or double-encoded strings
function parseOrderParam(
  raw: string | null | undefined
): CheckoutPayload | null {
  if (!raw) return null;
  const tries: string[] = [raw];
  try {
    tries.push(decodeURIComponent(raw));
  } catch {}
  try {
    tries.push(decodeURIComponent(decodeURIComponent(raw)));
  } catch {}
  for (const candidate of tries) {
    try {
      const obj = JSON.parse(candidate);
      if (
        obj &&
        typeof obj === "object" &&
        "subtotal" in obj &&
        "total" in obj
      ) {
        return obj as CheckoutPayload;
      }
    } catch {}
  }
  return null;
}

export default function ThankYouPage() {
  // Theme can later come from context/store; keep a safe default
  const theme: ThemeMode | null = "dark";
  const palette = useMemo(() => {
    try {
      return paletteForTheme(theme);
    } catch {
      return FALLBACK_PALETTE;
    }
  }, [theme]);

  const [payload, setPayload] = useState<CheckoutPayload | null>(null);
  const [orderId, setOrderId] = useState<string>("");

  useEffect(() => {
    // Read from window to avoid null-ish searchParams in mocked envs
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("order"); // may be null; safe handled by parser
    const parsed = parseOrderParam(raw);
    if (parsed) {
      setPayload(parsed);
      const id = generateOrderId(
        JSON.stringify({
          email: parsed.email,
          total: parsed.total,
          when: parsed.subtotal,
        })
      );
      setOrderId(id);
    } else {
      setPayload(null);
      setOrderId("");
    }
  }, []);

  const hasData = !!payload;
  console.log(setOrderId);
  return (
    <main className={`${palette.bg} ${palette.fg} min-h-screen antialiased`}>
      <div className="container py-10">
        <div
          className={`mx-auto max-w-3xl rounded-2xl ${palette.ring} ${palette.card} p-6`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold">
                Thank you{payload ? `, ${payload.first}` : "!"}
              </h1>
              <p className={`mt-1 text-sm ${palette.subfg}`}>
                {hasData ? (
                  <>Your order has been placed and is now being processed.</>
                ) : (
                  <>
                    We couldn&apos;t find your order details. If you just
                    checked out, please return to the cart and try again.
                  </>
                )}
              </p>
            </div>
            {hasData && (
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${palette.chip}`}
              >
                Order received
              </span>
            )}
          </div>

          {/* Order header */}
          {hasData && (
            <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
              <div className={`rounded-xl ${palette.ring} ${palette.card} p-3`}>
                <div className="opacity-80">Order</div>
                <div className="font-medium">{orderId}</div>
              </div>
              <div className={`rounded-xl ${palette.ring} ${palette.card} p-3`}>
                <div className="opacity-80">Email</div>
                <div className="font-medium">{payload!.email}</div>
              </div>
              <div className={`rounded-xl ${palette.ring} ${palette.card} p-3`}>
                <div className="opacity-80">Payment</div>
                <div className="font-medium capitalize">{payload!.payment}</div>
              </div>
            </div>
          )}

          {/* Summary */}
          {hasData && (
            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
              <section className="space-y-4">
                <div
                  className={`rounded-2xl ${palette.ring} ${palette.card} p-4`}
                >
                  <div className="text-lg font-semibold">Shipping address</div>
                  <div className={`mt-2 text-sm ${palette.subfg}`}>
                    <div>
                      {payload!.first} {payload!.last}
                    </div>
                    <div>
                      {payload!.address1}
                      {payload!.address2 ? ", " + payload!.address2 : ""}
                    </div>
                    <div>
                      {payload!.city}, {payload!.province} {payload!.zip}
                    </div>
                    <div>{payload!.country}</div>
                    <div className="mt-2">
                      Delivery method:{" "}
                      {payload!.method === "express"
                        ? "Express (1–2 days)"
                        : "Standard (3–5 days)"}
                    </div>
                  </div>
                </div>

                <div
                  className={`rounded-2xl ${palette.ring} ${palette.card} p-4`}
                >
                  <div className="text-lg font-semibold">Next steps</div>
                  <ul
                    className={`mt-2 list-disc space-y-1 pl-5 text-sm ${palette.subfg}`}
                  >
                    <li>
                      You’ll receive an email confirmation at{" "}
                      <span className="text-current">{payload!.email}</span>.
                    </li>
                    <li>
                      We’ll send a tracking link as soon as your order ships.
                    </li>
                    <li>Need help? Reply to the email or contact support.</li>
                  </ul>
                </div>
              </section>

              <aside
                className={`h-max rounded-2xl ${palette.ring} ${palette.card} p-4`}
              >
                <div className="text-lg font-semibold">Order summary</div>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="opacity-80">Subtotal</span>
                    <span>{money(payload!.subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="opacity-80">Discount</span>
                    <span>-{money(payload!.discount)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="opacity-80">Shipping</span>
                    <span>{money(payload!.ship)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="opacity-80">VAT</span>
                    <span>{money(payload!.vat)}</span>
                  </div>
                  <div className="flex items-center justify-between border-t pt-2">
                    <span className="font-medium">Total</span>
                    <span className="font-semibold">
                      {money(payload!.total)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-2">
                  <button
                    onClick={() => window.print()}
                    className={`rounded-xl border ${palette.border} px-4 py-2 text-sm`}
                  >
                    Print receipt
                  </button>
                  <a
                    href={`/account/orders/${encodeURIComponent(orderId)}`}
                    className={`rounded-xl px-4 py-2 text-center text-sm font-medium ${palette.button}`}
                  >
                    View order
                  </a>
                </div>
              </aside>
            </div>
          )}

          {/* Empty/fallback state */}
          {!hasData && (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <a
                href="/cart/retail"
                className={`rounded-xl border ${palette.border} px-4 py-3 text-center text-sm`}
              >
                Return to cart
              </a>
              <a
                href="/products"
                className={`rounded-xl px-4 py-3 text-center text-sm ${palette.button}`}
              >
                Continue shopping
              </a>
            </div>
          )}
        </div>

        {/* Back links */}
        <div className="mx-auto mt-6 flex max-w-3xl items-center justify-between text-sm">
          <Link href="/" className="underline">
            Home
          </Link>
          <Link href="/account/orders" className="underline">
            My orders
          </Link>
        </div>
      </div>
    </main>
  );
}

/*
------------------------------------------------------------
TESTS (snippets; place in tests/ or __tests__/)

// tests/thank-you-utils.test.ts
// import { generateOrderId, money, parseOrderParam } from "app/thank-you/page";
// it("generates deterministic id for same seed", () => {
//   const a = generateOrderId(JSON.stringify({ email: "a@b.com", total: 10 }));
//   const b = generateOrderId(JSON.stringify({ email: "a@b.com", total: 10 }));
//   expect(a).toBe(b);
// });
// it("formats money", () => { expect(money(100, "USD")).toMatch(/\$/); });
// it("parses plain JSON", () => {
//   const raw = JSON.stringify({ email: "x@y.com", subtotal: 10, discount: 0, ship: 0, vat: 1.5, total: 11.5, phone: "", first: "A", last: "B", address1: "", city: "", province: "", zip: "", country: "SA", method: "standard", payment: "card", items: [] });
//   expect(parseOrderParam(raw)).not.toBeNull();
// });
// it("parses encoded JSON", () => {
//   const raw = encodeURIComponent(JSON.stringify({ email: "x@y.com", subtotal: 10, discount: 0, ship: 0, vat: 1.5, total: 11.5, phone: "", first: "A", last: "B", address1: "", city: "", province: "", zip: "", country: "SA", method: "standard", payment: "card", items: [] }));
//   expect(parseOrderParam(raw)).not.toBeNull();
// });
// it("returns null on invalid input", () => {
//   expect(parseOrderParam("not json")).toBeNull();
//   expect(parseOrderParam(null)).toBeNull();
// });
//------------------------------------------------------------
*/
