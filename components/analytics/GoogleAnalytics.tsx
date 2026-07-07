"use client";

import Script from "next/script";
import { useEffect } from "react";
import { getConsent } from "@/lib/analytics/consent";
import { GA_MEASUREMENT_ID, updateConsentMode } from "@/lib/analytics/gtag";

export function GoogleAnalytics() {
  useEffect(() => {
    if (getConsent() === "granted") {
      updateConsentMode(true);
    }
  }, []);

  if (!GA_MEASUREMENT_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false });
        `}
      </Script>
    </>
  );
}
