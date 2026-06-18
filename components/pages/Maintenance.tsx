"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Mail, Instagram, ShieldAlert, RefreshCcw } from "lucide-react";

export default function MaintenancePage() {
  const [countdown, setCountdown] = useState<number>(0);

  // Optional: show a small "auto refresh" timer (pure UI)
  const refreshSeconds = 30;

  useEffect(() => {
    setCountdown(refreshSeconds);
    const t = setInterval(() => {
      setCountdown((c) => (c <= 1 ? refreshSeconds : c - 1));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const statusText = useMemo(
    () => "We’re performing scheduled maintenance.",
    []
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#060608] text-white">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute -top-24 -left-24 h-[520px] w-[520px] rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, rgba(255,214,145,0.16), transparent 60%)",
          }}
          animate={{ x: [0, 60, 0], y: [0, 30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-32 -right-28 h-[620px] w-[620px] rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle at 70% 70%, rgba(255,170,220,0.10), transparent 62%)",
          }}
          animate={{ x: [0, -70, 0], y: [0, -40, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 opacity-[0.45] mix-blend-soft-light bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06),transparent_55%)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl items-center px-6 py-14">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="w-full"
        >
          {/* Top badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-xl">
            <ShieldAlert className="h-4 w-4 text-amber-200" />
            <span className="text-xs tracking-[0.26em] text-white/70">
              SYSTEM NOTICE
            </span>
          </div>

          {/* Main card */}
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-10">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-5">
                <div className="text-xs tracking-[0.28em] text-white/60">
                  ELVARRA
                </div>

                <h1 className="text-4xl font-extralight leading-tight tracking-tight sm:text-5xl">
                  Under Maintenance
                </h1>

                <p className="max-w-xl text-white/65">
                  {statusText} We’ll be back shortly. Thank you for your
                  patience.
                </p>

                {/* Optional small details */}
                <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px] tracking-wide text-white/55">
                  <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1">
                    Secure updates in progress
                  </span>
                  <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1">
                    Service restoration soon
                  </span>
                </div>
              </div>

              {/* Right side: actions */}
              <div className="grid gap-3 sm:w-[320px]">
                <button
                  onClick={() => window.location.reload()}
                  className="group flex h-12 items-center justify-center gap-2 rounded-2xl text-sm font-medium text-black"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(255,214,145,1), rgba(255,170,220,1))",
                  }}
                >
                  <RefreshCcw className="h-4 w-4 transition group-hover:rotate-180" />
                  Refresh now
                </button>

                <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white/70">
                  Auto refresh in{" "}
                  <span className="text-white/90 font-medium">
                    {countdown}s
                  </span>
                </div>

                <div className="flex flex-col gap-2 pt-1 text-sm">
                  <a
                    href="mailto:support@elvarra.in"
                    className="flex items-center gap-2 text-white/60 hover:text-amber-100 transition"
                  >
                    <Mail className="h-4 w-4" />
                    support@elvarra.in
                  </a>

                  <a
                    href="https://www.instagram.com/elvar.ra"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-white/60 hover:text-amber-100 transition"
                  >
                    <Instagram className="h-4 w-4" />
                    @elvar.ra
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-xs tracking-[0.25em] text-white/45">
            © {new Date().getFullYear()} ELVARRA • ALL RIGHTS RESERVED
          </div>
        </motion.div>
      </div>

      {/* Tiny auto-refresh (optional) */}
      <AutoReload seconds={refreshSeconds} />
    </div>
  );
}

function AutoReload({ seconds }: { seconds: number }) {
  useEffect(() => {
    const t = setInterval(() => {
      // Only reload if page is visible (avoids annoying reloads in background tabs)
      if (document.visibilityState === "visible") {
        window.location.reload();
      }
    }, seconds * 1000);

    return () => clearInterval(t);
  }, [seconds]);

  return null;
}
