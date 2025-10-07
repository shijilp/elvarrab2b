"use client";

import { useState } from "react";
import { api } from "@/lib/api";

type Wallet = {
  balance: number;
  user: { id: number; username: string; email: string };
};
type Txn = {
  id: number;
  user: { id: number; username: string; email: string };
  amount: number;
  type: "credit" | "debit";
  note: string;
  created_at: string;
};

export default function AdminWalletAdjustCard() {
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState<string>("");
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [txns, setTxns] = useState<Txn[]>([]);
  const [amount, setAmount] = useState<string>("0.00");
  const [type, setType] = useState<"credit" | "debit">("credit");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function fetchWallet() {
    setErr(null);
    setOk(null);
    if (!email && !userId) {
      setErr("Enter email or user id");
      return;
    }
    try {
      const q = email ? { email } : { user_id: userId };
      const { data } = await api.get("admin/wallet/get/", { params: q });
      setWallet({
        balance: Number(data.wallet.balance),
        user: data.wallet.user,
      });
      setTxns(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (data.transactions || []).map((t: any) => ({
          ...t,
          amount: Number(t.amount),
        }))
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setErr(e?.response?.data?.detail || "Failed to fetch wallet");
    }
  }

  async function adjust() {
    setBusy(true);
    setErr(null);
    setOk(null);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload: any = { type, amount: Number(amount), note };
      if (email) payload.email = email;
      else if (userId) payload.user_id = Number(userId);
      else {
        setErr("Enter email or user id");
        setBusy(false);
        return;
      }

      const { data } = await api.post("admin/wallet/adjust/", payload);
      setWallet({
        balance: Number(data.wallet.balance),
        user: data.wallet.user,
      });
      setTxns((prev) => [
        { ...data.transaction, amount: Number(data.transaction.amount) },
        ...prev,
      ]);
      setOk(
        `${type === "credit" ? "Credited" : "Debited"} ₹${Number(
          amount
        ).toFixed(2)} successfully.`
      );
      setAmount("0.00");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setErr(e?.response?.data?.detail || "Adjustment failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <h2 className="text-lg font-semibold">Admin: Wallet Adjust</h2>
      <p className="mt-1 text-xs text-zinc-400">
        Credit or debit a customer’s wallet.
      </p>
      <div className="rounded-xl border border-zinc-800 w-1/5 mt-2 bg-zinc-950 p-3 text-sm">
        <div className="text-zinc-400">Balance</div>
        <div className="text-lg font-semibold">
          ₹{(wallet?.balance ?? 0).toFixed(2)}
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="col-span-2 flex gap-2">
          <input
            className="h-9 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
            placeholder="Customer email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <span className="self-center text-xs text-zinc-500">or</span>
          <input
            className="w-32 h-9 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none"
            placeholder="User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
          <button
            onClick={fetchWallet}
            className="rounded-lg bg-zinc-200 px-3 py-2 text-sm h-9 font-medium text-zinc-900 hover:bg-white"
          >
            Load
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <select
          className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none"
          value={type}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onChange={(e) => setType(e.target.value as any)}
        >
          <option value="credit">Credit</option>
          <option value="debit">Debit</option>
        </select>
        <input
          type="number"
          step="0.01"
          min="0.01"
          className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <input
          className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none"
          placeholder="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <div>
          <button
            disabled={busy}
            onClick={adjust}
            className=" w-1/4 mt-5 btn-gradient-accent rounded-lg  px-3 py-2 text-sm font-semibold  disabled:opacity-50"
          >
            {busy ? "Saving…" : type === "credit" ? "Credit" : "Debit"}
          </button>
        </div>
      </div>

      {err && <p className="mt-2 text-sm text-rose-400">{err}</p>}
      {ok && <p className="mt-2 text-sm text-emerald-400">{ok}</p>}

      <div className="mt-6">
        <h3 className="text-sm font-medium text-zinc-300">
          Recent transactions
        </h3>
        <div className="mt-2 divide-y divide-zinc-800 rounded-xl border border-zinc-800">
          {(txns || []).map((t) => (
            <div
              key={t.id}
              className="grid grid-cols-5 items-center gap-2 p-3 text-sm"
            >
              <div className="font-medium">
                {t.user.email || t.user.username}
              </div>
              <div className="text-xs text-zinc-500">
                {new Date(t.created_at).toDateString()}
              </div>

              <div className="text-xs uppercase tracking-wider">{t.type}</div>
              <div
                className={
                  t.type === "credit" ? "text-emerald-300" : "text-rose-300"
                }
              >
                {t.type === "credit" ? "+" : "-"}₹{t.amount.toFixed(2)}
              </div>
              <div className="truncate text-xs text-zinc-400">
                {t.note || "-"}
              </div>
            </div>
          ))}
          {txns.length === 0 && (
            <div className="p-3 text-sm text-zinc-500">
              No transactions yet.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
