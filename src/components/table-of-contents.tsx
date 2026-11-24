"use client";

import { useEffect, useState } from "react";
import { CaretDown } from "@phosphor-icons/react";
import type { TocItem } from "@/lib/schemas";

interface TableOfContentsProps {
  items: TocItem[];
  onNavigate?: () => void;
}

export function TableOfContents({ items, onNavigate }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? "");

  useEffect(() => {
    if (items.length === 0) {
      return;
    }

    const headingElements = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);

    if (headingElements.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              a.boundingClientRect.top - b.boundingClientRect.top
          );

        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-8% 0px -74% 0px",
        threshold: [0, 1],
      }
    );

    for (const el of headingElements) {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) {
    return null;
  }

  return (
    <nav aria-label="文章目录">
      <ul className="space-y-2">
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <li
              key={item.id}
              className={item.level === 3 ? "pl-3" : ""}
            >
              <a
                href={`#${item.id}`}
                onClick={(event) => {
                  const target = document.getElementById(item.id);
                  if (target) {
                    event.preventDefault();
                    const reduced = window.matchMedia(
                      "(prefers-reduced-motion: reduce)"
                    ).matches;
                    target.scrollIntoView({
                      behavior: reduced ? "auto" : "smooth",
                      block: "start",
                    });
                    window.history.replaceState(null, "", `#${item.id}`);
                    setActiveId(item.id);
                    onNavigate?.();
                  }
                }}
                aria-current={isActive ? "location" : undefined}
                className={`group flex items-baseline gap-2 py-0.5 text-sm leading-5 transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isActive
                    ? "text-[#171717] font-medium"
                    : "text-[#737373] hover:text-[#171717]"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`tabular-mono text-xs shrink-0 transition-opacity duration-300 ${
                    isActive
                      ? "opacity-100 text-[#171717]"
                      : "opacity-0 group-hover:opacity-60"
                  }`}
                >
                  ·
                </span>
                <span className="leading-snug">{item.text}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function MobileToc({ items }: { items: TocItem[] }) {
  const [expanded, setExpanded] = useState(false);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="md:hidden mb-8 border border-[#E5E5E5] rounded-lg bg-[#F5F5F5]">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
        className="w-full px-4 py-2.5 flex items-center justify-between text-left title-4 text-[#171717]"
      >
        <span>目录</span>
        <CaretDown
          size={16}
          className={`text-[#737373] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            expanded ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>
      {expanded ? (
        <div className="px-4 pb-3 pt-1 border-t border-[#E5E5E5]">
          <TableOfContents
            items={items}
            onNavigate={() => setExpanded(false)}
          />
        </div>
      ) : null}
    </div>
  );
}
