"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getConsent, setConsent, type ConsentStatus } from "@/lib/analytics/consent";
import { pageview, updateConsentMode } from "@/lib/analytics/gtag";
import { useLocale, useTranslation } from "@/lib/i18n";

export function CookieConsentBanner() {
  const { t } = useTranslation();
  const locale = useLocale();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(getConsent() === null);
  }, []);

  const handleChoice = (status: ConsentStatus) => {
    setConsent(status);
    updateConsentMode(status === "granted");
    setVisible(false);

    if (status === "granted") {
      const path = window.location.pathname + window.location.search;
      pageview(path);
    }
  };

  if (!visible) return null;

  const privacyHref = locale === "es" ? "/es/privacy" : "/privacy";

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-consent-title"
      className="fixed bottom-0 left-0 right-0 z-[105] border-t border-border bg-card p-4 shadow-lg md:bottom-4 md:left-4 md:right-auto md:max-w-md md:rounded-lg md:border"
    >
      <div className="mx-auto max-w-4xl space-y-3 md:mx-0">
        <h2 id="cookie-consent-title" className="text-sm font-semibold text-card-foreground">
          {t("cookieConsentTitle")}
        </h2>
        <p className="text-sm text-muted-foreground">{t("cookieConsentDescription")}</p>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={() => handleChoice("granted")}>
            {t("cookieAccept")}
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleChoice("denied")}>
            {t("cookieReject")}
          </Button>
          <Link
            href={privacyHref}
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            {t("cookieLearnMore")}
          </Link>
        </div>
      </div>
    </div>
  );
}
