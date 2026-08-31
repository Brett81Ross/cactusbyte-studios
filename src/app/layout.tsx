import type { Metadata, Viewport } from "next";
import AccountDock from "./account-dock";
import BrandedShare from "./branded-share";
import CactusByteAuthSurface from "./cactusbyte-auth-surface";
import DemoHelp from "./demo-help";
import LaunchBar from "./launch-bar";
import PersonalizationLayer from "./personalization-layer";
import SecureCheckoutBridge from "./secure-checkout-bridge";
import TesterAppBridge from "./tester-app-bridge";
import "./globals.css";
import "./mobile.css";
import "./personalization.css";
import "./button-polish.css";

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
  description: "The official Cactus🌵Byte Studios™ command center for apps, launches, updates, and sharing.",
  applicationName: "Cactus🌵Byte Studios™",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "Cactus🌵Byte Studios™",
    description: "One command center for the Cactus🌵Byte Studios™ app ecosystem.",
    images: ["/icon-512.png"],
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
      <body><LaunchBar/><BrandedShare/><CactusByteAuthSurface/><PersonalizationLayer/><TesterAppBridge/><SecureCheckoutBridge/><AccountDock/><DemoHelp/>{children}</body>
    </html>
  );
}
