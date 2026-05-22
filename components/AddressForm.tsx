"use client";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { z } from "zod";

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
    email: "", // ✅ initialize email
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
  const theme: ThemeMode = "dark"; // match site mode
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

    const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
    const data = await res.json();

    if (data[0].Status === "Success") {
      const office = data[0].PostOffice[0];
      set("city", office.District);
      set("state", office.State);
      set("country", office.Country);
    }
  };

  return (
    <form onSubmit={handle} className="space-y-3 bg-white/5 rounded-xl p-4">
      <section className={`rounded-2xl ${palette.ring} ${palette.card} p-4`}>
        {/* Contact */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {!user?.email && (
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs uppercase tracking-wider opacity-80">
                Email
              </label>
              <input
                value={form.email || ""}
                onChange={(e) => set("email", e.target.value)}
                placeholder="you@example.com"
                className={`w-full rounded-xl border ${palette.border} bg-transparent px-3 py-2 text-sm outline-none`}
              />
            </div>
          )}
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs uppercase tracking-wider opacity-80">
              Phone
            </label>
            <input
              value={form.phone || ""}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+91…"
              className={`w-full rounded-xl border ${palette.border} bg-transparent px-3 py-2 text-sm outline-none`}
            />
          </div>
        </div>

        {/* Shipping address */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider opacity-80">
              Full name
            </label>
            <input
              value={form.full_name}
              onChange={(e) => set("full_name", e.target.value)}
              className={`w-full rounded-xl border ${palette.border} bg-transparent px-3 py-2 text-sm outline-none`}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs uppercase tracking-wider opacity-80">
              Address
            </label>
            <input
              value={form.line1}
              onChange={(e) => set("line1", e.target.value)}
              placeholder="Street, building"
              className={`w-full rounded-xl border ${palette.border} bg-transparent px-3 py-2 text-sm outline-none`}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs uppercase tracking-wider opacity-80">
              Address 2 (optional)
            </label>
            <input
              value={form.line2 || ""}
              onChange={(e) => set("line2", e.target.value)}
              placeholder="Apartment, unit, etc."
              className={`w-full rounded-xl border ${palette.border} bg-transparent px-3 py-2 text-sm outline-none`}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider opacity-80">
              Postal Code
            </label>
            <input
              value={form.pincode}
              required
              //onChange={(e) => set("pincode", e.target.value)}
              onChange={(e) => {
                set("pincode", e.target.value);
                fetchPincode(e.target.value);
              }}
              className={`w-full rounded-xl border ${palette.border} bg-transparent px-3 py-2 text-sm outline-none`}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider opacity-80">
              City
            </label>
            <input
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
              className={`w-full rounded-xl border ${palette.border} bg-transparent px-3 py-2 text-sm outline-none`}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider opacity-80">
              State
            </label>
            <input
              value={form.state || ""}
              onChange={(e) => set("state", e.target.value)}
              className={`w-full rounded-xl border ${palette.border} bg-transparent px-3 py-2 text-sm outline-none`}
            />
          </div>
          {/* <div>
            <label className="mb-1 block text-xs uppercase tracking-wider opacity-80">
              Postal Code
            </label>
            <input
              value={form.pincode}
              required
              onChange={(e) => set("pincode", e.target.value)}
              className={`w-full rounded-xl border ${palette.border} bg-transparent px-3 py-2 text-sm outline-none`}
            />
          </div> */}
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider opacity-80">
              Country
            </label>
            <select
              value={form.country}
              onChange={(e) => set("country", e.target.value)}
              className={`w-full rounded-xl border ${palette.border} bg-transparent px-3 py-2 text-sm outline-none`}
            >
              <option value="IN">India</option>
              {/* <option value="AE">United Arab Emirates</option>
              <option value="US">United States</option>
              <option value="GB">United Kingdom</option> */}
            </select>
            <p className="opacity-80">
              Please <Link href="/contact">contact</Link> us for international
              shipping!
            </p>
          </div>
        </div>

        {/* Terms */}
        <div className="mt-6 flex items-center gap-2 text-xs">
          <input
            id="terms"
            type="checkbox"
            checked={!!form.is_default}
            onChange={(e) => set("is_default", e.target.checked)}
          />
          <span>Make this my default {type} address</span>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            disabled={saving}
            className="px-4 py-2  btn-gradient-accent rounded btn-gradient font-semibold disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save address"}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded border border-white/40 "
            >
              Cancel
            </button>
          )}
        </div>
      </section>
    </form>
  );
}
