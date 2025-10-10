"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import AddressForm, { Address, AddressType } from "./AddressForm";
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
  // const headers = useMemo(
  //   () => (user ? { Authorization: `Bearer ${user.access}` } : undefined),
  //   [user]
  // );

  const [list, setList] = useState<Address[]>([]);
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const storageKey = `guest-${type}-addresses`;

  async function load() {
    if (isLoggedIn) {
      const data = (await api.get("addresses/")).data.results;

      setList(data);
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
      // const saved = await createAddress(addr, headers);
      const saved = (await api.post("addresses/", addr)).data;

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
      //await setDefaultAddress(Number(id), headers);
      await api.post(`addresses/${id}/set-default/`);

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
      //await deleteAddress(Number(id), headers);
      await api.delete(`addresses/${id}/`);
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

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Your {type} address</h3>
        <button
          className="text-sm underline"
          onClick={() => setShowForm((v) => !v)}
        >
          {showForm ? "Hide form" : "Add new"}
        </button>
      </div>

      {showForm && (
        <AddressForm
          type={type}
          onSave={add}
          onCancel={() => setShowForm(false)}
        />
      )}

      {list.length === 0 ? (
        <p className="text-sm opacity-80">No saved addresses yet.</p>
      ) : (
        <ul className="grid gap-3">
          {list.map((a) => (
            <li
              key={String(a.id)}
              className="rounded-xl border border-white/15 bg-white/5 p-3"
            >
              <label className="flex items-start gap-3">
                <input
                  type="radio"
                  name={`addr-${type}`}
                  checked={String(selectedId) === String(a.id)}
                  onChange={() => {
                    setSelectedId(String(a.id));
                    onPick(a);
                  }}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{a.full_name}</span>
                    {a.is_default && (
                      <span className="text-[11px] px-2 py-[2px] rounded btn-gradient-accent text-blue-900 font-bold uppercase tracking-wide">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="text-sm opacity-90">
                    {a.line1}
                    {a.line2 ? `, ${a.line2}` : ""}, {a.city}
                    {a.state ? `, ${a.state}` : ""}, {a.pincode}, {a.country}
                  </div>
                  {(a.phone || a.email) && (
                    <div className="text-xs opacity-80">
                      {a.phone ? `📞 ${a.phone}` : ""}
                      {a.phone && a.email ? " · " : ""}
                      {a.email ? `✉️ ${a.email}` : ""}
                    </div>
                  )}
                </div>
              </label>

              <div className="flex gap-3 mt-2">
                {!a.is_default && (
                  <button
                    onClick={() => makeDefault(a.id!)}
                    className="text-xs underline"
                  >
                    Set as default
                  </button>
                )}
                <button
                  onClick={() => remove(a.id!)}
                  className="text-xs underline text-red-300"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
