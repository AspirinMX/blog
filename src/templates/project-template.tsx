import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import type { PageEntry } from "@/lib/content";
import type { GiscusConfig, TocItem } from "@/lib/schemas";
import { ProseContent } from "@/components/prose-content";
import { MobileToc } from "@/components/table-of-contents";
import { GiscusComments } from "@/components/giscus-comments";

interface ProjectTemplateProps {
  page: PageEntry;
  bodyHtml: string;
  toc: TocItem[];
  giscus: GiscusConfig;
}

export function ProjectTemplate({
  page,
  bodyHtml,
  toc,
  giscus,
}: ProjectTemplateProps) {
  return (
    <div>
      <header className="mb-10 pb-8 border-b border-[#E5E5E5]">
        <div className="flex items-baseline justify-between gap-4">
          <h1 className="heading-4 text-[#171717]">{page.title}</h1>
          <span className="tabular-mono caption-5 text-[#737373]">
            {page.projects.length} 项
          </span>
        </div>
        {page.description ? (
          <p className="mt-3 body-6 text-[#525252]">{page.description}</p>
        ) : null}
      </header>

      {page.toc && toc.length > 0 ? <MobileToc items={toc} /> : null}

      {page.projects.length === 0 ? (
        <div className="py-10 px-5 border border-[#E5E5E5] rounded-lg bg-[#F5F5F5]">
          <p className="title-4 text-[#171717]">暂无项目条目</p>
          <p className="mt-1 caption-2 text-[#525252]">
            在 <code className="tabular-mono text-xs">content/pages/projects.md</code> 的 YAML <code className="tabular-mono text-xs">projects</code> 列表中添加条目即可展示。
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-[#E5E5E5]">
          {page.projects.map((project, index) => (
            <li
              key={`${project.name}-${index}`}
              className={index === 0 ? "pb-8" : "py-8"}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div className="flex flex-wrap items-baseline gap-2.5">
                  <h2 className="title-2 text-[#171717] font-semibold">
                    {project.name}
                  </h2>
                  {project.status ? (
                    <span className="caption-5 text-[#525252] px-2 py-0.5 border border-[#E5E5E5] rounded bg-[#F2F2F2]">
                      {project.status}
                    </span>
                  ) : null}
                </div>
                {project.year ? (
                  <span className="tabular-mono caption-5 text-[#737373]">
                    {project.year}
                  </span>
                ) : null}
              </div>

              {project.summary ? (
                <p className="mt-3 body-6 text-[#525252] leading-relaxed">
                  {project.summary}
                </p>
              ) : null}

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                  {project.stack.map((tech, idx) => (
                    <span
                      key={tech}
                      className="tabular-mono caption-5 text-[#737373]"
                    >
                      {idx > 0 ? "· " : ""}
                      {tech}
                    </span>
                  ))}
                </div>

                {project.links.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-4">
                    {project.links.map((link) => {
                      const isExternal = /^https?:\/\//i.test(link.href);
                      if (isExternal) {
                        return (
                          <a
                            key={link.label}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 caption-2 text-[#171717] underline decoration-[#A3A3A3] hover:decoration-[#171717] underline-offset-4 transition-colors duration-200"
                          >
                            <span>{link.label}</span>
                            <ArrowUpRight size={13} aria-hidden="true" />
                          </a>
                        );
                      }
                      return (
                        <Link
                          key={link.label}
                          href={link.href}
                          className="inline-flex items-center gap-1 caption-2 text-[#171717] underline decoration-[#A3A3A3] hover:decoration-[#171717] underline-offset-4 transition-colors duration-200"
                        >
                          <span>{link.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      {bodyHtml ? (
        <div className="mt-10 pt-8 border-t border-[#E5E5E5]">
          <ProseContent html={bodyHtml} />
        </div>
      ) : null}

      {page.comments ? (
        <GiscusComments config={giscus} slug={page.slug} />
      ) : null}
    </div>
  );
}
