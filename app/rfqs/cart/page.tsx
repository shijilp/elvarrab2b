"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRFQCart } from "@/context/RFQCartContext";

export default function RFQCartPage() {
  const { rfq, updateQty, removeItem, submitRFQ, loading } = useRFQCart();

  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [notes, setNotes] = useState("");

  const items = rfq?.items ?? [];
  const itemCount = useMemo(
    () => items.reduce((s, it) => s + (it.requested_qty || 0), 0),
    [items]
  );

  const handleSubmit = async () => {
    await submitRFQ({
      customer_name: customer.name,
      customer_email: customer.email,
      customer_phone: customer.phone,
      notes,
    });
    alert("RFQ submitted. We’ll email your quotation shortly.");
  };

  return (
    <main className="min-h-dvh bg-zinc-950 text-zinc-100">
      <section className="mx-auto max-w-7xl px-4 py-6 sm:py-10">
        <h1 className="text-2xl font-bold sm:text-3xl">Your RFQ Cart</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Review items, set quantities, and submit your request for quotation.
        </p>

        {/* Loading */}
        {loading && (
          <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 text-center">
            <p className="text-zinc-300">Loading your RFQ…</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && items.length === 0 && (
          <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 text-center">
            <p className="text-zinc-300">Your RFQ cart is empty.</p>
            <Link
              href="/wholesale" // adjust if your wholesale route differs
              className="mt-4 inline-block rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] px-5 py-3 font-semibold text-[var(--text-dark)]"
            >
              Browse wholesale products
            </Link>
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
            {/* Items list */}
            <div className="space-y-3">
              {items.map((it) => (
                <div
                  key={`${it.product}-${it.id ?? "guest"}`}
                  className="flex gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-3 sm:p-4"
                >
                  <Image
                    src={it.image || "/placeholder.png"}
                    alt={it.name || `#${it.product}`}
                    width={96}
                    height={96}
                    className="h-24 w-24 flex-none rounded-xl object-cover ring-1 ring-zinc-800"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="line-clamp-1 font-medium text-zinc-100">
                      {it.name || `#${it.product}`}
                    </div>
                    {it.slug && (
                      <div className="mt-0.5 line-clamp-1 text-xs text-zinc-400">
                        {it.slug}
                      </div>
                    )}
                    <div className="mt-3 inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950 px-2 py-1">
                      <button
                        onClick={() =>
                          updateQty(
                            it.product,
                            Math.max(1, (it.requested_qty || 1) - 1)
                          )
                        }
                        className="rounded-md px-2 text-lg leading-none hover:bg-zinc-800"
                      >
                        –
                      </button>
                      <input
                        type="number"
                        value={it.requested_qty || 1}
                        min={1}
                        onChange={(e) =>
                          updateQty(it.product, Number(e.target.value) || 1)
                        }
                        className="w-14 bg-transparent text-center outline-none"
                      />
                      <button
                        onClick={() =>
                          updateQty(it.product, (it.requested_qty || 1) + 1)
                        }
                        className="rounded-md px-2 text-lg leading-none hover:bg-zinc-800"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => removeItem(it.product)}
                      className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-200 hover:bg-zinc-800"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* RFQ Summary / Submit */}
            <aside className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 sm:p-5">
              <h2 className="text-lg font-semibold">RFQ Summary</h2>

              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Items</span>
                  <span>{items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Total Quantity</span>
                  <span>{itemCount}</span>
                </div>
                <div className="mt-2 text-xs text-zinc-400">
                  Prices, taxes, shipping, and terms will be added by our team
                  in your formal quote.
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <input
                  placeholder="Your name / company"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
                  onChange={(e) =>
                    setCustomer((s) => ({ ...s, name: e.target.value }))
                  }
                />
                <input
                  placeholder="Email"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
                  onChange={(e) =>
                    setCustomer((s) => ({ ...s, email: e.target.value }))
                  }
                />
                <input
                  placeholder="Phone (optional)"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
                  onChange={(e) =>
                    setCustomer((s) => ({ ...s, phone: e.target.value }))
                  }
                />
                <textarea
                  placeholder="Notes to seller (optional)"
                  className="h-24 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <button
                onClick={handleSubmit}
                className="mt-3 block w-full rounded-2xl btn-gradient-accent px-5 py-2 text-center font-semibold text-[var(--text-dark)]"
              >
                Submit RFQ
              </button>

              <Link
                href="/wholesale"
                className="block text-center text-sm text-zinc-300 hover:text-white"
              >
                Continue browsing wholesale
              </Link>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}
