import type { ReactNode } from "react";
import Link from "next/link";
import type { NavItem, SiteConfig, TocItem } from "@/lib/schemas";
import { SidebarPanel } from "./sidebar-panel";
import { MobileHeader, SidebarSearchTrigger } from "./mobile-header";

interface BlogShellProps {
  site: SiteConfig;
  navItems: NavItem[];
  toc?: TocItem[];
  defaultSidebarTab?: "nav" | "toc";
  children: ReactNode;
}

export function BlogShell({
  site,
  navItems,
  toc = [],
  defaultSidebarTab = "nav",
  children,
}: BlogShellProps) {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#171717]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-3 focus:py-2 focus:bg-[#171717] focus:text-[#FAFAFA] focus:rounded"
      >
        跳至正文
      </a>

      <MobileHeader site={site} navItems={navItems} />

      <div className="max-w-5xl mx-auto px-5 md:px-10 md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-16">
        <aside
          aria-label="侧边栏"
          className="hidden md:flex md:flex-col md:justify-between sticky top-0 h-screen py-14 border-r border-[#E5E5E5] pr-8"
        >
          <div className="flex flex-col min-h-0 flex-1">
            <header className="mb-10 shrink-0">
              <Link
                href="/"
                className="inline-block heading-5 text-[#171717] hover:opacity-75 transition-opacity duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
              >
                {site.title}
              </Link>
              {site.subtitle ? (
                <p className="mt-2 caption-2 text-[#737373] leading-relaxed">
                  {site.subtitle}
                </p>
              ) : null}
            </header>

            <div className="min-h-0 flex-1 flex flex-col">
              <SidebarPanel
                navItems={navItems}
                toc={toc}
                defaultTab={defaultSidebarTab}
              />
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-[#E5E5E5] space-y-4 shrink-0">
            <SidebarSearchTrigger />
            {site.socials.length > 0 ? (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                {site.socials.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target={
                      social.href.startsWith("http") ? "_blank" : undefined
                    }
                    rel={
                      social.href.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className="caption-5 text-[#737373] hover:text-[#171717] transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  >
                    {social.label}
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </aside>

        <main
          id="main-content"
          className="min-w-0 w-full max-w-[680px] py-10 md:py-14 flex flex-col min-h-[calc(100vh-3.5rem)] md:min-h-screen"
        >
          <div className="flex-1">{children}</div>

          <footer className="mt-20 pt-6 border-t border-[#E5E5E5] flex flex-wrap items-center justify-between gap-2 caption-5 text-[#737373]">
            <span>
              {site.author && site.author !== site.title
                ? `${site.author} · ${site.title}`
                : site.title}
            </span>
            {site.footerNote ? <span>{site.footerNote}</span> : null}
          </footer>
        </main>
      </div>
    </div>
  );
}
