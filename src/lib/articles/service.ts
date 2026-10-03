import "server-only";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { articles, type Article } from "@/db/schema";
import type { Platform } from "@/lib/affiliate/types";
import { nvidiaChat, isNvidiaConfigured } from "@/lib/ai/nvidia";
import { platformLabel } from "@/lib/labels";
import { formatVnd } from "@/lib/config";

export interface ArticleSection {
  q: string;
  a: string;
}

/** Turn a Vietnamese title into an ASCII slug. */
function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

/** Extract the first balanced JSON object from a model response. */
function parseJsonObject(text: string): Record<string, unknown> | null {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }
}

export interface GenerateArticleInput {
  platform: Platform;
  productId: string;
  productUrl: string;
  userId?: string;
  productName: string;
  price?: number;
  imageUrl?: string;
  estimatedCashback?: number;
  affiliateShortCode?: string;
}

/**
 * Generate an SEO review article for a product via NVIDIA AI and store it.
 * Idempotent per (platform, productId). Best-effort: returns null (never throws)
 * so it can be fire-and-forget from the link-creation flow.
 */
export async function generateAndSaveArticle(
  input: GenerateArticleInput,
): Promise<Article | null> {
  try {
    if (!isNvidiaConfigured() || !input.productId || !input.productName) {
      return null;
    }

    const existing = await db
      .select()
      .from(articles)
      .where(
        and(
          eq(articles.platform, input.platform),
          eq(articles.productId, input.productId),
        ),
      )
      .limit(1);
    if (existing[0]) return existing[0];

    const san = platformLabel[input.platform] ?? input.platform;
    const priceStr = input.price ? formatVnd(input.price) : "đang cập nhật";
    const cashbackStr = input.estimatedCashback
      ? formatVnd(input.estimatedCashback)
      : "hoàn tiền hấp dẫn";

    const system =
      "Bạn là cây viết SEO tiếng Việt cho Win-Win Back (website hoàn tiền khi mua trên Shopee/TikTok Shop). " +
      "CHỈ trả về JSON hợp lệ, không markdown, không giải thích.";
    const user =
      `Sản phẩm: ${input.productName}. Giá: ${priceStr}. Sàn: ${san}. Tiền hoàn dự kiến: ${cashbackStr}.\n\n` +
      'Viết bài review SEO tiếng Việt, thuyết phục, tự nhiên. Trả về JSON đúng dạng: ' +
      '{"title": tiêu đề SEO dạng "[Tên rút gọn] - Có Nên Mua Không? Mua Ở Đâu Được Hoàn Tiền?", ' +
      '"metaDescription": khoảng 155 ký tự, ' +
      '"intro": đoạn mở đầu khoảng 70 từ, ' +
      '"sections": [' +
      '{"q":"Sản phẩm này có tốt không?","a":"khoảng 80 từ"},' +
      '{"q":"Mua ở đâu rẻ nhất, có hoàn tiền không?","a":"khoảng 80 từ, nhấn mạnh mua qua Win-Win Back được hoàn tiền"},' +
      '{"q":"Bao lâu thì nhận được tiền hoàn?","a":"khoảng 60 từ, giải thích tiền hoàn về sau khi đơn hoàn tất"}]}';

    const raw = await nvidiaChat({ system, user, maxTokens: 1500, temperature: 0.6 });
    const parsed = parseJsonObject(raw);
    if (!parsed) return null;

    const title =
      (typeof parsed.title === "string" && parsed.title.trim()) ||
      `${input.productName} - Có Nên Mua Không? Mua Ở Đâu Được Hoàn Tiền?`;
    const sections = Array.isArray(parsed.sections)
      ? (parsed.sections as unknown[])
          .filter(
            (s): s is ArticleSection =>
              !!s &&
              typeof (s as ArticleSection).q === "string" &&
              typeof (s as ArticleSection).a === "string",
          )
          .map((s) => ({ q: s.q, a: s.a }))
      : [];

    const slug = `${slugify(title)}-${input.productId.replace(/\D/g, "").slice(-6)}`;

    const inserted = await db
      .insert(articles)
      .values({
        slug,
        platform: input.platform,
        productId: input.productId,
        userId: input.userId,
        title,
        metaDescription:
          typeof parsed.metaDescription === "string"
            ? parsed.metaDescription.slice(0, 300)
            : null,
        intro: typeof parsed.intro === "string" ? parsed.intro : null,
        sections: JSON.stringify(sections),
        productName: input.productName,
        price: input.price ?? null,
        imageUrl: input.imageUrl ?? null,
        productUrl: input.productUrl,
        affiliateShortCode: input.affiliateShortCode ?? null,
        estimatedCashback: input.estimatedCashback ?? null,
        status: "published",
      })
      .onConflictDoNothing()
      .returning();
    return inserted[0] ?? null;
  } catch {
    return null;
  }
}

/** Public: fetch a published article by slug + bump view count (best-effort). */
export async function getPublishedArticleBySlug(
  slug: string,
): Promise<Article | null> {
  const rows = await db
    .select()
    .from(articles)
    .where(eq(articles.slug, slug))
    .limit(1);
  const article = rows[0];
  if (!article || article.status !== "published") return null;
  void db
    .update(articles)
    .set({ views: sql`${articles.views} + 1` })
    .where(eq(articles.id, article.id))
    .catch(() => {});
  return article;
}

/** Fetch a published article without bumping views (for SEO metadata). */
export async function peekPublishedArticle(
  slug: string,
): Promise<Article | null> {
  const rows = await db
    .select()
    .from(articles)
    .where(eq(articles.slug, slug))
    .limit(1);
  const article = rows[0];
  return article && article.status === "published" ? article : null;
}

export function parseSections(sections: string | null): ArticleSection[] {
  if (!sections) return [];
  try {
    const arr = JSON.parse(sections);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

/** Admin: list articles (most recent first). */
export async function listArticles(limit = 100): Promise<Article[]> {
  return db
    .select()
    .from(articles)
    .orderBy(desc(articles.createdAt))
    .limit(limit);
}

export async function setArticleStatus(
  id: string,
  status: "published" | "hidden",
): Promise<void> {
  await db.update(articles).set({ status }).where(eq(articles.id, id));
}

export async function deleteArticle(id: string): Promise<void> {
  await db.delete(articles).where(eq(articles.id, id));
}
