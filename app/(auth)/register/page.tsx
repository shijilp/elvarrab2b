"use client";

import GoogleButton from "@/components/GoogleButton";
import B2BAuthShell, {
  tradeInputClass,
  tradeLabelClass,
  tradePrimaryButtonClass,
} from "@/components/auth/B2BAuthShell";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import type { User } from "@/types";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { setAuthenticatedUser } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("/api/register", {
        first_name: name,
        username: email,
        password,
        email: email || undefined,
      });

      const registeredUser = res.data?.user as User | undefined;

      // Registration creates the auth cookies on the server. Keep the client
      // AuthContext in sync immediately so protected B2B pages do not bounce
      // the newly registered user back to /login.
      if (!registeredUser || res.data?.authenticated === false) {
        router.replace("/login?registered=1");
        return;
      }

      setAuthenticatedUser(registeredUser);
      router.replace("/catalog");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.error ||
          err?.message ||
          "Registration failed",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <B2BAuthShell
      eyebrow="Elvarra Trade Registration"
      title="Create your trade account"
      description="Register for Elvarra Wholesale to access B2B pricing and place trade orders. Resellers can also contact our support team for resale program details."
      footer={
        <p>
          Already registered?{" "}
          <Link
            href="/login"
            className="font-semibold text-cyan-300 hover:text-cyan-200"
          >
            Sign in to your account
          </Link>
        </p>
      }
    >
      <script src="https://accounts.google.com/gsi/client" async defer />

      <form onSubmit={handleRegister} className="space-y-5">
        <div>
          <label className={tradeLabelClass}>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
            placeholder="Your name"
            className={tradeInputClass}
          />
        </div>

        <div>
          <label className={tradeLabelClass}>Business email</label>
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
          <label className={tradeLabelClass}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            placeholder="Create a secure password"
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
          {loading ? "Creating account…" : "Create Trade Account"}
        </button>

        <div className="flex items-center gap-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-600">
          <span className="h-px flex-1 bg-slate-800" />
          or
          <span className="h-px flex-1 bg-slate-800" />
        </div>

        <div className="flex justify-center">
          <GoogleButton />
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4 text-xs leading-5 text-slate-400 lg:hidden">
          <span className="font-semibold text-emerald-300">
            Resale program available.
          </span>{" "}
          Contact Trade Support or use the site chat for more details.
        </div>
      </form>

      <LoadingOverlay show={loading} />
    </B2BAuthShell>
  );
}
