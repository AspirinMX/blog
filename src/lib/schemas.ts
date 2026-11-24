import { z } from "zod";

const yamlDateSchema = z
  .union([z.string(), z.date()])
  .transform((value) => {
    if (value instanceof Date) {
      return value.toISOString().slice(0, 10);
    }
    return value.trim();
  });

export const socialLinkSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
});

export const giscusConfigSchema = z
  .object({
    enabled: z.boolean().default(false),
    repo: z.string().default(""),
    repoId: z.string().default(""),
    category: z.string().default("Announcements"),
    categoryId: z.string().default(""),
    mapping: z
      .enum(["pathname", "url", "title", "og:title", "specific", "number"])
      .default("pathname"),
    strict: z.enum(["0", "1"]).default("0"),
    reactionsEnabled: z.enum(["0", "1"]).default("1"),
    emitMetadata: z.enum(["0", "1"]).default("0"),
    inputPosition: z.enum(["top", "bottom"]).default("bottom"),
    theme: z.string().default("light"),
    lang: z.string().default("zh-CN"),
  })
  .default({
    enabled: false,
    repo: "",
    repoId: "",
    category: "Announcements",
    categoryId: "",
    mapping: "pathname",
    strict: "0",
    reactionsEnabled: "1",
    emitMetadata: "0",
    inputPosition: "bottom",
    theme: "light",
    lang: "zh-CN",
  });

export const siteConfigSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().default(""),
  author: z.string().default(""),
  description: z.string().default(""),
  url: z.string().default("http://localhost:3000"),
  language: z.string().default("zh-CN"),
  footerNote: z.string().default(""),
  socials: z.array(socialLinkSchema).default([]),
  giscus: giscusConfigSchema,
});

export type SiteConfig = z.infer<typeof siteConfigSchema>;
export type GiscusConfig = z.infer<typeof giscusConfigSchema>;

export const navConfigSchema = z
  .object({
    show: z.boolean().default(false),
    label: z.string().optional(),
    order: z.number().default(99),
  })
  .default({
    show: false,
    order: 99,
  });

export const projectLinkSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
});

export const projectItemSchema = z.object({
  name: z.string().min(1),
  year: z.union([z.string(), z.number()]).transform(String).optional(),
  status: z.string().optional(),
  summary: z.string().default(""),
  stack: z.array(z.string()).default([]),
  links: z.array(projectLinkSchema).default([]),
});

export type ProjectItem = z.infer<typeof projectItemSchema>;

export const profileSchema = z
  .object({
    location: z.string().optional(),
    focus: z.string().optional(),
    email: z.string().optional(),
  })
  .optional();

export const pageTemplateSchema = z
  .enum(["home", "archive", "project", "about", "page"])
  .default("page");

export type PageTemplateName = z.infer<typeof pageTemplateSchema>;

export const pageFrontmatterSchema = z.object({
  title: z.string().min(1),
  slug: z.string().optional(),
  template: pageTemplateSchema,
  description: z.string().default(""),
  nav: navConfigSchema,
  toc: z.boolean().default(false),
  comments: z.boolean().default(false),
  // Home template options
  showIntro: z.boolean().default(true),
  readMoreLabel: z.string().default("继续阅读"),
  pageSize: z.number().int().positive().optional(),
  // Archive template options
  showTagFilter: z.boolean().default(true),
  // Project template options
  projects: z.array(projectItemSchema).default([]),
  // About template options
  profile: profileSchema,
});

export type PageFrontmatter = z.infer<typeof pageFrontmatterSchema>;

export const postFrontmatterSchema = z.object({
  title: z.string().min(1),
  date: yamlDateSchema,
  updated: yamlDateSchema.optional(),
  slug: z.string().optional(),
  summary: z.string().optional(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  toc: z.boolean().default(true),
  comments: z.boolean().default(true),
});

export type PostFrontmatter = z.infer<typeof postFrontmatterSchema>;

export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

export interface NavItem {
  label: string;
  href: string;
  order: number;
  slug: string;
}

export interface SearchDocument {
  id: string;
  type: "post" | "page";
  title: string;
  href: string;
  date?: string;
  tags: string[];
  excerpt: string;
  content: string;
}
