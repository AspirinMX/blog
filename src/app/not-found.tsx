import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { getSiteConfig } from "@/lib/site";
import { getNavItems } from "@/lib/content";
import { BlogShell } from "@/components/blog-shell";

export default function NotFound() {
  const site = getSiteConfig();
  const navItems = getNavItems();

  return (
    <BlogShell site={site} navItems={navItems}>
      <section className="py-12 space-y-6">
        <p className="tabular-mono caption-4 text-[#737373]">404</p>
        <h1 className="heading-4 text-[#171717]">页面未找到</h1>
        <p className="body-6 text-[#525252]">
          你访问的链接可能已更改或不存在，可以返回首页，或按{" "}
          <kbd className="tabular-mono px-1.5 py-0.5 bg-[#F2F2F2] border border-[#E5E5E5] rounded text-xs text-[#171717]">
            /
          </kbd>{" "}
          检索站内文章。
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 title-4 text-[#171717] underline decoration-[#A3A3A3] hover:decoration-[#171717] underline-offset-4 transition-colors duration-200"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            <span>返回首页</span>
          </Link>
        </div>
      </section>
    </BlogShell>
  );
}
