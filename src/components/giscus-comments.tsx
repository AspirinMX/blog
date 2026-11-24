"use client";

import { useEffect, useRef, useState } from "react";
import type { GiscusConfig } from "@/lib/schemas";

interface GiscusCommentsProps {
  config: GiscusConfig;
  slug: string;
}

export function GiscusComments({ config, slug }: GiscusCommentsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  const isConfigured = Boolean(
    config.enabled &&
      config.repo.trim() &&
      config.repoId.trim() &&
      config.categoryId.trim()
  );

  useEffect(() => {
    if (!isConfigured) {
      return;
    }
    const target = containerRef.current;
    if (!target) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "240px 0px" }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [isConfigured]);

  useEffect(() => {
    if (!isConfigured || !shouldLoad) {
      return;
    }
    const container = containerRef.current;
    if (!container) {
      return;
    }

    container.innerHTML = "";
    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.setAttribute("data-repo", config.repo);
    script.setAttribute("data-repo-id", config.repoId);
    script.setAttribute("data-category", config.category);
    script.setAttribute("data-category-id", config.categoryId);
    script.setAttribute("data-mapping", config.mapping);
    script.setAttribute("data-strict", config.strict);
    script.setAttribute("data-reactions-enabled", config.reactionsEnabled);
    script.setAttribute("data-emit-metadata", config.emitMetadata);
    script.setAttribute("data-input-position", config.inputPosition);
    script.setAttribute("data-theme", config.theme);
    script.setAttribute("data-lang", config.lang);
    script.setAttribute("data-loading", "lazy");

    container.appendChild(script);

    return () => {
      container.innerHTML = "";
    };
  }, [config, isConfigured, shouldLoad, slug]);

  if (!config.enabled) {
    return null;
  }

  return (
    <section
      aria-label="评论区"
      className="mt-16 pt-10 border-t border-[#E5E5E5]"
    >
      <h2 className="title-3 text-[#171717] mb-6">评论</h2>
      {isConfigured ? (
        <div ref={containerRef} className="min-h-[120px]" />
      ) : (
        <div className="px-4 py-4 border border-[#E5E5E5] rounded-lg bg-[#F5F5F5] space-y-1.5">
          <p className="body-6 text-[#171717] font-medium">
            Giscus 评论尚未配置
          </p>
          <p className="caption-2 text-[#525252]">
            请在 <code className="tabular-mono px-1 py-0.5 bg-[#FAFAFA] border border-[#E5E5E5] rounded text-xs">content/site.yaml</code>{" "}
            中填入从{" "}
            <a
              href="https://giscus.app/zh-CN"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-[#A3A3A3] hover:decoration-[#171717] underline-offset-4"
            >
              giscus.app
            </a>{" "}
            获取的 <code className="tabular-mono text-xs">repo</code>、<code className="tabular-mono text-xs">repoId</code> 与{" "}
            <code className="tabular-mono text-xs">categoryId</code>，保存后即可自动启用。
          </p>
        </div>
      )}
    </section>
  );
}
