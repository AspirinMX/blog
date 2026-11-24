import {
  getAllTags,
  type PageEntry,
  type PostEntry,
} from "@/lib/content";
import { ProseContent } from "@/components/prose-content";
import { ArchiveList } from "./archive-list";

interface ArchiveTemplateProps {
  page: PageEntry;
  posts: PostEntry[];
  bodyHtml: string;
}

export function ArchiveTemplate({
  page,
  posts,
  bodyHtml,
}: ArchiveTemplateProps) {
  const tags = getAllTags(posts);
  const compactPosts = posts.map((post) => ({
    slug: post.slug,
    title: post.title,
    year: post.year,
    monthDay: post.monthDay,
    date: post.date,
    tags: post.tags,
  }));

  return (
    <div>
      <header className="mb-10">
        <div className="flex items-baseline justify-between gap-4">
          <h1 className="heading-4 text-[#171717]">{page.title}</h1>
          <span className="tabular-mono caption-5 text-[#737373]">
            共 {posts.length} 篇
          </span>
        </div>
        {page.description ? (
          <p className="mt-3 body-6 text-[#525252]">{page.description}</p>
        ) : null}
      </header>

      {bodyHtml ? (
        <div className="mb-10">
          <ProseContent html={bodyHtml} />
        </div>
      ) : null}

      <ArchiveList
        posts={compactPosts}
        tags={tags}
        showTagFilter={page.showTagFilter}
      />
    </div>
  );
}
