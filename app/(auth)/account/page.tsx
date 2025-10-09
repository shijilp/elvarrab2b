"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { WhatsAppShareButton } from "@/components/ui/WhatsAppShareButton";

// -----------------------------
// Types
// -----------------------------
type Address = {
  id: string;
  name: string;
  phone?: string;
  line1: string;
  line2?: string;
  city: string;
  province: string;
  zip: string;
  country: string;
  isDefault?: boolean;
};
type Caps = { can_create_referral: boolean; can_create_affiliate: boolean };

type LinkKind = "REF" | "AFF";
type ReferralLink = {
  id: number;
  code: string;
  kind: LinkKind;
  percent: string; // backend sends decimals as strings
  flat_amount: string;
  cookie_ttl_days: number;
  active: boolean;
  clicks: number;
  conversions: number;
  earnings: string; // stringified decimal
  created_at: string;
};

type wallet = {
  cleared: number;
  uncleared: number;
  total: number;
  balance: number;
};
// -----------------------------
// Small utils
// -----------------------------
const LS_ADDR = "elvara:addresses";
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
const asNumber = (v: unknown, d = 0) =>
  Number.isFinite(Number(v)) ? Number(v) : d;

// -----------------------------
// API helpers (use axios `api`)
// -----------------------------
async function apiGetWallet(): Promise<wallet> {
  try {
    const r = await api.get("wallet/", { withCredentials: true });
    return r.data as unknown as wallet;
  } catch {
    return { cleared: 0, uncleared: 0, total: 0, balance: 0 };
  }
}
async function apiCapabilities(): Promise<Caps> {
  try {
    const r = await api.get("/referrals/capabilities/", {
      withCredentials: true,
    });
    return r.data as Caps;
  } catch {
    return { can_create_referral: true, can_create_affiliate: false };
  }
}

async function apiListReferralLinks(): Promise<ReferralLink[]> {
  try {
    const r = await api.get("/referrals/mine/", {
      withCredentials: true,
      headers: { Accept: "application/json" },
    });
    const data = r.data;
    if (Array.isArray(data)) return data as ReferralLink[];
    if (data?.results && Array.isArray(data.results))
      return data.results as ReferralLink[];
  } catch {}
  return [];
}

async function apiCreateReferralLink(body: {
  kind: LinkKind;
  percent?: number;
  flat_amount?: number;
}) {
  try {
    const r = await api.post("/referrals/create/", body, {
      withCredentials: true,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    return r.data; // { id, code }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    const msg =
      err?.response?.data?.detail || err?.message || "Unable to create link";
    throw new Error(msg);
  }
}

// Addresses (keep working even if API down)
async function apiListAddresses(): Promise<Address[]> {
  try {
    const r = await api.get("/api/account/addresses/", {
      withCredentials: true,
    });
    return (r.data as Address[]) || [];
  } catch {
    const raw =
      typeof window !== "undefined" ? localStorage.getItem(LS_ADDR) : null;
    return raw ? (JSON.parse(raw) as Address[]) : [];
  }
}
async function apiSaveAddress(a: Address) {
  try {
    await api.post("/api/account/addresses/", a, {
      withCredentials: true,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    const arr = await apiListAddresses();
    const next = [...arr, a];
    if (typeof window !== "undefined")
      localStorage.setItem(LS_ADDR, JSON.stringify(next));
  }
}
async function apiUpdateAddress(a: Address) {
  try {
    await api.put(`/api/account/addresses/${encodeURIComponent(a.id)}/`, a, {
      withCredentials: true,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    const arr = await apiListAddresses();
    const idx = arr.findIndex((x) => x.id === a.id);
    if (idx >= 0) arr[idx] = a;
    if (typeof window !== "undefined")
      localStorage.setItem(LS_ADDR, JSON.stringify(arr));
  }
}
async function apiDeleteAddress(id: string) {
  try {
    await api.delete(`/api/account/addresses/${encodeURIComponent(id)}/`, {
      withCredentials: true,
    });
  } catch {
    const arr = await apiListAddresses();
    if (typeof window !== "undefined")
      localStorage.setItem(
        LS_ADDR,
        JSON.stringify(arr.filter((x) => x.id !== id))
      );
  }
}
async function apiSetDefault(id: string) {
  try {
    await api.post(
      `/api/account/addresses/${encodeURIComponent(id)}/default/`,
      null,
      { withCredentials: true }
    );
  } catch {
    const arr = await apiListAddresses();
    const next = arr.map((x) => ({ ...x, isDefault: x.id === id }));
    if (typeof window !== "undefined")
      localStorage.setItem(LS_ADDR, JSON.stringify(next));
  }
}

async function apiChangePassword(current: string, password: string) {
  const payload = { current, password };
  const tryPost = (u: string) =>
    api.post(u, payload, {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    });
  let r;
  try {
    r = await tryPost("/api/account/password/");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    if (e?.response?.status === 404) r = await tryPost("/api/account/password");
    else throw e;
  }
  return !!r;
}

// -----------------------------
// UI atoms
// -----------------------------
const CopyButton: React.FC<{ text: string; className?: string }> = ({
  text,
  className = "",
}) => {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setOk(true);
          setTimeout(() => setOk(false), 1200);
        } catch {}
      }}
      className={`rounded-xl border btn-gradient-accent border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs hover:bg-zinc-800 ${className}`}
    >
      {ok ? "Copied" : "Copy"}
    </button>
  );
};
const Pill: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-flex items-center  rounded-full border border-zinc-700 btn-gradient-accent  px-2 py-0.5 text-[10px] uppercase tracking-wide">
    {children}
  </span>
);
const Money: React.FC<{ value: string | number }> = ({ value }) => {
  const n = typeof value === "string" ? Number(value) : value;
  return <span>₹{(n || 0).toFixed(2)}</span>;
};

// -----------------------------
// Invite & Earn
// -----------------------------
const InviteAndEarnCard: React.FC = () => {
  const [links, setLinks] = useState<ReferralLink[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [caps, setCaps] = useState<Caps>({
    can_create_referral: true,
    can_create_affiliate: false,
  });

  // useEffect(() => {
  //   (async () => {
  //     try {
  //       const data = await apiListReferralLinks();
  //       setLinks(data);
  //     } catch (e: any) {
  //       setErr(e?.message || "Unable to load referral links");
  //     }
  //   })();
  // }, []);

  useEffect(() => {
    (async () => {
      setCaps(await apiCapabilities());
      setLinks(await apiListReferralLinks());
    })();
  }, []);

  const siteUrl = typeof window !== "undefined" ? window.location.origin : "";

  async function create(kind: LinkKind) {
    setErr(null);
    setCreating(true);
    try {
      const body =
        kind === "REF"
          ? { kind: "REF" as const, flat_amount: 50 }
          : { kind: "AFF" as const, percent: 10 };
      const created = await apiCreateReferralLink(body);
      let next = await apiListReferralLinks();
      if (!next?.length && created?.code) {
        // optimistic insert if API list is empty (cache/auth race)
        const optimistic: ReferralLink = {
          id: created.id ?? Date.now(),
          code: created.code,
          kind,
          percent: kind === "AFF" ? String(body.percent ?? 0) : "0",
          flat_amount: kind === "REF" ? String(body.flat_amount ?? 0) : "0",
          cookie_ttl_days: 30,
          active: true,
          clicks: 0,
          conversions: 0,
          earnings: "0",
          created_at: new Date().toISOString(),
        };
        next = [optimistic, ...links];
      }
      setLinks(next);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setErr(e?.message || "Unable to create link");
    } finally {
      setCreating(false);
    }
  }

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Invite & Earn</h2>
        <div className="text-xs text-zinc-400">
          Share your link, earn wallet cash or commission.
        </div>
      </div>

      {err && (
        <div className="mt-3 rounded-xl border border-rose-500/50 bg-rose-500/10 p-3 text-sm text-rose-200">
          {err}
        </div>
      )}
      <div className="mt-4 grid grid-cols-1 gap-3 ">
        {/* Referral */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider text-zinc-400">
                Referral link
              </div>
              <div className="mt-1 text-sm text-zinc-200">
                Flat wallet reward on first paid order.
              </div>
            </div>
            <button
              disabled={creating}
              onClick={() => create("REF")}
              className="rounded-xl btn-gradient-accent px-3 py-1.5 text-xs font-semibold text-[var(--text-dark)] disabled:opacity-60"
            >
              {creating ? "Creating…" : "Create link"}
            </button>
          </div>

          <div className="mt-3 space-y-2">
            {links.filter((l) => l.kind === "REF").length === 0 && (
              <div className="text-xs text-zinc-400">
                No referral links yet.
              </div>
            )}
            {links
              .filter((l) => l.kind === "REF")
              .map((l) => {
                const shareUrl = siteUrl
                  ? `${siteUrl}/?ref=${encodeURIComponent(l.code)}`
                  : l.code;
                return (
                  <div
                    key={`${l.kind}-${l.id}`}
                    className="rounded-lg border border-zinc-800 bg-zinc-900 p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">
                          {shareUrl}
                        </div>
                        <div className="mt-0.5 text-[11px] text-zinc-400">
                          <Pill>REFERRAL</Pill>
                          <span className="ml-2">
                            Flat: <Money value={l.flat_amount} />
                          </span>
                        </div>
                      </div>

                      {/* Buttons: Copy + WhatsApp */}
                      <div className="shrink-0 flex gap-2">
                        <CopyButton text={shareUrl} />
                        <WhatsAppShareButton
                          url={shareUrl}
                          message="Hey! Get something gorgeous from Elvarra—use my link:"
                        />
                      </div>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-2">
                        <div className="text-[10px] uppercase text-zinc-400">
                          Clicks
                        </div>
                        <div className="text-sm font-semibold">{l.clicks}</div>
                      </div>
                      <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-2">
                        <div className="text-[10px] uppercase text-zinc-400">
                          Orders
                        </div>
                        <div className="text-sm font-semibold">
                          {l.conversions}
                        </div>
                      </div>
                      <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-2">
                        <div className="text-[10px] uppercase text-zinc-400">
                          Earnings
                        </div>
                        <div className="text-sm font-semibold">
                          <Money value={l.earnings} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Affiliate */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
          {caps.can_create_affiliate ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wider text-zinc-400">
                    Affiliate link
                  </div>
                  <div className="mt-1 text-sm text-zinc-200">
                    % commission after payment confirmation.
                  </div>
                </div>

                <button
                  disabled={creating}
                  onClick={() => create("AFF")}
                  className="rounded-xl btn-gradient-accent px-3 py-1.5 text-xs font-semibold text-[var(--text-dark)] disabled:opacity-60"
                >
                  {creating ? "Creating…" : "Create link"}
                </button>
              </div>

              <div className="mt-3 space-y-2">
                {links.filter((l) => l.kind === "AFF").length === 0 && (
                  <div className="text-xs text-zinc-400">
                    No affiliate links yet.
                  </div>
                )}
                {links
                  .filter((l) => l.kind === "AFF")
                  .map((l) => {
                    const shareUrl = siteUrl
                      ? `${siteUrl}/?ref=${encodeURIComponent(l.code)}`
                      : l.code;
                    return (
                      <div
                        key={`${l.kind}-${l.id}`}
                        className="rounded-lg border border-zinc-800 bg-zinc-900 p-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium">
                              {shareUrl}
                            </div>
                            <div className="mt-0.5 text-[11px] text-zinc-400">
                              <Pill>AFFILIATE</Pill>
                              <span className="ml-2">
                                Rate: {Number(l.percent || 0)}%
                              </span>
                            </div>
                          </div>

                          {/* Buttons: Copy + WhatsApp */}
                          <div className="shrink-0 flex gap-2">
                            <CopyButton text={shareUrl} />
                            <WhatsAppShareButton
                              url={shareUrl}
                              message="Hey! Get something gorgeous from Elvarra—use my link:"
                            />
                          </div>
                        </div>
                        <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
                          <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-2">
                            <div className="text-[10px] uppercase text-zinc-400">
                              Clicks
                            </div>
                            <div className="text-sm font-semibold">
                              {l.clicks}
                            </div>
                          </div>
                          <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-2">
                            <div className="text-[10px] uppercase text-zinc-400">
                              Orders
                            </div>
                            <div className="text-sm font-semibold">
                              {l.conversions}
                            </div>
                          </div>
                          <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-2">
                            <div className="text-[10px] uppercase text-zinc-400">
                              Earnings
                            </div>
                            <div className="text-sm font-semibold">
                              <Money value={l.earnings} />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </>
          ) : (
            <>
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                <div className="text-sm text-zinc-300">
                  Affiliate program is invite-only.{" "}
                  <a href="/contact" className="underline">
                    Contact us
                  </a>{" "}
                  to apply.
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-xs text-zinc-300">
        <div className="font-medium">How it works</div>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            Share your link. A cookie tracks attribution for ~30 days
            (configurable).
          </li>
          <li>
            Paid orders: referrals get wallet credit; affiliates get a
            commission record.
          </li>
          <li>Self-referrals/cancelled orders may be excluded per policy.</li>
        </ul>
      </div>
    </section>
  );
};

// -----------------------------
// Page
// -----------------------------
export default function AccountSettingsPage() {
  // wallet
  const [wallet, setWallet] = useState<wallet | null>(null);
  const [walletErr, setWalletErr] = useState<string | null>(null);
  //  const { cleared, uncleared, total } = wallet;

  // password
  const [cur, setCur] = useState("");
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [pwErr, setPwErr] = useState<string | null>(null);
  const [pwOk, setPwOk] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  // addresses
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [adErr, setAdErr] = useState<string | null>(null);
  const [editing, setEditing] = useState<Address | null>(null);

  useEffect(() => {
    (async () => {
      setAddresses(await apiListAddresses());
      try {
        setWallet(await apiGetWallet());
      } catch {
        setWallet({ balance: 0, total: 0, cleared: 0, uncleared: 0 });
        setWalletErr("Unable to load wallet");
      }
    })();
  }, []);

  const validatePass = (): string | null => {
    if (!cur) return "Please enter your current password.";
    if (pass.length < 6) return "New password must be at least 6 characters.";
    if (pass !== confirm) return "Passwords do not match.";
    return null;
  };

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

  async function saveAddress(a: Address) {
    setAdErr(null);
    try {
      if (addresses.some((x) => x.id === a.id)) await apiUpdateAddress(a);
      else await apiSaveAddress(a);
      setAddresses((prev) => {
        const i = prev.findIndex((x) => x.id === a.id);
        if (i >= 0) {
          const next = [...prev];
          next[i] = a;
          return next;
        }
        return [a, ...prev];
      });
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

  const AddressCard: React.FC<{ a: Address }> = ({ a }) => (
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

  const AddressEditor: React.FC<{
    value?: Address | null;
    onClose: () => void;
  }> = ({ value, onClose }) => {
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
    const set = <K extends keyof Address>(k: K, v: Address[K]) =>
      setForm((s) => ({ ...s, [k]: v }));
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
  };

  return (
    <main className="min-h-dvh bg-zinc-950 text-zinc-100 antialiased">
      <section className="mx-auto max-w-7xl px-4 py-6 sm:py-10">
        <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900">
          <div className="grid gap-6 p-6 sm:grid-cols-[1fr_auto] sm:items-center sm:p-8">
            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold sm:text-2xl">
                Account settings
              </h1>
              <p className="mt-1 truncate text-sm text-zinc-400">
                Manage your password, wallet, addresses — and invite & earn.
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
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 mt-6">
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
                ₹{wallet?.total ?? 0}
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                <div className="text-xs text-zinc-400">Cleared</div>
                <div className="text-lg font-semibold text-emerald-400">
                  ₹{wallet?.cleared}
                </div>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                <div className="text-xs text-zinc-400">Uncleared</div>
                <div className="text-lg font-semibold text-yellow-400">
                  ₹{wallet?.uncleared}
                </div>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                <div className="text-xs text-zinc-400">Total</div>
                <div className="text-lg font-semibold text-zinc-100">
                  ₹{wallet?.total}
                </div>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                <div className="text-xs text-zinc-400">Status</div>
                <div className="text-sm md:text-lg  font-semibold text-zinc-100">
                  Active
                </div>
              </div>
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
        </section>

        {/* Grid */}
        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <InviteAndEarnCard />

          <div className="grid grid-cols-1 gap-6">
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
        </div>
      </section>

      {editing && (
        <AddressEditor value={editing} onClose={() => setEditing(null)} />
      )}
    </main>
  );
}
