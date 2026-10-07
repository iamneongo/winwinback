import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Win-Win Back",
    short_name: "Win-Win Back",
    description: "Chia sẻ link Shopee, TikTok Shop để kiểm tra hoàn tiền.",
    lang: "vi",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#f4f7fb",
    theme_color: "#082b4b",
    icons: [
      { src: "/icons/pwa-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/pwa-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/pwa-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    share_target: {
      action: "/share-target",
      method: "GET",
      enctype: "application/x-www-form-urlencoded",
      params: { title: "title", text: "text", url: "url" },
    },
  };
}
