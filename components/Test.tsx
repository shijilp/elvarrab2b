"use client";

import { useState } from "react";

export default function Test() {
  const [dark, setDark] = useState(false);

  return (
    <main
      data-theme={dark ? "dark" : "light"}
      className="flex min-h-screen flex-col items-center justify-center gap-8 bg-elvarra"
    >
      <h1 className="text-2xl font-bold">Elvarra Ring Demo</h1>

      <div className="w-40 h-20 rounded-lg bg-elvarra ring-1 ring-elvarra flex items-center justify-center">
        Ring Box
      </div>

      <button
        onClick={() => setDark(!dark)}
        className="px-4 py-2 rounded-md bg-neutral-800 text-white hover:bg-neutral-700"
      >
        Toggle Theme ({dark ? "Dark" : "Light"})
      </button>
    </main>
  );
}
/* bg-[var(--elvarra-accent-start)] */
