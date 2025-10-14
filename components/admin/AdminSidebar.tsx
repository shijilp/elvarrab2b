// AdminSidebar.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

/** tiny clsx */
function clsx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

/** A small global event you can dispatch to open the drawer from anywhere */
const SIDEBAR_OPEN_EVENT = "elvarra:sidebar-open";

/** Helper to open the mobile sidebar programmatically */
export function openAdminSidebar() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SIDEBAR_OPEN_EVENT));
  }
}

/** Optional ready-made hamburger button you can drop in your mobile header */
export function SidebarMobileButton({
  label = "Open sidebar",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <button
      onClick={openAdminSidebar}
      aria-label={label}
      className={clsx(
        "rounded-xl ring-1 ring-neutral-300 dark:ring-neutral-700 p-2 active:scale-[0.98]",
        className
      )}
    >
      <span className="block h-0.5 w-5 bg-current mb-1" />
      <span className="block h-0.5 w-5 bg-current mb-1" />
      <span className="block h-0.5 w-5 bg-current" />
    </button>
  );
}

// ---------- Sidebar ----------
export function Sidebar({
  collapsed,
  onToggle,
  /** Controlled mobile state is optional. If omitted, component manages its own. */
  mobileOpen: mobileOpenProp,
  setMobileOpen: setMobileOpenProp,
}: {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}) {
  const pathname = usePathname();

  // Controlled/uncontrolled support for mobile drawer
  const isControlled =
    typeof mobileOpenProp === "boolean" && !!setMobileOpenProp;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const mobileOpen = isControlled
    ? (mobileOpenProp as boolean)
    : uncontrolledOpen;
  const setMobileOpen = isControlled
    ? (setMobileOpenProp as (o: boolean) => void)
    : setUncontrolledOpen;

  // Listen for global open events (from SidebarMobileButton or openAdminSidebar())
  useEffect(() => {
    const handler = () => setMobileOpen(true);
    if (typeof window !== "undefined") {
      window.addEventListener(SIDEBAR_OPEN_EVENT, handler);
      return () => window.removeEventListener(SIDEBAR_OPEN_EVENT, handler);
    }
  }, [setMobileOpen]);

  // Close drawer on route change
  useEffect(() => {
    setMobileOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Lock body scroll while drawer is open
  useEffect(() => {
    if (mobileOpen) {
      const prevHtml = document.documentElement.style.overflow;
      const prevBody = document.body.style.overflow;
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      return () => {
        document.documentElement.style.overflow = prevHtml;
        document.body.style.overflow = prevBody;
      };
    }
  }, [mobileOpen]);

  const links = useMemo(
    () => [
      { href: "/admin", label: "Dashboard" },
      { href: "/admin/orders", label: "Orders" },
      { href: "/admin/products", label: "Products" },
      { href: "/admin/orders/packing", label: "Packing" },
      { href: "/admin/orders/shipping", label: "Shipping" },
    ],
    []
  );

  const inventorylinks = useMemo(
    () => [
      { href: "/admin/inventory", label: "Dashboard" },
      { href: "/admin/inventory/receipts", label: "Receipts" },
      { href: "/admin/inventory/adjustments", label: "Adjustments" },
      { href: "/admin/inventory/transfers", label: "Transfers" },
    ],
    []
  );

  const customerlinks = useMemo(
    () => [
      { href: "/admin/customers/dashboard", label: "Dashboard" },
      { href: "/admin/customers", label: "Report" },
      { href: "/admin/customers/wallet", label: "Wallet" },
    ],
    []
  );

  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(href + "/");

  return (
    <>
      {/* Sidebar itself */}
      <aside
        className={clsx(
          // Positioning: off-canvas on mobile, static sticky on desktop
          "fixed inset-y-0 left-0 z-50 w-72 max-w-[85%] transform transition-transform duration-300 md:static md:translate-x-0",
          "md:sticky md:top-0 md:h-[100vh] md:shrink-0",
          // Visuals
          "border-r border-neutral-200 bg-white/80 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/80",
          "transition-[width] ease-out",
          // Width on desktop based on collapsed
          collapsed ? "md:w-[72px]" : "md:w-64",
          // Mobile visibility
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
        aria-label="Sidebar navigation"
        role="dialog"
        aria-modal={mobileOpen ? true : undefined}
      >
        <div className="flex min-h-0 flex-1 flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-4">
            <Link
              href="/"
              className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-amber-500/50 rounded-xl"
            >
              <div className="h-8 w-8 rounded-xl btn-gradient-accent" />
              <span
                className={clsx(
                  "font-semibold",
                  collapsed && "hidden md:inline"
                )}
              >
                Elvarra Admin
              </span>
            </Link>

            {/* Desktop collapse toggle */}
            <button
              onClick={onToggle}
              className="hidden md:inline-flex rounded-xl px-2 py-1 text-xs ring-1 ring-neutral-200 hover:bg-neutral-50 dark:ring-neutral-800 dark:hover:bg-neutral-900"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={collapsed ? "Expand" : "Collapse"}
            >
              {collapsed ? "›" : "‹"}
            </button>

            {/* Mobile close button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden rounded-xl px-2 py-1 text-xs ring-1 ring-neutral-200 hover:bg-neutral-50 dark:ring-neutral-800 dark:hover:bg-neutral-900"
              aria-label="Close sidebar"
            >
              ✕
            </button>
          </div>

          {/* Scrollable nav */}
          <nav className="mt-2 flex-1 overflow-y-auto px-2 pb-4">
            <ul className="space-y-1">
              {links.map((link) => {
                const active = isActive(link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={clsx(
                        "group flex items-center gap-2 rounded-xl px-3 py-2 text-sm ring-1 ring-transparent",
                        active
                          ? " text-white ring-neutral-900 btn-gradient-accent dark:text-neutral-900 "
                          : "text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-900"
                      )}
                      aria-current={active ? "page" : undefined}
                      title={collapsed ? link.label : undefined}
                    >
                      <span
                        className={clsx(
                          "inline-block h-1.5 w-1.5 rounded-full",
                          active ? "bg-current" : "bg-neutral-400"
                        )}
                      />
                      <span className={clsx(collapsed && "hidden md:inline")}>
                        {link.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <ul className="space-y-1 mt-5">
              <p
                className={clsx(
                  "text-base opacity-75",
                  collapsed && "hidden md:block"
                )}
              >
                Customer
              </p>
              {customerlinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={clsx(
                        "group flex items-center gap-2 rounded-xl px-3 py-2 text-sm ring-1 ring-transparent",
                        active
                          ? " text-white ring-neutral-900 btn-gradient-accent dark:text-neutral-900 "
                          : "text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-900"
                      )}
                      aria-current={active ? "page" : undefined}
                      title={collapsed ? link.label : undefined}
                    >
                      <span
                        className={clsx(
                          "inline-block h-1.5 w-1.5 rounded-full",
                          active ? "bg-current" : "bg-neutral-400"
                        )}
                      />
                      <span className={clsx(collapsed && "hidden md:inline")}>
                        {link.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <ul className="space-y-1 mt-5">
              <p
                className={clsx(
                  "text-base opacity-75",
                  collapsed && "hidden md:block"
                )}
              >
                Inventory
              </p>
              {inventorylinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={clsx(
                        "group flex items-center gap-2 rounded-xl px-3 py-2 text-sm ring-1 ring-transparent",
                        active
                          ? " text-white ring-neutral-900 btn-gradient-accent dark:text-neutral-900 "
                          : "text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-900"
                      )}
                      aria-current={active ? "page" : undefined}
                      title={collapsed ? link.label : undefined}
                    >
                      <span
                        className={clsx(
                          "inline-block h-1.5 w-1.5 rounded-full",
                          active ? "bg-current" : "bg-neutral-400"
                        )}
                      />
                      <span className={clsx(collapsed && "hidden md:inline")}>
                        {link.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="border-t border-neutral-200 p-3 text-[11px] text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
            <span className={clsx(collapsed && "hidden md:inline")}>
              v1.0 • Elvarra
            </span>
            <span className={clsx(!collapsed && "hidden md:inline")}>v1.0</span>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          aria-label="Close sidebar overlay"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
        />
      )}
    </>
  );
}
