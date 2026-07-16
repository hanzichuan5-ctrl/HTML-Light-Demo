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
    default: "HZC Game Engine",
    template: "%s — HZC",
  },
  description:
    "HZC is a small, elegant, high-performance Rust game engine architecture.",
  icons: {
    icon: publicAsset("/mors-logo.svg"),
    shortcut: publicAsset("/mors-logo.svg"),
  },
  openGraph: {
    title: "HZC Game Engine",
    description: "我是鼠鼠大王",
    type: "website",
    url: siteUrl,
    images: [{ url: publicAsset("/og.jpg"), width: 1200, height: 630, alt: "A hanging light reveals the HZC engine architecture." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "HZC Game Engine",
    description: "我是鼠鼠大王",
    images: [publicAsset("/og.jpg")],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={notoSansJP.variable}>{children}</body>
    </html>
  );
}
