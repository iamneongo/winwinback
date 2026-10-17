"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createManagedCategory, deleteManagedCategory, listManagedCategories, renameManagedCategory } from "@/lib/articles/category-service";
import { requireAdmin } from "@/lib/auth/guards";
import {
  setArticleStatus,
  deleteArticle,
  regenerateArticle,
  updateArticleContent,
  createManualArticle,
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
  category: z.string().trim().min(1).max(80),
  imageUrl: z.union([
    z.literal(""),
    z.url().refine((value) => value.startsWith("https://"), "Ảnh phải dùng HTTPS."),
    z.string().regex(/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/).max(450_000),
  ]),
  status: z.enum(["published", "hidden"]).optional(),
});

async function validateCategory(name: string): Promise<boolean> {
  return (await listManagedCategories()).some((category) => category.name === name);
}

export async function createArticleAction(input: z.input<typeof articleEditSchema>): Promise<{ ok: boolean; id?: string; error?: string }> {
  await requireAdmin();
  const parsed = articleEditSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ." };
  if (!await validateCategory(parsed.data.category)) return { ok: false, error: "Danh mục không còn tồn tại." };
  if (!parsed.data.html.replace(/<[^>]*>/g, "").trim()) return { ok: false, error: "Vui lòng viết nội dung bài viết." };
  const article = await createManualArticle({ ...parsed.data, status: parsed.data.status ?? "hidden" });
  revalidatePath("/admin/bai-viet");
  revalidatePath("/bai-viet");
  return { ok: true, id: article.id };
}

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
  if (!await validateCategory(data.data.category)) return { ok: false, error: "Danh mục không còn tồn tại." };
  await updateArticleContent(parsed.data, data.data);
  revalidatePath("/admin/bai-viet");
  revalidatePath("/bai-viet");
  return { ok: true };
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
