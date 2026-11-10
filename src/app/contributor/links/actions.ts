"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { contributorShares } from "@/db/schema";
import { requireContributor } from "@/lib/auth/guards";
import { generateShortCode } from "@/lib/shortcode";

export async function createContributorShareAction() {
  const contributor = await requireContributor();
  const [existing] = await db.select({ code: contributorShares.code }).from(contributorShares)
    .where(and(eq(contributorShares.contributorId, contributor.id), isNull(contributorShares.articleId))).limit(1);
  let code = existing?.code;
  if (!code) {
    for (let attempt = 0; attempt < 5 && !code; attempt++) {
      const proposed = generateShortCode(10);
      const [created] = await db.insert(contributorShares)
        .values({ contributorId: contributor.id, code: proposed })
        .onConflictDoNothing()
        .returning({ code: contributorShares.code });
      code = created?.code;
      if (!code) {
        const [concurrent] = await db.select({ code: contributorShares.code }).from(contributorShares)
          .where(and(eq(contributorShares.contributorId, contributor.id), isNull(contributorShares.articleId))).limit(1);
        code = concurrent?.code;
      }
    }
  }
  if (!code) throw new Error("Không tạo được link theo dõi. Vui lòng thử lại.");
  revalidatePath("/contributor/links");
  redirect(`/contributor/links/${code}`);
}
