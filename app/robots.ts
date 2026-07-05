import type { MetadataRoute } from "next";
import { PRODUCTION_APP_URL } from "@/lib/constants/branding";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/", "/budget/", "/auth/", "/dashboard/", "/history/"],
    },
    sitemap: `${PRODUCTION_APP_URL}/sitemap.xml`,
  };
}
