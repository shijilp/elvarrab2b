"use client";
import React, { useMemo, useState } from "react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import Image from "next/image";

function formatMoney(n: unknown) {
  const num = typeof n === "number" ? n : parseFloat(String(n));
  if (isNaN(num)) return "—"; // fallback for invalid values
  const price = num.toLocaleString(undefined, {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });

  return price;
}

// ---------------------------
export default function RetailCartPage() {
  const { cartItems, updateQuantity, removeFromCart } = useCart();

  // const [items, setItems] = useState<CartItem[]>(INITIAL_ITEMS);
  const [giftNote, setGiftNote] = useState("");

  const subtotal = useMemo(
    () => cartItems.reduce((s, it) => s + it.price * it.quantity, 0),
    [cartItems]
  );

  const taxable = Math.max(0, subtotal);
  const total = Math.max(0, taxable);

  return (
    <main className={`  el-text  min-h-screen antialiased`}>
      {/*   <div className="inset-0 -z-10 opacity-40 blur-3xl">
        <div className="pointer-events-none absolute -inset-20 rounded-[100px] gradient-accent" />
      </div> */}
      <div className="container py-8 mx-auto ">
        <h1 className="text-2xl el-text-sub font-semibold">Your Cart</h1>
        <p className={`mt-1 text-sm el-text-sub `}>
          Free shipping over $150 • Easy returns • 2‑year warranty
        </p>
        <div className=" inset-0 -z-10 opacity-30 blur-3xl">
          <div className="pointer-events-none absolute -inset-10 rounded-[100px] gradient-accent" />
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          {/* Items */}
          <section className={`rounded-2xl el-ring el-card p-4`}>
            {cartItems.length === 0 ? (
              <div className={`text-sm el-subfg `}>
                Your cart is empty.{" "}
                <Link href="/products" className="underline">
                  Continue shopping
                </Link>
                .
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((it) => {
                  const line = it.price * it.quantity;
                  return (
                    <div key={it.id}>
                      <div className=" bg-black h-0.5  w-full"></div>
                      <div
                        key={it.id}
                        className={`grid grid-cols-12 gap-3 rounded-xl el-ring  el-card  p-3`}
                      >
                        <div className="col-span-12 md:col-span-2">
                          <Image
                            width={64}
                            height={64}
                            src={it.image}
                            alt={it.name}
                            className="aspect-square w-full rounded-lg object-cover"
                          />
                        </div>
                        <div className="col-span-12 md:col-span-10">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <div className="text-sm font-medium">
                                {it.name}
                              </div>
                              <div className={`text-xs el-subfg`}>
                                SKU: {it.id}
                              </div>
                              <div className={`mt-1 text-xs el-subfg`}>
                                Unit: {formatMoney(it.price)}
                              </div>
                            </div>
                            <button
                              onClick={() => removeFromCart(it.id)}
                              className={`rounded-xl border el-border  px-3 py-1.5  text-xs cursor-pointer`}
                            >
                              Remove
                            </button>
                          </div>

                          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <div>
                              <label className="mb-1 block text-xs opacity-80">
                                Quantity
                              </label>
                              <input
                                type="number"
                                value={it.quantity}
                                min={1}
                                step={1}
                                onChange={(e) =>
                                  updateQuantity(
                                    it.id,
                                    Number(e.target.value) || 1
                                  )
                                }
                                className={`w-full rounded-xl border el-border  bg-transparent px-3 py-2 text-sm outline-none`}
                              />
                            </div>
                            <div>
                              <label className="mb-1 block text-xs opacity-80">
                                Line total
                              </label>
                              <div className="rounded-xl border border-dashed px-3 py-2 text-sm">
                                {formatMoney(line)}
                              </div>
                            </div>

                            <div className="sm:col-span-2 hidden">
                              <label className="mb-1 block text-xs opacity-80">
                                Gift note
                              </label>
                              <input
                                placeholder="Optional gift message for this item"
                                className={`w-full rounded-xl border el-border  bg-transparent px-3 py-2 text-sm outline-none`}
                                value={giftNote}
                                onChange={(e) => setGiftNote(e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Summary */}
          <aside className="space-y-4">
            <div className={`rounded-2xl el-ring  el-card  p-4`}>
              <h2 className="text-lg font-semibold">Cart Total</h2>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  {/* <span className="opacity-80">Subtotal</span> */}
                  <span className="font-medium">Amount</span>
                  <span className="font-semibold">{formatMoney(total)}</span>
                  {/* <span>{formatMoney(subtotal)}</span> */}
                </div>

                <div className="flex items-center justify-between border-t pt-2">
                  {/* <span className="font-medium">Cart Total</span> */}
                  {/* <span className="font-semibold">{formatMoney(total)}</span> */}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2">
                <Link
                  href={`/orders/checkout`}
                  className={`rounded-xl px-4 py-3 text-center text-sm font-medium btn-gradient`}
                >
                  Proceed to Checkout
                </Link>
                <Link
                  href={`/products`}
                  className={`rounded-xl border el-border    px-4 py-3 text-sm`}
                >
                  <button>Continue Shopping</button>
                </Link>
              </div>
            </div>

            <div
              className={`rounded-2xl el-ring el-card  p-4 text-sm el-text-sub`}
            >
              <div className="font-medium text-current">Good to know</div>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>
                  Free shipping on orders over $150 or with FREESHIP promo.
                </li>
                <li>30‑day returns. 2‑year warranty.</li>
                <li>Prices include VAT at checkout where applicable.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
