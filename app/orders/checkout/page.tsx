"use client";
import { Address, AddressSchema } from "@/components/AddressForm";
import AddressList from "@/components/AddressList";
import BtnElvarra from "@/components/ui/BtnElvarra";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { api } from "@/lib/api";
import { loadRazorpay } from "@/lib/razorpay";
import ApplyCoupon from "@/components/ApplyCoupon";
import Image from "next/image";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";

// Theme palette utilities (local)
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
type CartItem = {
  id: number | string; // product id
  name: string;
  price: number;
  quantity: number;
  image?: string;
};
type PincodeCheck = {
  serviceable: boolean;
  charge?: number;
  delivery_days?: number | null;
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
// Types & helpers
// ---------------------------
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
// 15% VAT example (KSA)
// function computeVAT(amount: number, rate = 0.15) {

//   return Math.max(0, Math.round(amount * rate * 100) / 100);
// }

// ---------------------------
// Default export: Retail Checkout Page
// ---------------------------
export default function CheckoutPage() {
  const theme: ThemeMode = "dark"; // match site mode
  const palette = useMemo(() => paletteForTheme(theme), [theme]);
  const router = useRouter();
  const { cartItems, coupon, clearCart } = useCart() as {
    cartItems: CartItem[];
    coupon: { code: string; discount: number } | null;
    clearCart: () => void;
  };
  console.log(cartItems, "scas");
  const [shipping, setShipping] = useState<number>(0);

  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deliveryEta, setDeliveryEta] = useState<number | null>(null);

  // Payment (demo only)
  const [addr, setAddr] = useState<Address | null>(null);

  // Totals
  const subtotal = useMemo(
    () => cartItems.reduce((s, it) => s + it.price * it.quantity, 0),
    [cartItems]
  );
  const discount = Number(coupon?.discount ?? 0);

  const taxable = Math.max(0, subtotal - discount);
  // const vat = useMemo(() => computeVAT(taxable), [taxable]);
  const total = Math.max(0, taxable + shipping);

  // useEffect(() => {
  //   if (subtotal === 0) setShipping(0);
  //   else if (subtotal >= 999) setShipping(0);
  // }, [subtotal]);
  const validate = (): string | null => {
    const res = AddressSchema.safeParse(addr);
    if (!res.success) {
      // Option A: grab first issue
      const first = res.error.issues[0];
      const errors: Record<string, string> = {};
      for (const issue of res.error.issues) {
        const field = issue.path[0] as string;
        errors[field] = issue.message;
      }
      const customMessages =
        first?.message === "Invalid input: expected object, received null"
          ? "Please enter a valid Address."
          : null;
      return customMessages
        ? customMessages
        : first?.message ?? "Invalid input 1";
    }
    return cartItems.length === 0 ? "Your cart is empty." : null;
  };

  const placeOrder = async () => {
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }
    setError(null);
    setPlacing(true);
    try {
      // Your backend reads actual cart from DB/session; this payload mirrors your view expectations
      const payload = {
        cart_items: cartItems.map((x) => ({
          product: x.id,
          quantity: x.quantity,
        })),
        contact: {
          full_name: addr?.full_name,
          email: addr?.email,
          phone: addr?.phone,
        },
        address: {
          line1: addr?.line1,
          line2: addr?.line2,
          city: addr?.city,
          state: addr?.state,
          pincode: addr?.pincode,
          country: addr?.country,
        },
        shipping: shipping,
        coupon_code: coupon?.code || "",
        subtotal: subtotal,
      };
      if (addr?.full_name == null || addr.email == null || addr.phone == null)
        return;
      const { data } = await api.post("checkout/", payload);
      // Expected response: { order_id, razorpay_order_id, total_amount, currency, ... }
      const ok = await openRazorpayAndPay({
        rzpOrderId: data.razorpay_order_id,
        orderId: String(data.order_id),
        currency: data.currency || "INR",
        name: addr.full_name,
        email: addr.email,
        contact: addr.phone,
      });

      if (!ok) return;

      // Verify on backend (sends signature + ids from Razorpay)
      // NOTE: we do this in the handler inside openRazorpayAndPay()
      clearCart();
      //await api.post("orders/send-shipped/", { order_id: data.order_id });

      router.push(`/orders/confirmation?order=${data.order_id}`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      const msg =
        e?.response?.data?.detail ||
        e?.message ||
        "Failed to create order. Please try again.";
      setError(msg);
    } finally {
      setPlacing(false);
    }
  };
  useEffect(() => {
    if (addr?.pincode == null || !addr?.pincode || addr?.pincode.length < 6)
      return;
    const pin = addr.pincode?.trim();
    const controller = new AbortController();

    const load = async () => {
      try {
        const r = await api.get(`shipping/check/${pin}/`, {
          signal: controller.signal,
        });

        // Axios returns JSON already in r.data
        const data: PincodeCheck = r.data;

        if (!data) throw new Error("pincode check failed");

        if (data.serviceable) {
          setShipping(Number(data.charge || 0));
          setDeliveryEta(data.delivery_days ?? null);
        } else {
          setShipping(0);
          setDeliveryEta(null);
        }
      } catch (err) {
        console.error("Pincode check error:", err);
        setShipping(0);
        setDeliveryEta(null);
      }
    };

    load();

    return () => controller.abort();
  }, [addr?.pincode]);
  return (
    <main className={`${palette.bg} ${palette.fg} min-h-screen antialiased`}>
      <div className="container py-8 mx-auto">
        <h1 className="text-2xl font-semibold">Checkout</h1>
        <p className={`mt-1 text-sm ${palette.subfg}`}>
          Secure checkout • Free shipping over $150 • 30‑day returns
        </p>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
          {/* Form */}
          <section
            className={`rounded-2xl ${palette.ring} ${palette.card} p-4`}
          >
            <section className="md:col-span-3 space-y-6">
              <AddressList type="shipping" onPick={setAddr} />
            </section>
            {/* Delivery */}
            {/* <div className="mt-6">
              <div className="text-sm font-medium">Delivery method</div>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  {
                    id: "standard",
                    label: "Standard (3–5 days)",
                    desc: "Tracked courier",
                    price: shippingCost("standard", subtotal, hasFreeShip),
                  },
                  {
                    id: "express",
                    label: "Express (1–2 days)",
                    desc: "Priority courier",
                    price: shippingCost("express", subtotal, hasFreeShip),
                  },
                ].map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex cursor-pointer items-center justify-between rounded-2xl ${palette.ring} ${palette.card} p-3`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="delivery"
                        value={opt.id}
                        checked={method === opt.id}
                        onChange={() => setMethod(opt.id)}
                      />
                      <div>
                        <div className="text-sm font-medium">{opt.label}</div>
                        <div className={`text-xs ${palette.subfg}`}>
                          {opt.desc}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-medium">
                      {formatMoney(opt.price)}
                    </div>
                  </label>
                ))}
              </div>
            </div> */}
            {/* Payment */}
            {/* <div className="mt-6">
              <div className="text-sm font-medium">Payment</div>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { id: "card", label: "Card" },
                  { id: "apple", label: "Apple Pay" },
                  { id: "cash", label: "Cash on Delivery" },
                ].map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex cursor-pointer items-center justify-between rounded-2xl ${palette.ring} ${palette.card} p-3`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        value={opt.id}
                        checked={payment === opt.id}
                        onChange={() => setPayment(opt.id)}
                      />
                      <div className="text-sm font-medium">{opt.label}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div> */}
            {/* Terms */}

            <div className="mt-6"></div>
          </section>

          {/* Summary */}
          <aside className="space-y-4">
            <div className={`rounded-2xl ${palette.ring} ${palette.card} p-4`}>
              <h2 className="text-lg font-semibold">Order summary</h2>
              <div className="mt-3 space-y-2 text-sm">
                {cartItems.map((it) => (
                  <div
                    key={it.id}
                    className="flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <Image
                        width={64}
                        height={64}
                        src={it.image || ""}
                        alt={it.name}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                      <div>
                        <div>{it.name}</div>
                        <div className={`text-xs ${palette.subfg}`}>
                          Qty {it.quantity}
                        </div>
                      </div>
                    </div>
                    <div className="font-medium">
                      {formatMoney(it.price * it.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="opacity-80">Subtotal</span>
                  <span>{formatMoney(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="opacity-80">Discount</span>
                  <span>-{formatMoney(discount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="opacity-80">Shipping</span>
                  <span>{formatMoney(shipping)}</span>
                </div>
                {/* <div className="flex items-center justify-between">
                  <span className="opacity-80">VAT (15%)</span>
                  <span>{formatMoney(vat)}</span>
                </div> */}
                <div className="flex items-center justify-between border-t pt-2">
                  <span className="font-medium">Total</span>
                  <span className="font-semibold">{formatMoney(total)}</span>
                </div>
              </div>

              <ApplyCoupon email={addr?.email} />
            </div>
            <BtnElvarra
              disabled={placing || cartItems.length === 0}
              onClick={placeOrder}
              className={` w-full px-5 py-3 text-sm font-medium btn-gradient-accent `}
            >
              {" "}
              {placing ? "Processing…" : "Pay securely"}
            </BtnElvarra>
            <p>{error}</p>
            <p className="text-xs text-gray-500">
              You’ll be redirected to Razorpay to complete payment.
              {deliveryEta !== null && shipping > 0 && (
                <> Estimated delivery in {deliveryEta} days.</>
              )}
            </p>
            <div
              className={`rounded-2xl ${palette.ring} ${palette.card} p-4 text-sm ${palette.subfg}`}
            >
              <div className="font-medium text-current">Secure checkout</div>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>All payments are 3D‑secure where applicable.</li>
                <li>Orders ship within 24–48h on business days.</li>
                <li>Easy returns within 30 days.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
      <LoadingOverlay show={placing} />
    </main>
  );
}

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
