"use client";
import React, { useMemo, useState } from "react";
import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={<div className="max-w-md mx-auto py-12 px-4">Loading…</div>}
    >
      <ResetPasswordForm />
    </Suspense>
  );
}

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

function ResetPasswordForm() {
  const theme: ThemeMode = "dark";
  const params = useSearchParams(); // ✅ now inside Suspense
  const uid = params.get("uid");
  const token = params.get("token");

  const palette = useMemo(() => paletteForTheme(theme), [theme]);
  // const [token, setToken] = useState<string | null>(null);
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!uid || !token) {
      setError("Invalid reset link.");
      return;
    }
    if (pass !== confirm) {
      setError("Passwords don't match");
      return;
    }

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
    }
  }

  return (
    <main
      className={`${palette.bg} ${palette.fg} min-h-screen flex items-center justify-center`}
    >
      <div
        className={`w-full max-w-md rounded-2xl ${palette.ring} ${palette.card} p-6`}
      >
        <h1 className="text-2xl font-semibold">Reset password</h1>
        {!done ? (
          <>
            <p className={`mt-1 text-sm ${palette.subfg}`}>
              Choose a new password for your account.
            </p>
            <form onSubmit={submit} className="mt-4 space-y-4">
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
                    className="w-full bg-transparent px-3 py-2 outline-none"
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
                  Confirm password
                </label>
                <input
                  type={show ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className={`w-full rounded-xl border ${palette.border} bg-transparent px-3 py-2 outline-none`}
                  required
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
                Set new password
              </button>
              <div className="flex items-center justify-between text-sm">
                <a href="/login" className="underline">
                  Back to login
                </a>
                <a href="/forgot" className="underline">
                  Resend link
                </a>
              </div>
            </form>
          </>
        ) : (
          <div className="mt-4 space-y-3 text-sm">
            <div className="rounded-xl border border-emerald-500/50 bg-emerald-500/10 p-3 text-emerald-200">
              Your password has been updated. You can now sign in.
            </div>
            <a href="/login" className="underline">
              Go to login
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
