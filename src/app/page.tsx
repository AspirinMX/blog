import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSiteConfig } from "@/lib/site";
import { getAllPosts, getHomePage, getNavItems } from "@/lib/content";
import { BlogShell } from "@/components/blog-shell";
import { renderPageByTemplate } from "@/templates/registry";

export function generateMetadata(): Metadata {
  const site = getSiteConfig();
  const home = getHomePage();
  return {
    title: {
      absolute: site.title,
    },
    description: home?.description || site.description || site.subtitle,
  };
}

export default async function HomePage() {
  const site = getSiteConfig();
  const home = getHomePage();
  if (!home) {
    notFound();
  }

  const navItems = getNavItems();
  const posts = getAllPosts();
  const rendered = await renderPageByTemplate({
    page: home,
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
