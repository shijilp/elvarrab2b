"use client";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { OrderStatus, Variant } from "@/types";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { useRouter } from "next/navigation";
import { StatusPill } from "../ui/StatusPill";
import ConfirmModal from "../modals/ConfirmModal";
import OrderRepay from "../ui/OrderRepay";

// ------------------------------------------------------------
// Elvarra / Elvara — RETAIL ORDER DETAILS PAGE (Robust params)
// Route: app/account/orders/[id]/page.tsx
// Fix: Guard against undefined `params` / `params.id` and add fallbacks.
// ------------------------------------------------------------

type ThemeMode = "dark" | "light";
type Palette = {
  bg: string;
  fg: string;
  subfg: string;
  card: string;
  border: string;
  button: string;
  ring: string;
  chip: string;
};

function paletteForTheme(theme: ThemeMode): Palette {
  return theme === "dark"
    ? {
        bg: "bg-neutral-950",
        fg: "text-neutral-50",
        subfg: "text-neutral-300",
        card: "bg-neutral-900/70",
        border: "border-neutral-800",
        button:
          "bg-gradient-to-r from-yellow-500 to-amber-500 text-neutral-900 hover:brightness-110",
        ring: "ring-1 ring-neutral-800",
        chip: "bg-yellow-500 text-neutral-900",
      }
    : {
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
}

// ---------------------------
// Types & mock data (replace with real API)
// ---------------------------

export type RetailOrderItem = {
  sku: string;
  title: string;
  image: string;
  unit: number;
  qty: number;
};

/* export type RetailOrder = {
  id: string;
  createdAt: string; // ISO
  status: "Confirmed" | "Shipped" | "Delivered" | "Cancelled";
  currency: string;
  subtotal: number;
  tax: number; // VAT
  shipping: number;
  customer: {
    first: string;
    last: string;
    email: string;
  };
  address: {
    line1: string;
    line2?: string;
    city: string;
    province: string;
    zip: string;
    country: string;
  };
  delivery: {
    method: "standard" | "express";
    trackingId?: string;
    carrier?: string;
  };
  items: RetailOrderItem[];
  timeline: { label: string; at: string }[]; // ISO timestamps
}; */

function money(n: number, currency = "USD") {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(n);
  } catch {
    return `$${n.toFixed(2)}`;
  }
}

type OrderDetail = {
  id: number;
  order_number: string;
  created_at: string;
  total_amount: number;
  status: OrderStatus;
  is_paid: boolean;
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
// ------------------------------------------------------------
// Page Component (App Router dynamic route)
// - Accepts optional `params` and safely resolves `id`.
// - Fallbacks: try window.location pathname when params are missing.
// ------------------------------------------------------------

export default function OrderDetailsPage({ id }: { id: string }) {
  const theme: ThemeMode = "dark";
  const palette = useMemo(() => paletteForTheme(theme), [theme]);
  const { user } = useAuth();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // const order = useMemo(
  //   () => (id ? MOCK_ORDERS.find((o) => o.id === id) : undefined),
  //   [id]
  // );

  useEffect(() => {
    if (!user || !id) return;
    setLoading(true);
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/my-orders/${id}/`, {});
        setOrder(res.data);
      } catch (error) {
        console.error("Failed to fetch order:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [user, id]);
  if (!id && !loading) {
    return (
      <main className={`${palette.bg} ${palette.fg} min-h-screen antialiased`}>
        <div className="container py-12">
          <Link href="/orders" className="underline">
            ← Back to My Orders
          </Link>
          <h1 className="mt-4 text-2xl font-semibold">Order ID missing</h1>
          <p className={`mt-2 text-sm ${palette.subfg}`}>
            We couldn&apos;t determine which order to display. Please open this
            page from your orders list.
          </p>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className={`${palette.bg} ${palette.fg} min-h-screen antialiased`}>
        <div className="container py-12">
          <Link href="/orders" className="underline">
            ← Back to My Orders
          </Link>
          <h1 className="mt-4 text-2xl font-semibold">Order not found</h1>
          <p className={`mt-2 text-sm ${palette.subfg}`}>
            We couldn&apos;t find an order with ID “{id}”.
          </p>
        </div>
      </main>
    );
  }

  const total = order ? order.total_amount : 0;

  return (
    <main className={`${palette.bg} ${palette.fg} min-h-screen antialiased`}>
      <div className="container pt-7 mx-auto">
        <Link href="/orders" className="underline">
          ← Back to My Orders
        </Link>
        <LoadingOverlay show={cancelLoading} />

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">
              Order {order.order_number}
            </h1>
            <p className={`mt-1 text-sm ${palette.subfg}`}>
              Placed on {new Date(order.created_at).toLocaleString()}
            </p>
          </div>
          <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-semibold 
            `}
          >
            <div className=" flex gap-1">
              <StatusPill status={order.status} />
            </div>
          </span>
          {["new", "confirmed", "processing", "packed"].includes(
            order.status,
          ) && (
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-rose-400 hover:bg-zinc-800"
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
              // ✅ CLOSE MODAL IMMEDIATELY
              setShowCancelConfirm(false);

              // Optional: show page-level loader instead
              setCancelLoading(true);

              try {
                await api.post(`orders/${order.id}/cancel/`);
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
        </div>
        {/* Grid: Left details / Right summary */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          {/* LEFT */}
          <section className="space-y-6">
            {/* Items */}
            <div className={`rounded-2xl ${palette.ring} ${palette.card} p-4`}>
              <div className="text-lg font-semibold">Items</div>
              <div className="mt-3 space-y-3 text-sm">
                {order.items.map((it) => (
                  <div
                    key={it.product.sku}
                    className="flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <Image
                        width={64}
                        height={64}
                        src={it.product.image}
                        alt={it.product.name}
                        className="h-14 w-14 rounded-lg object-cover"
                      />
                      <div>
                        <div className="font-medium">
                          {it.product.name}{" "}
                          {it.variant && `[${it.variant.name}]`}
                        </div>
                        <div className={`${palette.subfg}`}>
                          SKU: {it.variant ? it.variant.sku : it.product.sku} ·
                          Qty {it.quantity}
                        </div>
                      </div>
                    </div>
                    <div className="font-medium">
                      {money(it.price * it.quantity, "INR")}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping */}
            <div className={`rounded-2xl ${palette.ring} ${palette.card} p-4`}>
              <div className="text-lg font-semibold">Shipping</div>
              <div className={`mt-2 text-sm ${palette.subfg}`}>
                <div>{order.full_name}</div>
                <div>
                  {order.line1}
                  {order.line2 ? ", " + order.line2 : ""}
                </div>
                <div>
                  {order.city}, {order.state} {order.pincode}
                </div>
                <div>{order.country}</div>
                <div className="mt-2">
                  Method:{" "}
                  {/* {order.method === "express" ? "Express" : "Standard"} */}
                </div>
                {order.tracking_no && (
                  <div className="mt-1">
                    Tracking:{" "}
                    <a
                      className="underline"
                      href={`https://www.17track.net/en?nums=${encodeURIComponent(
                        order.tracking_no,
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {order.tracking_no}
                    </a>{" "}
                    ({order.carrier})
                  </div>
                )}
              </div>
            </div>

            {/* Timeline */}
            {/* <div className={`rounded-2xl ${palette.ring} ${palette.card} p-4`}>
              <div className="text-lg font-semibold">Timeline</div>
              <ol className="mt-3 space-y-2 text-sm">
                {order.timeline.map((t, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-current"></span>
                    <div>
                      <div className="font-medium">{t.label}</div>
                      <div className={`${palette.subfg}`}>
                        {new Date(t.at).toLocaleString()}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div> */}
          </section>

          {/* RIGHT */}
          <aside
            className={`h-max rounded-2xl ${palette.ring} ${palette.card} p-4`}
          >
            <div className="text-lg font-semibold">Summary</div>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="opacity-80">Subtotal</span>
                <span>{money(order.subtotal, "INR")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="opacity-80">Shipping</span>
                <span>{money(order.shipping, "INR")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="opacity-80">Discount</span>
                <span>-{money(order.discount, "INR")}</span>
              </div>

              <div className="flex items-center justify-between border-t pt-2">
                <span className="font-medium">Total</span>
                <span className="font-semibold">{money(total, "INR")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="opacity-80">Wallet used</span>
                <span>-{money(order.wallet_used, "INR")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {order.is_paid ? "Net Paid" : "Net Payable"}
                </span>
                <span className="font-medium">
                  {money(order.net_amount, "INR")}
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3">
              {/* <Link
                href={`/invoices/${encodeURIComponent(order.id)}`}
                className={`rounded-xl border ${palette.border} px-4 py-2 text-center text-sm`}
              >
                Download Invoice (PDF)
              </Link> */}
              {!order.is_paid && <OrderRepay order_id={order.id} />}
              <Link
                href="/contact"
                className={`rounded-xl px-4 py-2 text-center text-sm btn-gradient-accent`}
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
