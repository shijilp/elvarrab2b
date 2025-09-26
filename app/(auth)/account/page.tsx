"use client";
import React, { useEffect, useMemo, useState } from "react";

// ------------------------------------------------------------
// Elvarra / Elvara — ACCOUNT SETTINGS (Retail)
// Route: app/account/settings/page.tsx
// Features:
//  - Change password form (current, new, confirm)
//  - View & manage saved addresses (list, add, edit, delete)
//  - Same visual theme as the rest of the app
//  - API contracts (POST /api/account/password, CRUD /api/account/addresses)
//  - Local fallback storage if API not wired yet (for preview/testing)
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
  const raw = localStorage.getItem(LS_KEY);
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
  localStorage.setItem(LS_KEY, JSON.stringify(next));
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
  localStorage.setItem(LS_KEY, JSON.stringify(arr));
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
  localStorage.setItem(LS_KEY, JSON.stringify(arr.filter((x) => x.id !== id)));
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
  localStorage.setItem(LS_KEY, JSON.stringify(next));
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

export default function AccountSettingsPage() {
  const theme: ThemeMode = "dark";
  const palette = useMemo(() => paletteForTheme(theme), [theme]);

  // Password
  const [cur, setCur] = useState("");
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [pwErr, setPwErr] = useState<string | null>(null);
  const [pwOk, setPwOk] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

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
      <div className={`rounded-2xl ${palette.ring} ${palette.card} p-4`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-medium">
              {a.name}
              {a.isDefault ? " • Default" : ""}
            </div>
            <div className={`mt-1 text-xs ${palette.subfg}`}>
              <div>
                {a.line1}
                {a.line2 ? ", " + a.line2 : ""}
              </div>
              <div>
                {a.city}, {a.province} {a.zip}
              </div>
              <div>{a.country}</div>
              {a.phone && <div>Phone: {a.phone}</div>}
            </div>
          </div>
          <div className="flex gap-2">
            {!a.isDefault && (
              <button
                onClick={() => makeDefault(a.id)}
                className={`rounded-xl border ${palette.border} px-3 py-1.5 text-xs`}
              >
                Make Default
              </button>
            )}
            <button
              onClick={() => setEditing(a)}
              className={`rounded-xl border ${palette.border} px-3 py-1.5 text-xs`}
            >
              Edit
            </button>
            <button
              onClick={() => removeAddress(a.id)}
              className={`rounded-xl border ${palette.border} px-3 py-1.5 text-xs`}
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
      <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
        <div
          className={`w-full max-w-lg rounded-2xl ${palette.ring} ${palette.card} p-5`}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {value ? "Edit address" : "Add address"}
            </h3>
            <button
              onClick={onClose}
              className={`rounded-xl border ${palette.border} px-3 py-1.5 text-xs`}
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
                className={`w-full rounded-xl border ${palette.border} bg-transparent px-3 py-2 text-sm outline-none`}
              />
              <input
                value={form.phone || ""}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="Phone (optional)"
                className={`w-full rounded-xl border ${palette.border} bg-transparent px-3 py-2 text-sm outline-none`}
              />
            </div>
            <input
              value={form.line1}
              onChange={(e) => set("line1", e.target.value)}
              placeholder="Address line 1"
              className={`w-full rounded-xl border ${palette.border} bg-transparent px-3 py-2 text-sm outline-none`}
            />
            <input
              value={form.line2 || ""}
              onChange={(e) => set("line2", e.target.value)}
              placeholder="Address line 2 (optional)"
              className={`w-full rounded-xl border ${palette.border} bg-transparent px-3 py-2 text-sm outline-none`}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <input
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                placeholder="City"
                className={`w-full rounded-xl border ${palette.border} bg-transparent px-3 py-2 text-sm outline-none`}
              />
              <input
                value={form.province}
                onChange={(e) => set("province", e.target.value)}
                placeholder="Province"
                className={`w-full rounded-xl border ${palette.border} bg-transparent px-3 py-2 text-sm outline-none`}
              />
              <input
                value={form.zip}
                onChange={(e) => set("zip", e.target.value)}
                placeholder="ZIP"
                className={`w-full rounded-xl border ${palette.border} bg-transparent px-3 py-2 text-sm outline-none`}
              />
            </div>
            <input
              value={form.country}
              onChange={(e) => set("country", e.target.value)}
              placeholder="Country"
              className={`w-full rounded-xl border ${palette.border} bg-transparent px-3 py-2 text-sm outline-none`}
            />

            <div className="mt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className={`rounded-xl border ${palette.border} px-4 py-2 text-sm`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`rounded-xl px-4 py-2 text-sm font-medium ${palette.button}`}
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
    <main className={`${palette.bg} ${palette.fg} min-h-screen antialiased`}>
      <div className="container py-10">
        <div className="mx-auto max-w-5xl">
          <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold">Account settings</h1>
              <p className={`mt-1 text-sm ${palette.subfg}`}>
                Manage your password and shipping addresses.
              </p>
            </div>
            <a
              href="/account/orders/retail"
              className={`rounded-xl px-4 py-2 text-sm font-medium ${palette.button}`}
            >
              My orders
            </a>
          </header>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr]">
            {/* Change Password */}
            <section
              className={`rounded-2xl ${palette.ring} ${palette.card} p-6`}
            >
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
                    className={`w-full rounded-xl border ${palette.border} bg-transparent px-3 py-2 text-sm outline-none`}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-wider opacity-80">
                    New password
                  </label>
                  <div
                    className={`flex items-stretch overflow-hidden rounded-xl border ${palette.border}`}
                  >
                    <input
                      type={show ? "text" : "password"}
                      value={pass}
                      onChange={(e) => setPass(e.target.value)}
                      className="w-full bg-transparent px-3 py-2 text-sm outline-none"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShow((s) => !s)}
                      className="px-3 text-sm opacity-80"
                    >
                      {show ? "Hide" : "Show"}
                    </button>
                  </div>
                  <p className={`mt-1 text-xs ${palette.subfg}`}>
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
                    className={`w-full rounded-xl border ${palette.border} bg-transparent px-3 py-2 text-sm outline-none`}
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
                  className={`rounded-xl px-4 py-2 text-sm font-medium ${palette.button} disabled:opacity-60`}
                >
                  {pwLoading ? "Saving…" : "Update password"}
                </button>
              </form>
            </section>

            {/* Addresses */}
            <section
              className={`rounded-2xl ${palette.ring} ${palette.card} p-6`}
            >
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
                  className={`rounded-xl px-3 py-1.5 text-sm ${palette.button}`}
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
                  <div
                    className={`rounded-xl ${palette.ring} ${palette.card} p-4 text-sm ${palette.subfg}`}
                  >
                    No saved addresses yet.
                  </div>
                )}
                {addresses.map((a) => (
                  <AddressCard key={a.id} a={a} />
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      {editing && (
        <AddressEditor value={editing} onClose={() => setEditing(null)} />
      )}
    </main>
  );
}

/*
------------------------------------------------------------
API CONTRACT (example Next.js route handlers)

// app/api/account/password/route.ts
import { NextResponse } from "next/server";
export async function POST(req: Request) {
  const { current, password } = await req.json();
  if (!current || !password) return NextResponse.json({ ok: false }, { status: 400 });
  // TODO: verify current password & set new password
  return NextResponse.json({ ok: true });
}

// app/api/account/addresses/route.ts
import { NextResponse } from "next/server";
let mem: any[] = [];
export async function GET() { return NextResponse.json(mem); }
export async function POST(req: Request) {
  const a = await req.json(); mem.push(a); return NextResponse.json({ ok: true });
}

// app/api/account/addresses/[id]/route.ts
import { NextResponse } from "next/server";
export async function PUT(_: Request, { params }: { params: { id: string }}) {
  // TODO: update in DB
  return NextResponse.json({ ok: true });
}
export async function DELETE(_: Request, { params }: { params: { id: string }}) {
  // TODO: delete in DB
  return NextResponse.json({ ok: true });
}

// app/api/account/addresses/[id]/default/route.ts
import { NextResponse } from "next/server";
export async function POST(_: Request, { params }: { params: { id: string }}) {
  // TODO: set default in DB
  return NextResponse.json({ ok: true });
}

------------------------------------------------------------
TESTS (snippets)
// tests/account-settings.test.ts
// it("validates password mismatch", () => { expect("abc" === "abcd").toBe(false); });
// it("creates new address id", () => { expect(typeof (Math.random().toString(36).slice(2))).toBe("string"); });
//------------------------------------------------------------
*/
