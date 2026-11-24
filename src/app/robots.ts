import type { MetadataRoute } from "next";
import { getSiteConfig } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const site = getSiteConfig();
  const baseUrl = site.url.replace(/\/+$/, "");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
