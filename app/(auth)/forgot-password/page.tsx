"use client";
import React, { useMemo, useState } from "react";
import { api } from "@/lib/api";

// ------------------------------------------------------------
// Elvarra / Elvara — AUTH PAGES (Login, Register, Forgot, Reset)
// Routes to create in your app:
// - app/login/page.tsx → export default LoginPage
// - app/register/page.tsx → export default RegisterPage
// - app/forgot/page.tsx → export default ForgotPasswordPage
// - app/reset-password/page.tsx → export default ResetPasswordPage
// This file keeps them together for canvas preview as named exports.
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
export default function ForgotPasswordPage() {
  const theme: ThemeMode = "dark";
  const palette = useMemo(() => paletteForTheme(theme), [theme]);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    try {
      await api.post("/auth/request-reset-password/", { email });
      setSent(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err?.response?.data?.error || "Something went wrong");
    }
  }

  return (
    <main
      className={`${palette.bg} ${palette.fg} min-h-screen flex items-center justify-center`}
    >
      <div
        className={`w-full max-w-md rounded-2xl ${palette.ring} ${palette.card} p-6`}
      >
        <h1 className="text-2xl font-semibold">Forgot password</h1>
        <p className={`mt-1 text-sm ${palette.subfg}`}>
          We&apos; ll email you a link to reset your password.
        </p>

        {sent ? (
          <div className="mt-4 space-y-3 text-sm">
            <div className="rounded-xl border border-emerald-500/50 bg-emerald-500/10 p-3 text-emerald-200">
              If an account exists for{" "}
              <span className="font-medium">{email}</span>, you&apos;ll receive
              a reset link shortly.
            </div>
            <div className="flex items-center justify-between">
              <a href="/login" className="underline">
                Back to login
              </a>
              <a href="/register" className="underline">
                Create account
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-4 space-y-4">
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wider opacity-80">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`w-full rounded-xl border ${palette.border} bg-transparent px-3 py-2 text-sm outline-none`}
              />
            </div>
            {error && (
              <div className="rounded-xl border border-rose-500/50 bg-rose-500/10 p-3 text-sm text-rose-200">
                {error}
              </div>
            )}
            <button
              type="submit"
              className={`w-full rounded-xl px-4 py-2 text-sm font-medium ${palette.button}`}
            >
              Send reset link
            </button>
            <div className="flex items-center justify-between text-sm">
              <a href="/login" className="underline">
                Back to login
              </a>
              <a href="/register" className="underline">
                Create account
              </a>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
