"use client";
import { api } from "@/lib/api";
import { loadRazorpay } from "@/lib/razorpay";
import { Order } from "@/types";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const OrderRepay = ({ order_id }: { order_id: number }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!order_id) return;
    const fetchOrder = async () => {
      const res = await api.get(`my-orders/${order_id}/`);
      setOrder(res.data);
    };
    fetchOrder();
  }, [order_id]);
  function toNumber(n: unknown) {
    const v = typeof n === "number" ? n : parseFloat(String(n ?? 0));
    return Number.isFinite(v) ? v : 0;
  }
  const handlePay = async () => {
    if (!order) return;
    const finalPayable = toNumber(order?.net_amount ?? 0);

    if (!finalPayable || finalPayable <= 0) {
      // Minimal backend endpoint to mark paid due to wallet
      // Implement tiny view: takes order_id, sets is_paid=True, status='confirmed'
      await api.post("/payment/zero/", { order_id: order_id });

      router.push(`/orders/confirmation?order=${order_id}`);
      return;
    }

    const { data } = await api.post(`create-payment-order/`, {
      order_id: order.id,
      amount: order.net_amount,
    });
    const ok = await openRazorpayAndPay({
      rzpOrderId: data.id,
      orderId: String(order_id),
      currency: data.currency || "INR",
      name: order.full_name,
      email: order.email,
      contact: order.phone,
    });
    if (!ok) return;
    router.push(`/orders/confirmation?order=${order_id}`);
  };
  if (!order) return <p>Loading...</p>;

  return (
    <button
      onClick={handlePay}
      className="rounded-xl btn-gradient-accent px-3 py-2 text-sm font-semibold text-[var(--text-dark)]"
    >
      Pay Now
    </button>
  );
};

export default OrderRepay;

async function openRazorpayAndPay(opts: {
  rzpOrderId: string;
  orderId: string;
  currency: string;
  name: string;
  email: string;
  contact: string;
}) {
  const loaded = await loadRazorpay();
  if (!loaded) {
    alert("Failed to load Razorpay. Please try again.");
    return false;
  }

  return new Promise<boolean>((resolve) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rzp = new (window as any).Razorpay({
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // public key
      order_id: opts.rzpOrderId, // server-created order id
      currency: opts.currency,
      name: "Elvarra",
      description: `Order #${opts.orderId}`,
      prefill: { name: opts.name, email: opts.email, contact: opts.contact },
      theme: { color: "#0140a9" },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      handler: async function (resp: any) {
        // Immediately verify on backend
        try {
          await api.post("/payment/verify/", {
            order_id: opts.orderId,
            razorpay_order_id: resp.razorpay_order_id,
            razorpay_payment_id: resp.razorpay_payment_id,
            razorpay_signature: resp.razorpay_signature,
          });
          resolve(true);
        } catch (e) {
          alert("Payment verification failed." + (e as string));
          resolve(false);
        }
      },
      modal: {
        ondismiss: function () {
          resolve(false);
        },
      },
    });
    rzp.open();
  });
}
