"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<string>("dark");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <button
      onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
      className="rounded-2xl border border-neutral-200 dark:border-neutral-800 px-3 py-1.5 text-xs uppercase tracking-wider hover:opacity-90"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? "Chic Light" : "Luxury Dark"}
    </button>
  );
}
