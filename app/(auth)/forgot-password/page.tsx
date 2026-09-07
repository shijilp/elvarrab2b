"use client";

import B2BAuthShell, {
  tradeInputClass,
  tradeLabelClass,
  tradePrimaryButtonClass,
} from "@/components/auth/B2BAuthShell";
import axios from "axios";
import Link from "next/link";
import React, { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      await axios.post("/api/reset-password", { email });
      setSent(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err?.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <B2BAuthShell
      eyebrow="Trade Account Recovery"
      title="Forgot your password?"
      description="Enter the email used for your Elvarra trade account. We’ll send you a secure reset link if an account exists."
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/login"
            className="font-semibold text-cyan-300 hover:text-cyan-200"
          >
            Back to login
          </Link>
          <Link href="/register" className="text-slate-300 hover:text-white">
            Create trade account
          </Link>
        </div>
      }
    >
      {sent ? (
        <div className="space-y-5">
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-sm leading-6 text-emerald-100">
            If an account exists for{" "}
            <span className="font-semibold text-white">{email}</span>, a reset
            link will be sent shortly.
          </div>
          <p className="text-sm leading-6 text-slate-400">
            Please check your inbox and spam folder. The reset link will take
            you back to the Elvarra B2B portal.
          </p>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className={tradeLabelClass}>Account email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@business.com"
              className={tradeInputClass}
            />
          </div>

          {error && (
            <div className="rounded-2xl border border-rose-500/35 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={tradePrimaryButtonClass}
          >
            {loading ? "Sending…" : "Send Reset Link"}
          </button>
        </form>
      )}
    </B2BAuthShell>
  );
}
