import { cacheLife } from "next/cache";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeKatex from "rehype-katex";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";
import type { TocItem } from "./schemas";

interface HastText {
  type: "text";
  value: string;
}

interface HastElement {
  type: "element";
  tagName: string;
  properties?: Record<string, unknown>;
  children: HastNode[];
}

interface HastOtherNode {
  type: string;
  children?: HastNode[];
}

type HastNode = HastText | HastElement | HastOtherNode;

interface HastRoot {
  type: "root";
  children: HastNode[];
}

export interface CompiledMarkdown {
  html: string;
  toc: TocItem[];
}

function isHastText(node: HastNode): node is HastText {
  return node.type === "text" && "value" in node;
}

function isHastElement(node: HastNode): node is HastElement {
  return node.type === "element" && "tagName" in node;
}

function extractNodeText(node: HastNode): string {
  if (isHastText(node)) {
    return node.value;
  }
  if (isHastElement(node)) {
    const classList = Array.isArray(node.properties?.className)
      ? node.properties.className.map(String)
      : [];
    if (classList.includes("math-inline") || classList.includes("math-display")) {
      const rawTex = node.children.map(extractNodeText).join("");
      return rawTex
        .replace(/\\sqrt\{([^}]+)\}/g, "√$1")
        .replace(/\\([a-zA-Z]+)/g, "$1")
        .replace(/[{}]/g, "")
        .trim();
    }
    return node.children.map(extractNodeText).join("");
  }
  return "";
}

function createRehypeCollectToc(toc: TocItem[]) {
  return () => (tree: HastRoot) => {
    visit(tree, "element", (node: HastElement) => {
      if (node.tagName !== "h2" && node.tagName !== "h3") {
        return;
      }
      const id =
        typeof node.properties?.id === "string" ? node.properties.id : "";
      const text = extractNodeText(node).trim();
      if (!id || !text) {
        return;
      }
      toc.push({
        id,
        text,
        level: node.tagName === "h2" ? 2 : 3,
      });
    });
  };
}

export async function compileMarkdown(source: string): Promise<CompiledMarkdown> {
  "use cache";
  cacheLife("max");

  if (!source.trim()) {
    return { html: "", toc: [] };
  }

  const toc: TocItem[] = [];

  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype, {
      allowDangerousHtml: true,
      footnoteLabel: "脚注",
      footnoteBackLabel: "返回正文",
    })
    .use(rehypeSlug)
    .use(createRehypeCollectToc(toc))
    .use(rehypeKatex, {
      strict: false,
      trust: false,
    })
    .use(rehypePrettyCode, {
      theme: "github-light",
      keepBackground: false,
      defaultLang: "plaintext",
    })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(source);

  return {
    html: String(file),
    toc,
  };
}

export function stripMarkdownToPlainText(markdown: string): string {
  return markdown
    .replace(/<!--\s*more\s*-->/gi, " ")
    .replace(/```[\s\S]*?```/g, (block) =>
      block.replace(/```[^\n]*\n?/, "").replace(/```$/, "")
    )
    .replace(/\$\$[\s\S]*?\$\$/g, " ")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[`*_>#~|]/g, " ")
    .replace(/\[\^[^\]]+\]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
