"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { hasAnalyticsConsent } from "@/lib/analytics/consent";
import { isAnalyticsConfigured, pageview } from "@/lib/analytics/gtag";

export function AnalyticsPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isAnalyticsConfigured() || !hasAnalyticsConsent()) return;

    const query = searchParams.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    pageview(url);
  }, [pathname, searchParams]);

  return null;
}
