"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createManagedCategory, deleteManagedCategory, renameManagedCategory } from "@/lib/articles/category-service";
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


const categoryNameSchema = z.string().trim().min(1, "Nhập tên danh mục.").max(80, "Tên danh mục tối đa 80 ký tự.");

export async function createCategoryAction(name: string): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const parsed = categoryNameSchema.safeParse(name);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };
  try {
    await createManagedCategory(parsed.data);
    revalidatePath("/admin/bai-viet");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Không tạo được danh mục." };
  }
}

export async function renameCategoryAction(from: string, to: string): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const parsed = categoryNameSchema.safeParse(to);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };
  try {
    await renameManagedCategory(from, parsed.data);
    revalidatePath("/admin/bai-viet");
    revalidatePath("/bai-viet");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Không đổi tên được danh mục." };
  }
}

export async function deleteCategoryAction(name: string, destination: string | null, confirmed: boolean): Promise<{ ok: boolean; moved?: number; error?: string }> {
  await requireAdmin();
  if (!confirmed) return { ok: false, error: "Bạn cần xác nhận trước khi xóa danh mục." };
  try {
    const moved = await deleteManagedCategory(name, destination);
    revalidatePath("/admin/bai-viet");
    revalidatePath("/bai-viet");
    return { ok: true, moved };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Không xóa được danh mục." };
  }
}
