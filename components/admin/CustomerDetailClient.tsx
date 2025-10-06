"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

type OrderItem = {
  id: number;
  product: number;
  product_name: string;
  sku: string;
  quantity: number;
  price: string;
};

type Order = {
  id: number;
  created_at: string;
  status: string;
  is_paid: boolean;
  subtotal: string;
  discount: string;
  shipping: string;
  total_amount: string;
  items: OrderItem[];
};

type Detail = {
  email: string;
  name: string;
  is_registered: boolean;
  orders: number;
  total_spent: string;
  avg_order_value: string;
  first_order_at: string | null;
  last_order_at: string | null;
  order_history: Order[];
};

export default function CustomerDetailClient({ email }: { email: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { user } = useAuth() as any;
  const canView = user?.isAdmin === true;
  const [data, setData] = useState<Detail | null>(null);

  useEffect(() => {
    if (!canView) return;
    api
      .get(`admin/customers/detail?email=${encodeURIComponent(email)}`, {})
      .then((r) => r.data)
      .then(setData)
      .catch(() => setData(null));
  }, [canView, email]);

  if (!canView) return <div className="p-6">Not authorized.</div>;
  if (!data) return <div className="p-6">Loading…</div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/admin/customers" className="underline">
          ← Back
        </Link>
        <h1 className="text-2xl font-semibold">Customer</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl border">
          <div className="text-sm text-gray-500">Name</div>
          <div className="font-medium">{data.name || "—"}</div>
          <div className="text-sm text-gray-500 mt-2">Email</div>
          <div>{data.email}</div>
          <div className="text-sm text-gray-500 mt-2">Registered</div>
          <div>{data.is_registered ? "Yes" : "Guest"}</div>
        </div>

        <div className="p-4 rounded-2xl border">
          <div className="text-sm text-gray-500">Orders</div>
          <div className="text-xl font-semibold">{data.orders}</div>
          <div className="text-sm text-gray-500 mt-2">Total Spent</div>
          <div className="text-xl font-semibold">₹{data.total_spent}</div>
        </div>

        <div className="p-4 rounded-2xl border">
          <div className="text-sm text-gray-500">Avg Order Value</div>
          <div className="text-xl font-semibold">₹{data.avg_order_value}</div>
          <div className="text-sm text-gray-500 mt-2">Last Order</div>
          <div>
            {data.last_order_at
              ? new Date(data.last_order_at).toLocaleString()
              : "—"}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="[&>th]:px-3 [&>th]:py-2 text-left">
              <th>Order</th>
              <th>Date</th>
              <th>Status</th>
              <th>Paid</th>
              <th>Subtotal</th>
              <th>Discount</th>
              <th>Shipping</th>
              <th>Total</th>
              <th>Items</th>
            </tr>
          </thead>
          <tbody className="[&>tr>td]:px-3 [&>tr>td]:py-2">
            {data.order_history.map((o) => (
              <tr key={o.id} className="border-t align-top">
                <td>#{o.id}</td>
                <td>{new Date(o.created_at).toLocaleString()}</td>
                <td>{o.status}</td>
                <td>{o.is_paid ? "Yes" : "No"}</td>
                <td>₹{o.subtotal}</td>
                <td>₹{o.discount}</td>
                <td>₹{o.shipping}</td>
                <td className="font-medium">₹{o.total_amount}</td>
                <td>
                  <ul className="list-disc pl-5">
                    {o.items.map((i) => (
                      <li key={i.id}>
                        {i.product_name} ({i.sku}) × {i.quantity} @ ₹{i.price}
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
            {data.order_history.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center py-8 text-gray-500">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
