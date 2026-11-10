import { notFound, redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { contributorShares } from "@/db/schema";
import { requireContributor } from "@/lib/auth/guards";

export default async function ContributorShareDetailPage({ params }: { params: Promise<{ code: string }> }) {
  const user = await requireContributor();
  const { code } = await params;
  const [owned] = await db.select({ id: contributorShares.id }).from(contributorShares)
    .where(and(eq(contributorShares.code, code), eq(contributorShares.contributorId, user.id))).limit(1);
  if (!owned) notFound();
  redirect("/contributor/links");
}
