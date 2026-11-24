import type { PageEntry } from "@/lib/content";
import type { GiscusConfig, TocItem } from "@/lib/schemas";
import { ProseContent } from "@/components/prose-content";
import { MobileToc } from "@/components/table-of-contents";
import { GiscusComments } from "@/components/giscus-comments";

interface AboutTemplateProps {
  page: PageEntry;
  bodyHtml: string;
  toc: TocItem[];
  giscus: GiscusConfig;
}

export function AboutTemplate({
  page,
  bodyHtml,
  toc,
  giscus,
}: AboutTemplateProps) {
  const profileEntries = [
    page.profile?.location
      ? { label: "坐标", value: page.profile.location }
      : null,
    page.profile?.focus ? { label: "方向", value: page.profile.focus } : null,
    page.profile?.email
      ? {
          label: "邮件",
          value: page.profile.email,
          href: `mailto:${page.profile.email}`,
        }
      : null,
  ].filter(Boolean) as Array<{ label: string; value: string; href?: string }>;

  return (
    <div>
      <header className="mb-10 pb-8 border-b border-[#E5E5E5]">
        <h1 className="heading-4 text-[#171717]">{page.title}</h1>
        {page.description ? (
          <p className="mt-3 body-6 text-[#525252]">{page.description}</p>
        ) : null}

        {profileEntries.length > 0 ? (
          <dl className="mt-6 pt-5 border-t border-[#E5E5E5] grid grid-cols-1 sm:grid-cols-3 gap-4">
            {profileEntries.map((entry) => (
              <div key={entry.label} className="space-y-1">
                <dt className="caption-5 text-[#737373]">{entry.label}</dt>
                <dd className="caption-2 text-[#171717]">
                  {entry.href ? (
                    <a
                      href={entry.href}
                      className="tabular-mono underline decoration-[#A3A3A3] hover:decoration-[#171717] underline-offset-4"
                    >
                      {entry.value}
                    </a>
                  ) : (
                    entry.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
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
