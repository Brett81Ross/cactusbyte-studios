import type { Metadata, Viewport } from "next";
import AccountDock from "./account-dock";
import SecureCheckoutBridge from "./secure-checkout-bridge";
import "./globals.css";
import "./mobile.css";

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
    icon: "/logo2.png",
    apple: "/logo2.png",
  },
  openGraph: {
    title: "Cactus🌵Byte Studios™",
    description: "One command center for the Cactus🌵Byte Studios™ app ecosystem.",
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
      <body><SecureCheckoutBridge/><AccountDock/>{children}</body>
    </html>
  );
}
