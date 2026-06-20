"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import AddressForm, { Address, AddressType } from "./AddressForm";
import { api_backend } from "@/lib/api_backend";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Plus,
  ChevronUp,
  Star,
  Trash2,
  BadgeCheck,
} from "lucide-react";
import { api2 } from "@/lib/api2";
import { api } from "@/lib/api";

export default function AddressList({
  type = "shipping",
  onPick,
}: {
  type?: AddressType;
  onPick: (addr: Address | null) => void;
}) {
  const { user } = useAuth();
  const isLoggedIn = !!user;

  const [list, setList] = useState<Address[]>([]);
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const storageKey = `guest-${type}-addresses`;

  async function load() {
    if (isLoggedIn) {
      const data = (await api.get("auth/addresses/")).data;

      setList(data);

      if (data.length === 0) {
        setShowForm(true);
      }

      const def = data.find((a: Address) => a.is_default) || data[0] || null;
      setSelectedId(def?.id ?? null);
      onPick(def ?? null);
    } else {
      const raw = localStorage.getItem(storageKey);
      const data: Address[] = raw ? JSON.parse(raw) : [];

      setList(data);

      const def = data.find((a) => a.is_default) || data[0] || null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setSelectedId((def as any)?.id ?? (def ? "guest-0" : null));
      onPick(def ?? null);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, type]);

  async function add(addr: Address) {
    if (isLoggedIn) {
      const saved = (await api_backend.post("auth/addresses/", addr)).data;

      await load();
      setShowForm(false);
      setSelectedId(saved.id!);
      onPick(saved);
    } else {
      const withId: Address = {
        ...addr,
        id: crypto.randomUUID(),
        is_default: list.length === 0 ? true : !!addr.is_default,
      };

      const next = withId.is_default
        ? list.map((x) => ({ ...x, is_default: false })).concat(withId)
        : list.concat(withId);

      setList(next);
      localStorage.setItem(storageKey, JSON.stringify(next));
      setShowForm(false);
      setSelectedId(withId.id as string);
      onPick(withId);
    }
  }

  async function makeDefault(id: number | string) {
    if (isLoggedIn) {
      await api_backend.post(`addresses/${id}/set-default/`);
      await load();
    } else {
      const next = list.map((a) => ({
        ...a,
        is_default: String(a.id) === String(id),
      }));

      setList(next);
      localStorage.setItem(storageKey, JSON.stringify(next));
      setSelectedId(id);

      const current = next.find((a) => String(a.id) === String(id)) || null;
      onPick(current);
    }
  }

  async function remove(id: number | string) {
    if (isLoggedIn) {
      await api_backend.delete(`auth/addresses/${id}/`);
      await load();
    } else {
      const next = list.filter((a) => String(a.id) !== String(id));

      setList(next);
      localStorage.setItem(storageKey, JSON.stringify(next));

      const def = next.find((a) => a.is_default) || next[0] || null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setSelectedId((def as any)?.id ?? (def ? "guest-0" : null));
      onPick(def);
    }
  }

  const heading =
    type === "billing" ? "Billing Address" : "Wholesale Shipping Address";

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950 via-[#071827] to-[#06111f] p-5 shadow-[0_30px_90px_-45px_rgba(37,99,235,.75)]">
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -left-20 bottom-0 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-300">
              <Building2 className="h-3.5 w-3.5" />
              Trade Delivery
            </div>

            <h3 className="text-xl font-bold text-white">{heading}</h3>

            <p className="mt-1 max-w-xl text-sm leading-6 text-slate-400">
              Choose the saved delivery address for your Elvarra wholesale
              order.
            </p>
          </div>

          <button
            type="button"
            className={[
              "inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition active:scale-[0.98]",
              showForm
                ? "border-slate-700 bg-slate-950/70 text-slate-300 hover:text-white"
                : "border-cyan-500/40 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20",
            ].join(" ")}
            onClick={() => setShowForm((v) => !v)}
          >
            {showForm ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Hide Form
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Add New Address
              </>
            )}
          </button>
        </div>
      </div>

      {showForm && (
        <AddressForm
          type={type}
          onSave={add}
          onCancel={() => setShowForm(false)}
        />
      )}

      {list.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-950/60 p-8 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
            <MapPin className="h-6 w-6" />
          </div>

          <h4 className="mt-4 text-base font-semibold text-white">
            No saved addresses yet
          </h4>

          <p className="mt-1 text-sm text-slate-400">
            Add your delivery address to continue with wholesale checkout.
          </p>

          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="mt-5 inline-flex items-center gap-2 rounded-2xl border border-cyan-500/40 bg-cyan-500/10 px-5 py-3 text-sm font-semibold text-cyan-300 hover:bg-cyan-500/20"
          >
            <Plus className="h-4 w-4" />
            Add Address
          </button>
        </div>
      ) : (
        <ul className="grid gap-3">
          {list.map((a) => {
            const active = String(selectedId) === String(a.id);

            return (
              <li
                key={String(a.id)}
                className={[
                  "relative overflow-hidden rounded-3xl border p-4 transition-all",
                  active
                    ? "border-cyan-400/50 bg-gradient-to-r from-cyan-500/10 via-slate-950 to-blue-500/10 shadow-[0_20px_70px_-45px_rgba(34,211,238,.8)]"
                    : "border-slate-800 bg-slate-950/70 hover:border-slate-700",
                ].join(" ")}
              >
                {active && (
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/80 to-transparent" />
                )}

                <label className="flex cursor-pointer items-start gap-4">
                  <input
                    type="radio"
                    name={`addr-${type}`}
                    checked={active}
                    onChange={() => {
                      setSelectedId(String(a.id));
                      onPick(a);
                    }}
                    className="mt-1 h-4 w-4 accent-cyan-400"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-white">
                        {a.full_name}
                      </span>

                      {a.is_default && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-300">
                          <BadgeCheck className="h-3 w-3" />
                          Default
                        </span>
                      )}

                      {active && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-300">
                          Selected
                        </span>
                      )}
                    </div>

                    <div className="mt-3 space-y-1 text-sm leading-6 text-slate-300">
                      <div className="flex gap-2">
                        <MapPin className="mt-1 h-4 w-4 shrink-0 text-cyan-300" />
                        <div>
                          {a.line1}
                          {a.line2 ? `, ${a.line2}` : ""}
                          <br />
                          {a.city}
                          {a.state ? `, ${a.state}` : ""}, {a.country},{" "}
                          {a.pincode}
                        </div>
                      </div>

                      {(a.phone || a.email) && (
                        <div className="flex flex-wrap gap-3 pt-1 text-xs text-slate-400">
                          {a.phone && (
                            <span className="inline-flex items-center gap-1">
                              <Phone className="h-3.5 w-3.5 text-cyan-300" />
                              {a.phone}
                            </span>
                          )}

                          {a.email && (
                            <span className="inline-flex items-center gap-1">
                              <Mail className="h-3.5 w-3.5 text-cyan-300" />
                              {a.email}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </label>

                <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-800 pt-3">
                  {!a.is_default && (
                    <button
                      type="button"
                      onClick={() => makeDefault(a.id!)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300"
                    >
                      <Star className="h-3.5 w-3.5" />
                      Set Default
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => remove(a.id!)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/20"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
