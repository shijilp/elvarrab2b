"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ensureSiteVersion } from "@/lib/siteVersion";

const CHECK_INTERVAL_MS = 60_000;
const VERSION_KEY = "elvarra_site_data_version";

function isCheckoutInProgress(pathname: string) {
  return (
    pathname.startsWith("/orders/checkout") ||
    pathname.startsWith("/orders/confirmation")
  );
}

export default function SiteVersionGate() {
  const pathname = usePathname();

  useEffect(() => {
    let disposed = false;
    let checking = false;
    const controller = new AbortController();

    const checkVersion = async () => {
      if (disposed || checking || document.visibilityState === "hidden") return;
      checking = true;
      try {
        // Read the CURRENT backend setting, not the settings serialized when
        // the Next.js layout was initially rendered.
        const response = await fetch("/api/settings", {
          method: "GET",
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
          signal: controller.signal,
        });
        if (!response.ok || disposed) return;
        const data: { version_value?: string | number | null } =
          await response.json();
        if (disposed) return;
        await ensureSiteVersion(data.version_value, {
          allowReload: !isCheckoutInProgress(pathname || ""),
        });
      } catch (error) {
        if (!controller.signal.aborted) {
          console.warn("Elvarra version check failed; will retry", error);
        }
      } finally {
        checking = false;
      }
    };

    const onFocus = () => void checkVersion();
    const onVisible = () => {
      if (document.visibilityState === "visible") void checkVersion();
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === VERSION_KEY) void checkVersion();
    };

    void checkVersion();
    const timer = window.setInterval(() => void checkVersion(), CHECK_INTERVAL_MS);
    window.addEventListener("focus", onFocus);
    window.addEventListener("online", onFocus);
    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      disposed = true;
      controller.abort();
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("online", onFocus);
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [pathname]);

  return null;
}
