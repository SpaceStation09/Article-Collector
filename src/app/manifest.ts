import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Article Collector",
    short_name: "Collector",
    description: "Private article collection with passkey login, tags, and search.",
    start_url: "/?tab=browse",
    display: "standalone",
    background_color: "#f4f1ea",
    theme_color: "#223c30",
    icons: [
      {
        src: "/icon?size=192",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon?size=512",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
