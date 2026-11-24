import { buildSearchIndex } from "@/lib/content";

export function GET() {
  const docs = buildSearchIndex();
  return Response.json(docs, {
    headers: {
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
