"use client";
import Link from "next/link";
import React, { useMemo, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { Order } from "@/types";

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

  const [payload, setPayload] = useState<Order | null>(null);
  // const [orderId, setOrderId] = useState<string>("");
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order"); // "61

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/my-orders/${orderId}/`, {});
        setPayload(res.data);
      } catch (error) {
        console.error("Failed to fetch order:", error);
      } finally {
      }
    };

    fetchOrder();
  }, [orderId]);

  const hasData = !!payload;

  return (
    <main className={`${palette.bg} ${palette.fg} min-h-screen antialiased`}>
      <div className="container py-10">
        <div
          className={`mx-auto max-w-3xl rounded-2xl ${palette.ring} ${palette.card} p-6`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold">
                Thank you{payload ? `, ${payload.full_name}` : "!"}
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
                className={`rounded-full px-3 py-1 text-xs font-semibold btn-gradient-accent`}
              >
                {payload!.is_paid ? "Confirmed" : "Order Received"}
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
                <div className="font-medium capitalize">
                  {payload!.is_paid ? "Paid" : "Pending"}
                </div>
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
                    <div>{payload!.full_name}</div>
                    <div>
                      {payload!.line1}
                      {payload!.line2 ? ", " + payload!.line2 : ""}
                    </div>
                    <div>
                      {payload!.city}, {payload!.state} {payload!.pincode}
                    </div>
                    <div>{payload!.country}</div>
                    <div className="mt-2">
                      {/* Delivery method:{" "}
                      {payload!.method === "express"
                        ? "Express (1–2 days)"
                        : "Standard (3–5 days)"} */}
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
                    <span>{money(payload!.shipping)}</span>
                  </div>
                  {/* <div className="flex items-center justify-between">
                    <span className="opacity-80">VAT</span>
                    <span>{money(payload!.vat)}</span>
                  </div> */}
                  <div className="flex items-center justify-between border-t pt-2">
                    <span className="font-medium">Total</span>
                    <span className="font-semibold">
                      {money(payload!.total_amount)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-2">
                  <button
                    onClick={() => window.print()}
                    className={`rounded-xl border ${palette.border} px-4 py-2 text-sm print:hidden`}
                  >
                    Print receipt
                  </button>
                  <a
                    href={`/orders/${encodeURIComponent(orderId ?? "")}`}
                    className={`rounded-xl px-4 py-2 text-center text-sm font-medium print:hidden btn-gradient-accent `}
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
              <Link
                href="/orders/cart"
                className={`rounded-xl border ${palette.border} px-4 py-3 text-center text-sm`}
              >
                Return to cart
              </Link>
              <Link
                href="/products"
                className={`rounded-xl px-4 py-3 text-center text-sm btn-gradient-accent`}
              >
                Continue shopping
              </Link>
            </div>
          )}
        </div>

        {/* Back links */}
        <div className="mx-auto mt-6 flex max-w-3xl items-center justify-between text-sm print:hidden">
          <Link href="/" className="underline">
            Home
          </Link>
          <Link href="/orders" className="underline  ">
            My orders
          </Link>
        </div>
      </div>
    </main>
  );
}
