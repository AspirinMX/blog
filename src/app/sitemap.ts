import type { MetadataRoute } from "next";
import { getSiteConfig } from "@/lib/site";
import { getAllPosts, getDynamicPageSlugs } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const site = getSiteConfig();
  const baseUrl = site.url.replace(/\/+$/, "");
  const posts = getAllPosts();
  const latestDate = posts[0]?.updated ?? posts[0]?.date ?? "2026-01-01";

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: latestDate,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...getDynamicPageSlugs().map((slug) => ({
      url: `${baseUrl}/${slug}`,
      lastModified: latestDate,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];

  const postPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/posts/${post.slug}`,
    lastModified: post.updated ?? post.date,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticPages, ...postPages];
}
