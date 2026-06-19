"use client";

const VERSION_KEY = "elvarra_site_data_version";

const EXACT_KEYS = ["user", "lastExternalReferrer", "lastExternalReferrerTime"];
const PREFIX_KEYS = ["elvarra_", "rzp_"];

function purgeLocalStorage() {
  const keys = Object.keys(localStorage);
  for (const key of keys) {
    if (EXACT_KEYS.includes(key) || PREFIX_KEYS.some((p) => key.startsWith(p))) {
      localStorage.removeItem(key);
    }
  }
}

function purgeCookies() {
  const cookies = document.cookie.split(";").map((c) => c.trim()).filter(Boolean);

  for (const cookie of cookies) {
    const name = cookie.split("=")[0];

    if (
      name.startsWith("elvarra_") ||
      name.startsWith("rzp_") ||
      name === "access_token" ||
      name === "refresh_token"
    ) {
      // delete on path
      document.cookie = `${name}=; Max-Age=0; path=/`;

      // try common domain deletions (helps if set with domain)
      const host = window.location.hostname;
      const parts = host.split(".");
      if (parts.length >= 2) {
        const apex = parts.slice(-2).join(".");
        document.cookie = `${name}=; Max-Age=0; path=/; domain=.${apex}`;
        document.cookie = `${name}=; Max-Age=0; path=/; domain=${apex}`;
      }
    }
  }
}

export function ensureSiteVersion(serverVersionRaw: string | number | null | undefined) {
  try {
    if (typeof window === "undefined") return;

    const serverVersion = String(serverVersionRaw ?? "1");
    const localVersion = localStorage.getItem(VERSION_KEY);

    if (!localVersion || localVersion !== serverVersion) {
      console.log("🔄 Elvarra version changed. Purging client storage...");

      purgeLocalStorage();
      purgeCookies();

      localStorage.setItem(VERSION_KEY, serverVersion);

      // recommended: reload so contexts start clean
      window.location.reload();
    }
  } catch (err) {
    console.error("Version check failed", err);
  }
}