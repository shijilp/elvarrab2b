// components/LegalLayout.tsx
"use client";

import { PropsWithChildren, useMemo } from "react";

export default function LegalLayout({
  title,
  intro,
  children,
}: PropsWithChildren<{ title: string; intro?: string }>) {
  const items = useMemo(() => {
    // Collect all section headings inside .prose and build a TOC
    if (typeof window === "undefined") return [];
    const nodes =
      document.querySelectorAll<HTMLHeadingElement>(".prose h2[id]");
    return Array.from(nodes).map((n) => ({
      id: n.id,
      text: n.textContent ?? "",
    }));
  }, []); // re-compute on mount

  return (
    <section className="min-h-screen bg-[var(--background,black)] text-[var(--foreground,white)]">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          {intro ? (
            <p className="mt-3 text-sm text-neutral-400">{intro}</p>
          ) : null}
        </header>

        <div className="grid gap-10 lg:grid-cols-[260px,1fr]">
          {/* TOC */}
          <aside className="lg:pt-2">
            <div className="sticky top-24 rounded-2xl border border-neutral-800/60 bg-neutral-900/40 p-4">
              <div className="text-xs uppercase tracking-wide text-neutral-400">
                On this page
              </div>
              <nav className="mt-3 space-y-2">
                {items.length === 0 ? (
                  <div className="text-sm text-neutral-500">—</div>
                ) : (
                  items.map((it) => (
                    <a
                      key={it.id}
                      href={`#${it.id}`}
                      className="block text-sm text-neutral-300 hover:text-white"
                    >
                      {it.text}
                    </a>
                  ))
                )}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <article className="prose prose-invert max-w-none prose-headings:scroll-mt-28 prose-h2:mt-12">
            {children}
          </article>
        </div>

        <footer className="mt-16 border-t border-neutral-800/60 pt-6 text-xs text-neutral-400">
          <p>
            Elvarra • Contact:{" "}
            <a href="mailto:support@elvarra.com" className="underline">
              support@elvarra.com
            </a>
          </p>
        </footer>
      </div>
    </section>
  );
}
