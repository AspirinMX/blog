import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { getSiteConfig } from "@/lib/site";
import {
  formatDotDate,
  getAdjacentPosts,
  getAllPosts,
  getNavItems,
  getPostBySlug,
} from "@/lib/content";
import { compileMarkdown, stripMarkdownToPlainText } from "@/lib/markdown";
import { BlogShell } from "@/components/blog-shell";
import { MobileToc } from "@/components/table-of-contents";
import { ProseContent } from "@/components/prose-content";
import { GiscusComments } from "@/components/giscus-comments";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) {
    return { title: "文章不存在" };
  }
  const description = stripMarkdownToPlainText(post.excerptMarkdown).slice(
    0,
    160
  );

  return {
    title: post.title,
    description,
    openGraph: {
      type: "article",
      title: post.title,
      description,
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      tags: post.tags,
    },
  };
}

export default async function PostDetailPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) {
    notFound();
  }

  const site = getSiteConfig();
  const navItems = getNavItems();
  const compiled = await compileMarkdown(post.content);
  const toc = post.toc ? compiled.toc : [];
  const { prev, next } = getAdjacentPosts(post.slug);

  return (
    <BlogShell
      site={site}
      navItems={navItems}
      toc={toc}
      defaultSidebarTab={toc.length > 0 ? "toc" : "nav"}
    >
      <article>
        <header className="mb-10 pb-8 border-b border-[#E5E5E5]">
          <h1 className="heading-4 text-[#171717]">{post.title}</h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 caption-5 text-[#737373]">
            <time dateTime={post.date} className="tabular-mono">
              {formatDotDate(post.date)}
            </time>
            {post.updated && post.updated !== post.date ? (
              <span className="tabular-mono">
                更新于 {formatDotDate(post.updated)}
              </span>
            ) : null}
            <span className="tabular-mono">约 {post.readingMinutes} 分钟</span>
            {post.tags.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2">
                {post.tags.map((tag) => (
                  <span key={tag}>#{tag}</span>
                ))}
              </div>
            ) : null}
          </div>
        </header>

        {toc.length > 0 ? <MobileToc items={toc} /> : null}

        <ProseContent html={compiled.html} />

        {prev || next ? (
          <nav
            aria-label="相邻文章"
            className="mt-16 pt-8 border-t border-[#E5E5E5] grid grid-cols-1 sm:grid-cols-2 gap-6"
          >
            <div>
              {prev ? (
                <Link
                  href={`/posts/${prev.slug}`}
                  className="group inline-flex flex-col gap-1 text-left"
                >
                  <span className="inline-flex items-center gap-1 caption-5 text-[#737373]">
                    <ArrowLeft
                      size={12}
                      aria-hidden="true"
                      className="transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-x-0.5"
                    />
                    <span>较早一篇</span>
                  </span>
                  <span className="title-4 text-[#171717] group-hover:text-[#525252] transition-colors duration-200">
                    {prev.title}
                  </span>
                </Link>
              ) : null}
            </div>

            <div className="sm:text-right">
              {next ? (
                <Link
                  href={`/posts/${next.slug}`}
                  className="group inline-flex flex-col sm:items-end gap-1"
                >
                  <span className="inline-flex items-center gap-1 caption-5 text-[#737373]">
                    <span>较新一篇</span>
                    <ArrowRight
                      size={12}
                      aria-hidden="true"
                      className="transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5"
                    />
                  </span>
                  <span className="title-4 text-[#171717] group-hover:text-[#525252] transition-colors duration-200">
                    {next.title}
                  </span>
                </Link>
              ) : null}
            </div>
          </nav>
        ) : null}

        {post.comments ? (
          <GiscusComments config={site.giscus} slug={post.slug} />
        ) : null}
      </article>
    </BlogShell>
  );
}
