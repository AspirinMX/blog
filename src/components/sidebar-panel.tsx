"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem, TocItem } from "@/lib/schemas";
import { TableOfContents } from "./table-of-contents";

interface SidebarPanelProps {
  navItems: NavItem[];
  toc: TocItem[];
  defaultTab: "nav" | "toc";
}

function isNavActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SidebarPanel({
  navItems,
  toc,
  defaultTab,
}: SidebarPanelProps) {
  const pathname = usePathname();
  const hasToc = toc.length > 0;
  const [override, setOverride] = useState<{
    pathname: string;
    tab: "nav" | "toc";
  } | null>(null);

  const activeTab: "nav" | "toc" = !hasToc
    ? "nav"
    : override?.pathname === pathname
      ? override.tab
      : defaultTab;

  const setTab = (tab: "nav" | "toc") => {
    setOverride({ pathname, tab });
  };

  return (
    <div className="flex flex-col min-h-0">
      {hasToc ? (
        <div
          role="tablist"
          aria-label="左侧栏视图切换"
          className="flex items-center gap-5 border-b border-[#E5E5E5] mb-5"
        >
          <button
            type="button"
            role="tab"
            id="sidebar-tab-toc"
            aria-selected={activeTab === "toc"}
            aria-controls="sidebar-panel-content"
            onClick={() => setTab("toc")}
            className={`relative pb-2 text-sm leading-5 cursor-pointer transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              activeTab === "toc"
                ? "text-[#171717] font-semibold"
                : "text-[#737373] hover:text-[#171717]"
            }`}
          >
            目录
            <span
              aria-hidden="true"
              className={`absolute left-0 right-0 -bottom-px h-[1.5px] bg-[#171717] transition-opacity duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                activeTab === "toc" ? "opacity-100" : "opacity-0"
              }`}
            />
          </button>

          <button
            type="button"
            role="tab"
            id="sidebar-tab-nav"
            aria-selected={activeTab === "nav"}
            aria-controls="sidebar-panel-content"
            onClick={() => setTab("nav")}
            className={`relative pb-2 text-sm leading-5 cursor-pointer transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              activeTab === "nav"
                ? "text-[#171717] font-semibold"
                : "text-[#737373] hover:text-[#171717]"
            }`}
          >
            导航
            <span
              aria-hidden="true"
              className={`absolute left-0 right-0 -bottom-px h-[1.5px] bg-[#171717] transition-opacity duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                activeTab === "nav" ? "opacity-100" : "opacity-0"
              }`}
            />
          </button>
        </div>
      ) : null}

      <div
        id="sidebar-panel-content"
        role={hasToc ? "tabpanel" : undefined}
        aria-labelledby={
          hasToc
            ? activeTab === "toc"
              ? "sidebar-tab-toc"
              : "sidebar-tab-nav"
            : undefined
        }
        className="overflow-y-auto sidebar-scroll pr-1"
      >
        {activeTab === "toc" && hasToc ? (
          <TableOfContents items={toc} />
        ) : (
          <nav aria-label="主导航">
            <ul className="space-y-2.5">
              {navItems.map((item) => {
                const active = isNavActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`inline-flex items-center gap-2 py-0.5 text-base leading-6 transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                        active
                          ? "text-[#171717] font-semibold"
                          : "text-[#525252] hover:text-[#171717]"
                      }`}
                    >
                      <span>{item.label}</span>
                      {active ? (
                        <span
                          aria-hidden="true"
                          className="inline-block w-1.5 h-1.5 rounded-full bg-[#171717]"
                        />
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}
      </div>
    </div>
  );
}
