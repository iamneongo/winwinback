import { AffiliateLinkDetail } from "@/components/dashboard/AffiliateLinkDetail";

export const metadata = { title: "Chi tiết link — Win-Win Back" };
export const dynamic = "force-dynamic";

export default async function AffiliateLinkDetailPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return <AffiliateLinkDetail code={code} backHref="/dashboard#link-cua-ban" />;
}
