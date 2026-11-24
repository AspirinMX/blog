import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import {
  formatDotDate,
  type PageEntry,
  type PostEntry,
} from "@/lib/content";
import { compileMarkdown } from "@/lib/markdown";
import { ProseContent } from "@/components/prose-content";

interface HomeTemplateProps {
  page: PageEntry;
  posts: PostEntry[];
}

export async function HomeTemplate({ page, posts }: HomeTemplateProps) {
  const visiblePosts = page.pageSize ? posts.slice(0, page.pageSize) : posts;

  const [introCompiled, compiledPosts] = await Promise.all([
    page.showIntro && page.content
      ? compileMarkdown(page.content)
      : Promise.resolve({ html: "", toc: [] }),
    Promise.all(
      visiblePosts.map(async (post) => ({
        post,
        excerptHtml: (await compileMarkdown(post.excerptMarkdown)).html,
      }))
    ),
  ]);

  return (
    <div>
      {introCompiled.html ? (
        <section
          aria-label="站点简介"
          className="pb-10 mb-10 border-b border-[#E5E5E5]"
        >
          <ProseContent
            html={introCompiled.html}
            className="text-[#525252]"
          />
        </section>
      ) : null}

      {compiledPosts.length === 0 ? (
        <div className="py-12 border border-[#E5E5E5] rounded-lg px-6 bg-[#F5F5F5]">
          <p className="title-3 text-[#171717]">还没有已发布的文章</p>
          <p className="mt-1 body-6 text-[#525252]">
            在 <code className="tabular-mono text-xs">content/posts/</code>{" "}
            目录新增 Markdown 文件即可开始写作。
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[#E5E5E5]">
          {compiledPosts.map(({ post, excerptHtml }, index) => (
            <article
              key={post.slug}
              className={index === 0 ? "pb-12" : "py-12"}
            >
              <header className="mb-4">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h2 className="heading-6 text-[#171717]">
                    <Link
                      href={`/posts/${post.slug}`}
                      className="hover:opacity-70 transition-opacity duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    >
                      {post.title}
                    </Link>
                  </h2>
                  <time
                    dateTime={post.date}
                    className="tabular-mono caption-5 text-[#737373] shrink-0"
                  >
                    {formatDotDate(post.date)}
                  </time>
                </div>

                {post.tags.length > 0 ? (
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="caption-5 text-[#737373]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </header>

              {excerptHtml ? (
                <ProseContent
                  html={excerptHtml}
                  className="text-[#262626]"
                />
              ) : null}

              <div className="mt-5">
                <Link
                  href={`/posts/${post.slug}`}
                  className="group inline-flex items-center gap-1.5 title-4 text-[#171717] hover:text-[#525252] transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
                >
                  <span>{page.readMoreLabel}</span>
                  <ArrowRight
                    size={14}
                    aria-hidden="true"
                    className="transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1"
                  />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
