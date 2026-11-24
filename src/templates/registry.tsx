import type { ReactNode } from "react";
import type { PageEntry, PostEntry } from "@/lib/content";
import { compileMarkdown } from "@/lib/markdown";
import type { GiscusConfig, TocItem } from "@/lib/schemas";
import { HomeTemplate } from "./home-template";
import { ArchiveTemplate } from "./archive-template";
import { ProjectTemplate } from "./project-template";
import { AboutTemplate } from "./about-template";
import { GenericPageTemplate } from "./generic-page-template";

export interface RenderedTemplateResult {
  element: ReactNode;
  toc: TocItem[];
  defaultSidebarTab: "nav" | "toc";
}

export async function renderPageByTemplate(options: {
  page: PageEntry;
  posts: PostEntry[];
  giscus: GiscusConfig;
}): Promise<RenderedTemplateResult> {
  const { page, posts, giscus } = options;

  if (page.template === "home") {
    return {
      element: <HomeTemplate page={page} posts={posts} />,
      toc: [],
      defaultSidebarTab: "nav",
    };
  }

  const compiled = page.content
    ? await compileMarkdown(page.content)
    : { html: "", toc: [] };
  const activeToc = page.toc ? compiled.toc : [];
  const defaultSidebarTab: "nav" | "toc" =
    activeToc.length > 0 ? "toc" : "nav";

  switch (page.template) {
    case "archive":
      return {
        element: (
          <ArchiveTemplate
            page={page}
            posts={posts}
            bodyHtml={compiled.html}
          />
        ),
        toc: activeToc,
        defaultSidebarTab,
      };
    case "project":
      return {
        element: (
          <ProjectTemplate
            page={page}
            bodyHtml={compiled.html}
            toc={activeToc}
            giscus={giscus}
          />
        ),
        toc: activeToc,
        defaultSidebarTab,
      };
    case "about":
      return {
        element: (
          <AboutTemplate
            page={page}
            bodyHtml={compiled.html}
            toc={activeToc}
            giscus={giscus}
          />
        ),
        toc: activeToc,
        defaultSidebarTab,
      };
    case "page":
    default:
      return {
        element: (
          <GenericPageTemplate
            page={page}
            bodyHtml={compiled.html}
            toc={activeToc}
            giscus={giscus}
          />
        ),
        toc: activeToc,
        defaultSidebarTab,
      };
  }
}
