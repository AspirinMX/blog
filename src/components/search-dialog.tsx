"use client";

import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlass, ArrowElbowDownLeft, X } from "@phosphor-icons/react";
import type { SearchDocument } from "@/lib/schemas";

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchMatch {
  doc: SearchDocument;
  score: number;
  snippet: string;
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildSnippet(doc: SearchDocument, terms: string[]): string {
  const source = doc.content || doc.excerpt;
  if (!source) {
    return "";
  }
  const lower = source.toLowerCase();
  let matchIndex = -1;
  for (const term of terms) {
    const idx = lower.indexOf(term);
    if (idx !== -1 && (matchIndex === -1 || idx < matchIndex)) {
      matchIndex = idx;
    }
  }
  if (matchIndex === -1) {
    return doc.excerpt.slice(0, 120);
  }
  const start = Math.max(0, matchIndex - 28);
  const end = Math.min(source.length, matchIndex + 92);
  const prefix = start > 0 ? "…" : "";
  const suffix = end < source.length ? "…" : "";
  return `${prefix}${source.slice(start, end).trim()}${suffix}`;
}

function HighlightText({ text, terms }: { text: string; terms: string[] }) {
  if (!terms.length || !text) {
    return <>{text}</>;
  }
  const pattern = new RegExp(`(${terms.map(escapeRegExp).join("|")})`, "gi");
  const parts = text.split(pattern);
  const lowerSet = new Set(terms.map((t) => t.toLowerCase()));

  return (
    <>
      {parts.map((part, idx) =>
        lowerSet.has(part.toLowerCase()) ? (
          <mark
            key={idx}
            className="bg-[#E5E5E5] text-[#171717] font-medium px-0.5 rounded-[2px]"
          >
            {part}
          </mark>
        ) : (
          <Fragment key={idx}>{part}</Fragment>
        )
      )}
    </>
  );
}

export function SearchDialog({ isOpen, onClose }: SearchDialogProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [docs, setDocs] = useState<SearchDocument[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const raf = requestAnimationFrame(() => {
      inputRef.current?.focus();
    });

    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || docs !== null) {
      return;
    }
    let cancelled = false;
    fetch("/search-index.json")
      .then((res) => {
        if (!res.ok) {
          throw new Error("无法加载搜索索引");
        }
        return res.json() as Promise<SearchDocument[]>;
      })
      .then((data) => {
        if (!cancelled) {
          setDocs(data);
          setLoadError(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError("搜索索引加载失败，请稍后重试。");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, docs]);

  const terms = useMemo(
    () =>
      query
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean),
    [query]
  );

  const results = useMemo<SearchMatch[]>(() => {
    if (!docs) {
      return [];
    }
    if (terms.length === 0) {
      return docs.slice(0, 8).map((doc) => ({
        doc,
        score: 0,
        snippet: doc.excerpt,
      }));
    }

    const matches: SearchMatch[] = [];
    for (const doc of docs) {
      const titleLower = doc.title.toLowerCase();
      const tagsLower = doc.tags.join(" ").toLowerCase();
      const contentLower = `${doc.excerpt} ${doc.content}`.toLowerCase();

      let score = 0;
      let allMatched = true;

      for (const term of terms) {
        let termScore = 0;
        if (titleLower.includes(term)) termScore += 12;
        if (tagsLower.includes(term)) termScore += 6;
        if (contentLower.includes(term)) termScore += 2;
        if (termScore === 0) {
          allMatched = false;
          break;
        }
        score += termScore;
      }

      if (allMatched) {
        matches.push({
          doc,
          score,
          snippet: buildSnippet(doc, terms),
        });
      }
    }

    return matches
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);
  }, [docs, terms]);

  const safeActiveIndex =
    results.length > 0 ? Math.min(activeIndex, results.length - 1) : 0;

  const navigateTo = (href: string) => {
    onClose();
    setQuery("");
    setActiveIndex(0);
    router.push(href);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (results.length > 0) {
        setActiveIndex((prev) => (prev + 1) % results.length);
      }
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (results.length > 0) {
        setActiveIndex((prev) => (prev - 1 + results.length) % results.length);
      }
      return;
    }
    if (event.key === "Enter" && results[safeActiveIndex]) {
      event.preventDefault();
      navigateTo(results[safeActiveIndex].doc.href);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="站内搜索"
      onKeyDown={handleKeyDown}
      className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-16 sm:pt-24 bg-[#171717]/25 backdrop-blur-[2px] transition-opacity duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-xl bg-[#FAFAFA] border border-[#D4D4D4] rounded-xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E5E5E5]">
          <MagnifyingGlass
            size={18}
            weight="regular"
            className="text-[#737373] shrink-0"
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            placeholder="搜索文章标题、标签、项目或正文…"
            aria-label="搜索关键词"
            className="w-full bg-transparent text-[#171717] placeholder:text-[#737373] text-base leading-6 focus:outline-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setActiveIndex(0);
                inputRef.current?.focus();
              }}
              aria-label="清空搜索"
              className="p-1 text-[#737373] hover:text-[#171717] transition-colors duration-200"
            >
              <X size={16} />
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="tabular-mono text-xs text-[#737373] border border-[#E5E5E5] rounded px-1.5 py-0.5 hover:text-[#171717] hover:border-[#D4D4D4] transition-colors duration-200"
          >
            ESC
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto py-2">
          {loadError ? (
            <p className="px-4 py-8 text-center body-6 text-[#525252]">
              {loadError}
            </p>
          ) : docs === null ? (
            <div className="px-4 py-4 space-y-3" aria-busy="true">
              <div className="h-4 w-2/3 bg-[#F2F2F2] rounded" />
              <div className="h-3 w-full bg-[#F2F2F2] rounded" />
              <div className="h-4 w-1/2 bg-[#F2F2F2] rounded" />
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-10 text-center space-y-1">
              <p className="title-4 text-[#171717]">未找到与「{query}」相关的内容</p>
              <p className="caption-5 text-[#737373]">
                可以尝试更简短的关键词，或搜索标签与项目名称。
              </p>
            </div>
          ) : (
            <ul role="listbox" aria-label="搜索结果">
              {results.map((item, idx) => {
                const isSelected = idx === safeActiveIndex;
                return (
                  <li key={item.doc.id} role="option" aria-selected={isSelected}>
                    <button
                      type="button"
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={() => navigateTo(item.doc.href)}
                      className={`w-full text-left px-4 py-3 flex flex-col gap-1 transition-colors duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                        isSelected ? "bg-[#F2F2F2]" : "bg-transparent"
                      }`}
                    >
                      <div className="flex items-baseline justify-between gap-4">
                        <span className="title-3 text-[#171717]">
                          <HighlightText text={item.doc.title} terms={terms} />
                        </span>
                        <span className="tabular-mono caption-5 text-[#737373] shrink-0">
                          {item.doc.date ?? (item.doc.type === "page" ? "页面" : "")}
                        </span>
                      </div>
                      {item.snippet ? (
                        <p className="body-6 text-[#525252] line-clamp-2">
                          <HighlightText text={item.snippet} terms={terms} />
                        </p>
                      ) : null}
                      {item.doc.tags.length > 0 ? (
                        <div className="flex items-center gap-2 pt-0.5">
                          {item.doc.tags.map((tag) => (
                            <span
                              key={tag}
                              className="caption-5 text-[#737373]"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="px-4 py-2 border-t border-[#E5E5E5] bg-[#F5F5F5] flex items-center justify-between caption-5 text-[#737373]">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <kbd className="tabular-mono px-1 py-0.5 bg-[#FAFAFA] border border-[#E5E5E5] rounded">
                ↑↓
              </kbd>
              选择
            </span>
            <span className="inline-flex items-center gap-1">
              <ArrowElbowDownLeft size={12} aria-hidden="true" />
              跳转
            </span>
          </div>
          <span className="tabular-mono">
            {terms.length > 0 ? `${results.length} 条结果` : "按 / 随时唤起"}
          </span>
        </div>
      </div>
    </div>
  );
}
