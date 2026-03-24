import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://medicare.replit.app";
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${base}/doctors`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/departments`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/appointments`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/consultation`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];

  return staticRoutes;
}
