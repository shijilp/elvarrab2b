import Link from "next/link";
import React from "react";

type ThemeMode = "dark" | "light";
type Palette = {
  bg: string;
  fg: string;
  subfg: string;
  card: string;
  border: string;
  button: string;
  ring: string;
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
      };
}

export default function PageShell({
  title,
  subtitle,
  children,
  theme = "dark",
  trail,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  theme?: ThemeMode;
  trail: string;
}) {
  const palette = paletteForTheme(theme);
  return (
    <main className={`${palette.bg} ${palette.fg} min-h-screen antialiased`}>
      <div className="container py-10">
        <nav className={`text-xs ${palette.subfg}`}>
          <Link href="/" className="underline">
            Home
          </Link>{" "}
          /{" "}
          <Link href="/guides" className="underline">
            Guides
          </Link>{" "}
          / <span>{trail}</span>
        </nav>

        <header className="mt-2 mb-8">
          <h1 className="text-3xl font-semibold">{title}</h1>
          <p className={`mt-1 text-sm ${palette.subfg}`}>{subtitle}</p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">{children}</div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/products"
            className={`rounded-xl px-6 py-2 font-medium ${palette.button}`}
          >
            Shop Jewelry
          </Link>
        </div>
      </div>
    </main>
  );
}

export { paletteForTheme };
