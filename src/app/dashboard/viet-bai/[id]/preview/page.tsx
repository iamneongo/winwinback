import { redirect } from "next/navigation";

export default async function FormerContributorPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/contributor/bai-viet/${id}/preview`);
}
