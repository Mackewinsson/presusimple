import type { MetadataRoute } from "next";
import { PRODUCTION_APP_URL } from "@/lib/constants/branding";
import { getAllPosts } from "@/lib/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticDate = new Date("2026-07-15T00:00:00.000Z");

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: PRODUCTION_APP_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${PRODUCTION_APP_URL}/es`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${PRODUCTION_APP_URL}/privacy`,
      lastModified: staticDate,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${PRODUCTION_APP_URL}/terms`,
      lastModified: staticDate,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${PRODUCTION_APP_URL}/es/privacy`,
      lastModified: staticDate,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${PRODUCTION_APP_URL}/es/terms`,
      lastModified: staticDate,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${PRODUCTION_APP_URL}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${PRODUCTION_APP_URL}/es/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const englishPosts = getAllPosts("en").map((post) => ({
    url: `${PRODUCTION_APP_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const spanishPosts = getAllPosts("es").map((post) => ({
    url: `${PRODUCTION_APP_URL}/es/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...englishPosts, ...spanishPosts];
}

