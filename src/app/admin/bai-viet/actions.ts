"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ARTICLE_CATEGORIES } from "@/lib/articles/categories";
import { requireAdmin } from "@/lib/auth/guards";
import {
  setArticleStatus,
  deleteArticle,
  regenerateArticle,
  updateArticleContent,
} from "@/lib/articles/service";

const idSchema = z.string().uuid();

export async function regenerateArticleAction(
  formData: FormData,
): Promise<void> {
  await requireAdmin();
  const id = idSchema.safeParse(String(formData.get("id") ?? ""));
  if (!id.success) return;
  await regenerateArticle(id.data);
  revalidatePath("/admin/bai-viet");
}

export async function toggleArticleAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = idSchema.safeParse(String(formData.get("id") ?? ""));
  if (!id.success) return;
  const status = formData.get("status") === "hidden" ? "hidden" : "published";
  await setArticleStatus(id.data, status);
  revalidatePath("/admin/bai-viet");
}

export async function deleteArticleAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = idSchema.safeParse(String(formData.get("id") ?? ""));
  if (!id.success) return;
  await deleteArticle(id.data);
  revalidatePath("/admin/bai-viet");
}

const articleEditSchema = z.object({
  html: z.string().max(600_000),
  title: z.string().trim().min(1, "Vui lòng nhập tiêu đề.").max(180),
  metaDescription: z.string().trim().max(300),
  category: z.enum(ARTICLE_CATEGORIES),
  imageUrl: z.union([
    z.literal(""),
    z.url().refine((value) => value.startsWith("https://"), "Ảnh phải dùng HTTPS."),
    z.string().regex(/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/).max(450_000),
  ]),
});

/** Save body and search/share fields together. */
export async function saveArticleContentAction(
  id: string,
  input: z.input<typeof articleEditSchema>,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return { ok: false, error: "Bài viết không hợp lệ." };
  const data = articleEditSchema.safeParse(input);
  if (!data.success) return { ok: false, error: data.error.issues[0]?.message ?? "Dữ liệu không hợp lệ." };
  await updateArticleContent(parsed.data, data.data);
  revalidatePath("/admin/bai-viet");
  revalidatePath("/bai-viet");
  return { ok: true };
}
