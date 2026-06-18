"use client";

import {
  DEFAULT_STORE_SETTINGS,
  StoreSettings,
} from "@/lib/storeSettings.types";
import React, { createContext, useContext, useMemo } from "react";

const StoreSettingsContext = createContext<StoreSettings>(
  DEFAULT_STORE_SETTINGS
);

export function StoreSettingsProvider({
  value,
  children,
}: {
  value: StoreSettings;
  children: React.ReactNode;
}) {
  const memo = useMemo(() => value, [value]);
  return (
    <StoreSettingsContext.Provider value={memo}>
      {children}
    </StoreSettingsContext.Provider>
  );
}

export function useStoreSettings() {
  return useContext(StoreSettingsContext);
}
