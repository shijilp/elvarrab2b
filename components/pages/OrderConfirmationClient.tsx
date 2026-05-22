"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { Order } from "@/types";

function money(n: number, currency = "INR") {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(Number(n ?? 0));
  } catch {
    return `₹${Number(n ?? 0).toFixed(2)}`;
  }
}

function toYYYYMMDD(input: string | Date): string {
  if (typeof input === "string") {
    const s = input.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

    const d = new Date(s);
    if (!isNaN(d.getTime())) {
      return new Intl.DateTimeFormat("en-CA").format(d);
    }
    return "";
  }

  if (input instanceof Date && !isNaN(input.getTime())) {
    return new Intl.DateTimeFormat("en-CA").format(input);
  }

  return "";
}

export default function OrderConfirmationClient() {
  const [payload, setPayload] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get(`/my-orders/${orderId}/`);
        setPayload(res.data);
      } catch (error) {
        console.error("Failed to fetch order:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const hasData = !!payload;

  const formattedDate = useMemo(() => {
    return toYYYYMMDD(payload?.created_at ?? "");
  }, [payload?.created_at]);

  const paymentStatus = payload?.is_paid
    ? "Payment confirmed"
    : "Payment pending";
  const orderStatus = payload?.is_paid
    ? "Trade Order Confirmed"
    : "Trade Order Received";

  return (
    <main className="min-h-screen bg-[#06101f] text-slate-100 antialiased">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-10%] h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute right-[-10%] top-[20%] h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-[-20%] left-[30%] h-96 w-96 rounded-full bg-slate-500/10 blur-3xl" />
      </div>

      <section className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link
            href="/b2b"
            className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm text-slate-300 hover:border-blue-500/60 hover:text-white"
          >
            ← Back to wholesale
          </Link>

          <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-blue-200">
            Elvarra Trade Portal
          </span>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-950/80 shadow-[0_30px_120px_-50px_rgba(37,99,235,.65)] backdrop-blur">
          <div className="relative border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-[#07111f] p-6 sm:p-8">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/80 to-transparent" />

            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="mb-4 inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
                  ✓ Wholesale Order Submitted
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  {loading
                    ? "Confirming your trade order..."
                    : payload
                      ? `Thank you, ${payload.full_name}`
                      : "Order confirmation"}
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                  {hasData
                    ? "Your wholesale order has been received by Elvarra Trade. Our team will process stock allocation, packing, and shipping updates."
                    : "We are checking your order details. You will receive an email confirmation shortly."}
                </p>
              </div>

              {hasData && (
                <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4 text-right">
                  <div className="text-xs uppercase tracking-[0.22em] text-blue-300">
                    Trade Status
                  </div>
                  <div className="mt-1 text-lg font-bold text-white">
                    {orderStatus}
                  </div>
                  <div className="mt-2 text-sm text-slate-300">
                    {paymentStatus}
                  </div>
                </div>
              )}
            </div>
          </div>

          {loading && (
            <div className="p-6 sm:p-8">
              <div className="grid gap-4 sm:grid-cols-3">
                {[1, 2, 3].map((x) => (
                  <div
                    key={x}
                    className="h-24 animate-pulse rounded-2xl border border-slate-800 bg-slate-900/70"
                  />
                ))}
              </div>
              <div className="mt-6 h-72 animate-pulse rounded-3xl border border-slate-800 bg-slate-900/70" />
            </div>
          )}

          {!loading && hasData && (
            <div className="p-6 sm:p-8">
              <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-4">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                  <div className="text-xs uppercase tracking-widest text-slate-400">
                    Order No.
                  </div>
                  <div className="mt-2 font-semibold text-white">
                    {payload!.order_number}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                  <div className="text-xs uppercase tracking-widest text-slate-400">
                    Order Date
                  </div>
                  <div className="mt-2 font-semibold text-white">
                    {formattedDate || "-"}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                  <div className="text-xs uppercase tracking-widest text-slate-400">
                    Email
                  </div>
                  <div className="mt-2 truncate font-semibold text-white">
                    {payload!.email}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                  <div className="text-xs uppercase tracking-widest text-slate-400">
                    Payment
                  </div>
                  <div
                    className={`mt-2 font-semibold ${
                      payload!.is_paid ? "text-emerald-300" : "text-yellow-300"
                    }`}
                  >
                    {payload!.is_paid ? "Paid" : "Pending"}
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
                <section className="space-y-5">
                  <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="text-lg font-semibold text-white">
                        Delivery Details
                      </h2>
                      <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300">
                        B2B Dispatch
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
                      <div>
                        <div className="text-xs uppercase tracking-widest text-slate-500">
                          Contact
                        </div>
                        <div className="mt-1 font-medium text-white">
                          {payload!.full_name}
                        </div>
                        <div>{payload!.email}</div>
                      </div>

                      <div>
                        <div className="text-xs uppercase tracking-widest text-slate-500">
                          Ship To
                        </div>
                        <div className="mt-1">
                          {payload!.line1}
                          {payload!.line2 ? `, ${payload!.line2}` : ""}
                        </div>
                        <div>
                          {payload!.city}, {payload!.state} {payload!.pincode}
                        </div>
                        <div>{payload!.country}</div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
                    <h2 className="text-lg font-semibold text-white">
                      Wholesale Processing Steps
                    </h2>

                    <div className="mt-4 space-y-3">
                      {[
                        "Order received in Elvarra Trade system",
                        "Stock allocation and quantity verification",
                        "Packing, invoice preparation, and dispatch update",
                      ].map((step, index) => (
                        <div
                          key={step}
                          className="flex gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-3"
                        >
                          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blue-500/15 text-sm font-bold text-blue-300">
                            {index + 1}
                          </div>
                          <div className="text-sm text-slate-300">{step}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                <aside className="h-max rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-[0_20px_80px_-40px_rgba(37,99,235,.6)]">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white">
                      Trade Summary
                    </h2>
                    <span className="rounded-full bg-slate-950 px-3 py-1 text-xs text-blue-300">
                      Wholesale
                    </span>
                  </div>

                  <div className="mt-4 space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Subtotal</span>
                      <span className="font-medium text-white">
                        {money(payload!.subtotal)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Discount</span>
                      <span className="font-medium text-emerald-300">
                        -{money(payload!.discount)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Shipping</span>
                      <span className="font-medium text-white">
                        {money(payload!.shipping)}
                      </span>
                    </div>

                    <div className="border-t border-slate-800 pt-3">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">
                          Total Amount
                        </span>
                        <span className="text-xl font-bold text-blue-300">
                          {money(payload!.total_amount)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-2 print:hidden">
                    <button
                      onClick={() => window.print()}
                      className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-semibold text-slate-200 hover:border-blue-500/60 hover:text-white"
                    >
                      Print Trade Receipt
                    </button>

                    <Link
                      href={`/orders/${encodeURIComponent(orderId ?? "")}`}
                      className="rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3 text-center text-sm font-bold text-white shadow-[0_14px_40px_-20px_rgba(59,130,246,.9)] hover:brightness-110"
                    >
                      View Order Details
                    </Link>
                  </div>
                </aside>
              </div>
            </div>
          )}

          {!loading && !hasData && (
            <div className="p-6 sm:p-8">
              <div className="rounded-3xl border border-yellow-500/30 bg-yellow-500/10 p-5">
                <h2 className="text-lg font-semibold text-yellow-200">
                  Order details not found
                </h2>
                <p className="mt-2 text-sm text-slate-300">
                  The order may still be processing, or the order reference is
                  missing.
                </p>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 print:hidden">
                <Link
                  href="/orders/cart"
                  className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-slate-200 hover:border-blue-500/60"
                >
                  Return to Wholesale Cart
                </Link>

                <Link
                  href="/b2b"
                  className="rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3 text-center text-sm font-bold text-white hover:brightness-110"
                >
                  Continue Wholesale Shopping
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="mx-auto mt-6 flex max-w-6xl items-center justify-between text-sm text-slate-400 print:hidden">
          <Link href="/b2b" className="hover:text-white">
            Wholesale Home
          </Link>
          <Link href="/orders" className="hover:text-white">
            My Trade Orders
          </Link>
        </div>
      </section>
    </main>
  );
}
