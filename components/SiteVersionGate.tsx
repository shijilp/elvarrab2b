"use client";

import { useEffect } from "react";
import { useStoreSettings } from "@/context/StoreSettingsProvider";
import { ensureSiteVersion } from "@/lib/siteVersion";

export default function SiteVersionGate() {
  const settings = useStoreSettings();

  useEffect(() => {
    // run only once settings are available
    if (!settings?.version_value) return;

    ensureSiteVersion(settings.version_value);
  }, [settings?.version_value]);

  return null;
}
