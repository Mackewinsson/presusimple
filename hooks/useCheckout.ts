"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslation } from "@/lib/i18n";

export function useCheckout() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const locale = pathname?.startsWith("/es") ? "es" : "en";

  const checkout = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session?.user?.email, locale }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || t("failedToStartCheckout"));
      }
    } catch (err) {
      setError(t("failedToStartCheckout"));
    } finally {
      setLoading(false);
    }
  };

  return { checkout, loading, error, canCheckout: !!session?.user?.email };
}
