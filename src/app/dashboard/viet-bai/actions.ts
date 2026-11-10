"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { articleDrafts, articles } from "@/db/schema";
import { requireContributor } from "@/lib/auth/guards";
import { publicationErrors } from "@/lib/articles/document";

export async function submitArticleForReviewAction(id: string, revision: number) {
  const contributor = await requireContributor();
  const articleId = z.string().uuid().parse(id);
  if (!Number.isSafeInteger(revision) || revision < 1) return { ok: false as const, error: "Hãy lưu bản nháp trước." };
  return db.transaction(async (tx) => {
    const [article] = await tx.select().from(articles).where(and(eq(articles.id, articleId), eq(articles.userId, contributor.id))).for("update");
    if (!article || !article.productId.startsWith("manual:") || article.status !== "hidden") return { ok: false as const, error: "Không có quyền gửi bài này." };
    if (article.revision !== revision) return { ok: false as const, error: "Bài đã thay đổi ở phiên khác. Hãy tải lại trước khi gửi." };
    const [draft] = await tx.select().from(articleDrafts).where(eq(articleDrafts.articleId, articleId));
    if (!draft) return { ok: false as const, error: "Không tìm thấy bản nháp để gửi duyệt." };
    const errors = publicationErrors(draft.document);
    if (errors.length) return { ok: false as const, error: errors[0] };
    await tx.update(articles).set({ editorialStatus: "submitted", updatedAt: new Date() }).where(eq(articles.id, articleId));
    revalidatePath("/dashboard/viet-bai");
    revalidatePath("/admin/bai-viet");
    return { ok: true as const };
  });
}
