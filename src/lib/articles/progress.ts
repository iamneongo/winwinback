import "server-only";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { affiliateLinks } from "@/db/schema";
import { generateAndSaveArticle, type ArticleProgress } from "./service";

export async function runArticleGeneration(shortCode: string): Promise<void> {
  const [link] = await db
    .select()
    .from(affiliateLinks)
    .where(eq(affiliateLinks.shortCode, shortCode))
    .limit(1);
  if (!link?.productId) return;

  const update = async (values: {
    articleStatus: string;
    articlePreview?: string | null;
    articleSlug?: string | null;
  }) => {
    await db
      .update(affiliateLinks)
      .set({ ...values, articleUpdatedAt: new Date() })
      .where(eq(affiliateLinks.id, link.id));
  };

  try {
    const article = await generateAndSaveArticle(
      {
        platform: link.platform,
        productId: link.productId,
        productUrl: link.originalUrl,
        userId: link.userId,
        affiliateShortCode: link.shortCode,
      },
      async ({ stage, preview }: ArticleProgress) => {
        await update({ articleStatus: stage, ...(preview ? { articlePreview: preview } : {}) });
      },
    );
    if (article?.status === "published") {
      await update({
        articleStatus: "published",
        articlePreview: article.intro ?? article.title,
        articleSlug: article.slug,
      });
    } else {
      await update({ articleStatus: "failed" });
    }
  } catch (error) {
    console.error("Article generation failed", error);
    await update({ articleStatus: "failed" });
  }
}
