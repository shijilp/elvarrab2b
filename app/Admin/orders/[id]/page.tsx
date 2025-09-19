"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api"; // Axios instance
import { useAuth } from "@/context/AuthContext";
import { BackOrder, Order } from "@/types";

// ------------------------------------------------------------
// Elvarra — Admin Order Detail Page
// Route: app/admin/orders/[id]/page.tsx
// Features:
//  - Superuser guard
//  - Fetch single order by ID
//  - Header with order code, status pill, created date
//  - Customer block (name, email, phone)
//  - Shipping/Billing addresses
//  - Items table with image, name, qty, price, line total
//  - Summary (subtotal, discount, shipping, tax, grand total)
//  - Actions: Update status, Print packing slip, Resend email, Refund (stub)
//  - Timeline of status changes (if provided) or inferred
//  - Internal notes (view/add)
//  - Centered loading overlay + spinner
//
// Backend expected endpoints (adjust to your API):
//   GET    /admin/orders/{id}
//   PATCH  /admin/orders/{id}             body: { status, tracking_code?, notes? }
//   POST   /admin/orders/{id}/resend      (optional: resend confirmation/shipping email)
//   POST   /admin/orders/{id}/refund      (optional: create refund)
//   POST   /admin/orders/{id}/notes       body: { text }
// ------------------------------------------------------------

// ---------- Types (align with your DRF serializers) ----------
export type Address = {
  name?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  phone?: string;
};

export type OrderItem = {
  id: number;
  product: number;
  name: string;
  qty: number;
  price: number; // per-unit
  image_url?: string;
  variant?: string;
};

export type StatusEvent = {
  status: Order["status"];
  at: string; // ISO
  note?: string;
};

// export type Order = {
//   id: number;
//   code?: string;
//   status:
//     | "new"
//     | "processing"
//     | "packed"
//     | "shipped"
//     | "delivered"
//     | "cancelled";
//   created_at: string; // ISO
//   updated_at?: string; // ISO
//   currency?: string;
//   subtotal?: number;
//   discount_total?: number;
//   shipping_total?: number;
//   tax_total?: number;
//   total: number;
//   customer_name?: string;
//   email?: string;
//   phone?: string;
//   shipping_address?: Address | null;
//   billing_address?: Address | null;
//   items: OrderItem[];
//   timeline?: StatusEvent[]; // optional
//   notes?: { id: number; text: string; created_at: string; author?: string }[];
//   tracking_code?: string;
// };

// ---------- Utilities ----------
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

function clsx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

const statusChipColors: Record<Order["status"], string> = {
  new: "bg-amber-500/15 text-amber-500 ring-1 ring-amber-500/30",
  processing: "bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/30",
  confirmed: "bg-indigo-500/15 text-indigo-400 ring-1 ring-indigo-500/30",
  shipped: "bg-cyan-500/15 text-cyan-400 ring-1 ring-cyan-500/30",
  delivered: "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30",
  cancelled: "bg-rose-500/15 text-rose-400 ring-1 ring-rose-500/30",
};

function Spinner({ size = 18 }: { size?: number }) {
  return (
    <svg
      className="animate-spin text-neutral-300"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-90"
        d="M4 12a8 8 0 0 1 8-8"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LoadingOverlay({
  show,
  label = "Loading...",
}: {
  show: boolean;
  label?: string;
}) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[120] grid place-items-center bg-black/40 backdrop-blur">
      <div className="flex items-center gap-3 rounded-2xl bg-neutral-900 px-4 py-3 text-neutral-100 ring-1 ring-neutral-800">
        <Spinner />
        <span className="text-sm opacity-90">{label}</span>
      </div>
    </div>
  );
}

// ---------- Data hook ----------
function useOrder(id: string | undefined) {
  const [data, setData] = useState<BackOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/admin/orders/${id}`);
        if (!ignore) setData(res.data as BackOrder);
      } catch (e) {
        console.error(e);
        // Fallback demo data
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [id]);

  return { data, loading, error, setData } as const;
}

// ---------- Small components ----------
function SectionTitle({
  children,
  cta,
}: {
  children: React.ReactNode;
  cta?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h3 className="text-lg font-semibold">{children}</h3>
      {cta}
    </div>
  );
}

function AddressCard({
  title,
  addr,
}: {
  title: string;
  addr: BackOrder | null;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white/90 p-3 text-sm dark:border-neutral-800 dark:bg-neutral-900/70">
      <div className="mb-1 font-medium">{title}</div>

      {addr?.customer && addr?.shipping_ad ? (
        <div className="opacity-80">
          {addr.customer.full_name && <div>{addr.customer.full_name}</div>}
          {addr.shipping_ad.line1 && <div>{addr.shipping_ad.line1}</div>}
          {addr.shipping_ad.line2 && <div>{addr.shipping_ad.line2}</div>}
          <div>
            {[
              addr.shipping_ad.city,
              addr.shipping_ad.state,
              addr.shipping_ad.pincode,
            ]
              .filter(Boolean)
              .join(", ")}
          </div>
          <div>{addr.shipping_ad.country}</div>
          {addr.customer.phone && (
            <div className="mt-1">{addr.customer.phone}</div>
          )}
        </div>
      ) : (
        <div className="opacity-60">—</div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: Order["status"] }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs",
        statusChipColors[status]
      )}
    >
      {status}
    </span>
  );
}

// ---------- Main Page ----------
export default function AdminOrderDetailPage() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useParams<{ id?: string }>();

  // robust ID
  const id = useMemo(() => {
    const pid =
      typeof params?.id === "string"
        ? params.id
        : Array.isArray(params?.id)
        ? params?.id?.[0]
        : "";
    try {
      return decodeURIComponent(pid || "");
    } catch {
      return pid || "";
    }
  }, [params]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (user && (user as any).is_superuser === false) router.replace("/");
  }, [user, router]);

  const { data: order, loading, setData } = useOrder(id);
  const [busy, setBusy] = useState(false);
  const [newStatus, setNewStatus] = useState<BackOrder["status"] | "">("");
  const [noteText, setNoteText] = useState("");

  const currency = order?.currency || "USD";

  const computedSubtotal = (order?.items || []).reduce(
    (sum, it) => sum + it.quantity * it.price,
    0
  );
  const subtotal = order?.subtotal ?? computedSubtotal;
  const discount = order?.discount ?? 0;
  const shipping = order?.shipping ?? 0;
  const grand = order?.total_amount ?? subtotal - discount + shipping;

  async function saveStatus() {
    if (!order || !newStatus) return;
    try {
      setBusy(true);
      await api.patch(`/admin/orders/${order.id}`, { status: newStatus });
      setData({ ...order, status: newStatus });
      setNewStatus("");
    } catch (e) {
      console.error(e);
      alert("Failed to update status.");
    } finally {
      setBusy(false);
    }
  }

  async function addNote() {
    if (!order || !noteText.trim()) return;
    try {
      setBusy(true);
      const res = await api.post(`/admin/orders/${order.id}/notes`, {
        text: noteText.trim(),
      });
      const newNote = res?.data || {
        id: Date.now(),
        text: noteText.trim(),
        created_at: new Date().toISOString(),
        author: "You",
      };
      setData({ ...order, notes: [...(order.notes || []), newNote] });
      setNoteText("");
    } catch (e) {
      console.error(e);
      alert("Failed to add note.");
    } finally {
      setBusy(false);
    }
  }

  async function resendEmail() {
    if (!order) return;
    try {
      setBusy(true);
      await api.post(`/admin/orders/${order.id}/resend`);
      alert("Email queued.");
    } catch (e) {
      console.error(e);
      alert("Could not resend email.");
    } finally {
      setBusy(false);
    }
  }

  async function refundOrder() {
    if (!order) return;
    if (!confirm("Create a refund for this order?")) return;
    try {
      setBusy(true);
      await api.post(`/admin/orders/${order.id}/refund`);
      alert("Refund created (check backend for details).");
    } catch (e) {
      console.error(e);
      alert("Could not create refund.");
    } finally {
      setBusy(false);
    }
  }

  function printPackingSlip() {
    if (!order) return;
    const url = `/pp/orders/${order.id}/packing-slip`;
    window.open(url, "_blank");
  }
  console.log(order);
  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">
              Order {order?.id || `#${order?.id ?? id}`}
            </h1>
            {order && <StatusPill status={order.status} />}
          </div>
          <div className="mt-1 text-sm opacity-70">
            Placed {order ? new Date(order.created_at).toLocaleString() : "—"}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/orders"
            className="rounded-xl px-3 py-2 text-sm ring-1 ring-neutral-200 dark:ring-neutral-800"
          >
            Back to Orders
          </Link>
          <button
            onClick={printPackingSlip}
            disabled={!order}
            className="rounded-xl bg-neutral-900 px-3 py-2 text-sm text-white disabled:opacity-50 dark:bg-amber-500 dark:text-neutral-900"
          >
            Print Packing Slip
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left: core details */}
        <div className="space-y-4 lg:col-span-2">
          {/* Customer & addresses */}
          <div className="rounded-2xl border border-neutral-200 bg-white/90 p-4 dark:border-neutral-800 dark:bg-neutral-900/70">
            <SectionTitle>Customer & Addresses</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-neutral-200 bg-white/90 p-3 text-sm dark:border-neutral-800 dark:bg-neutral-900/70">
                <div className="mb-1 font-medium">Customer</div>
                <div className="opacity-80">
                  <div>{order?.customer.full_name || "—"}</div>
                  <div>{order?.customer.email || "—"}</div>
                  <div>{order?.customer.phone || "—"}</div>
                </div>
              </div>
              <AddressCard title="Shipping Address" addr={order} />
              <AddressCard title="Billing Address" addr={order} />
            </div>
          </div>

          {/* Items */}
          <div className="rounded-2xl border border-neutral-200 bg-white/90 p-4 dark:border-neutral-800 dark:bg-neutral-900/70">
            <SectionTitle>Items</SectionTitle>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-neutral-500">
                  <tr className="border-b border-neutral-200 dark:border-neutral-800">
                    <th className="px-2 py-2">Item</th>
                    <th className="px-2 py-2">Price</th>
                    <th className="px-2 py-2">Qty</th>
                    <th className="px-2 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(order?.items || []).map((it) => (
                    <tr
                      key={it.id}
                      className="border-b border-neutral-100 last:border-none dark:border-neutral-800"
                    >
                      <td className="px-2 py-2">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 overflow-hidden rounded-xl ring-1 ring-neutral-200 dark:ring-neutral-800">
                            {it.product ? (
                              <Image
                                src={it.product.image}
                                alt={it.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="grid h-full w-full place-items-center text-xs opacity-60">
                                —
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{it.name}</div>
                            {it && (
                              <div className="text-xs opacity-70">
                                {it.name}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-2">{money(it.price, currency)}</td>
                      <td className="px-2 py-2">{it.quantity}</td>
                      <td className="px-2 py-2 text-right">
                        {money(it.quantity * it.price, currency)}
                      </td>
                    </tr>
                  ))}
                  {(order?.items?.length ?? 0) === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-2 py-6 text-center text-sm opacity-70"
                      >
                        No items.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes */}
          <div className="rounded-2xl border border-neutral-200 bg-white/90 p-4 dark:border-neutral-800 dark:bg-neutral-900/70">
            <SectionTitle>Internal Notes</SectionTitle>
            <div className="space-y-2">
              {/* {(order?.notes || []).map((n: any) => (
                <div
                  key={n.id}
                  className="rounded-xl border border-neutral-200 bg-white/90 p-3 text-sm dark:border-neutral-800 dark:bg-neutral-900/70"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium opacity-80">
                      {n.author || "Admin"}
                    </div>
                    <div className="text-xs opacity-60">
                      {new Date(n.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="mt-1 whitespace-pre-wrap">{n.text}</div>
                </div>
              ))} */}
              <div className="flex gap-2">
                <input
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add an internal note..."
                  className="w-full rounded-xl border border-neutral-200 bg-transparent px-3 py-2 text-sm outline-none dark:border-neutral-800"
                />
                <button
                  onClick={addNote}
                  className="rounded-xl bg-neutral-900 px-3 py-2 text-sm text-white dark:bg-amber-500 dark:text-neutral-900"
                >
                  Add Note
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: summary & actions */}
        <div className="space-y-4">
          {/* Summary */}
          <div className="rounded-2xl border border-neutral-200 bg-white/90 p-4 text-sm dark:border-neutral-800 dark:bg-neutral-900/70">
            <SectionTitle>Summary</SectionTitle>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="opacity-70">Subtotal</div>
                <div>{money(subtotal, currency)}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="opacity-70">Discount</div>
                <div>-{money(discount, currency)}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="opacity-70">Shipping</div>
                <div>{money(shipping, currency)}</div>
              </div>
              {/* <div className="flex items-center justify-between">
                <div className="opacity-70">Tax</div>
                <div>{money(tax, currency)}</div>
              </div> */}
              <div className="mt-2 border-t border-neutral-200 pt-2 dark:border-neutral-800" />
              <div className="flex items-center justify-between font-medium">
                <div>Total</div>
                <div>{money(grand, currency)}</div>
              </div>
            </div>
          </div>

          {/* Status & actions */}
          <div className="rounded-2xl border border-neutral-200 bg-white/90 p-4 text-sm dark:border-neutral-800 dark:bg-neutral-900/70">
            <SectionTitle>Actions</SectionTitle>
            <div className="space-y-3">
              <div>
                <div className="mb-1 opacity-70">Update Status</div>
                <div className="flex items-center gap-2">
                  <select
                    value={newStatus || order?.status || ""}
                    onChange={(e) =>
                      setNewStatus(e.target.value as BackOrder["status"])
                    }
                    className="w-full rounded-xl border border-neutral-200 bg-transparent px-3 py-2 outline-none dark:border-neutral-800"
                  >
                    {(
                      [
                        "new",
                        "processing",
                        "packed",
                        "shipped",
                        "delivered",
                        "cancelled",
                      ] as const
                    ).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={saveStatus}
                    className="rounded-xl bg-neutral-900 px-3 py-2 text-xs text-white dark:bg-amber-500 dark:text-neutral-900"
                  >
                    Save
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={resendEmail}
                  className="rounded-xl px-3 py-2 text-xs ring-1 ring-neutral-200 dark:ring-neutral-800"
                >
                  Resend Email
                </button>
                <button
                  onClick={refundOrder}
                  className="rounded-xl px-3 py-2 text-xs ring-1 ring-neutral-200 dark:ring-neutral-800"
                >
                  Refund
                </button>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-2xl border border-neutral-200 bg-white/90 p-4 text-sm dark:border-neutral-800 dark:bg-neutral-900/70">
            <SectionTitle>Timeline</SectionTitle>
            {/* <div className="space-y-3">
              {(order?.timeline && order.timeline.length > 0
                ? order.timeline
                : [
                    {
                      status: order?.status || "new",
                      at: order?.created_at || new Date().toISOString(),
                      note: "Current status",
                    },
                  ]
              ).map((ev, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-amber-500" />
                  <div>
                    <div className="font-medium">{ev.status}</div>
                    <div className="text-xs opacity-70">
                      {new Date(ev.at).toLocaleString()}
                    </div>
                    {ev.note && (
                      <div className="mt-1 whitespace-pre-wrap opacity-80">
                        {ev.note}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div> */}
          </div>
        </div>
      </div>

      <LoadingOverlay
        show={busy || loading}
        label={busy ? "Working..." : "Loading..."}
      />
    </div>
  );
}
