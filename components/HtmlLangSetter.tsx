"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Dynamically sets the <html lang> attribute based on the current route.
 * Required because Next.js App Router uses a single root layout with a
 * hardcoded <html> tag, but /es/* pages need lang="es" for SEO and
 * accessibility. Runs on every navigation.
 */
export function HtmlLangSetter() {
  const pathname = usePathname();

  useEffect(() => {
    const lang = pathname.startsWith("/es") ? "es" : "en";
    document.documentElement.lang = lang;
  }, [pathname]);

  return null;
}
