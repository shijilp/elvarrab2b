import { usePathname } from "next/navigation";
import Link from "next/link";

function clsx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}
// ---------- Sidebar & Topbar ----------
export function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();

  const links = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/orders", label: "Orders" },
    { href: "/admin/products", label: "Products" },
    { href: "/admin/orders/packing", label: "Packing" },
    { href: "/admin/orders/shipping", label: "Shipping" },
    { href: "/admin/settings", label: "Settings" },
  ];
  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(href + "/");
  return (
    <aside
      className={clsx(
        // hidden on mobile (from previous fix), full-height sticky on md+
        "hidden md:flex md:sticky md:top-0 md:h-[100vh] md:shrink-0",
        "border-r border-neutral-200 bg-white/70 backdrop-blur",
        "dark:border-neutral-800 dark:bg-neutral-900/50",
        "transition-[width] duration-200 ease-out",
        collapsed ? "w-[72px]" : "w-64"
      )}
      aria-label="Sidebar navigation"
    >
      <div className="flex min-h-0 flex-1 flex-col">
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4">
          <Link
            href="/"
            className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-amber-500/50 rounded-xl"
          >
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500" />
            {!collapsed && <span className="font-semibold">Elvarra Admin</span>}
          </Link>
          <button
            onClick={onToggle}
            className="rounded-xl px-2 py-1 text-xs ring-1 ring-neutral-200 hover:bg-neutral-50 dark:ring-neutral-800 dark:hover:bg-neutral-900"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? "›" : "‹"}
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
                        ? "bg-neutral-900 text-white ring-neutral-900 dark:bg-amber-500 dark:text-neutral-900 dark:ring-amber-500"
                        : "text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-900"
                    )}
                    aria-current={active ? "page" : undefined}
                    title={collapsed ? link.label : undefined} // tooltip when collapsed
                  >
                    <span
                      className={clsx(
                        "inline-block h-1.5 w-1.5 rounded-full",
                        active ? "bg-current" : "bg-neutral-400"
                      )}
                    />
                    {!collapsed && <span>{link.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer (optional) */}
        <div className="border-t border-neutral-200 p-3 text-[11px] text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
          {!collapsed ? "v1.0 • Elvarra" : "v1.0"}
        </div>
      </div>
    </aside>
  );
}
