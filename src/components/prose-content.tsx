"use client";

import { useEffect, useRef } from "react";

interface ProseContentProps {
  html: string;
  className?: string;
}

export function ProseContent({ html, className = "" }: ProseContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) {
      return;
    }

    // Wrap bare tables so mobile viewports scroll horizontally inside the table container
    const tables = root.querySelectorAll("table");
    tables.forEach((table) => {
      if (table.parentElement?.classList.contains("ink-table-wrap")) {
        return;
      }
      const wrapper = document.createElement("div");
      wrapper.className = "ink-table-wrap";
      table.parentNode?.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    });

    // Attach crisp copy buttons to every code block
    const codeTargets = root.querySelectorAll(
      "figure[data-rehype-pretty-code-figure], :scope > pre"
    );
    const cleanups: Array<() => void> = [];

    codeTargets.forEach((container) => {
      if (container.querySelector(".code-copy-btn")) {
        return;
      }
      const codeEl = container.querySelector("pre code");
      if (!codeEl) {
        return;
      }

      const button = document.createElement("button");
      button.type = "button";
      button.className = "code-copy-btn";
      button.textContent = "复制";
      button.setAttribute("aria-label", "复制代码");

      let timer: number | undefined;
      const onClick = async () => {
        const text = codeEl.textContent ?? "";
        try {
          await navigator.clipboard.writeText(text);
          button.textContent = "已复制";
          window.clearTimeout(timer);
          timer = window.setTimeout(() => {
            button.textContent = "复制";
          }, 1800);
        } catch {
          button.textContent = "失败";
          window.clearTimeout(timer);
          timer = window.setTimeout(() => {
            button.textContent = "复制";
          }, 1800);
        }
      };

      button.addEventListener("click", onClick);
      container.appendChild(button);

      cleanups.push(() => {
        window.clearTimeout(timer);
        button.removeEventListener("click", onClick);
        button.remove();
      });
    });

    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, [html]);

  return (
    <div
      ref={containerRef}
      className={`ink-prose ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
