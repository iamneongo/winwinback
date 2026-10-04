"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/guards";
import {
  setArticleStatus,
  deleteArticle,
  regenerateArticle,
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
