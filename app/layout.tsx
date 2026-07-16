import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  weight: "variable",
  display: "swap",
  variable: "--font-noto-sans-jp",
  preload: false,
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hanzichuan5-ctrl.github.io/HTML-Light-Demo/";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const publicAsset = (path: string) => new URL(`${basePath}${path}`, siteUrl).toString();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "HZC Detective Playroom",
    template: "%s — HZC",
  },
  description: "菠萝包和さと的侦探搭档灯光互动页面。",
  icons: {
    icon: publicAsset("/mors-logo.svg"),
    shortcut: publicAsset("/mors-logo.svg"),
  },
  openGraph: {
    title: "HZC Detective Playroom",
    description: "菠萝包和さと的侦探搭档灯光互动页面。",
    type: "website",
    url: siteUrl,
    images: [{ url: publicAsset("/20260716-231908.jpg"), width: 1230, height: 1230, alt: "菠萝包和さと的侦探搭档合照。" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "HZC Detective Playroom",
    description: "菠萝包和さと的侦探搭档灯光互动页面。",
    images: [publicAsset("/20260716-231908.jpg")],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body className={notoSansJP.variable}>{children}</body>
    </html>
  );
}
