"use client";

import { api } from "@/lib/api";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  Building2,
  Headphones,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";

function isEmail(x: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x);
}

export default function SupportPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [resaleInquiry, setResaleInquiry] = useState(false);

  useEffect(() => {
    try {
      const pre = localStorage.getItem("elvara:prefill-email");
      if (pre && typeof pre === "string" && isEmail(pre)) setEmail(pre);
    } catch {}

    const params = new URLSearchParams(window.location.search);
    if (params.get("topic") === "resale") {
      setResaleInquiry(true);
      setSubject((current) => current || "Elvarra Resale Program Enquiry");
      setMessage(
        (current) =>
          current ||
          "I am interested in reselling Elvarra products. Please share the resale program details, eligibility, pricing information and onboarding process.",
      );
    }
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
      setOk(true);
      return;
    }

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      await api.post(
        "api/elvarra/support/",
        {
          name,
          email,
          subject,
          message,
          orderId: orderId || undefined,
        },
        { withCredentials: true },
      );

      setOk(true);
      setName("");
      setSubject("");
      setMessage("");
      setOrderId("");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.error ||
          err?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-2xl border border-slate-700 bg-slate-950/65 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/70 focus:ring-4 focus:ring-cyan-500/10";
  const labelClass =
    "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400";

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#06111f] text-slate-100">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.20),transparent_36%),radial-gradient(circle_at_82%_22%,rgba(14,165,233,0.12),transparent_30%),linear-gradient(180deg,#06111f_0%,#081827_50%,#020617_100%)]" />
      <div className="absolute inset-0 -z-10 opacity-[0.04] [background-image:linear-gradient(rgba(255,255,255,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.8)_1px,transparent_1px)] [background-size:48px_48px]" />

      <div className="container mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
        <div className="mb-8 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-blue-200">
              <Headphones className="h-3.5 w-3.5" /> Elvarra Trade Support
            </div>
            <h1 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
              {resaleInquiry
                ? "Let’s discuss resale"
                : "How can we help your business?"}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              {resaleInquiry
                ? "Tell us about how you plan to sell Elvarra products. Our team can guide you on resale options, eligibility, product information and onboarding."
                : "Contact our trade team for wholesale orders, pricing, account access, delivery questions or resale enquiries."}
            </p>
          </div>

          <Link
            href="/catalog"
            className="inline-flex items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-5 py-3 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500/15"
          >
            Browse Wholesale Catalog
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
          <aside className="space-y-4">
            {[
              {
                icon: Building2,
                title: "Wholesale support",
                text: "Questions about trade pricing, catalog access, MOQ rules or repeat ordering.",
              },
              {
                icon: MessageCircle,
                title: "Resale enquiries",
                text: "Interested in reselling Elvarra? Send your details and we’ll explain the available options.",
              },
              {
                icon: ShieldCheck,
                title: "Account assistance",
                text: "Help with registration, login, order history or account-related issues.",
              },
            ].map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="rounded-3xl border border-slate-800 bg-slate-950/60 p-5"
              >
                <div className="grid h-10 w-10 place-items-center rounded-2xl border border-cyan-500/25 bg-cyan-500/10 text-cyan-300">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="mt-4 font-semibold text-white">{title}</div>
                <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
              </div>
            ))}

            <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/[0.06] p-5">
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-300">
                Prefer email?
              </div>
              <a
                href="mailto:support@elvarra.com"
                className="mt-2 block text-sm font-semibold text-white hover:text-cyan-200"
              >
                support@elvarra.com
              </a>
            </div>
          </aside>

          <section className="rounded-[2rem] border border-slate-800 bg-slate-950/75 p-5 shadow-2xl backdrop-blur sm:p-8">
            {ok ? (
              <div className="space-y-5">
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-sm leading-6 text-emerald-100">
                  Thank you. Your message has been sent to Elvarra Trade
                  Support.
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/"
                    className="rounded-2xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:border-cyan-500/40"
                  >
                    Back to home
                  </Link>
                  <Link
                    href="/catalog"
                    className="rounded-2xl bg-cyan-500 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-400"
                  >
                    Browse catalog
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} className="grid grid-cols-1 gap-5">
                <div className="hidden">
                  <label>Do not fill</label>
                  <input
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                  />
                </div>

                {resaleInquiry && (
                  <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.07] p-4 text-sm leading-6 text-slate-300">
                    <span className="font-semibold text-emerald-300">
                      Resale enquiry selected.
                    </span>{" "}
                    We’ve pre-filled the subject and message; edit them as
                    needed before sending.
                  </div>
                )}

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Name</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={inputClass}
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputClass}
                      placeholder="you@business.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Subject</label>
                  <input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className={inputClass}
                    placeholder="How can we help?"
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={6}
                    className={`${inputClass} resize-y`}
                    placeholder="Tell us what you need..."
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Order ID (optional)</label>
                  <input
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    className={inputClass}
                    placeholder="e.g. B2B-123456"
                  />
                </div>

                {error && (
                  <div className="rounded-2xl border border-rose-500/35 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                    {error}
                  </div>
                )}

                <div className="flex flex-col gap-4 border-t border-slate-800 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs leading-5 text-slate-500">
                    By submitting, you agree to our{" "}
                    <Link
                      className="text-slate-300 underline hover:text-white"
                      href="/privacy"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </p>
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-2xl border border-cyan-400/30 bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-sm font-bold text-white transition hover:from-blue-500 hover:to-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading
                      ? "Sending…"
                      : resaleInquiry
                        ? "Send Resale Enquiry"
                        : "Send Message"}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
