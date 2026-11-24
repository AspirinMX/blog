"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

export interface ArchivePostItem {
  slug: string;
  title: string;
  year: string;
  monthDay: string;
  date: string;
  tags: string[];
}

interface ArchiveListProps {
  posts: ArchivePostItem[];
  tags: string[];
  showTagFilter: boolean;
}

export function ArchiveList({
  posts,
  tags,
  showTagFilter,
}: ArchiveListProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const filtered = selectedTag
      ? posts.filter((post) => post.tags.includes(selectedTag))
      : posts;

    const map = new Map<string, ArchivePostItem[]>();
    for (const post of filtered) {
      const list = map.get(post.year) ?? [];
      list.push(post);
      map.set(post.year, list);
    }

    return Array.from(map.entries()).sort(([a], [b]) => (a < b ? 1 : -1));
  }, [posts, selectedTag]);

  return (
    <div>
      {showTagFilter && tags.length > 0 ? (
        <div
          role="group"
          aria-label="按标签筛选"
          className="mb-10 pb-5 border-b border-[#E5E5E5] flex flex-wrap items-center gap-x-4 gap-y-2"
        >
          <button
            type="button"
            onClick={() => setSelectedTag(null)}
            aria-pressed={selectedTag === null}
            className={`caption-2 cursor-pointer transition-colors duration-200 ${
              selectedTag === null
                ? "text-[#171717] font-semibold underline decoration-[#171717] underline-offset-4"
                : "text-[#737373] hover:text-[#171717]"
            }`}
          >
            全部
          </button>
          {tags.map((tag) => {
            const active = selectedTag === tag;
            return (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(active ? null : tag)}
                aria-pressed={active}
                className={`caption-2 cursor-pointer transition-colors duration-200 ${
                  active
                    ? "text-[#171717] font-semibold underline decoration-[#171717] underline-offset-4"
                    : "text-[#737373] hover:text-[#171717]"
                }`}
              >
                #{tag}
              </button>
            );
          })}
        </div>
      ) : null}

      {grouped.length === 0 ? (
        <p className="body-6 text-[#737373] py-8">当前筛选条件下暂无文章。</p>
      ) : (
        <div className="space-y-12">
          {grouped.map(([year, items]) => (
            <section key={year} aria-labelledby={`year-${year}`}>
              <div className="flex items-baseline justify-between pb-2 mb-4 border-b border-[#E5E5E5]">
                <h2
                  id={`year-${year}`}
                  className="tabular-mono title-2 text-[#171717] font-semibold"
                >
                  {year}
                </h2>
                <span className="tabular-mono caption-5 text-[#737373]">
                  {items.length} 篇
                </span>
              </div>

              <ul className="space-y-3">
                {items.map((post) => (
                  <li
                    key={post.slug}
                    className="flex items-baseline justify-between gap-6 py-1"
                  >
                    <Link
                      href={`/posts/${post.slug}`}
                      className="body-3 text-[#171717] hover:text-[#525252] transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    >
                      {post.title}
                    </Link>
                    <time
                      dateTime={post.date}
                      className="tabular-mono caption-5 text-[#737373] shrink-0"
                    >
                      {post.monthDay}
                    </time>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
