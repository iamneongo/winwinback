"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { articleDrafts, articles } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/guards";
import { saveDocument } from "@/lib/articles/studio";

export async function approveContributorArticleAction(id: string) {
  await requireAdmin();
  const articleId = z.string().uuid().parse(id);
  const [article] = await db.select().from(articles).where(eq(articles.id, articleId));
  if (!article || article.editorialStatus !== "submitted" || !article.productId.startsWith("manual:") || article.status !== "hidden") return { ok: false as const, error: "Bài này không đang chờ duyệt." };
  const [draft] = await db.select().from(articleDrafts).where(eq(articleDrafts.articleId, articleId));
  if (!draft) return { ok: false as const, error: "Bản nháp không còn tồn tại." };
  try {
    await saveDocument({ id: articleId, revision: article.revision, document: draft.document, publish: true, label: "Admin duyệt xuất bản" });
    revalidatePath("/admin/bai-viet");
    revalidatePath("/contributor/bai-viet");
    revalidatePath("/bai-viet", "layout");
    revalidatePath("/sitemap.xml");
    return { ok: true as const };
  } catch (error) {
    return { ok: false as const, error: error instanceof Error ? error.message : "Không xuất bản được bài." };
  }
}
