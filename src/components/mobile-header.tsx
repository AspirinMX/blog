"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { List, MagnifyingGlass, X } from "@phosphor-icons/react";
import type { NavItem, SiteConfig } from "@/lib/schemas";
import { useSearch } from "./search-context";

interface MobileHeaderProps {
  site: SiteConfig;
  navItems: NavItem[];
}

export function MobileHeader({ site, navItems }: MobileHeaderProps) {
  const pathname = usePathname();
  const { openSearch } = useSearch();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  return (
    <>
      <header className="md:hidden sticky top-0 z-30 bg-[#FAFAFA]/90 backdrop-blur-md border-b border-[#E5E5E5]">
        <div className="px-5 h-14 flex items-center justify-between gap-4">
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="title-2 text-[#171717] font-semibold tracking-tight"
          >
            {site.title}
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                openSearch();
              }}
              aria-label="打开搜索"
              className="p-2 text-[#525252] hover:text-[#171717] active:scale-[0.98] transition-all duration-200"
            >
              <MagnifyingGlass size={18} />
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label={menuOpen ? "关闭导航菜单" : "打开导航菜单"}
              aria-expanded={menuOpen}
              className="p-2 text-[#525252] hover:text-[#171717] active:scale-[0.98] transition-all duration-200"
            >
              {menuOpen ? <X size={20} /> : <List size={20} />}
            </button>
          </div>
        </div>
      </header>

      <div
        aria-hidden={!menuOpen}
        className={`md:hidden fixed inset-x-0 top-14 bottom-0 z-20 bg-[#FAFAFA]/95 backdrop-blur-md px-6 py-8 flex flex-col justify-between transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          menuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <nav aria-label="移动端主导航">
          <ul className="space-y-4">
            {navItems.map((item, idx) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);
              const delayMs = Math.min(idx * 60, 360);
              return (
                <li
                  key={item.href}
                  style={{
                    transitionDelay: menuOpen ? `${delayMs}ms` : "0ms",
                  }}
                  className={`transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    menuOpen
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-6"
                  }`}
                >
                  <Link
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`inline-flex items-center gap-2.5 text-xl leading-7 ${
                      active
                        ? "text-[#171717] font-semibold"
                        : "text-[#525252]"
                    }`}
                  >
                    <span>{item.label}</span>
                    {active ? (
                      <span
                        aria-hidden="true"
                        className="w-1.5 h-1.5 rounded-full bg-[#171717]"
                      />
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="pt-6 border-t border-[#E5E5E5] space-y-4">
          {site.subtitle ? (
            <p className="body-6 text-[#737373]">{site.subtitle}</p>
          ) : null}
          {site.socials.length > 0 ? (
            <div className="flex flex-wrap items-center gap-4">
              {site.socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target={social.href.startsWith("http") ? "_blank" : undefined}
                  rel={
                    social.href.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className="caption-2 text-[#525252] hover:text-[#171717] transition-colors duration-200"
                >
                  {social.label}
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}

export function SidebarSearchTrigger() {
  const { openSearch } = useSearch();

  return (
    <button
      type="button"
      onClick={openSearch}
      className="w-full flex items-center justify-between px-3 py-2 border border-[#E5E5E5] rounded-lg bg-[#FAFAFA] hover:bg-[#F2F2F2] active:scale-[0.98] text-[#525252] hover:text-[#171717] cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
    >
      <span className="inline-flex items-center gap-2 text-sm leading-5">
        <MagnifyingGlass size={15} aria-hidden="true" />
        <span>搜索</span>
      </span>
      <kbd className="tabular-mono caption-5 px-1.5 py-0.5 rounded bg-[#F2F2F2] border border-[#E5E5E5] text-[#737373]">
        /
      </kbd>
    </button>
  );
}
