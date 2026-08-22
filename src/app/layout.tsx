import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
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
      <body>{children}</body>
    </html>
  );
}
