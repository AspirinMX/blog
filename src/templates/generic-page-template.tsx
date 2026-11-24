import type { PageEntry } from "@/lib/content";
import type { GiscusConfig, TocItem } from "@/lib/schemas";
import { ProseContent } from "@/components/prose-content";
import { MobileToc } from "@/components/table-of-contents";
import { GiscusComments } from "@/components/giscus-comments";

interface GenericPageTemplateProps {
  page: PageEntry;
  bodyHtml: string;
  toc: TocItem[];
  giscus: GiscusConfig;
}

export function GenericPageTemplate({
  page,
  bodyHtml,
  toc,
  giscus,
}: GenericPageTemplateProps) {
  return (
    <div>
      <header className="mb-10 pb-8 border-b border-[#E5E5E5]">
        <h1 className="heading-4 text-[#171717]">{page.title}</h1>
        {page.description ? (
          <p className="mt-3 body-6 text-[#525252]">{page.description}</p>
        ) : null}
      </header>

      {page.toc && toc.length > 0 ? <MobileToc items={toc} /> : null}

      {bodyHtml ? <ProseContent html={bodyHtml} /> : null}

      {page.comments ? (
        <GiscusComments config={giscus} slug={page.slug} />
      ) : null}
    </div>
  );
}
