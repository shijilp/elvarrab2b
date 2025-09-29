"use client";

import { useMemo, useState } from "react";
import { useCart } from "@/context/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";

function formatMoney(n: number) {
  return n.toLocaleString(undefined, {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });
}

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart } = useCart();
  const [ship, setShip] = useState("standard");
  const [promo, setPromo] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);

  const subtotal = useMemo(
    () => cartItems.reduce((s, it) => s + it.price * it.quantity, 0),
    [cartItems]
  );
  const shippingOptions = [
    { id: "standard", label: "Standard (3–6 days)", price: 9.0 },
    /*   { id: "express", label: "Express (1–2 days)", price: 19.0 },
    { id: "pickup", label: "Store Pickup", price: 0.0 }, */
  ];
  const shipping = useMemo(
    () => shippingOptions.find((s) => s.id === ship)!.price,
    [ship]
  );
  const discount = useMemo(
    () => (promoApplied ? Math.min(0.15 * subtotal, 50) : 0),
    [promoApplied, subtotal]
  );
  const taxRate = 0.08;
  const tax = useMemo(
    () => (subtotal - discount) * taxRate,
    [subtotal, discount]
  );
  const total = useMemo(
    () => Math.max(0, subtotal - discount) + tax + shipping,
    [subtotal, discount, tax, shipping]
  );

  const applyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promo.trim()) setPromoApplied(true);
  };

  return (
    <main className="min-h-dvh bg-zinc-950 text-zinc-100">
      <section className="mx-auto max-w-7xl px-4 py-6 sm:py-10">
        <h1 className="text-2xl font-bold sm:text-3xl">Your Cart</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Review your items and proceed to checkout.
        </p>

        {/* Empty state */}
        {cartItems.length === 0 && (
          <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 text-center">
            <p className="text-zinc-300">Your cart is empty.</p>
            <Link
              href="/products"
              className="mt-4 inline-block rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] px-5 py-3 font-semibold text-[var(--text-dark)]"
            >
              Browse products
            </Link>
          </div>
        )}

        {cartItems.length > 0 && (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
            {/* Items list */}
            <div className="space-y-3">
              {cartItems.map((it) => (
                <div
                  key={it.id}
                  className="flex gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-3 sm:p-4"
                >
                  <Image
                    src={it.image}
                    alt={it.name}
                    width={96}
                    height={96}
                    className="h-24 w-24 flex-none rounded-xl object-cover ring-1 ring-zinc-800"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="line-clamp-1 font-medium text-zinc-100">
                      {it.name}
                    </div>
                    <div className="mt-1 text-sm text-zinc-300">
                      {formatMoney(it.price * it.quantity)}
                    </div>
                    <div className="mt-3 inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950 px-2 py-1">
                      <button
                        onClick={() =>
                          updateQuantity(it.id, Math.max(1, it.quantity - 1))
                        }
                        className="rounded-md px-2 text-lg leading-none hover:bg-zinc-800"
                      >
                        –
                      </button>
                      <input
                        type="number"
                        value={it.quantity}
                        min={1}
                        onChange={(e) =>
                          updateQuantity(it.id, Number(e.target.value) || 1)
                        }
                        className="w-14 bg-transparent text-center outline-none"
                      />
                      <button
                        onClick={() => updateQuantity(it.id, it.quantity + 1)}
                        className="rounded-md px-2 text-lg leading-none hover:bg-zinc-800"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => removeFromCart(it.id)}
                      className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-200 hover:bg-zinc-800"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <aside className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 sm:p-5">
              <h2 className="text-lg font-semibold">Order Summary</h2>

              {/* Promo */}
              {/* <form
                onSubmit={applyPromo}
                className="mt-2 flex items-center gap-2"
              >
                <input
                  value={promo}
                  onChange={(e) => {
                    setPromo(e.target.value);
                    setPromoApplied(false);
                  }}
                  placeholder="Promo code"
                  className="flex-1 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
                />
                <button
                  type="submit"
                  className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm hover:bg-zinc-800"
                >
                  Apply
                </button>
              </form> */}
              {promoApplied && (
                <div className="text-xs text-emerald-400">
                  Promo applied: up to 15% off (max ₹50)
                </div>
              )}

              {/* Shipping */}
              <div className="mt-3">
                <div className="mb-1 text-sm text-zinc-400">Shipping</div>
                <div className="space-y-2">
                  {shippingOptions.map((s) => (
                    <label
                      key={s.id}
                      className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
                    >
                      <span className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="ship"
                          checked={ship === s.id}
                          onChange={() => setShip(s.id)}
                        />
                        {s.label}
                      </span>
                      <span>{formatMoney(s.price)}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Subtotal</span>
                  <span>{formatMoney(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Discount</span>
                  <span>- {formatMoney(discount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Tax (8%)</span>
                  <span>{formatMoney(tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Shipping</span>
                  <span>{formatMoney(shipping)}</span>
                </div>
                <div className="mt-2 flex justify-between border-t border-zinc-800 pt-2 text-base font-semibold">
                  <span>Total</span>
                  <span>{formatMoney(total)}</span>
                </div>
              </div>

              <Link
                href="/orders/checkout"
                className="mt-5 block w-full rounded-2xl btn-gradient-accent px-5 py-2 text-center font-semibold text-[var(--text-dark)]"
              >
                Proceed to Checkout
              </Link>

              <Link
                href="/products"
                className="block text-center text-sm text-zinc-300 hover:text-white"
              >
                Continue shopping
              </Link>
            </aside>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
