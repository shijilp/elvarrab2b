"use client";
import { Address, AddressSchema } from "@/components/AddressForm";
import AddressList from "@/components/AddressList";
import BtnElvarra from "@/components/ui/BtnElvarra";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { api } from "@/lib/api";
import { loadRazorpay } from "@/lib/razorpay";
import Image from "next/image";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import ApplyCoupon from "@/components/ApplyCoupon";
import { useAuth } from "@/context/AuthContext";
import {
  calculateWholesaleEligibility,
  getWholesaleRules,
} from "@/lib/wholesaleRules";
import { api_backend } from "@/lib/api_backend";

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
  is_free_shipping: boolean;
  discount: number | 0;
  coupon_discount: number | 0;
  variant_id: number | null;
};
type PincodeCheck = {
  serviceable: boolean;
  charge?: number;
  delivery_days?: number | null;
};

type WalletSummary = {
  balance: number;
  referral_cleared: number;

  // (optional) if you later expose recent transactions
  // transactions?: Array<{ id: number; amount: number; type: "credit"|"debit"; created_at: string }>
};
function toNumber(n: unknown) {
  const v = typeof n === "number" ? n : parseFloat(String(n ?? 0));
  return Number.isFinite(v) ? v : 0;
}

function paletteForTheme(theme: ThemeMode): Palette {
  // B2B wholesale theme: trade portal / navy / slate / blue
  return {
    bg: "bg-[#07111f]",
    fg: "text-slate-50",
    subfg: "text-slate-400",
    card: "bg-slate-950/80",
    border: "border-slate-800",
    button:
      "bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white hover:brightness-110",
    ring: "ring-1 ring-slate-800",
    chip: "bg-blue-500/15 text-blue-300 border border-blue-500/30",
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
// Default export: B2B Wholesale Checkout Page
// ---------------------------
export default function CheckoutPage() {
  const theme: ThemeMode = "dark"; // match site mode
  const palette = useMemo(() => paletteForTheme(theme), [theme]);
  const router = useRouter();
  const { cartItems, coupon, clearCart } = useCart() as {
    cartItems: CartItem[];
    coupon: {
      code: string;
      discount: number;
      coupon_discount: number;
      shipping_discount: number;
    } | null;
    clearCart: () => void;
  };
  const [shipping, setShipping] = useState<number>(0);
  const [wallet, setWallet] = useState<WalletSummary | null>(null);
  const [walletWillUse, setWalletWillUse] = useState<number>(0);
  const [refWalletWillUse, setRefWalletWillUse] = useState<number>(0);
  const { user } = useAuth();

  const [payableNow, setPayableNow] = useState<number>(0);

  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deliveryEta, setDeliveryEta] = useState<number | null>(null);
  const hasFreeShippingItem = useMemo(
    () => cartItems.some((it) => it.is_free_shipping === true),
    [cartItems],
  );
  const FREE_SHIP_THRESHOLD = hasFreeShippingItem ? 0 : Number(3000) - 1;
  const SHIPPING_FEE = Number(40);
  const shippingDiscount = Number(coupon?.shipping_discount || 0);
  // Payment (demo only)
  const [addr, setAddr] = useState<Address | null>(null);
  let ref_code = "";
  if (typeof window !== "undefined") {
    ref_code = localStorage.getItem("elv_ref") || "";
  }

  // Totals
  const subtotal = useMemo(
    () => cartItems.reduce((s, it) => s + it.price * it.quantity, 0),
    [cartItems],
  );
  const discountTotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (item.discount ?? 0), 0);
  }, [subtotal, cartItems]);

  const coupen_discountTotal = useMemo(() => {
    return Number(coupon?.coupon_discount ?? 0);
  }, [coupon]);

  const discount = coupen_discountTotal + discountTotal;

  //const discount = Number(coupon?.discount ?? discountTotal);
  const taxable = Math.max(0, subtotal - discount);
  // const vat = useMemo(() => computeVAT(taxable), [taxable]);
  const total = Math.max(0, taxable + shipping);

  // useEffect(() => {
  //   if (subtotal === 0) setShipping(0);
  //   else if (subtotal >= 999) setShipping(0);
  // }, [subtotal]);

  const wholesaleEligibility = useMemo(() => {
    return calculateWholesaleEligibility({
      cartItems,
      subtotal,
      discount,
      user,
    });
  }, [cartItems, subtotal]);
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const r = await api.get("/wallet/"); // expects { balance, transactions: [...] }
        if (!ignore) {
          setWallet({
            balance: toNumber(r.data?.main_cleared ?? 0),
            referral_cleared: toNumber(r.data?.referral_cleared ?? 0),
          });
        }
      } catch {
        // ignore for guests / errors
        setWallet(null);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);
  useEffect(() => {
    // front-end estimate; final source of truth is backend response
    const gross = Math.max(0, subtotal - discount + shipping);
    const refcanUse = Math.min(wallet?.referral_cleared ?? 0, gross * 0.1); // max 50% of order
    setRefWalletWillUse(refcanUse);
    const canUse = Math.min(wallet?.balance ?? 0, gross - refcanUse);
    setWalletWillUse(canUse);
    const maxShipDisc =
      shippingDiscount > 0 ? Math.min(SHIPPING_FEE, shippingDiscount) : 0;
    console;
    setShipping(
      subtotal > FREE_SHIP_THRESHOLD ? 0 : SHIPPING_FEE - maxShipDisc,
    );
    setPayableNow(Math.max(0, gross - refcanUse - canUse));
  }, [
    subtotal,
    discount,
    discountTotal,
    shipping,
    wallet,
    FREE_SHIP_THRESHOLD,
    coupon,
  ]);

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
        : (first?.message ?? "Invalid input 1");
    }
    return cartItems.length === 0 ? "Your cart is empty." : null;
  };

  const placeOrder = async () => {
    const msg = validate();
    if (msg) {
      setError(msg);
      alert(msg);
      return;
    }

    const totalQty = cartItems.reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0,
    );

    const totalSku = cartItems.length;
    const qtyPerSku = totalSku > 0 ? totalQty / totalSku : 0;

    if (!wholesaleEligibility.isWholesaleEligible) {
      if (subtotal < wholesaleEligibility.minWholesaleValue) {
        const alertMsg = "Minimum wholesale order value should be ₹2,000.";
        setError(alertMsg);
        alert(alertMsg);
        return;
      }
      if (qtyPerSku < wholesaleEligibility.qtyNeededForRatio) {
        const alertMsg =
          "Minimum wholesale quantity ratio should be 2 or above. Please increase quantity or reduce SKUs.";
        setError(alertMsg);
        alert(alertMsg);
        return;
      }
    }

    if (addr?.full_name == null || addr.email == null || addr.phone == null) {
      const alertMsg = "Please select a valid delivery address.";
      setError(alertMsg);
      alert(alertMsg);
      return;
    }

    setError(null);
    setPlacing(true);

    try {
      const payload = {
        cart_items: cartItems.map((x) => ({
          product: x.id,
          quantity: x.quantity,
          discount: x.discount,
          variant_id: x.variant_id ? x.variant_id : null,
        })),
        contact: {
          full_name: addr.full_name,
          email: addr.email,
          phone: addr.phone,
        },
        address: {
          line1: addr.line1,
          line2: addr.line2,
          city: addr.city,
          state: addr.state,
          pincode: addr.pincode,
          country: addr.country,
        },
        shipping: shipping,
        coupon_code: coupon?.code || "",
        subtotal: subtotal,
        ref_code,
      };

      const { data } = await api.post("b2b/checkout/", payload);

      const finalPayable = toNumber(data?.net_amount ?? 0);
      const walletUsedServer = toNumber(data?.wallet_used ?? 0);
      const refwalletUsedServer = toNumber(data?.ref_wallet_used ?? 0);

      if (refwalletUsedServer > 0) setRefWalletWillUse(refwalletUsedServer);
      if (walletUsedServer > 0) setWalletWillUse(walletUsedServer);

      setPayableNow(finalPayable);

      if (!finalPayable || finalPayable <= 0) {
        await api_backend.post("api/elvarra/payment/zero/", {
          order_id: data.order_id,
        });
        clearCart();
        router.push(`/orders/confirmation?order=${data.order_id}`);
        return;
      }

      const ok = await openRazorpayAndPay({
        rzpOrderId: data.razorpay_order_id,
        orderId: String(data.order_id),
        currency: data.currency || "INR",
        name: addr.full_name,
        email: addr.email,
        contact: addr.phone,
      });

      if (!ok) return;

      clearCart();
      router.push(`/orders/confirmation?order=${data.order_id}`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      const msg =
        e?.response?.data?.detail ||
        e?.message ||
        "Failed to create order. Please try again.";

      setError(msg);
      alert(msg);
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
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.22),transparent_35%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.14),transparent_32%)]" />

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-[#07111f] p-5 shadow-[0_20px_80px_-45px_rgba(37,99,235,.75)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-blue-300">
                Elvarra Trade Portal
              </div>
              <h1 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Wholesale Checkout
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-400">
                Complete your trade order with verified shipping details,
                wholesale eligibility, wallet credits, and secure Razorpay
                payment.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3">
                <div className="text-xs text-slate-500">Min Order</div>
                <div className="font-semibold text-white">
                  ₹{getWholesaleRules(100).minOrderValue}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3">
                <div className="text-xs text-slate-500">Qty/SKU</div>
                <div className="font-semibold text-white">
                  {getWholesaleRules(100).minQtyPerSku}+
                </div>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3">
                <div className="text-xs text-slate-500">Payment</div>
                <div className="font-semibold text-white">Secure</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4"></div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_400px]">
          {/* Form */}
          <section
            className={`rounded-3xl border border-slate-800 bg-slate-950/75 p-5 shadow-[0_18px_70px_-45px_rgba(15,23,42,.95)]`}
          >
            <div className="mb-5 flex items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Trade Delivery Details
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Select the delivery address for this wholesale order.
                </p>
              </div>
              <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-blue-300">
                B2B
              </span>
            </div>
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
            <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/85 p-5 shadow-[0_18px_70px_-45px_rgba(37,99,235,.65)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Wholesale Order Summary
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Trade pricing, shipping and credits
                  </p>
                </div>
                <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-cyan-300">
                  Trade
                </span>
              </div>
              <div className="mt-3 space-y-2 text-sm">
                {cartItems.map((it) => (
                  <div
                    key={it.id}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/45 p-2"
                  >
                    <div className="flex items-center gap-3">
                      <Image
                        width={64}
                        height={64}
                        src={it.image || ""}
                        alt={it.name}
                        className="h-12 w-12 rounded-xl border border-slate-800 object-cover"
                      />
                      <div className=" truncate w-[200px]">
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

                <div className="flex items-center justify-between border-t border-slate-800 pt-3">
                  <span className="font-medium">Total</span>
                  <span className="font-semibold">{formatMoney(total)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="opacity-80">Wallet balance</span>
                  <span>{formatMoney(wallet?.balance ?? 0)}</span>
                </div>

                {/* Show only if anything will be used */}
                {(walletWillUse ?? 0) > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="opacity-80">Wallet applied</span>
                    <span>-{formatMoney(walletWillUse)}</span>
                  </div>
                )}
                {(refWalletWillUse ?? 0) > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="opacity-80">Referral applied</span>
                    <span>-{formatMoney(refWalletWillUse)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-slate-800 pt-3">
                  <span className="opacity-80">Payable now</span>
                  <span className="font-medium">{formatMoney(payableNow)}</span>
                </div>
              </div>

              <ApplyCoupon email={addr?.email} shippingcost={shipping} />
            </div>
            <BtnElvarra
              disabled={
                !wholesaleEligibility.isWholesaleEligible ||
                placing ||
                cartItems.length === 0 ||
                !addr
              }
              onClick={placeOrder}
              className={`w-full rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_60px_-28px_rgba(59,130,246,.9)] transition hover:-translate-y-[1px] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-30`}
            >
              {" "}
              {placing
                ? "Processing Trade Order…"
                : "Pay Securely & Place Wholesale Order"}
            </BtnElvarra>
            {error && (
              <p className="rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                {error}
              </p>
            )}
            <p className="text-xs leading-relaxed text-slate-500">
              You’ll be redirected to Razorpay to complete payment.
              {deliveryEta !== null && shipping > 0 && (
                <> Estimated delivery in {deliveryEta} days.</>
              )}
            </p>
            <div className="rounded-3xl border border-slate-800 bg-slate-950/75 p-4 text-sm text-slate-400">
              <div className="font-semibold text-white">
                Trade checkout protection
              </div>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Wholesale orders are validated before payment.</li>
                <li>All payments are 3D-secure where applicable.</li>
                <li>
                  Orders ship within 24-48h on business days after confirmation.
                </li>
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
      name: "Elvarra Wholesale",
      description: `Wholesale Order #${opts.orderId}`,
      prefill: { name: opts.name, email: opts.email, contact: opts.contact },
      theme: { color: "#2563eb" },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      handler: async function (resp: any) {
        // Immediately verify on backend
        try {
          await api.post("/api/elvarra/payment/verify/", {
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
