import type { Metadata } from "next";
import { Geist_Mono, Noto_Serif_SC } from "next/font/google";
import "katex/dist/katex.min.css";
import "./globals.css";
import { getSiteConfig } from "@/lib/site";
import { SearchProvider } from "@/components/search-context";

const notoSerifSC = Noto_Serif_SC({
  variable: "--font-noto-serif-sc",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export function generateMetadata(): Metadata {
  const site = getSiteConfig();
  let metadataBase: URL | undefined;
  try {
    metadataBase = new URL(site.url);
  } catch {
    metadataBase = undefined;
  }

  return {
    metadataBase,
    title: {
      default: site.title,
      template: `%s · ${site.title}`,
    },
    description: site.description || site.subtitle,
    authors: site.author ? [{ name: site.author }] : undefined,
    alternates: {
      types: {
        "application/rss+xml": "/rss.xml",
      },
    },
    openGraph: {
      type: "website",
      locale: site.language.replace("-", "_"),
      siteName: site.title,
      title: site.title,
      description: site.description || site.subtitle,
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const site = getSiteConfig();

  return (
    <html
      lang={site.language}
      className={`${notoSerifSC.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full bg-[#FAFAFA] text-[#171717]">
        <SearchProvider>{children}</SearchProvider>
      </body>
    </html>
  );
}
