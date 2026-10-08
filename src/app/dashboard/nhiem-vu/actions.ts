"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth/guards";
import { claimMission, submitMissionProof } from "@/lib/missions/service";

export type MissionActionState = { error?: string; success?: string };

/** Claim the reward for a one-time automatic mission. */
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
  .max(500)
  .refine((value) => {
    try {
      return ["http:", "https:"].includes(new URL(value).protocol);
    } catch {
      return false;
    }
  }, "Vui lòng dán link bài đăng, video hoặc ảnh bằng chứng (http/https).");

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

function detectImageMime(bytes: Uint8Array): "image/png" | "image/jpeg" | "image/webp" | null {
  if (bytes.length >= 8 && [137, 80, 78, 71, 13, 10, 26, 10].every((value, index) => bytes[index] === value)) return "image/png";
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP") return "image/webp";
  return null;
}

/** Submit proof for a manual (social) mission — goes to admin review. */
export async function submitProofAction(
  missionKey: string,
  formData: FormData,
): Promise<MissionActionState> {
  const user = await requireUser();
  const rawLink = formData.get("proof");
  const link = typeof rawLink === "string" ? rawLink.trim() : "";
  if (link) {
    const parsed = proofSchema.safeParse(link);
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Link bằng chứng không hợp lệ" };
  }
  const image = formData.get("image");
  let imageData: string | null = null;
  let imageMime: string | null = null;
  if (image instanceof File && image.size > 0) {
    if (image.size > MAX_IMAGE_BYTES) return { error: "Ảnh vượt quá 2 MB. Vui lòng chọn ảnh nhỏ hơn." };
    const bytes = new Uint8Array(await image.arrayBuffer());
    imageMime = detectImageMime(bytes);
    if (!imageMime) return { error: "Chỉ nhận ảnh PNG, JPG hoặc WebP." };
    imageData = Buffer.from(bytes).toString("base64");
  }
  if (!link && !imageData) return { error: "Vui lòng dán link hoặc tải ảnh bằng chứng." };
  const res = await submitMissionProof(user, missionKey, { link: link || null, imageData, imageMime });
  if ("error" in res) return { error: res.error };
  revalidatePath("/dashboard/nhiem-vu");
  return { success: "Đã gửi, chờ duyệt trong thời gian sớm nhất." };
}
