"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/guards";
import { approveClaim, rejectClaim } from "@/lib/missions/service";

export type AdminMissionState = { error?: string; success?: string };

export async function approveClaimAction(
  claimId: string,
): Promise<AdminMissionState> {
  await requireAdmin();
  const res = await approveClaim(claimId);
  if ("error" in res) return { error: res.error };
  revalidatePath("/admin/nhiem-vu");
  revalidatePath("/admin");
  return { success: "Đã duyệt & cộng thưởng vào ví người dùng" };
}

export async function rejectClaimAction(
  claimId: string,
  note: string,
): Promise<AdminMissionState> {
  await requireAdmin();
  const res = await rejectClaim(claimId, note);
  if ("error" in res) return { error: res.error };
  revalidatePath("/admin/nhiem-vu");
  return { success: "Đã từ chối" };
}
