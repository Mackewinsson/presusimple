import type { MetadataRoute } from "next";
import { PRODUCTION_APP_URL } from "@/lib/constants/branding";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Note: /auth/ is intentionally NOT disallowed here. Disallowing crawl
      // prevents Googlebot from ever seeing the page-level `noindex` set in
      // app/auth/layout.tsx, which is why /auth/login was showing as
      // "Indexed, though blocked by robots.txt" in GSC despite being listed
      // here previously. Letting Googlebot crawl + see noindex is the
      // correct way to get it fully deindexed.
      disallow: ["/api/", "/admin/", "/budget/", "/dashboard/", "/history/"],
    },
    sitemap: `${PRODUCTION_APP_URL}/sitemap.xml`,
  };
}
