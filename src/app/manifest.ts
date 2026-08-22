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
        src: "/logo2.png",
        sizes: "any",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
