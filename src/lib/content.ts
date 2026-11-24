import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import {
  pageFrontmatterSchema,
  postFrontmatterSchema,
  type NavItem,
  type PageFrontmatter,
  type PostFrontmatter,
  type SearchDocument,
} from "./schemas";
import { stripMarkdownToPlainText } from "./markdown";

const CONTENT_DIR = path.join(process.cwd(), "content");
const PAGES_DIR = path.join(CONTENT_DIR, "pages");
const POSTS_DIR = path.join(CONTENT_DIR, "posts");
const MORE_TAG_REGEX = /<!--\s*more\s*-->/i;

export interface PageEntry extends PageFrontmatter {
  slug: string;
  filePath: string;
  content: string;
}

export interface PostEntry extends PostFrontmatter {
  slug: string;
  filePath: string;
  year: string;
  monthDay: string;
  readingMinutes: number;
  content: string;
  excerptMarkdown: string;
  hasMore: boolean;
}

export interface ArchiveYearGroup {
  year: string;
  posts: PostEntry[];
}

function listMarkdownFiles(directory: string): string[] {
  if (!fs.existsSync(directory)) {
    return [];
  }
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.mdx?$/i.test(entry.name))
    .map((entry) => path.join(directory, entry.name))
    .sort();
}

function normalizeSlug(rawSlug: string | undefined, filePath: string): string {
  if (rawSlug !== undefined) {
    return rawSlug.replace(/^\/+|\/+$/g, "");
  }
  return path.basename(filePath).replace(/\.mdx?$/i, "");
}

function estimateReadingMinutes(markdown: string): number {
  const plain = stripMarkdownToPlainText(markdown);
  const cjkCount = (plain.match(/[\u4e00-\u9fff]/g) ?? []).length;
  const latinWords = plain
    .replace(/[\u4e00-\u9fff]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  const minutes = Math.ceil(cjkCount / 320 + latinWords / 200);
  return Math.max(1, minutes);
}

function extractPostExcerpt(
  rawContent: string,
  summary?: string
): { excerptMarkdown: string; fullContent: string; hasMore: boolean } {
  const match = MORE_TAG_REGEX.exec(rawContent);
  if (match && match.index !== undefined) {
    const before = rawContent.slice(0, match.index).trim();
    const fullContent = rawContent.replace(MORE_TAG_REGEX, "").trim();
    return {
      excerptMarkdown: before,
      fullContent,
      hasMore: true,
    };
  }

  const trimmed = rawContent.trim();
  if (summary && summary.trim()) {
    return {
      excerptMarkdown: summary.trim(),
      fullContent: trimmed,
      hasMore: true,
    };
  }

  const paragraphs = trimmed.split(/\r?\n\s*\r?\n/).filter((p) => {
    const line = p.trim();
    return line.length > 0 && !line.startsWith("#");
  });
  const firstParagraph = paragraphs[0] ?? "";

  return {
    excerptMarkdown: firstParagraph,
    fullContent: trimmed,
    hasMore: firstParagraph.length < trimmed.length,
  };
}

function formatMonthDay(isoDate: string): string {
  const parts = isoDate.split("-");
  if (parts.length >= 3) {
    return `${parts[1]}.${parts[2]}`;
  }
  return isoDate;
}

export function formatDotDate(isoDate: string): string {
  return isoDate.replace(/-/g, ".");
}

export function getAllPages(): PageEntry[] {
  const files = listMarkdownFiles(PAGES_DIR);
  const pages = files.map((filePath) => {
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);
    const parsed = pageFrontmatterSchema.safeParse(data);

    if (!parsed.success) {
      throw new Error(
        `Invalid frontmatter in ${path.relative(process.cwd(), filePath)}: ${parsed.error.message}`
      );
    }

    const slug = normalizeSlug(parsed.data.slug, filePath);
    return {
      ...parsed.data,
      slug,
      filePath,
      content: content.trim(),
    };
  });

  return pages;
}

export function getHomePage(): PageEntry | undefined {
  const pages = getAllPages();
  return (
    pages.find((page) => page.slug === "" || page.template === "home") ??
    pages[0]
  );
}

export function getPageBySlug(slug: string): PageEntry | undefined {
  const normalized = slug.replace(/^\/+|\/+$/g, "");
  return getAllPages().find((page) => page.slug === normalized);
}

export function getDynamicPageSlugs(): string[] {
  return getAllPages()
    .map((page) => page.slug)
    .filter((slug) => slug.length > 0 && slug !== "posts");
}

export function getNavItems(): NavItem[] {
  return getAllPages()
    .filter((page) => page.nav.show)
    .map((page) => ({
      label: page.nav.label ?? page.title,
      href: page.slug ? `/${page.slug}` : "/",
      order: page.nav.order,
      slug: page.slug,
    }))
    .sort((a, b) => a.order - b.order);
}

export function getAllPosts(includeDrafts = false): PostEntry[] {
  const files = listMarkdownFiles(POSTS_DIR);
  const posts = files
    .map((filePath) => {
      const raw = fs.readFileSync(filePath, "utf-8");
      const { data, content } = matter(raw);
      const parsed = postFrontmatterSchema.safeParse(data);

      if (!parsed.success) {
        throw new Error(
          `Invalid frontmatter in ${path.relative(process.cwd(), filePath)}: ${parsed.error.message}`
        );
      }

      const slug = normalizeSlug(parsed.data.slug, filePath);
      const { excerptMarkdown, fullContent, hasMore } = extractPostExcerpt(
        content,
        parsed.data.summary
      );
      const year = parsed.data.date.slice(0, 4) || "未知";

      return {
        ...parsed.data,
        slug,
        filePath,
        year,
        monthDay: formatMonthDay(parsed.data.date),
        readingMinutes: estimateReadingMinutes(fullContent),
        content: fullContent,
        excerptMarkdown,
        hasMore,
      };
    })
    .filter((post) => includeDrafts || !post.draft)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  return posts;
}

export function getPostBySlug(slug: string): PostEntry | undefined {
  return getAllPosts().find((post) => post.slug === slug);
}

export function getAdjacentPosts(slug: string): {
  prev: PostEntry | null;
  next: PostEntry | null;
} {
  const posts = getAllPosts();
  const index = posts.findIndex((post) => post.slug === slug);
  if (index === -1) {
    return { prev: null, next: null };
  }
  // posts are sorted newest-first:
  // "prev" (older) is index + 1, "next" (newer) is index - 1
  return {
    next: index > 0 ? posts[index - 1] : null,
    prev: index < posts.length - 1 ? posts[index + 1] : null,
  };
}

export function getPostsGroupedByYear(posts: PostEntry[]): ArchiveYearGroup[] {
  const map = new Map<string, PostEntry[]>();
  for (const post of posts) {
    const list = map.get(post.year) ?? [];
    list.push(post);
    map.set(post.year, list);
  }
  return Array.from(map.entries())
    .sort(([yearA], [yearB]) => (yearA < yearB ? 1 : -1))
    .map(([year, items]) => ({ year, posts: items }));
}

export function getAllTags(posts: PostEntry[]): string[] {
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "zh-CN"))
    .map(([tag]) => tag);
}

export function buildSearchIndex(): SearchDocument[] {
  const posts = getAllPosts();
  const pages = getAllPages();

  const postDocs: SearchDocument[] = posts.map((post) => ({
    id: `post:${post.slug}`,
    type: "post",
    title: post.title,
    href: `/posts/${post.slug}`,
    date: formatDotDate(post.date),
    tags: post.tags,
    excerpt: stripMarkdownToPlainText(post.excerptMarkdown).slice(0, 180),
    content: stripMarkdownToPlainText(post.content).slice(0, 2400),
  }));

  const pageDocs: SearchDocument[] = pages
    .filter((page) => page.slug !== "")
    .map((page) => {
      const projectText = page.projects
        .map(
          (p) =>
            `${p.name} ${p.status ?? ""} ${p.summary} ${p.stack.join(" ")}`
        )
        .join(" ");
      const plainBody = stripMarkdownToPlainText(page.content);
      const combined = `${page.description} ${projectText} ${plainBody}`.trim();

      return {
        id: `page:${page.slug}`,
        type: "page",
        title: page.title,
        href: `/${page.slug}`,
        tags: page.template === "project" ? ["项目"] : ["页面"],
        excerpt: (page.description || plainBody).slice(0, 160),
        content: combined.slice(0, 2000),
      };
    });

  return [...postDocs, ...pageDocs];
}
