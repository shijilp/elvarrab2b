"use client";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import LogoutButton from "./ui/LogoutButton";
import CartBtnonHeader from "./CartBtnonHeader";
import { useState } from "react";
import { Menu, X, Home, Package, ShoppingCart, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext"; // ✅ import cart context
import { useTheme } from "@/context/ThemeContext";

export default function Header() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { cartItems } = useCart(); // ✅ access cart
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: "/products", label: "Catalog" },
    // { href: "#how", label: "How it works" },
    { href: "/orders", label: "Orders" },
    { href: "/contact", label: "Contact" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Top Header (unchanged) */}
      <header className="sticky top-0 z-40 w-full backdrop-blur supports-[backdrop-filter]:bg-white/5 print:hidden">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-1">
              <Image
                src={theme === "dark" ? "/logowhite.svg" : "/logog.svg"}
                width={25}
                height={25}
                alt="Elvarra Logo"
              />
              <Link href={"/"}>
                <span className="text-lg font-semibold tracking-wide">
                  ELVARRA
                </span>
              </Link>
            </div>

            <nav className="hidden gap-8 text-sm md:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  className="opacity-90 hover:opacity-100"
                  href={link.href}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            {user?.isAdmin && (
              <nav className="hidden gap-8 text-sm md:flex">
                <Link className="opacity-90 hover:opacity-100" href={"/admin"}>
                  Admin{user?.isAdmin ? ` (${user?.role})` : ""}
                </Link>
              </nav>
            )}

            <div className="flex items-center gap-2">
              {user && (
                <Link href="/account">
                  <div className=" hidden md:block">
                    <span className="text-sm opacity-90">
                      Hello, {user.first_name ? user.first_name : user.username}
                      !
                    </span>
                  </div>
                </Link>
              )}
              <ThemeToggle />
              <div className=" hidden md:block">
                <CartBtnonHeader />
              </div>
              <div className=" hidden md:block">
                {user ? (
                  <LogoutButton />
                ) : (
                  <Link href={"/login"}>
                    <button className="rounded-2xl px-3 py-1.5 text-xs text-neutral-900 dark:text-neutral-900 btn-gradient-accent cursor-pointer">
                      Sign In
                    </button>
                  </Link>
                )}
              </div>
              <button
                className="md:hidden p-2"
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
          <div className="md:hidden absolute inset-x-0 top-16 z-30 bg-white dark:bg-neutral-900 shadow-lg">
            <nav className="flex flex-col space-y-4 px-6 py-6 text-sm">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="opacity-90 hover:opacity-100"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <LogoutButton setOpen={setOpen} />
              ) : (
                <Link href={"/login"}>
                  <button
                    onClick={() => setOpen(false)}
                    className="rounded-2xl px-3 py-1.5 text-xs text-neutral-900 dark:text-neutral-900 btn-gradient-accent cursor-pointer"
                  >
                    Sign In
                  </button>
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Bottom Mobile Nav */}
      <nav className="md:hidden print:hidden fixed bottom-0 inset-x-0 z-40 bg-white/90 dark:bg-neutral-900/90 border-t border-neutral-200 dark:border-neutral-800 backdrop-blur pb-[max(env(safe-area-inset-bottom),0px)]">
        <div className="flex justify-around items-center h-14 text-xs">
          <Tab href="/" label="Home" active={isActive("/")}>
            <Home className="h-5 w-5" />
          </Tab>
          <Tab href="/products" label="Catalog" active={isActive("/products")}>
            <Package className="h-5 w-5" />
          </Tab>
          {/* ✅ Cart with badge */}
          <Tab
            href="/orders/cart"
            label="Cart"
            active={isActive("/orders/cart")}
          >
            <div className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 text-[10px] font-bold text-neutral-900 shadow">
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
        "relative flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition",
        active
          ? "text-neutral-900 dark:text-neutral-900 btn-gradient-accent shadow-sm"
          : "opacity-90 hover:opacity-100",
      ].join(" ")}
    >
      {children}
      <span className={active ? "font-medium" : ""}>{label}</span>
      {active && (
        <span className="absolute -top-1 h-1.5 w-6 rounded-full bg-yellow-400/90" />
      )}
    </Link>
  );
}
