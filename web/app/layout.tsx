import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Providers } from "@/components/Providers";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "引用通 / CiteTong";
const description =
  "CSSCI 期刊引文格式自动校验 · 271 种期刊覆盖 · 1 分钟拿到改稿建议";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} — 学术论文投稿前最后一公里`,
    template: `%s · ${siteName}`,
  },
  description,
  keywords: [
    "CSSCI",
    "学术论文",
    "投稿",
    "引文格式",
    "注释体例",
    "CiteTong",
    "引用通",
    "格式校验",
  ],
  authors: [{ name: "CiteTong Team" }],
  creator: "CiteTong",
  publisher: "CiteTong",
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: siteUrl,
    siteName,
    title: `${siteName} — 学术论文投稿前最后一公里`,
    description,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: siteName,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description,
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0284c7",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen">
        <Providers>
          <Navbar />
          <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <footer className="border-t border-gray-200 mt-16 py-8 text-center text-sm text-gray-500">
            <p>© 2026 CiteTong · 引用通 · CSSCI 2025-2026 期刊覆盖</p>
            <p className="mt-1 text-xs">
              <a href="/sitemap.xml" className="hover:text-primary-600">Sitemap</a>
              {" · "}
              <a href="/robots.txt" className="hover:text-primary-600">Robots</a>
            </p>
          </footer>
        </Providers>
      </body>
    </html>
  );
}