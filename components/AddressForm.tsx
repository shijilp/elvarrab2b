"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { z } from "zod";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  User,
  Save,
  X,
  Truck,
  BadgeCheck,
} from "lucide-react";

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
        bg: "bg-[#06111f]",
        fg: "text-white",
        subfg: "text-slate-400",
        card: "bg-gradient-to-br from-slate-950 via-[#071827] to-[#06111f]",
        border: "border-slate-800",
        button:
          "bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 hover:brightness-110",
        ring: "ring-1 ring-slate-800",
        chip: "bg-cyan-500/10 text-cyan-300 border border-cyan-500/30",
      }
    : {
        bg: "bg-slate-50",
        fg: "text-slate-950",
        subfg: "text-slate-600",
        card: "bg-white",
        border: "border-slate-200",
        button:
          "bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:brightness-110",
        ring: "ring-1 ring-slate-200",
        chip: "bg-blue-50 text-blue-700 border border-blue-200",
      };
}

export type AddressType = "shipping" | "billing";

export const AddressSchema = z.object({
  id: z.union([z.number(), z.string()]).optional(),
  full_name: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(7, "Enter phone number"),
  line1: z.string().min(3, "Address line is required"),
  line2: z.string().optional().default(""),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z
    .string()
    .min(4, "PIN/ZIP required")
    .max(10, "PIN/ZIP must be at most 10 characters"),
  country: z.string().default("India"),
  type: z.string().default("shipping"),
  is_default: z.boolean().optional().default(false),
});

export type Address = z.infer<typeof AddressSchema>;

export default function AddressForm({
  type = "shipping",
  initial,
  onSave,
  onCancel,
}: {
  type?: AddressType;
  initial?: Partial<Address>;
  onSave: (addr: Address) => Promise<void> | void;
  onCancel?: () => void;
}) {
  const [form, setForm] = useState<Address>({
    type,
    full_name: "",
    email: "",
    line1: "",
    line2: "",
    city: "",
    pincode: "",
    state: "",
    country: "India",
    phone: "",
    is_default: false,
    ...initial,
  });

  const theme: ThemeMode = "dark";
  const { user } = useAuth();

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof Address>(k: K, v: Address[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const palette = useMemo(() => paletteForTheme(theme), [theme]);

  async function handle(e: React.FormEvent) {
    e.preventDefault();

    const result = AddressSchema.safeParse(form);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};

      result.error.issues.forEach((err) => {
        const field = err.path[0] as string;
        fieldErrors[field] = err.message;
      });

      setErrors(fieldErrors);
      alert(Object.values(fieldErrors).join("\n"));
      return;
    }

    try {
      setErrors({});
      setSaving(true);
      await onSave(result.data);
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (user?.email) {
      set("email", user.email);
    }
  }, [user]);

  const fetchPincode = async (pin: string) => {
    if (pin.length !== 6) return;

    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await res.json();

      if (data?.[0]?.Status === "Success") {
        const office = data[0].PostOffice[0];
        set("city", office.District);
        set("state", office.State);
        set("country", "IN");
      }
    } catch {
      // ignore pincode autofill failure
    }
  };

  const inputClass = (field: keyof Address) =>
    [
      "w-full rounded-2xl border bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition",
      "placeholder:text-slate-600",
      "focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/10",
      errors[field]
        ? "border-red-400/60"
        : "border-slate-800 hover:border-slate-700",
    ].join(" ");

  const labelClass =
    "mb-1.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400";

  const errorText = (field: keyof Address) =>
    errors[field] ? (
      <p className="mt-1 text-xs text-red-300">{errors[field]}</p>
    ) : null;

  return (
    <form onSubmit={handle} className="space-y-4">
      <section
        className={`relative overflow-hidden rounded-3xl border ${palette.border} ${palette.card} ${palette.ring} p-5 shadow-[0_30px_90px_-45px_rgba(37,99,235,.75)] sm:p-6`}
      >
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -left-20 bottom-0 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div
              className={`mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] ${palette.chip}`}
            >
              <Building2 className="h-3.5 w-3.5" />
              Trade Delivery Details
            </div>

            <h3 className={`text-xl font-bold ${palette.fg}`}>
              {type === "billing"
                ? "Billing Address"
                : "Wholesale Shipping Address"}
            </h3>

            <p className={`mt-1 text-sm ${palette.subfg}`}>
              Add delivery information for your Elvarra B2B wholesale order.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Truck className="h-4 w-4 text-cyan-300" />
              India Shipping
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              International buyers contact support
            </div>
          </div>
        </div>

        <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-2">
          {!user?.email && (
            <div className="sm:col-span-2">
              <label className={labelClass}>
                <Mail className="h-3.5 w-3.5 text-cyan-300" />
                Email
              </label>
              <input
                value={form.email || ""}
                onChange={(e) => set("email", e.target.value)}
                placeholder="trade@example.com"
                className={inputClass("email")}
              />
              {errorText("email")}
            </div>
          )}

          <div>
            <label className={labelClass}>
              <User className="h-3.5 w-3.5 text-cyan-300" />
              Full Name
            </label>
            <input
              value={form.full_name}
              onChange={(e) => set("full_name", e.target.value)}
              placeholder="Contact person"
              className={inputClass("full_name")}
            />
            {errorText("full_name")}
          </div>

          <div>
            <label className={labelClass}>
              <Phone className="h-3.5 w-3.5 text-cyan-300" />
              Phone
            </label>
            <input
              value={form.phone || ""}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+91..."
              className={inputClass("phone")}
            />
            {errorText("phone")}
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>
              <MapPin className="h-3.5 w-3.5 text-cyan-300" />
              Address Line 1
            </label>
            <input
              value={form.line1}
              onChange={(e) => set("line1", e.target.value)}
              placeholder="Street, building, shop name"
              className={inputClass("line1")}
            />
            {errorText("line1")}
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Address Line 2</label>
            <input
              value={form.line2 || ""}
              onChange={(e) => set("line2", e.target.value)}
              placeholder="Apartment, landmark, floor, unit"
              className={inputClass("line2")}
            />
            {errorText("line2")}
          </div>

          <div>
            <label className={labelClass}>Postal Code</label>
            <input
              value={form.pincode}
              required
              onChange={(e) => {
                set("pincode", e.target.value);
                fetchPincode(e.target.value);
              }}
              placeholder="PIN / ZIP"
              className={inputClass("pincode")}
            />
            {errorText("pincode")}
          </div>

          <div>
            <label className={labelClass}>City</label>
            <input
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
              placeholder="City"
              className={inputClass("city")}
            />
            {errorText("city")}
          </div>

          <div>
            <label className={labelClass}>State</label>
            <input
              value={form.state || ""}
              onChange={(e) => set("state", e.target.value)}
              placeholder="State"
              className={inputClass("state")}
            />
            {errorText("state")}
          </div>

          <div>
            <label className={labelClass}>Country</label>
            <select
              value={form.country}
              onChange={(e) => set("country", e.target.value)}
              className={inputClass("country")}
            >
              <option value="IN">India</option>
            </select>

            <p className="mt-2 text-xs text-slate-500">
              For international wholesale shipping, please{" "}
              <Link
                href="/contact"
                className="text-cyan-300 hover:text-cyan-200"
              >
                contact trade support
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="relative mt-6 flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-xs text-slate-300">
          <input
            id="terms"
            type="checkbox"
            checked={!!form.is_default}
            onChange={(e) => set("is_default", e.target.checked)}
            className="h-4 w-4 accent-cyan-400"
          />
          <label htmlFor="terms" className="flex items-center gap-2">
            <BadgeCheck className="h-4 w-4 text-cyan-300" />
            Make this my default {type} address
          </label>
        </div>

        <div className="relative mt-6 flex flex-wrap gap-3">
          <button
            disabled={saving}
            className={[
              "inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold transition active:scale-[0.98] disabled:opacity-50",
              palette.button,
            ].join(" ")}
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Trade Address"}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950/70 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          )}
        </div>
      </section>
    </form>
  );
}
