"use client";

import GoogleButton from "@/components/GoogleButton";
import B2BAuthShell, {
  tradeInputClass,
  tradeLabelClass,
  tradePrimaryButtonClass,
} from "@/components/auth/B2BAuthShell";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, loading } = useAuth();
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      await login(email, password);
      router.push("/");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.error ||
          err?.message ||
          "Login failed. Please check your details and try again.",
      );
    }
  }

  return (
    <B2BAuthShell
      title="Trade account login"
      description="Sign in to manage your Elvarra wholesale account, orders and account support. The catalog and trade pricing can be browsed without login."
      footer={
        <p>
          New to Elvarra Wholesale?{" "}
          <Link
            href="/register"
            className="font-semibold text-cyan-300 hover:text-cyan-200"
          >
            Create a trade account
          </Link>
        </p>
      }
    >
      <script src="https://accounts.google.com/gsi/client" async defer />

      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className={tradeLabelClass}>Email address</label>
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

        <div>
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <label className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-cyan-300 transition hover:text-cyan-200"
            >
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="Enter your password"
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
          {loading ? "Signing in…" : "Sign in to Trade Portal"}
        </button>

        <div className="flex items-center gap-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-600">
          <span className="h-px flex-1 bg-slate-800" />
          or
          <span className="h-px flex-1 bg-slate-800" />
        </div>

        <div className="flex justify-center">
          <GoogleButton />
        </div>
      </form>

      <LoadingOverlay show={loading} />
    </B2BAuthShell>
  );
}
