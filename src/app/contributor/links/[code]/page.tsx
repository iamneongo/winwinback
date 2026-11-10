import { requireContributor } from "@/lib/auth/guards";
import { AffiliateLinkDetail } from "@/components/dashboard/AffiliateLinkDetail";

export const metadata = { title: "Chi tiết link — Cộng tác viên" };

export default async function ContributorLinkDetailPage({ params }: { params: Promise<{ code: string }> }) {
  await requireContributor();
  const { code } = await params;
  return <AffiliateLinkDetail code={code} backHref="/contributor/links" />;
}
