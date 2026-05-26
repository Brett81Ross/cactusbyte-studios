import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CactusByte Studios",
  description: "Realize your potential with CactusByte Studios.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-950 text-white min-h-screen`}>
        <nav className="p-6 border-b border-gray-800 flex items-center gap-4">
          <img 
            src="/logo2.png" 
            alt="CactusByte Logo" 
            className="w-10 h-10 object-contain" 
          />
          <h1 className="text-2xl font-bold tracking-tighter">
            CACTUS<span className="text-blue-500">BYTE</span>
          </h1>
        </nav>
        <main className="p-6">
          {children}
        </main>
      </body>
    </html>
  );
}
