import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kroni",
    short_name: "Kroni",
    description: "Ukepenger og oppgaver for familier — bygd i Norge.",
    start_url: "/",
    display: "standalone",
    background_color: "#FBFAF6",
    theme_color: "#F5B015",
    icons: [
      {
        src: "/brand/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/brand/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
