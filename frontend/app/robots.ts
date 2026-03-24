import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://medicare.replit.app";
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/doctors", "/departments", "/appointments", "/consultation", "/contact"],
        disallow: ["/dashboard/", "/auth/", "/api/", "/chat/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
