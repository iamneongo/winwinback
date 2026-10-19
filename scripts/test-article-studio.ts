import { loadEnvConfig } from "@next/env";
import assert from "node:assert/strict";
import { unlink } from "node:fs/promises";
import sharp from "sharp";
loadEnvConfig(process.cwd());
async function main() {
  const { db } = await import("../src/db");
  const { articles, articleCategories, articleSlugs, articleMedia } = await import("../src/db/schema");
  const { saveDocument, loadStudio, listVersions } = await import("../src/lib/articles/studio");
  const { storeArticleImage, readArticleImage, mediaPath } = await import("../src/lib/articles/media");
  const { defaultSeo } = await import("../src/lib/articles/document");
  const { eq } = await import("drizzle-orm");
  const [category] = await db.select().from(articleCategories).limit(1);
  assert.ok(category, "Need an existing category");
  const slug = `kiem-thu-bien-tap-${Date.now()}`;
  let id: string | undefined;
  let mediaId: string | undefined;
  try {
    const sample = await sharp({ create: { width: 48, height: 32, channels: 4, background: "#a8df61" } }).png().toBuffer();
    const media = await storeArticleImage(sample, "kiem-thu.png");
    mediaId = media.id;
    assert.match(media.url, /^\/api\/article-media\/[a-f0-9-]+$/);
    assert.match((await sharp(await readArticleImage(media.id, false)).metadata()).format ?? "", /^webp$/);
    assert.ok((await readArticleImage(media.id, true)).length > 0);
    const doc = { title: "Kiểm thử trình biên tập", slug, html: '<h2>Kiểm thử</h2><p>Nội dung kiểm thử hệ thống.</p><table><tbody><tr><th colspan="2">Tiêu đề bảng</th></tr><tr><td>A</td><td>B</td></tr></tbody></table>', intro: "Kiểm thử nội bộ", metaDescription: "Mô tả kiểm thử", category: category.name, imageUrl: "", seo: { ...defaultSeo(), noindex: true } };
    const draft = await saveDocument({ revision: 0, document: doc }); id = draft.id;
    assert.equal((await loadStudio(id))?.article.status, "hidden");
    const published = await saveDocument({ id, revision: draft.revision, document: doc, publish: true });
    const edited = { ...doc, title: "Bản nháp chưa công khai" };
    const next = await saveDocument({ id, revision: published.revision, document: edited });
    const state = await loadStudio(id);
    assert.equal(state?.article.title, doc.title);
    assert.equal(state?.document.title, edited.title);
    await assert.rejects(() => saveDocument({ id, revision: published.revision, document: doc }), /phiên khác/);
    await saveDocument({ id, revision: next.revision, document: { ...edited, slug: `${slug}-moi` }, publish: true });
    const aliases = await db.select().from(articleSlugs).where(eq(articleSlugs.articleId, id));
    assert.ok(aliases.some((a) => a.slug === slug));
    assert.ok(aliases.some((a) => a.slug === `${slug}-moi`));
    assert.ok((await listVersions(id)).length >= 4);
    assert.match((await loadStudio(id))!.document.html, /colspan="2"/);
    console.log("PASS: media optimization, draft isolation, publication, optimistic conflict, slug history, versions, merged cells");
  } finally {
    if (id) await db.delete(articles).where(eq(articles.id, id));
    if (mediaId) {
      await db.delete(articleMedia).where(eq(articleMedia.id, mediaId));
      await Promise.allSettled([unlink(mediaPath(mediaId)), unlink(mediaPath(mediaId, true))]);
    }
  }
}
main().then(() => process.exit(0)).catch((error) => { console.error(error instanceof Error ? error.message : "Test failed"); process.exit(1); });
