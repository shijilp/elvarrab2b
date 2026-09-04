"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/analytics";

export default function VisitorTracker() {
  const pathname = usePathname();
  const startedAt = useRef(Date.now());
  const page = pathname;

  useEffect(() => {
    startedAt.current = Date.now();
    trackEvent({ event_type: "page_view", page });

    return () => {
      const duration_ms = Date.now() - startedAt.current;
      if (duration_ms > 500) {
        trackEvent({ event_type: "time_spent", page, duration_ms });
      }
    };
  }, [page]);

  return null;
}
