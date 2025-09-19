"use client";
import React from "react";

export default function ESpinner({
  size = 64,
  color = "url(#elvarra-gold)",
  label = "Loading",
}: {
  size?: number;
  color?: string;
  label?: string;
}) {
  const strokeWidth = 4;

  return (
    <span role="status" aria-label={label} className="inline-flex items-center">
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        className="animate-spin-slow"
      >
        <defs>
          <linearGradient id="elvarra-gold" x1="0" y1="0" x2="100%" y2="0">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="50%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#eab308" />
          </linearGradient>
        </defs>

        {/* Letter E Path */}
        <path
          d="M20 20 H80 M20 50 H70 M20 80 H80 M20 20 V80"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="260"
          strokeDashoffset="0"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="260"
            to="0"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </path>
      </svg>
      <span className="sr-only">{label}</span>
    </span>
  );
}

// Add a custom slow spin animation in globals.css
// @layer utilities {
//   .animate-spin-slow {
//     animation: spin 2s linear infinite;
//   }
// }
