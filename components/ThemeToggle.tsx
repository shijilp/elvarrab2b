"use client";
import { useTheme } from "@/context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  // useEffect(() => {
  //   const saved =
  //     typeof window !== "undefined" ? localStorage.getItem("theme") : null;
  //   if (saved) toggleTheme(saved);
  // }, []);

  // useEffect(() => {
  //   const root = document.documentElement;
  //   if (theme === "dark") {
  //     root.classList.add("dark");
  //   } else {
  //     root.classList.remove("dark");
  //   }
  //   localStorage.setItem("theme", theme);
  // }, [theme]);

  return (
    <button
      onClick={toggleTheme}
      className="rounded-2xl border border-neutral-200 dark:border-neutral-800 px-3 py-1.5 text-xs uppercase tracking-wider hover:opacity-90"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? "Chic Light" : "Luxury Dark"}
    </button>
  );
}
