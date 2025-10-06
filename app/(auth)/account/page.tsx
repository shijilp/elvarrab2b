"use client";

import { api } from "@/lib/api";
import Link from "next/link";
import React, { useEffect, useState } from "react";

// ------------------------------------------------------------
// Elvarra / Elvara — ACCOUNT SETTINGS (Retail)
// Route: app/account/settings/page.tsx
// Refactor notes:
//  - Keep the same data flow & API helpers
//  - Switch to the layout/styling used by AccountPage:
//    • bg-zinc-950/text-zinc-100 page shell
//    • cards: rounded-2xl border border-zinc-800 bg-zinc-900
//    • inputs: border-zinc-800 bg-zinc-950
//    • primary buttons: gradient using var(--color-primary)/(--color-accent)
//    • secondary buttons: bordered zinc
// ------------------------------------------------------------

// ---------------------------------
// Types
// ---------------------------------
export type Address = {
  id: string; // uuid-ish
  name: string; // Full name
  phone?: string;
  line1: string;
  line2?: string;
  city: string;
  province: string;
  zip: string;
  country: string;
  isDefault?: boolean;
};
type WalletSummary = { balance: number };
function asNumber(v: unknown, def = 0): number {
  const n = Number(v);
  return isNaN(n) ? def : n;
}

// ---------------------------------
// Helpers
// ---------------------------------
function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit & { timeoutMs?: number } = {}
) {
  const { timeoutMs = 12000, ...rest } = init;
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...rest,
      signal: ctrl.signal,
      credentials: "include",
    });
    return res;
  } finally {
    clearTimeout(id);
  }
}

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}
async function safeText(res: Response) {
  try {
    return await res.text();
  } catch {
    return "";
  }
}

// Try API first; fallback to localStorage mock for addresses
const LS_KEY = "elvara:addresses";

async function apiListAddresses(): Promise<Address[]> {
  try {
    const r = await fetchWithTimeout("/api/account/addresses/", {
      method: "GET",
    });
    if (r.ok) return (await r.json()) as Address[];
  } catch {}
  // fallback
  const raw =
    typeof window !== "undefined" ? localStorage.getItem(LS_KEY) : null;
  return raw ? (JSON.parse(raw) as Address[]) : [];
}

async function apiSaveAddress(a: Address) {
  try {
    const r = await fetchWithTimeout("/api/account/addresses/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(a),
    });
    if (r.ok) return await safeJson(r);
  } catch {}
  // fallback
  const arr = await apiListAddresses();
  const next = [...arr, a];
  if (typeof window !== "undefined") {
    localStorage.setItem(LS_KEY, JSON.stringify(next));
  }
  return { ok: true };
}

async function apiUpdateAddress(a: Address) {
  try {
    const r = await fetchWithTimeout(
      `/api/account/addresses/${encodeURIComponent(a.id)}/`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(a),
      }
    );
    if (r.ok) return await safeJson(r);
  } catch {}
  // fallback
  const arr = await apiListAddresses();
  const idx = arr.findIndex((x) => x.id === a.id);
  if (idx >= 0) arr[idx] = a;
  if (typeof window !== "undefined") {
    localStorage.setItem(LS_KEY, JSON.stringify(arr));
  }
  return { ok: true };
}

async function apiDeleteAddress(id: string) {
  try {
    const r = await fetchWithTimeout(
      `/api/account/addresses/${encodeURIComponent(id)}/`,
      {
        method: "DELETE",
      }
    );
    if (r.ok) return true;
  } catch {}
  // fallback
  const arr = await apiListAddresses();
  if (typeof window !== "undefined") {
    localStorage.setItem(
      LS_KEY,
      JSON.stringify(arr.filter((x) => x.id !== id))
    );
  }
  return true;
}

async function apiSetDefault(id: string) {
  try {
    const r = await fetchWithTimeout(
      `/api/account/addresses/${encodeURIComponent(id)}/default/`,
      {
        method: "POST",
      }
    );
    if (r.ok) return true;
  } catch {}
  // fallback
  const arr = await apiListAddresses();
  const next = arr.map((x) => ({ ...x, isDefault: x.id === id }));
  if (typeof window !== "undefined") {
    localStorage.setItem(LS_KEY, JSON.stringify(next));
  }
  return true;
}

async function apiChangePassword(current: string, nextPass: string) {
  const payload = { current, password: nextPass };
  const tryPost = async (url: string) =>
    fetchWithTimeout(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  let res = await tryPost("/api/account/password/");
  if (!res.ok && res.status === 404)
    res = await tryPost("/api/account/password");
  if (!res.ok)
    throw new Error(
      (await safeText(res)) || `Password update failed (${res.status})`
    );
  return true;
}
async function apiGetWallet(): Promise<WalletSummary> {
  // Try /api/wallet/ → /wallet/ → /account/wallet/
  const tryUrls = ["/api/wallet/", "/wallet/", "/account/wallet/"];
  for (const url of tryUrls) {
    try {
      const r = await api.get(url);
      if (r.data) {
        const data = await r.data;
        return { balance: asNumber(data?.balance, 0) };
      }
    } catch {}
  }
  return { balance: 0 };
}
export default function AccountSettingsPage() {
  // Password
  const [cur, setCur] = useState("");
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [pwErr, setPwErr] = useState<string | null>(null);
  const [pwOk, setPwOk] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [wallet, setWallet] = useState<WalletSummary | null>(null);
  const [walletErr, setWalletErr] = useState<string | null>(null);

  // Addresses
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [adErr, setAdErr] = useState<string | null>(null);
  const [editing, setEditing] = useState<Address | null>(null);

  useEffect(() => {
    (async () => {
      const list = await apiListAddresses();
      setAddresses(list);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const w = await apiGetWallet();
        setWallet(w);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        setWalletErr("Unable to load wallet");
        setWallet({ balance: 0 });
      }
    })();
  }, []);

  function validatePass(): string | null {
    if (!cur) return "Please enter your current password.";
    if (pass.length < 6) return "New password must be at least 6 characters.";
    if (pass !== confirm) return "Passwords do not match.";
    return null;
  }

  async function submitPass(e: React.FormEvent) {
    e.preventDefault();
    setPwErr(null);
    setPwOk(false);
    const v = validatePass();
    if (v) return setPwErr(v);
    setPwLoading(true);
    try {
      await apiChangePassword(cur, pass);
      setPwOk(true);
      setCur("");
      setPass("");
      setConfirm("");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setPwErr(err?.message || "Unable to change password.");
    } finally {
      setPwLoading(false);
    }
  }

  function upsertLocal(addr: Address) {
    setAddresses((prev) => {
      const i = prev.findIndex((x) => x.id === addr.id);
      if (i >= 0) {
        const next = [...prev];
        next[i] = addr;
        return next;
      }
      return [addr, ...prev];
    });
  }

  async function saveAddress(a: Address) {
    setAdErr(null);
    try {
      if (addresses.some((x) => x.id === a.id)) await apiUpdateAddress(a);
      else await apiSaveAddress(a);
      upsertLocal(a);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setAdErr(e?.message || "Unable to save address.");
    }
  }

  async function removeAddress(id: string) {
    setAdErr(null);
    try {
      await apiDeleteAddress(id);
      setAddresses((prev) => prev.filter((x) => x.id !== id));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setAdErr(e?.message || "Unable to delete address.");
    }
  }

  async function makeDefault(id: string) {
    setAdErr(null);
    try {
      await apiSetDefault(id);
      setAddresses((prev) =>
        prev.map((x) => ({ ...x, isDefault: x.id === id }))
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setAdErr(e?.message || "Unable to set default.");
    }
  }

  function AddressCard({ a }: { a: Address }) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-medium text-zinc-100">
              {a.name}
              {a.isDefault ? (
                <span className="ml-2 rounded-full border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-[10px]">
                  Default
                </span>
              ) : null}
            </div>
            <div className="mt-1 text-xs text-zinc-300">
              <div className="truncate">
                {a.line1}
                {a.line2 ? ", " + a.line2 : ""}
              </div>
              <div className="truncate">
                {a.city}, {a.province} {a.zip}
              </div>
              <div className="truncate">{a.country}</div>
              {a.phone && <div className="truncate">Phone: {a.phone}</div>}
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            {!a.isDefault && (
              <button
                onClick={() => makeDefault(a.id)}
                className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs hover:bg-zinc-800"
              >
                Make Default
              </button>
            )}
            <button
              onClick={() => setEditing(a)}
              className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs hover:bg-zinc-800"
            >
              Edit
            </button>
            <button
              onClick={() => removeAddress(a.id)}
              className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs hover:bg-zinc-800"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  }

  function AddressEditor({
    value,
    onClose,
  }: {
    value?: Address | null;
    onClose: () => void;
  }) {
    const [form, setForm] = useState<Address>(
      value ??
        ({
          id: uid(),
          name: "",
          line1: "",
          city: "",
          province: "",
          zip: "",
          country: "Saudi Arabia",
        } as Address)
    );

    function set<K extends keyof Address>(k: K, v: Address[K]) {
      setForm((s) => ({ ...s, [k]: v }));
    }

    async function submit(e: React.FormEvent) {
      e.preventDefault();
      if (!form.name.trim()) return alert("Please enter name");
      if (!form.line1.trim()) return alert("Please enter address line 1");
      if (!form.city.trim() || !form.province.trim() || !form.zip.trim())
        return alert("Please complete city/province/zip");
      await saveAddress(form);
      onClose();
    }

    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
        <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {value ? "Edit address" : "Add address"}
            </h3>
            <button
              onClick={onClose}
              className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs hover:bg-zinc-800"
            >
              Close
            </button>
          </div>
          <form onSubmit={submit} className="mt-4 grid grid-cols-1 gap-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Full name"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none"
              />
              <input
                value={form.phone || ""}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="Phone (optional)"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none"
              />
            </div>
            <input
              value={form.line1}
              onChange={(e) => set("line1", e.target.value)}
              placeholder="Address line 1"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none"
            />
            <input
              value={form.line2 || ""}
              onChange={(e) => set("line2", e.target.value)}
              placeholder="Address line 2 (optional)"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none"
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <input
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                placeholder="City"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none"
              />
              <input
                value={form.province}
                onChange={(e) => set("province", e.target.value)}
                placeholder="Province"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none"
              />
              <input
                value={form.zip}
                onChange={(e) => set("zip", e.target.value)}
                placeholder="ZIP"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none"
              />
            </div>
            <input
              value={form.country}
              onChange={(e) => set("country", e.target.value)}
              placeholder="Country"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none"
            />

            <div className="mt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-[var(--text-dark)]"
              >
                {value ? "Save" : "Add"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-dvh bg-zinc-950 text-zinc-100 antialiased">
      <section className="mx-auto max-w-7xl px-4 py-6 sm:py-10">
        {/* Page header card */}
        <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900">
          <div className="grid gap-6 p-6 sm:grid-cols-[1fr_auto] sm:items-center sm:p-8">
            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold sm:text-2xl">
                Account settings
              </h1>
              <p className="mt-1 truncate text-sm text-zinc-400">
                Manage your password and shipping addresses.
              </p>
            </div>
            <div className="flex flex-col items-stretch gap-2 sm:items-end">
              <Link
                href="/orders"
                className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm hover:bg-zinc-800"
              >
                My orders
              </Link>
            </div>
          </div>
        </div>
        {/* Wallet */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 mt-6  ">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">My wallet</h2>
            <div className="text-xs text-zinc-400">
              {walletErr ? walletErr : "Auto-applied at checkout"}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
              <div className="text-xs uppercase tracking-wider text-zinc-400">
                Current balance
              </div>
              <div className="mt-1 text-2xl font-semibold">
                ₹{(wallet?.balance ?? 0).toFixed(2)}
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
              <div className="text-xs uppercase tracking-wider text-zinc-400">
                Status
              </div>
              <div className="mt-1 text-sm">Active</div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
              <div className="text-xs uppercase tracking-wider text-zinc-400">
                How it works
              </div>
              <p className="mt-1 text-xs text-zinc-300">
                If an order is cancelled before shipping, the refundable amount
                goes to your wallet. At checkout, your wallet is auto-applied;
                any remainder is paid via Razorpay.
              </p>
            </div>
          </div>

          {/* (Optional) a link to a transactions page if you add one later */}
          {/* <div className="mt-4">
              <a
                href="/account/wallet/transactions"
                className="text-sm text-zinc-300 underline-offset-4 hover:underline"
              >
                View transactions
              </a>
            </div> */}
        </section>

        {/* Main grid */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr]">
          {/* Change Password */}
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Change password</h2>
            </div>

            <form onSubmit={submitPass} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider opacity-80">
                  Current password
                </label>
                <input
                  type="password"
                  value={cur}
                  onChange={(e) => setCur(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider opacity-80">
                  New password
                </label>
                <div className="flex items-stretch overflow-hidden rounded-xl border border-zinc-800">
                  <input
                    type={show ? "text" : "password"}
                    value={pass}
                    onChange={(e) => setPass(e.target.value)}
                    className="w-full bg-zinc-950 px-3 py-2 text-sm outline-none"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    className="px-3 text-sm text-zinc-300 hover:text-zinc-100"
                  >
                    {show ? "Hide" : "Show"}
                  </button>
                </div>
                <p className="mt-1 text-xs text-zinc-400">
                  Minimum 6 characters.
                </p>
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider opacity-80">
                  Confirm new password
                </label>
                <input
                  type={show ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none"
                  required
                />
              </div>

              {pwErr && (
                <div className="rounded-xl border border-rose-500/50 bg-rose-500/10 p-3 text-sm text-rose-200">
                  {pwErr}
                </div>
              )}
              {pwOk && (
                <div className="rounded-xl border border-emerald-500/50 bg-emerald-500/10 p-3 text-sm text-emerald-200">
                  Password updated.
                </div>
              )}

              <button
                type="submit"
                disabled={pwLoading}
                className="rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-[var(--text-dark)] disabled:opacity-60"
              >
                {pwLoading ? "Saving…" : "Update password"}
              </button>
            </form>
          </section>

          {/* Addresses */}
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Saved addresses</h2>
              <button
                onClick={() =>
                  setEditing({
                    id: uid(),
                    name: "",
                    line1: "",
                    city: "",
                    province: "",
                    zip: "",
                    country: "Saudi Arabia",
                  })
                }
                className="rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] px-3 py-1.5 text-sm font-semibold text-[var(--text-dark)]"
              >
                Add new
              </button>
            </div>

            {adErr && (
              <div className="mt-3 rounded-xl border border-rose-500/50 bg-rose-500/10 p-3 text-sm text-rose-200">
                {adErr}
              </div>
            )}

            <div className="mt-4 grid grid-cols-1 gap-3">
              {addresses.length === 0 && (
                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-400">
                  No saved addresses yet.
                </div>
              )}
              {addresses.map((a) => (
                <AddressCard key={a.id} a={a} />
              ))}
            </div>
          </section>
        </div>
      </section>

      {editing && (
        <AddressEditor value={editing} onClose={() => setEditing(null)} />
      )}
    </main>
  );
}

/*
------------------------------------------------------------
API CONTRACT (example Next.js route handlers)

(unchanged from your original)
*/
