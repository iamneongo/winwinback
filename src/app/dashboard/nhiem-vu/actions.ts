"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth/guards";
import { claimMission, submitMissionProof } from "@/lib/missions/service";

export type MissionActionState = { error?: string; success?: string };

/** Claim the reward for an auto/referral mission the user has completed. */
export async function claimMissionAction(
  missionKey: string,
): Promise<MissionActionState> {
  const user = await requireUser();
  const res = await claimMission(user, missionKey);
  if ("error" in res) return { error: res.error };
  revalidatePath("/dashboard/nhiem-vu");
  revalidatePath("/dashboard", "layout");
  return { success: "Đã cộng thưởng vào ví!" };
}

const proofSchema = z
  .string()
  .trim()
  .min(4, "Vui lòng dán link/bằng chứng hợp lệ")
  .max(500);

/** Submit proof for a manual (social) mission — goes to admin review. */
export async function submitProofAction(
  missionKey: string,
  proof: string,
): Promise<MissionActionState> {
  const user = await requireUser();
  const parsed = proofSchema.safeParse(proof);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Bằng chứng không hợp lệ" };
  }
  const res = await submitMissionProof(user, missionKey, parsed.data);
  if ("error" in res) return { error: res.error };
  revalidatePath("/dashboard/nhiem-vu");
  return { success: "Đã gửi, chờ duyệt trong thời gian sớm nhất." };
}
