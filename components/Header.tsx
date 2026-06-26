"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import LogoutButton from "./ui/LogoutButton";
import CartBtnonHeader from "./RFQBtnonHeader";
import { useState } from "react";
import {
  Menu,
  X,
  Home,
  Package,
  ShoppingCart,
  User,
  Building2,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { getWholesaleRules } from "@/lib/wholesaleRules";
import { formatMoney } from "@/lib/utils";

export default function Header() {
  const { user } = useAuth();
  const { cartItems } = useCart();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: "/catalog", label: "Wholesale Catalog" },
    // { href: "/rfqs", label: "RFQ Requests" },
    { href: "/orders", label: "Orders" },

    { href: "/contact", label: "Trade Support" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };
  const minOrder = getWholesaleRules(100).minOrderValue;
  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#06111f]/90 backdrop-blur-xl print:hidden">
        <div className="bg-gradient-to-r from-blue-950 via-slate-950 to-cyan-950 px-4 py-1.5 text-center text-[11px] font-medium tracking-wide text-cyan-200">
          ELVARRA B2B TRADE PORTAL · Minimum Order {formatMoney(minOrder)} ·
          Wholesale RFQ Enabled
        </div>

        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex h-17 items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl border border-cyan-500/30 bg-slate-900 shadow-[0_0_25px_rgba(34,211,238,.12)]">
                <Image
                  src="/logowhite.svg"
                  width={24}
                  height={24}
                  alt="Elvarra Logo"
                />
              </div>

              <div>
                <div className="text-lg font-bold tracking-[0.18em] text-white">
                  ELVARRA
                </div>
                <div className="flex items-center gap-1 text-[10px] uppercase tracking-[0.22em] text-cyan-300">
                  <Building2 className="h-3 w-3" />
                  Wholesale
                </div>
              </div>
            </Link>

            <nav className="hidden items-center gap-2 text-sm md:flex">
              {navLinks.map((link) => {
                const active = isActive(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={[
                      "rounded-xl px-4 py-2 font-medium transition",
                      active
                        ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/30"
                        : "text-slate-300 hover:bg-slate-800/80 hover:text-white",
                    ].join(" ")}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-3">
              {user && (
                <Link
                  href="/account"
                  className="hidden rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-300 hover:border-cyan-500/40 hover:text-white md:block"
                >
                  Trade Account:{" "}
                  <span className="font-semibold text-cyan-300">
                    {user.first_name || user.username}
                  </span>
                </Link>
              )}

              <div className="hidden md:block">
                <CartBtnonHeader />
              </div>

              <div className="hidden md:block">
                {user ? (
                  <LogoutButton />
                ) : (
                  <Link href="/login">
                    <button className="rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-cyan-300 hover:bg-cyan-500/20">
                      Trade Login
                    </button>
                  </Link>
                )}
              </div>

              <button
                className="rounded-xl border border-slate-700 bg-slate-900 p-2 text-slate-200 md:hidden"
                onClick={() => setOpen((prev) => !prev)}
                aria-label="Toggle Menu"
              >
                {open ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {open && (
          <div className="absolute inset-x-0 top-[98px] z-30 border-b border-slate-800 bg-[#06111f] shadow-2xl md:hidden">
            <nav className="flex flex-col space-y-3 px-6 py-6 text-sm">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-200"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              {user ? (
                <LogoutButton setOpen={setOpen} />
              ) : (
                <Link href="/login">
                  <button
                    onClick={() => setOpen(false)}
                    className="w-full rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-cyan-300"
                  >
                    Trade Login
                  </button>
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-800 bg-[#06111f]/95 backdrop-blur-xl pb-[max(env(safe-area-inset-bottom),0px)] print:hidden md:hidden">
        <div className="flex h-14 items-center justify-around text-xs text-slate-300">
          <Tab href="/" label="Home" active={isActive("/")}>
            <Home className="h-5 w-5" />
          </Tab>

          <Tab href="/catalog" label="Catalog" active={isActive("/catalog")}>
            <Package className="h-5 w-5" />
          </Tab>

          <Tab
            href="/orders/cart"
            label="RFQ"
            active={isActive("/orders/cart")}
          >
            <div className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartItems && cartItems.length > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-400 text-[10px] font-bold text-slate-950">
                  {cartItems.length}
                </span>
              )}
            </div>
          </Tab>

          <Tab
            href={user ? "/account" : "/login"}
            label={user ? "Account" : "Login"}
            active={isActive(user ? "/account" : "/login")}
          >
            <User className="h-5 w-5" />
          </Tab>
        </div>
      </nav>
    </>
  );
}

function Tab({
  href,
  label,
  active,
  children,
}: {
  href: string;
  label: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={[
        "relative flex flex-col items-center gap-0.5 rounded-xl px-3 py-1 transition",
        active
          ? "bg-cyan-500/10 text-cyan-300"
          : "text-slate-400 hover:text-white",
      ].join(" ")}
    >
      {children}
      <span className={active ? "font-semibold" : ""}>{label}</span>

      {active && (
        <span className="absolute -top-1 h-1.5 w-6 rounded-full bg-cyan-400" />
      )}
    </Link>
  );
}
