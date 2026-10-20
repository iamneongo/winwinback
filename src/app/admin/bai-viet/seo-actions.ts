"use server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { articleCategories, seoTemplates } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/guards";
import { getSeoTemplate } from "@/lib/articles/seo-template";
import { renderSeoPattern } from "@/lib/articles/seo-template-pattern";
import { documentSchema, type ArticleDocument } from "@/lib/articles/document";

const pattern = z.string().trim().min(1).max(300).refine((v) => !/[{}]/.test(v.replace(/\{(?:title|category|keyword)\}/g, "")), "Chỉ dùng {title}, {category}, {keyword}.");
const template = z.object({ key: z.string().min(1).max(110), titlePattern: pattern, descriptionPattern: pattern });
export async function saveSeoTemplateAction(input: z.infer<typeof template>) {
  await requireAdmin();
  const data = template.parse(input);
  if (data.key !== "manual" && data.key !== "product") {
    if (!data.key.startsWith("category:")) throw new Error("Loại mẫu không hợp lệ.");
    const category = data.key.slice(9);
    const exists = await db.select({ name: articleCategories.name }).from(articleCategories).where(eq(articleCategories.name, category)).limit(1);
    if (!exists.length) throw new Error("Danh mục không tồn tại.");
  }
  await db.insert(seoTemplates).values(data).onConflictDoUpdate({ target: seoTemplates.key, set: { titlePattern: data.titlePattern, descriptionPattern: data.descriptionPattern, updatedAt: new Date() } });
  revalidatePath("/admin/bai-viet/seo");
  return { ok: true as const };
}
export async function deleteSeoTemplateAction(key: string) {
  await requireAdmin();
  const valid = z.string().min(1).max(110).parse(key);
  await db.delete(seoTemplates).where(eq(seoTemplates.key, valid));
  revalidatePath("/admin/bai-viet/seo");
  return { ok: true as const };
}
export async function previewSeoTemplateAction(input: { document: ArticleDocument; manual: boolean }) {
  await requireAdmin();
  const document = documentSchema.parse(input.document);
  const selected = await getSeoTemplate(document.category, input.manual);
  if (!selected) return null;
  return { key: selected.key, title: renderSeoPattern(selected.titlePattern, document).slice(0, 180), description: renderSeoPattern(selected.descriptionPattern, document).slice(0, 300) };
}
