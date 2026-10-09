import type { Metadata, Viewport } from "next";
import GlobalChrome from "./global-chrome";
import "./globals.css";
import "./mobile.css";
import "./personalization.css";
import "./button-polish.css";
import "./responsive-v2.css";

const configuredHost = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
const metadataBase = new URL(
  configuredHost
    ? configuredHost.startsWith("http://") || configuredHost.startsWith("https://")
      ? configuredHost
      : `https://${configuredHost}`
    : "http://localhost:3000",
);

export const metadata: Metadata = {
  metadataBase,
  title: "Cactus🌵Byte Studios™",
  description: "The official Cactus🌵Byte Studios™ launchpad for discovering, opening, and managing the CactusByte app ecosystem.",
  applicationName: "Cactus🌵Byte Studios™",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/pwa-icon-192", type: "image/png", sizes: "192x192" },
      { url: "/pwa-icon-512", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/pwa-icon-192", type: "image/png", sizes: "192x192" }],
  },
  openGraph: {
    title: "Cactus🌵Byte Studios™",
    description: "Your apps. One launchpad. The Cactus🌵Byte Studios™ app ecosystem.",
    images: ["/logo2.png"],
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#050807",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><GlobalChrome/>{children}</body>
    </html>
  );
}
