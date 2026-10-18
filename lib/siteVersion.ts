"use client";

// These keys are origin-scoped: retail and B2B track their versions separately.
const VERSION_KEY = "elvarra_site_data_version";
const TAB_VERSION_KEY = "elvarra_tab_site_data_version";

// Only remove disposable site-data caches. NEVER clear customer, cart, RFQ,
// referral, login or payment storage on a version change.
const CACHE_PREFIXES = [
  "elvarra_cache_",
  "elvarra:cache:",
  "b2b_cache_",
  "b2b:cache:",
];
const BROWSER_CACHE_PREFIXES = [
  "elvarra-",
  "elvarra_",
  "elvarra:",
  "b2b-",
  "b2b_",
  "b2b:",
];

let updateInProgress = false;

function clearDisposableStorage(storage: Storage) {
  for (let index = storage.length - 1; index >= 0; index--) {
    const key = storage.key(index);
    if (key && CACHE_PREFIXES.some((prefix) => key.startsWith(prefix))) {
      storage.removeItem(key);
    }
  }
}

async function clearDisposableBrowserCaches() {
  if (!("caches" in window)) return;
  try {
    const names = await window.caches.keys();
    await Promise.all(
      names
        .filter((name) =>
          BROWSER_CACHE_PREFIXES.some((prefix) => name.startsWith(prefix)),
        )
        .map((name) => window.caches.delete(name)),
    );
  } catch (error) {
    // CacheStorage may be blocked. Still allow the version-controlled reload.
    console.warn("Unable to clear Elvarra CacheStorage", error);
  }
}

/**
 * Compare a fresh backend version with the last version seen by this browser
 * AND by this specific tab. A tab-specific marker also detects updates from
 * another open tab on the same origin.
 *
 * The first successful check records the version without an unnecessary reload.
 * No action is taken for missing/blank API values or unavailable browser storage.
 */
export async function ensureSiteVersion(
  serverVersionRaw: string | number | null | undefined,
  options: { allowReload?: boolean } = {},
): Promise<void> {
  if (typeof window === "undefined") return;
  const serverVersion = String(serverVersionRaw ?? "").trim();
  if (!serverVersion || updateInProgress) return;

  let savedVersion: string | null;
  let tabVersion: string | null;
  try {
    savedVersion = window.localStorage.getItem(VERSION_KEY);
    tabVersion = window.sessionStorage.getItem(TAB_VERSION_KEY);
  } catch {
    // Avoid reload loops in browsers that block local/session storage.
    return;
  }

  // First visit: no old client state exists to invalidate.
  if (savedVersion === null && tabVersion === null) {
    try {
      window.localStorage.setItem(VERSION_KEY, serverVersion);
      window.sessionStorage.setItem(TAB_VERSION_KEY, serverVersion);
    } catch {
      // Ignore blocked browser storage.
    }
    return;
  }

  const hasChanged =
    (savedVersion !== null && savedVersion !== serverVersion) ||
    (tabVersion !== null && tabVersion !== serverVersion);

  if (!hasChanged) {
    // Migrate older installations that did not track the tab version.
    try {
      window.localStorage.setItem(VERSION_KEY, serverVersion);
      window.sessionStorage.setItem(TAB_VERSION_KEY, serverVersion);
    } catch {
      // Ignore blocked browser storage.
    }
    return;
  }

  // In particular, do not reload a checkout/payment/confirmation in progress.
  // The gate will check again when the customer leaves the protected route.
  if (options.allowReload === false) return;

  updateInProgress = true;
  try {
    clearDisposableStorage(window.localStorage);
    clearDisposableStorage(window.sessionStorage);
    await clearDisposableBrowserCaches();

    // Record before reloading, otherwise the page can reload indefinitely.
    window.localStorage.setItem(VERSION_KEY, serverVersion);
    window.sessionStorage.setItem(TAB_VERSION_KEY, serverVersion);
    window.location.reload(); // New document and Next.js in-memory router cache.
  } catch (error) {
    updateInProgress = false;
    console.warn("Elvarra version refresh could not be completed", error);
  }
}
