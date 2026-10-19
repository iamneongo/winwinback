import "server-only";
import { and, desc, eq, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { articles, articleDrafts, articleVersions, articleSlugs, articleCategories, articleOutros, type Article } from "@/db/schema";
import { articleSlug, defaultSeo, documentSchema, publicationErrors, type ArticleDocument } from "./document";
import { articleContentHtml, sanitizeArticleHtml } from "./service";

export function documentFromArticle(a: Article): ArticleDocument {
  return { title: a.title, slug: a.slug, html: articleContentHtml(a), intro: a.intro ?? a.metaDescription ?? "", metaDescription: a.metaDescription ?? "", category: a.category ?? "", imageUrl: a.imageUrl ?? "", seo: { ...defaultSeo(), ...a.seo } };
}
export async function loadStudio(id: string) {
  const [article] = await db.select().from(articles).where(eq(articles.id, id));
  if (!article) return null;
  const [draft] = await db.select().from(articleDrafts).where(eq(articleDrafts.articleId, id));
  return { article, document: draft?.document ?? documentFromArticle(article), revision: article.revision };
}

// The article row is the lock/version authority for drafts AND publication.
export async function saveDocument(input: { id?: string; revision: number; document: ArticleDocument; publish?: boolean; label?: string }) {
  const doc = documentSchema.parse(input.document);
  doc.html = sanitizeArticleHtml(doc.html);
  if (input.publish) {
    const errors = publicationErrors(doc);
    if (errors.length) throw new Error(errors[0]);
  }
  return db.transaction(async (tx) => {
    // Serialize slug reservations (including historical slugs) across articles.
    await tx.execute(sql`SELECT pg_advisory_xact_lock(2026101902)`);
    if (doc.category) {
      const [category] = await tx.select().from(articleCategories).where(eq(articleCategories.name, doc.category));
      if (!category) throw new Error("Danh mục không còn tồn tại. Hãy chọn lại.");
    }
    if (doc.seo.outro !== "off") {
      const [outro] = await tx.select().from(articleOutros).where(eq(articleOutros.id, doc.seo.outro));
      if (!outro) throw new Error("Mẫu cuối bài không còn tồn tại.");
    }
    let id = input.id;
    if (!id) {
      id = crypto.randomUUID();
      const initialSlug = `${articleSlug(doc.title) || "bai-viet"}-${id.slice(0, 8)}`;
      await tx.insert(articles).values({ id, slug: initialSlug, platform: "shopee", productId: `manual:${id}`, title: doc.title || "Bản nháp", status: "hidden", category: doc.category || null });
      await tx.insert(articleSlugs).values({ slug: initialSlug, articleId: id });
      if (!doc.slug) doc.slug = initialSlug;
    }
    const [old] = await tx.select().from(articles).where(eq(articles.id, id)).for("update");
    if (!old) throw new Error("Bài viết không còn tồn tại.");
    if (old.revision !== input.revision) throw new Error("Bài đã được thay đổi ở phiên khác. Sao chép nội dung đang viết rồi tải lại trang để tránh ghi đè.");
    const revision = old.revision + 1;
    if (input.publish) {
      doc.slug ||= old.slug;
      const [reserved] = await tx.select().from(articleSlugs).where(and(eq(articleSlugs.slug, doc.slug), ne(articleSlugs.articleId, id)));
      const [occupied] = await tx.select().from(articles).where(and(eq(articles.slug, doc.slug), ne(articles.id, id)));
      if (reserved || occupied) throw new Error("URL này đã được sử dụng. Hãy chọn URL khác.");
      await tx.insert(articleSlugs).values([{ slug: old.slug, articleId: id }, { slug: doc.slug, articleId: id }]).onConflictDoNothing();
      await tx.insert(articleVersions).values({ articleId: id, document: documentFromArticle(old), label: "Trước khi xuất bản/cập nhật" });
      await tx.update(articles).set({ title: doc.title, slug: doc.slug, contentHtml: doc.html, intro: doc.intro, metaDescription: doc.metaDescription, category: doc.category || null, imageUrl: doc.imageUrl, seo: doc.seo, status: "published", revision, updatedAt: new Date() }).where(eq(articles.id, id));
      await tx.delete(articleDrafts).where(eq(articleDrafts.articleId, id));
    } else {
      await tx.update(articles).set({ revision, ...(old.status === "hidden" ? { title: doc.title || "Bản nháp", category: doc.category || null } : {}) }).where(eq(articles.id, id));
      await tx.insert(articleDrafts).values({ articleId: id, document: doc, revision }).onConflictDoUpdate({ target: articleDrafts.articleId, set: { document: doc, revision, updatedAt: new Date() } });
    }
    await tx.insert(articleVersions).values({ articleId: id, document: doc, label: input.label || (input.publish ? "Đã xuất bản" : "Bản nháp tự lưu") });
    // Keep the latest 50 snapshots per article; the public version remains separate.
    await tx.execute(sql`DELETE FROM article_versions WHERE article_id = ${id} AND id NOT IN (SELECT id FROM article_versions WHERE article_id = ${id} ORDER BY created_at DESC LIMIT 50)`);
    return { id, revision, document: doc };
  });
}
export async function listVersions(id: string) {
  return db.select().from(articleVersions).where(eq(articleVersions.articleId, id)).orderBy(desc(articleVersions.createdAt)).limit(50);
}
export async function getOutro(id: string | undefined) {
  if (id === "off") return null;
  const [outro] = await db.select().from(articleOutros).where(eq(articleOutros.id, id || "default"));
  return outro ?? null;
}
