"use client";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/5">
      <div className="container">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-neutral-300 to-neutral-500 shadow" />
            <span className="text-lg font-semibold tracking-wide">ELVARRA</span>
          </div>
          <nav className="hidden gap-8 text-sm md:flex">
            <Link className="opacity-90 hover:opacity-100" href="#collections">
              Catalog
            </Link>
            <Link className="opacity-90 hover:opacity-100" href="#bestsellers">
              Bestsellers
            </Link>
            <Link className="opacity-90 hover:opacity-100" href="#about">
              About
            </Link>
            <Link className="opacity-90 hover:opacity-100" href="#how">
              How it works
            </Link>
            <Link className="opacity-90 hover:opacity-100" href="#contact">
              Contact
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {/* <button className="rounded-2xl px-3 py-1.5 text-xs text-neutral-900 dark:text-neutral-900 gradient-accent">
              Sign In
            </button> */}
          </div>
        </div>
      </div>
    </header>
  );
}
