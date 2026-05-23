"use client";

import React from "react";

export default function ElvarraSpinner({
  size = 180,
  label = "Loading trade data",
}: {
  size?: number;
  label?: string;
}) {
  return (
    <span
      role="status"
      aria-live="polite"
      className="inline-flex flex-col items-center"
    >
      <div className="relative">
        {/* glow */}
        <div className="absolute inset-0 scale-[1.6] rounded-full bg-cyan-500/15 blur-3xl" />

        <svg
          width={size}
          height={size}
          viewBox="0 0 180 180"
          fill="none"
          className="relative"
        >
          <defs>
            <linearGradient
              id="trade-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
          </defs>

          {/* outer */}
          <circle
            cx="90"
            cy="90"
            r="68"
            stroke="rgba(255,255,255,.06)"
            strokeWidth="6"
          />

          {/* animated */}
          <circle
            cx="90"
            cy="90"
            r="68"
            stroke="url(#trade-gradient)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="250 180"
            className="origin-center animate-spin"
          />

          {/* center */}
          <circle
            cx="90"
            cy="90"
            r="42"
            fill="#071827"
            stroke="rgba(56,189,248,.18)"
          />

          {/* logo */}
          <text
            x="90"
            y="84"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="14"
            fontWeight="700"
            letterSpacing="3"
          >
            ELVARRA
          </text>

          <text
            x="90"
            y="104"
            textAnchor="middle"
            fill="#67e8f9"
            fontSize="8"
            fontWeight="600"
            letterSpacing="2"
          >
            TRADE
          </text>
        </svg>
      </div>

      <div className="mt-3 text-center">
        <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-300">
          Wholesale Portal
        </div>

        <div className="mt-1 text-sm font-semibold text-white">{label}</div>

        <div className="mt-1 text-xs text-slate-400">
          Preparing catalog & pricing…
        </div>
      </div>
    </span>
  );
}
