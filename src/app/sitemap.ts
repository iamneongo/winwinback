import type { MetadataRoute } from "next";
import { listPublishedArticles } from "@/lib/articles/service";

export const dynamic = "force-dynamic";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://winwinback.com").replace(/\/$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/bai-viet`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${siteUrl}/dieu-khoan`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/chinh-sach-bao-mat`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  try {
    const articles = await listPublishedArticles({ limit: 50_000 });
    return [
      ...staticPages,
      ...articles.map((article) => ({
        url: `${siteUrl}/bai-viet/${article.slug}`,
        lastModified: article.createdAt,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
    ];
  } catch (error) {
    console.error("Unable to load published articles for sitemap:", error);
    return staticPages;
  }
}
