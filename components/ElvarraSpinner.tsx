"use client";
import React from "react";

export default function ElvarraSpinner({
  size = 140,
  color = "url(#elvarra-gold)",
  label = "Loading",
}: {
  size?: number;
  color?: string;
  label?: string;
}) {
  return (
    <span
      role="status"
      aria-live="polite"
      className="inline-flex flex-col items-center md:flex-row md:items-center"
    >
      <svg
        width={size}
        height={size / 3}
        viewBox="0 0 400 120"
        fill="none"
        className="animate-pulse-slow"
      >
        <defs>
          <linearGradient id="elvarra-gold" x1="0" y1="0" x2="100%" y2="0">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="50%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#eab308" />
          </linearGradient>
        </defs>

        {/* Modern wordmark ELVARRA with stroke animation */}
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="serif"
          fontSize="48"
          fontWeight="700"
          stroke={color}
          strokeWidth="1.5"
          fill="transparent"
          strokeDasharray="1000"
          strokeDashoffset="1000"
        >
          ELVARRA
          <animate
            attributeName="stroke-dashoffset"
            from="1000"
            to="0"
            dur="2.5s"
            repeatCount="indefinite"
          />
        </text>
      </svg>

      <span className="mt-2 text-xs opacity-75 md:mt-0 md:ml-2 md:text-sm">
        Elegance loading…
      </span>
    </span>
  );
}
