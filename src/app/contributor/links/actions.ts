"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { articles, contributorShares } from "@/db/schema";
import { requireContributor } from "@/lib/auth/guards";
import { generateShortCode } from "@/lib/shortcode";

export async function createContributorShareAction(formData: FormData) {
  const contributor = await requireContributor();
  const articleId = z.string().uuid().parse(formData.get("articleId"));
  const [article] = await db.select({ id: articles.id }).from(articles)
    .where(and(eq(articles.id, articleId), eq(articles.status, "published"))).limit(1);
  if (!article) throw new Error("Bài viết chưa được công khai.");

  const [existing] = await db.select({ code: contributorShares.code }).from(contributorShares)
    .where(and(eq(contributorShares.contributorId, contributor.id), eq(contributorShares.articleId, articleId))).limit(1);
  let code = existing?.code;
  if (!code) {
    for (let attempt = 0; attempt < 5 && !code; attempt++) {
      const proposed = generateShortCode(10);
      const [created] = await db.insert(contributorShares)
        .values({ contributorId: contributor.id, articleId, code: proposed })
        .onConflictDoNothing()
        .returning({ code: contributorShares.code });
      code = created?.code;
      if (!code) {
        const [concurrent] = await db.select({ code: contributorShares.code }).from(contributorShares)
          .where(and(eq(contributorShares.contributorId, contributor.id), eq(contributorShares.articleId, articleId))).limit(1);
        code = concurrent?.code;
      }
    }
  }
  if (!code) throw new Error("Không tạo được link theo dõi. Vui lòng thử lại.");
  revalidatePath("/contributor/links");
  redirect(`/contributor/links/${code}`);
}
