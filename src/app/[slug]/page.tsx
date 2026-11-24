import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSiteConfig } from "@/lib/site";
import {
  getAllPosts,
  getDynamicPageSlugs,
  getNavItems,
  getPageBySlug,
} from "@/lib/content";
import { BlogShell } from "@/components/blog-shell";
import { renderPageByTemplate } from "@/templates/registry";

interface DynamicPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getDynamicPageSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: DynamicPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getPageBySlug(slug);
  if (!page) {
    return { title: "页面不存在" };
  }
  return {
    title: page.title,
    description: page.description || undefined,
  };
}

export default async function ConfigurablePage({ params }: DynamicPageProps) {
  const { slug } = await params;
  const page = getPageBySlug(slug);
  if (!page || page.slug === "") {
    notFound();
  }

  const site = getSiteConfig();
  const navItems = getNavItems();
  const posts = getAllPosts();
  const rendered = await renderPageByTemplate({
    page,
    posts,
    giscus: site.giscus,
  });

  return (
    <BlogShell
      site={site}
      navItems={navItems}
      toc={rendered.toc}
      defaultSidebarTab={rendered.defaultSidebarTab}
    >
      {rendered.element}
    </BlogShell>
  );
}
