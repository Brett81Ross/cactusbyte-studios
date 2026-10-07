import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cactus🌵Byte Studios™",
    short_name: "CactusByte",
    description: "Cactus🌵Byte Studios™ app command center.",
    start_url: "/",
    display: "standalone",
    background_color: "#050807",
    theme_color: "#050807",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/pwa-icon-192",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/pwa-icon-512",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/pwa-icon-512",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
