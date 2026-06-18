import "server-only";
import { DEFAULT_STORE_SETTINGS, type StoreSettings } from "./storeSettings.types";

export async function getStoreSettings(): Promise<StoreSettings> {
  const res = await fetch(`${process.env.BACKEND_URL ?? ""}/manager/settings`, {
    cache: "no-store",
    headers: { "Cache-Control": "no-store" },
  });

  if (!res.ok) return DEFAULT_STORE_SETTINGS;

  const data = (await res.json()) as Partial<StoreSettings>;
  return { ...DEFAULT_STORE_SETTINGS, ...data };
}
