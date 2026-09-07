"use client";

import B2BAuthShell, {
  tradeInputClass,
  tradeLabelClass,
  tradePrimaryButtonClass,
} from "@/components/auth/B2BAuthShell";
import axios from "axios";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useState } from "react";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetLoadingState />}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetLoadingState() {
  return (
    <B2BAuthShell
      eyebrow="Trade Account Recovery"
      title="Reset your password"
      description="Preparing your secure password reset form."
    >
      <div className="space-y-3">
        <div className="h-12 animate-pulse rounded-2xl bg-slate-800/70" />
        <div className="h-12 animate-pulse rounded-2xl bg-slate-800/70" />
        <div className="h-12 animate-pulse rounded-2xl bg-slate-800/70" />
      </div>
    </B2BAuthShell>
  );
}

function ResetPasswordForm() {
  const params = useSearchParams();
  const uid = params.get("uid");
  const token = params.get("token");

  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!uid || !token) {
      setError("Invalid or incomplete reset link. Please request a new one.");
      return;
    }
    if (pass.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (pass !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      await axios.post("/api/reset-password/confirm", {
        uid,
        token,
        new_password: pass,
      });
      setDone(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: unknown) {
      let msg = "Something went wrong";
      if (typeof err === "object" && err !== null) {
        const maybeAxios = err as { response?: { data?: { error?: unknown } } };
        const maybeError = maybeAxios.response?.data?.error;
        if (typeof maybeError === "string") msg = maybeError;
      }
      if (msg === "Something went wrong" && err instanceof Error) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <B2BAuthShell
      eyebrow="Trade Account Recovery"
      title="Set a new password"
      description="Choose a new password for your Elvarra wholesale account."
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/login" className="font-semibold text-cyan-300 hover:text-cyan-200">
            Back to login
          </Link>
          <Link href="/forgot-password" className="text-slate-300 hover:text-white">
            Request a new link
          </Link>
        </div>
      }
    >
      {!done ? (
        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className={tradeLabelClass}>New password</label>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                className={`${tradeInputClass} pr-20`}
                placeholder="Minimum 6 characters"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute inset-y-0 right-3 my-auto h-8 rounded-xl px-3 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/10"
              >
                {show ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div>
            <label className={tradeLabelClass}>Confirm password</label>
            <input
              type={show ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={tradeInputClass}
              autoComplete="new-password"
              placeholder="Re-enter your new password"
              required
            />
          </div>

          {error && (
            <div className="rounded-2xl border border-rose-500/35 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className={tradePrimaryButtonClass}>
            {loading ? "Updating…" : "Set New Password"}
          </button>
        </form>
      ) : (
        <div className="space-y-5">
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-sm leading-6 text-emerald-100">
            Your password has been updated successfully. You can now sign in to your trade account.
          </div>
          <Link
            href="/login"
            className="inline-flex rounded-2xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-2.5 text-sm font-semibold text-cyan-300 hover:bg-cyan-500/15"
          >
            Go to Trade Login
          </Link>
        </div>
      )}
    </B2BAuthShell>
  );
}
