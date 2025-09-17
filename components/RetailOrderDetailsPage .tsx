"use client";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";

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
type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Shipped"
  | "Delivered"
  | "Cancelled";
("processing");
("new");

export type RetailOrder = {
  id: string;
  createdAt: string; // ISO
  status: "Pending" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled";
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
};

const MOCK_ORDERS: RetailOrder[] = [
  {
    id: "R-10511",
    createdAt: "2025-08-29T16:45:00Z",
    status: "Shipped",
    currency: "USD",
    subtotal: 138,
    tax: 20.7,
    shipping: 6.9,
    customer: { first: "Sara", last: "A.", email: "sara@example.com" },
    address: {
      line1: "King Fahd Rd 123",
      city: "Riyadh",
      province: "Riyadh",
      zip: "11564",
      country: "SA",
    },
    delivery: {
      method: "standard",
      trackingId: "SF123456789SA",
      carrier: "Aramex",
    },
    items: [
      {
        sku: "ELV-LUN-DRP-GLD",
        title: "Luna Drop Earrings",
        image: "",
        unit: 49,
        qty: 2,
      },
    ],
    timeline: [
      { label: "Order placed", at: "2025-08-29T16:45:00Z" },
      { label: "Confirmed", at: "2025-08-29T17:10:00Z" },
      { label: "Shipped", at: "2025-08-30T11:20:00Z" },
    ],
  },
  {
    id: "R-10488",
    createdAt: "2025-08-08T12:10:00Z",
    status: "Delivered",
    currency: "USD",
    subtotal: 89,
    tax: 13.35,
    shipping: 0,
    customer: { first: "Sara", last: "A.", email: "sara@example.com" },
    address: {
      line1: "Olaya St 45",
      city: "Riyadh",
      province: "Riyadh",
      zip: "11564",
      country: "SA",
    },
    delivery: {
      method: "express",
      trackingId: "SF987654321SA",
      carrier: "SMSA",
    },
    items: [
      {
        sku: "ELV-AUR-PND-18G",
        title: "Aurelia Pendant",
        image:
          "https://images.unsplash.com/photo-1603561596112-0e8e1f43d0a6?q=80&w=1200&auto=format&fit=crop",
        unit: 89,
        qty: 1,
      },
    ],
    timeline: [
      { label: "Order placed", at: "2025-08-08T12:10:00Z" },
      { label: "Confirmed", at: "2025-08-08T12:25:00Z" },
      { label: "Shipped", at: "2025-08-08T18:40:00Z" },
      { label: "Delivered", at: "2025-08-10T14:05:00Z" },
    ],
  },
];

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

function statusChip(status: OrderStatus) {
  switch (status) {
    case "Pending":
      return "bg-yellow-500 text-neutral-900";
    case "Confirmed":
      return "bg-blue-500 text-white";
    case "Shipped":
      return "bg-amber-600 text-white";
    case "Delivered":
      return "bg-emerald-500 text-white";
    case "Cancelled":
      return "bg-rose-500 text-white";
  }
}
type OrderDetail = {
  id: number;
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
  items: {
    id: number;
    product: {
      name: string;
      image: string;
      description?: string;
      sku: string;
    };
    quantity: number;
    price: number;
  }[];
};
// ------------------------------------------------------------
// Page Component (App Router dynamic route)
// - Accepts optional `params` and safely resolves `id`.
// - Fallbacks: try window.location pathname when params are missing.
// ------------------------------------------------------------

export default function RetailOrderDetailsPage({ id }: { id: string }) {
  const theme: ThemeMode = "dark";
  const palette = useMemo(() => paletteForTheme(theme), [theme]);
  const { user } = useAuth();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // const order = useMemo(
  //   () => (id ? MOCK_ORDERS.find((o) => o.id === id) : undefined),
  //   [id]
  // );
  useEffect(() => {
    if (!user?.access || !id) return;

    const fetchOrder = async () => {
      try {
        const res = await api.get(`/my-orders/${id}/`, {
          headers: {
            Authorization: `Bearer ${user.access}`,
          },
        });
        setOrder(res.data);
      } catch (error) {
        console.error("Failed to fetch order:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [user, id]);
  if (!id) {
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

  const total = order.total_amount;

  return (
    <main className={`${palette.bg} ${palette.fg} min-h-screen antialiased`}>
      <div className="container pt-7 mx-auto">
        <Link href="/orders" className="underline">
          ← Back to My Orders
        </Link>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Order {order.id}</h1>
            <p className={`mt-1 text-sm ${palette.subfg}`}>
              Placed on {new Date(order.created_at).toLocaleString()}
            </p>
          </div>
          <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusChip(
              order.status
            )}`}
          >
            {order.status}
          </span>
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
                        <div className="font-medium">{it.product.name}</div>
                        <div className={`${palette.subfg}`}>
                          SKU: {it.product.sku} · Qty {it.quantity}
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
                        order.tracking_no
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
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2">
              <a
                href={`/invoices/${encodeURIComponent(order.id)}`}
                className={`rounded-xl border ${palette.border} px-4 py-2 text-center text-sm`}
              >
                Download Invoice (PDF)
              </a>
              <a
                href="/support"
                className={`rounded-xl px-4 py-2 text-center text-sm ${palette.button}`}
              >
                Need Help?
              </a>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

/*
------------------------------------------------------------
TESTS (snippets; place in tests/ or __tests__/)

// tests/retail-order-details.test.ts
// If helpers are exported, you can test them like:
// import { money, extractIdFromPath } from "app/account/orders/[id]/page";
// it("formats money", () => { expect(money(100, "USD")).toMatch(/\$/); });
// it("extracts id from path", () => {
//   expect(extractIdFromPath("/account/orders/R-10511")).toBe("R-10511");
//   expect(extractIdFromPath("/account/orders/R-10488?x=1")).toBe("R-10488");
//   expect(extractIdFromPath("/account/orders/")).toBeUndefined();
// });
//------------------------------------------------------------
*/
