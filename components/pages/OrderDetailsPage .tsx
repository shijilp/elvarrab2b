"use client";

import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { OrderStatus, Variant } from "@/types";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { useRouter } from "next/navigation";
import { StatusPill } from "../ui/StatusPill";
import ConfirmModal from "../modals/ConfirmModal";
import OrderRepay from "../ui/OrderRepay";

function money(n: number, currency = "INR") {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(Number(n || 0));
  } catch {
    return `₹${Number(n || 0).toFixed(2)}`;
  }
}

type OrderDetail = {
  id: number;
  order_number: string;
  created_at: string;
  total_amount: number;
  status: OrderStatus;
  is_paid: boolean;
  is_wholesale?: boolean;
  full_name: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  tracking_no: string;
  carrier: string;
  shipping: number;
  discount: number;
  subtotal: number;
  wallet_used: number;
  net_amount: number;
  items: {
    id: number;
    product: {
      name: string;
      image: string;
      description?: string;
      sku: string;
    };
    quantity: number;
    variant: Variant;
    price: number;
  }[];
};

export default function OrderDetailsPage({ id }: { id: string }) {
  const { user } = useAuth();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    if (!user || !id) return;

    setLoading(true);

    const fetchOrder = async () => {
      try {
        const res = await api.get(`api/elvarra/my-orders/${id}/`, {});
        setOrder(res.data);
      } catch (error) {
        console.error("Failed to fetch order:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [user, id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#06111f] text-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="h-10 w-44 animate-pulse rounded-xl bg-slate-800" />
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="h-96 animate-pulse rounded-3xl border border-slate-800 bg-slate-900/60" />
            <div className="h-80 animate-pulse rounded-3xl border border-slate-800 bg-slate-900/60" />
          </div>
        </div>
      </main>
    );
  }

  if (!id) {
    return (
      <main className="min-h-screen bg-[#06111f] text-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <Link
            href="/orders"
            className="text-sm text-cyan-300 hover:text-cyan-200"
          >
            ← Back to My Orders
          </Link>
          <h1 className="mt-5 text-2xl font-semibold">Order ID missing</h1>
          <p className="mt-2 text-sm text-slate-400">
            We couldn&apos;t determine which order to display. Please open this
            page from your orders list.
          </p>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-[#06111f] text-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <Link
            href="/orders"
            className="text-sm text-cyan-300 hover:text-cyan-200"
          >
            ← Back to My Orders
          </Link>
          <h1 className="mt-5 text-2xl font-semibold">Order not found</h1>
          <p className="mt-2 text-sm text-slate-400">
            We couldn&apos;t find an order with ID “{id}”.
          </p>
        </div>
      </main>
    );
  }

  const total = order.total_amount || 0;
  const itemCount = order.items.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0,
  );

  return (
    <main className="min-h-screen bg-[#06111f] text-slate-100 antialiased">
      <LoadingOverlay show={cancelLoading} />

      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_34%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.14),transparent_30%)]" />

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950/70 px-4 py-2 text-sm text-cyan-300 transition hover:border-cyan-500/50 hover:bg-cyan-500/10"
        >
          ← Back to My Orders
        </Link>

        {/* Header */}
        <section className="mt-5 overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-950 via-[#0b1728] to-blue-950/50 p-5 shadow-[0_24px_80px_-50px_rgba(34,211,238,.45)] sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-300">
                  {order.is_wholesale ? "B2B Wholesale Order" : "Retail Order"}
                </span>

                {order.is_wholesale && (
                  <span className="rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-200">
                    Trade Account
                  </span>
                )}

                <StatusPill status={order.status} />
              </div>

              <h1 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Order {order.order_number}
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Placed on {new Date(order.created_at).toLocaleString("en-IN")}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[420px]">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                  Order Type
                </div>
                <div
                  className={
                    order.is_wholesale
                      ? "mt-1 font-semibold text-cyan-300"
                      : "mt-1 font-semibold text-amber-300"
                  }
                >
                  {order.is_wholesale ? "B2B" : "Retail"}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                  Items
                </div>
                <div className="mt-1 font-semibold text-white">
                  {itemCount} units
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                  Payment
                </div>
                <div
                  className={
                    order.is_paid
                      ? "mt-1 font-semibold text-emerald-300"
                      : "mt-1 font-semibold text-rose-300"
                  }
                >
                  {order.is_paid ? "Paid" : "Pending"}
                </div>
              </div>
            </div>
          </div>

          {order.is_wholesale && (
            <div className="mt-5 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-sm text-slate-200">
              <span className="font-semibold text-cyan-300">
                Wholesale note:
              </span>{" "}
              This is a B2B trade order. Pricing, quantity checks, packing and
              dispatch may follow wholesale processing rules.
            </div>
          )}

          {["new", "confirmed", "processing", "packed"].includes(
            order.status,
          ) && (
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="mt-5 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-5 py-2.5 text-sm font-semibold text-rose-300 transition hover:border-rose-400 hover:bg-rose-500/20"
            >
              Cancel Order
            </button>
          )}

          <ConfirmModal
            show={showCancelConfirm}
            title="Cancel order?"
            message="Are you sure you want to cancel this order? Amount will be credited to your wallet."
            confirmText="Yes, cancel"
            cancelText="No"
            loading={cancelLoading}
            onCancel={() => {
              if (cancelLoading) return;
              setShowCancelConfirm(false);
            }}
            onConfirm={async () => {
              setShowCancelConfirm(false);
              setCancelLoading(true);

              try {
                await api.post(`api/elvarra/orders/${order.id}/cancel/`);
                router.push("/orders");
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
              } catch (err: any) {
                const msg =
                  err?.response?.data?.error ||
                  err?.response?.data?.detail ||
                  "Unable to cancel order.";
                alert(msg);
              } finally {
                setCancelLoading(false);
              }
            }}
          />
        </section>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
          {/* LEFT */}
          <section className="space-y-6">
            {/* Items */}
            <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/70 shadow-[0_20px_70px_-50px_rgba(34,211,238,.35)]">
              <div className="border-b border-slate-800 bg-slate-900/60 px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      {order.is_wholesale ? "Trade Order Items" : "Order Items"}
                    </h2>
                    <p className="mt-1 text-xs text-slate-400">
                      SKU, variant and quantity details
                    </p>
                  </div>

                  {order.is_wholesale && (
                    <span className="rounded-full bg-blue-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-300">
                      Wholesale
                    </span>
                  )}
                </div>
              </div>

              <div className="divide-y divide-slate-800">
                {order.items.map((it) => (
                  <div
                    key={it.id}
                    className="flex flex-col gap-4 p-4 transition hover:bg-slate-900/50 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
                        <Image
                          width={80}
                          height={80}
                          src={it.product.image}
                          alt={it.product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="truncate font-semibold text-white">
                          {it.product.name}{" "}
                          {it.variant && `[${it.variant.name}]`}
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                          <span>
                            SKU: {it.variant ? it.variant.sku : it.product.sku}
                          </span>
                          <span className="h-1 w-1 rounded-full bg-slate-600" />
                          <span>Qty {it.quantity}</span>
                          {order.is_wholesale && (
                            <>
                              <span className="h-1 w-1 rounded-full bg-slate-600" />
                              <span className="text-cyan-300">B2B Line</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <div className="text-xs text-slate-500">Line Total</div>
                      <div className="font-semibold text-cyan-100">
                        {money(it.price * it.quantity, "INR")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping */}
            <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Shipping Details
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    Delivery address and tracking information
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 text-sm text-slate-300">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Ship To
                  </div>
                  <div className="mt-3 font-semibold text-white">
                    {order.full_name}
                  </div>
                  <div className="mt-1">
                    {order.line1}
                    {order.line2 ? `, ${order.line2}` : ""}
                  </div>
                  <div>
                    {order.city}, {order.state} {order.pincode}
                  </div>
                  <div>{order.country}</div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 text-sm text-slate-300">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Tracking
                  </div>

                  {order.tracking_no ? (
                    <div className="mt-3">
                      <a
                        className="font-semibold text-cyan-300 underline underline-offset-4 hover:text-cyan-200"
                        href={`https://www.17track.net/en?nums=${encodeURIComponent(order.tracking_no)}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {order.tracking_no}
                      </a>
                      <div className="mt-1 text-slate-400">{order.carrier}</div>
                    </div>
                  ) : (
                    <div className="mt-3 text-slate-400">
                      Tracking details will appear after dispatch.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* RIGHT */}
          <aside className="h-max rounded-3xl border border-slate-800 bg-slate-950/80 p-5 shadow-[0_20px_70px_-50px_rgba(34,211,238,.45)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Payment Summary
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  {order.is_wholesale ? "B2B trade billing" : "Retail billing"}
                </p>
              </div>

              {order.is_wholesale && (
                <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">
                  B2B
                </span>
              )}
            </div>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Subtotal</span>
                <span className="text-slate-100">
                  {money(order.subtotal, "INR")}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Shipping</span>
                <span className="text-slate-100">
                  {money(order.shipping, "INR")}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Discount</span>
                <span className="text-emerald-300">
                  -{money(order.discount, "INR")}
                </span>
              </div>

              <div className="border-t border-slate-800 pt-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-white">Total</span>
                  <span className="font-bold text-white">
                    {money(total, "INR")}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Wallet used</span>
                <span className="text-emerald-300">
                  -{money(order.wallet_used, "INR")}
                </span>
              </div>

              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-cyan-200">
                    {order.is_paid ? "Net Paid" : "Net Payable"}
                  </span>
                  <span className="text-xl font-bold text-white">
                    {money(order.net_amount, "INR")}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3">
              {!order.is_paid && <OrderRepay order_id={order.id} />}

              <Link
                href="/contact"
                className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-slate-200 transition hover:border-cyan-500/50 hover:bg-cyan-500/10 hover:text-cyan-200"
              >
                Need Help?
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
