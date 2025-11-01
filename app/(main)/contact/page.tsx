"use client";
import { api } from "@/lib/api";
import Link from "next/link";
import React, { useMemo, useState, useEffect } from "react";

// ------------------------------------------------------------
// Elvarra / Elvara — SUPPORT / CONTACT PAGE
// Route: app/support/page.tsx
// Behavior: submits to your backend (e.g., POST /api/support) to send an email
// - Client-side validation
// - Loading & error states
// - Success confirmation (no page reload)
// - Resilient fetch (timeout, retry once)
// - Honeypot anti-bot field
// - Same visual theme as the rest of the app
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

function isEmail(x: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x);
}

export default function SupportPage() {
  const theme: ThemeMode = "dark";
  const palette = useMemo(() => paletteForTheme(theme), [theme]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [orderId, setOrderId] = useState(""); // optional
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [honeypot, setHoneypot] = useState(""); // bots fill hidden fields

  // Prefill email from local storage if present
  useEffect(() => {
    try {
      const pre = localStorage.getItem("elvara:prefill-email");
      if (pre && typeof pre === "string" && isEmail(pre)) setEmail(pre);
    } catch {}
  }, []);

  function validate(): string | null {
    if (!name.trim()) return "Please enter your name.";
    if (!isEmail(email)) return "Please enter a valid email address.";
    if (!subject.trim()) return "Please enter a subject.";
    if (!message.trim()) return "Please enter a message.";
    return null;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(false);

    if (honeypot) {
      // Likely a bot — pretend success to avoid probing
      setOk(true);
      return;
    }

    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    setLoading(true);

    try {
      const res = await api.post(
        "/support/",
        {
          name,
          email,
          subject,
          message,
          orderId: orderId || undefined,
        },
        { withCredentials: true }
      );

      if (!res) {
        const msg = await safeResText(res);
        throw new Error(msg || `Request failed (${res})`);
      }

      setOk(true);
      setName("");
      setSubject("");
      setMessage("");
      setOrderId("");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={`${palette.bg} ${palette.fg} min-h-screen antialiased`}>
      <div className="container py-10  relative isolate">
        <div className="absolute inset-15 -z-10 opacity-10 blur-3xl mx-auto   max-w-[100vw] overflow-hidden">
          <div className="pointer-events-none absolute -inset-30 rounded-[100px] gradient-accent" />
        </div>
        <div className="mx-auto max-w-3xl">
          <header className="mb-6">
            <h1 className="text-2xl font-semibold">Contact support</h1>
            <p className={`mt-1 text-sm ${palette.subfg}`}>
              Send us a message and we&apos;ll get back within 1 business day.
            </p>
          </header>

          <section
            className={`rounded-2xl ${palette.ring} ${palette.card} p-6`}
          >
            {ok ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-emerald-500/50 bg-emerald-500/10 p-3 text-emerald-200 text-sm">
                  Thank you! Your message has been sent.
                </div>
                <div className="flex items-center justify-between text-sm">
                  <Link href="/" className="underline">
                    Back to home
                  </Link>
                  <Link href="/account/orders" className="underline">
                    View my orders
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} className="grid grid-cols-1 gap-4">
                {/* Honeypot field (hidden visually) */}
                <div className="hidden">
                  <label>Do not fill</label>
                  <input
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-wider opacity-80">
                      Name
                    </label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`w-full rounded-xl border ${palette.border} bg-transparent px-3 py-2 text-sm outline-none`}
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs uppercase tracking-wider opacity-80">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full rounded-xl border ${palette.border} bg-transparent px-3 py-2 text-sm outline-none`}
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs uppercase tracking-wider opacity-80">
                    Subject
                  </label>
                  <input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className={`w-full rounded-xl border ${palette.border} bg-transparent px-3 py-2 text-sm outline-none`}
                    placeholder="How can we help?"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs uppercase tracking-wider opacity-80">
                    Message
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={6}
                    className={`w-full resize-y rounded-xl border ${palette.border} bg-transparent px-3 py-2 text-sm outline-none`}
                    placeholder="Describe your issue or question..."
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs uppercase tracking-wider opacity-80">
                    Order ID (optional)
                  </label>
                  <input
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    className={`w-full rounded-xl border ${palette.border} bg-transparent px-3 py-2 text-sm outline-none`}
                    placeholder="e.g., R-123456"
                  />
                </div>

                {error && (
                  <div className="rounded-xl border border-rose-500/50 bg-rose-500/10 p-3 text-sm text-rose-200">
                    {error}
                  </div>
                )}

                <div className="flex items-center justify-between gap-3">
                  <p className={`text-xs ${palette.subfg}`}>
                    By submitting, you agree to our{" "}
                    <a className="underline" href="/privacy">
                      Privacy Policy
                    </a>
                    .
                  </p>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`rounded-xl px-4 py-2 text-sm font-medium btn-gradient-accent disabled:opacity-60`}
                  >
                    {loading ? "Sending…" : "Send message"}
                  </button>
                </div>
              </form>
            )}
          </section>

          {/* Quick links */}
          <div className="mt-6 flex items-center justify-between text-sm">
            <Link href="/" className="underline">
              Home
            </Link>
            <Link href="/faq" className="underline">
              FAQ
            </Link>
            <Link href="/policies/shipping" className="underline">
              Shipping & Returns
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

async function safeResText(res: Response) {
  try {
    return await res.text();
  } catch {
    return "";
  }
}
