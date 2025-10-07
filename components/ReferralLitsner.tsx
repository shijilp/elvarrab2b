"use client";

import { useEffect } from "react";
import { api } from "@/lib/api";

export function ReferralListener() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("ref");
    if (code) {
      localStorage.setItem("elv_ref", code);
      api.post("/referrals/track/", { code }).catch(() => {});
    }
  }, []);
  return null;
}
