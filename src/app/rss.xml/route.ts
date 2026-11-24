import { getSiteConfig } from "@/lib/site";
import { getAllPosts } from "@/lib/content";
import { stripMarkdownToPlainText } from "@/lib/markdown";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toRfc822(isoDate: string): string {
  const parsed = new Date(`${isoDate}T00:00:00Z`);
  return Number.isNaN(parsed.getTime())
    ? "Thu, 01 Jan 1970 00:00:00 GMT"
    : parsed.toUTCString();
}

export function GET() {
  const site = getSiteConfig();
  const posts = getAllPosts();
  const baseUrl = site.url.replace(/\/+$/, "");
  const lastBuildDate = posts[0]
    ? toRfc822(posts[0].updated ?? posts[0].date)
    : "Thu, 01 Jan 1970 00:00:00 GMT";

  const itemsXml = posts
    .map((post) => {
      const link = `${baseUrl}/posts/${post.slug}`;
      const description = stripMarkdownToPlainText(post.excerptMarkdown);
      const categories = post.tags
        .map((tag) => `<category>${escapeXml(tag)}</category>`)
        .join("");

      return [
        "    <item>",
        `      <title>${escapeXml(post.title)}</title>`,
        `      <link>${escapeXml(link)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(link)}</guid>`,
        `      <pubDate>${toRfc822(post.date)}</pubDate>`,
        `      <description>${escapeXml(description)}</description>`,
        categories ? `      ${categories}` : "",
        "    </item>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(site.title)}</title>
    <link>${escapeXml(baseUrl)}</link>
    <description>${escapeXml(site.description || site.subtitle)}</description>
    <language>${escapeXml(site.language)}</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${escapeXml(`${baseUrl}/rss.xml`)}" rel="self" type="application/rss+xml" />
${itemsXml}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
