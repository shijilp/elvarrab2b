"use client";

import { useMemo, useState } from "react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import Image from "next/image";

function formatMoney(n: number) {
  return n.toLocaleString(undefined, {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });
}

type GuestDiscountResponse = {
  line_discounts: { product_id: number; line_discount: string }[];
  discount_total: string;
};

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart } = useCart();

  const [discountInfo, setDiscountInfo] =
    useState<GuestDiscountResponse | null>(null);

  const subtotal = useMemo(
    () => cartItems.reduce((s, it) => s + it.price * it.quantity, 0),
    [cartItems],
  );

  const hasFreeShippingItem = useMemo(
    () => cartItems.some((it) => it.is_free_shipping === true),
    [cartItems],
  );

  const FREE_SHIP_THRESHOLD = hasFreeShippingItem ? 0 : Number(3500) - 1;
  const SHIPPING_FEE = hasFreeShippingItem ? 0 : Number(40);

  const discountTotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (item.discount ?? 0), 0);
  }, [cartItems]);

  const shipping = useMemo(() => {
    if (hasFreeShippingItem) return 0;
    return subtotal - discountTotal > FREE_SHIP_THRESHOLD ? 0 : SHIPPING_FEE;
  }, [subtotal, discountTotal, FREE_SHIP_THRESHOLD, hasFreeShippingItem]);

  const discount = discountTotal;

  const total = useMemo(
    () => Math.max(0, subtotal - discount) + shipping,
    [subtotal, discount, shipping],
  );

  // WHOLESALE RULES
  const wholesaleOrderValue = useMemo(
    () => Math.max(0, subtotal - discount),
    [subtotal, discount],
  );

  const totalQty = useMemo(
    () => cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [cartItems],
  );

  const totalSku = cartItems.length;

  const qtyPerSku = useMemo(() => {
    return totalSku > 0 ? totalQty / totalSku : 0;
  }, [totalQty, totalSku]);

  const minWholesaleValue = 2000;
  const minQtyPerSku = 1.4;

  const isValueEligible = wholesaleOrderValue >= minWholesaleValue;
  const isQtyEligible = qtyPerSku >= minQtyPerSku;
  const isWholesaleEligible = isValueEligible && isQtyEligible;

  const valueRequired = Math.max(0, minWholesaleValue - wholesaleOrderValue);
  const qtyNeededForRatio = Math.max(
    0,
    Math.ceil(minQtyPerSku * totalSku - totalQty),
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const decrement = (qty: number, pid: number, vid?: any) => {
    const next = qty - 1;
    if (next <= 0) {
      removeFromCart?.(pid, vid ?? null);
    } else {
      updateQuantity(pid, next, vid ?? null);
    }
  };

  return (
    <main className="min-h-dvh bg-[#07111f] text-slate-100">
      <section className="relative overflow-hidden border-b border-slate-800 bg-gradient-to-br from-[#07111f] via-slate-950 to-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.10),transparent_30%)]" />

        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:py-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-blue-300">
            Trade Cart
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Wholesale Order Cart
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
            Review your bulk order, check wholesale eligibility, and proceed to
            trade checkout.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-xs uppercase tracking-widest text-slate-400">
                Order Value
              </p>
              <p className="mt-1 text-xl font-bold text-white">
                {formatMoney(wholesaleOrderValue)}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-xs uppercase tracking-widest text-slate-400">
                Total Units
              </p>
              <p className="mt-1 text-xl font-bold text-white">{totalQty}</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-xs uppercase tracking-widest text-slate-400">
                SKU Count
              </p>
              <p className="mt-1 text-xl font-bold text-white">{totalSku}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
        {cartItems.length === 0 && (
          <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-950/80 p-10 text-center shadow-[0_24px_80px_-45px_rgba(59,130,246,.8)]">
            <p className="text-slate-300">Your wholesale cart is empty.</p>

            <Link
              href="/products"
              className="mt-5 inline-flex items-center justify-center rounded-2xl border border-blue-500/40 bg-blue-600 px-6 py-3 font-semibold text-white shadow-[0_16px_50px_-20px_rgba(59,130,246,.9)] hover:bg-blue-500"
            >
              Browse Trade Products
            </Link>
          </div>
        )}

        {cartItems.length > 0 && (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
            <div className="space-y-4">
              {cartItems.map((it) => (
                <div
                  key={`${it.id}-${it.variant_id ?? "no-variant"}`}
                  className="overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-[#07111f] p-3 shadow-[0_14px_50px_-35px_rgba(37,99,235,.8)] sm:p-4"
                >
                  <div className="flex gap-4">
                    <Image
                      src={it.image}
                      alt={it.name}
                      width={104}
                      height={104}
                      className="h-24 w-24 flex-none rounded-2xl object-cover ring-1 ring-slate-800 sm:h-28 sm:w-28"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="line-clamp-2 font-semibold text-white">
                            {it.name}
                          </div>

                          <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-widest text-blue-300">
                            Wholesale SKU
                          </div>
                        </div>

                        <button
                          onClick={() =>
                            removeFromCart(it.id, it.variant_id ?? null)
                          }
                          className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-sm text-red-200 transition hover:border-red-400 hover:bg-red-500/20"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
                          <p className="text-[11px] uppercase tracking-widest text-slate-400">
                            Line Value
                          </p>
                          <p className="mt-1 text-base font-bold text-white">
                            {formatMoney(it.price * it.quantity)}
                          </p>

                          {it.discount > 0 && (
                            <p className="mt-1 text-xs text-emerald-300">
                              Discount: {formatMoney(it.discount)}
                            </p>
                          )}
                        </div>

                        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
                          <p className="text-[11px] uppercase tracking-widest text-slate-400">
                            Trade Quantity
                          </p>

                          <div className="mt-2 inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-[#07111f] p-1">
                            <button
                              onClick={() =>
                                decrement(
                                  it.quantity,
                                  it.id,
                                  it.variant_id ?? null,
                                )
                              }
                              className="grid h-9 w-9 place-items-center rounded-xl border border-slate-700 bg-slate-900 text-slate-200 transition hover:border-red-500/60 hover:bg-red-500/10 hover:text-red-300"
                            >
                              –
                            </button>

                            <input
                              type="number"
                              value={it.quantity}
                              min={1}
                              onChange={(e) =>
                                updateQuantity(
                                  it.id,
                                  Number(e.target.value) || 1,
                                  it.variant_id ?? null,
                                )
                              }
                              className="w-16 bg-transparent text-center text-base font-bold text-blue-300 outline-none"
                            />

                            <button
                              onClick={() =>
                                updateQuantity(
                                  it.id,
                                  it.quantity + 1,
                                  it.variant_id ?? null,
                                )
                              }
                              className="grid h-9 w-9 place-items-center rounded-xl border border-blue-700/50 bg-blue-950/40 text-blue-200 transition hover:border-blue-400 hover:bg-blue-500/15 hover:text-white"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside className="h-fit space-y-4 rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-950 via-slate-900 to-[#07111f] p-5 shadow-[0_24px_80px_-45px_rgba(59,130,246,.9)]">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-blue-300">
                  Trade Summary
                </p>
                <h2 className="mt-1 text-xl font-bold text-white">
                  Wholesale Checkout
                </h2>
              </div>

              <div
                className={`rounded-3xl border p-4 ${
                  isWholesaleEligible
                    ? "border-emerald-500/40 bg-emerald-500/10"
                    : "border-amber-500/40 bg-amber-500/10"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-white">
                    Wholesale Eligibility
                  </h3>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest ${
                      isWholesaleEligible
                        ? "bg-emerald-500 text-white"
                        : "bg-amber-400 text-slate-950"
                    }`}
                  >
                    {isWholesaleEligible ? "Approved" : "Pending"}
                  </span>
                </div>

                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-300">Minimum order value</span>
                    <span
                      className={
                        isValueEligible ? "text-emerald-300" : "text-amber-300"
                      }
                    >
                      {formatMoney(wholesaleOrderValue)} / ₹2,000
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className={`h-full rounded-full ${
                        isValueEligible ? "bg-emerald-400" : "bg-amber-400"
                      }`}
                      style={{
                        width: `${Math.min(
                          100,
                          (wholesaleOrderValue / minWholesaleValue) * 100,
                        )}%`,
                      }}
                    />
                  </div>

                  <div className="flex justify-between gap-3">
                    <span className="text-slate-300">Qty / SKU ratio</span>
                    <span
                      className={
                        isQtyEligible ? "text-emerald-300" : "text-amber-300"
                      }
                    >
                      {qtyPerSku.toFixed(2)} / 1.40
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className={`h-full rounded-full ${
                        isQtyEligible ? "bg-emerald-400" : "bg-amber-400"
                      }`}
                      style={{
                        width: `${Math.min(
                          100,
                          (qtyPerSku / minQtyPerSku) * 100,
                        )}%`,
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
                      <p className="text-[11px] text-slate-400">Total Qty</p>
                      <p className="text-lg font-bold text-white">{totalQty}</p>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
                      <p className="text-[11px] text-slate-400">No. of SKU</p>
                      <p className="text-lg font-bold text-white">{totalSku}</p>
                    </div>
                  </div>
                </div>

                {!isWholesaleEligible && (
                  <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-3 text-xs leading-5 text-slate-300">
                    {!isValueEligible && (
                      <p>
                        Add{" "}
                        <span className="font-semibold text-amber-300">
                          {formatMoney(valueRequired)}
                        </span>{" "}
                        more to reach minimum wholesale value.
                      </p>
                    )}

                    {!isQtyEligible && (
                      <p className="mt-1">
                        Add at least{" "}
                        <span className="font-semibold text-amber-300">
                          {qtyNeededForRatio}
                        </span>{" "}
                        more unit(s) to meet the Qty/SKU ratio.
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-3 rounded-3xl border border-slate-800 bg-slate-950/70 p-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Subtotal</span>
                  <span className="font-medium text-white">
                    {formatMoney(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Discount</span>
                  <span className="font-medium text-emerald-300">
                    - {formatMoney(discount)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Shipping</span>
                  <span className="font-medium text-white">
                    {formatMoney(shipping)}
                  </span>
                </div>

                <div className="flex justify-between border-t border-slate-800 pt-3 text-lg font-bold">
                  <span className="text-white">Total</span>
                  <span className="text-blue-300">{formatMoney(total)}</span>
                </div>
              </div>

              {isWholesaleEligible ? (
                <Link
                  href="/orders/checkout"
                  className="block w-full rounded-2xl border border-blue-500/50 bg-blue-600 px-5 py-3 text-center font-bold text-white shadow-[0_20px_60px_-25px_rgba(59,130,246,.95)] transition hover:bg-blue-500"
                >
                  Proceed to Trade Checkout
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    alert(
                      "Wholesale checkout is not eligible. Minimum order value should be ₹2,000 and Qty/SKU ratio should be 1.4 or above.",
                    )
                  }
                  className="block w-full cursor-not-allowed rounded-2xl border border-slate-700 bg-slate-800 px-5 py-3 text-center font-bold text-slate-400"
                >
                  Not Eligible for Wholesale Checkout
                </button>
              )}

              <Link
                href="/products"
                className="block text-center text-sm font-medium text-blue-300 hover:text-blue-200"
              >
                Continue Trade Shopping
              </Link>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}
