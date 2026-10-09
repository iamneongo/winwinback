import "server-only";
import sanitizeHtml from "sanitize-html";
import { and, asc, desc, eq, ilike, inArray, isNull, ne, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { articles, type Article } from "@/db/schema";
import type { Platform } from "@/lib/affiliate/types";
import { nvidiaChat, isNvidiaConfigured } from "@/lib/ai/nvidia";
import { platformLabel } from "@/lib/labels";
import { formatVnd, cashbackRate } from "@/lib/config";
import { getShopeeProductInfo } from "@/lib/affiliate/shopee/automation-client";
import { getOpenCollaborationProductsByIds } from "@/lib/affiliate/tiktok/client";
import { getValidTikTokAccessToken } from "@/lib/affiliate/tiktok/tokens";
import { normalizeArticleCategory, UNCATEGORIZED } from "@/lib/articles/categories";

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
  affiliateShortCode?: string;
  estimatedCashback?: number;
}

interface ArticleProductData {
  name?: string;
  price?: number;
  imageUrl?: string;
  shopName?: string;
  category?: string;
  rating?: string;
  soldCount?: number;
  commission?: number;
}

/** Fetch rich product data from the marketplace to ground the article. */
async function fetchArticleProductData(
  platform: Platform,
  productUrl: string,
  productId: string,
): Promise<ArticleProductData | null> {
  try {
    if (platform === "shopee") {
      const p = await getShopeeProductInfo(productUrl);
      if (!p) return null;
      return {
        name: p.name,
        price: typeof p.price === "number" ? p.price : undefined,
        imageUrl: p.image,
        shopName: p.shopName,
        category:
          Array.isArray(p.category) && p.category.length
            ? p.category.join(" › ")
            : undefined,
        rating: p.rating != null ? String(p.rating) : undefined,
        soldCount: typeof p.sales === "number" ? p.sales : undefined,
        commission: typeof p.commission === "number" ? p.commission : undefined,
      };
    }
    const token = await getValidTikTokAccessToken();
    if (!token) return null;
    const [info] = await getOpenCollaborationProductsByIds([productId], token);
    if (!info) return null;
    const price = Math.round(
      parseFloat(
        String(info.original_price?.minimum_amount ?? "").replace(/[^\d.]/g, ""),
      ),
    );
    const commission = Math.round(
      parseFloat(
        String(info.commission?.amount ?? "").split("-")[0].replace(/[^\d.]/g, ""),
      ),
    );
    const category = (info.category_chains ?? [])
      .map((c) => c.local_name)
      .filter(Boolean)
      .join(" › ");
    return {
      name: info.title,
      price: Number.isFinite(price) && price > 0 ? price : undefined,
      imageUrl: info.main_image_url,
      shopName: info.shop?.name,
      category: category || undefined,
      soldCount:
        typeof info.units_sold === "number" ? info.units_sold : undefined,
      commission:
        Number.isFinite(commission) && commission > 0 ? commission : undefined,
    };
  } catch {
    return null;
  }
}

interface BuiltArticle {
  title: string;
  metaDescription: string | null;
  intro: string | null;
  sections: ArticleSection[];
  contentHtml: string;
  productName: string;
  category: string | null;
  price: number | null;
  imageUrl: string | null;
  estimatedCashback: number | null;
  slug: string;
}

export interface ArticleProgress {
  stage: "fetching_product" | "generating";
  preview?: string;
}

/** Pull readable fields from a partially streamed JSON response. */
function previewFromPartialArticle(raw: string): string {
  const pieces: string[] = [];
  for (const match of raw.matchAll(/"(title|intro|q|a)"\s*:\s*"((?:\\.|[^"\\])*)/g)) {
    const fragment = match[2] ?? "";
    let plain: string;
    try {
      plain = JSON.parse(`"${fragment}"`) as string;
    } catch {
      plain = fragment.replace(/\\n/g, "\n").replace(/\\"/g, '"');
    }
    if (plain.trim()) pieces.push(plain.trim());
  }
  return pieces.join("\n\n");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Serve product images through our proxy so hotlink-protected CDNs display. */
export function proxiedImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("data:") || url.startsWith("/")) return url;
  return `/api/img?url=${encodeURIComponent(url)}`;
}

/** Uploaded covers are stored as compressed JPEGs; expose them as real image URLs. */
export function articleCoverUrl(a: Pick<Article, "id" | "imageUrl">): string | null {
  if (a.imageUrl?.startsWith("data:image/jpeg;base64,")) {
    return `/api/article-thumbnail/${a.id}`;
  }
  return proxiedImageUrl(a.imageUrl);
}

/** Build the editable rich-HTML body from the generated pieces. */
function buildContentHtml(opts: {
  imageUrl: string | null;
  productName: string;
  intro: string | null;
  sections: ArticleSection[];
}): string {
  const parts: string[] = [];
  const img = proxiedImageUrl(opts.imageUrl);
  if (img) {
    parts.push(
      `<p><img src="${img}" alt="${escapeHtml(opts.productName)}" /></p>`,
    );
  }
  if (opts.intro) parts.push(`<p>${escapeHtml(opts.intro)}</p>`);
  for (const s of opts.sections) {
    parts.push(`<h2>${escapeHtml(s.q)}</h2>`);
    parts.push(`<p>${escapeHtml(s.a)}</p>`);
  }
  return parts.join("\n");
}

/** Fetch product data + ask the AI for the article content (no DB write). */
async function buildArticle(
  input: GenerateArticleInput,
  onProgress?: (progress: ArticleProgress) => Promise<void>,
): Promise<BuiltArticle | null> {
  if (!isNvidiaConfigured() || !input.productId) return null;

  await onProgress?.({ stage: "fetching_product" });
  const data = await fetchArticleProductData(
    input.platform,
    input.productUrl,
    input.productId,
  );
  const name = data?.name;
  if (!name) return null; // need a real product name for a good article
  await onProgress?.({ stage: "generating", preview: name });

  const estimatedCashback =
    input.estimatedCashback ??
    (data?.commission ? Math.round(data.commission * cashbackRate) : undefined);

  const san = platformLabel[input.platform] ?? input.platform;
  const facts = [
    `Tên sản phẩm: ${name}`,
    data?.price ? `Giá: ${formatVnd(data.price)}` : null,
    `Sàn: ${san}`,
    data?.shopName ? `Shop: ${data.shopName}` : null,
    data?.category ? `Danh mục: ${data.category}` : null,
    data?.rating ? `Đánh giá: ${data.rating}/5 sao` : null,
    data?.soldCount ? `Đã bán: ${data.soldCount.toLocaleString("vi-VN")}` : null,
    estimatedCashback
      ? `Tiền hoàn dự kiến khi mua qua Win-Win Back: ${formatVnd(estimatedCashback)}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");

  const system =
    "Bạn là chuyên gia viết bài review & SEO tiếng Việt cho Win-Win Back (website hoàn tiền khi mua trên Shopee/TikTok Shop). " +
    "Viết chi tiết, tự nhiên, thuyết phục, bám sát dữ liệu được cung cấp. KHÔNG bịa thông số kỹ thuật cụ thể nếu không chắc chắn. " +
    "CHỈ trả về JSON hợp lệ, không markdown, không giải thích.";
  const user =
    `DỮ LIỆU SẢN PHẨM:\n${facts}\n\n` +
    "Viết bài review SEO tiếng Việt chi tiết, bám sát dữ liệu. QUAN TRỌNG: mỗi mục TỐI ĐA ~100 từ (súc tích), và trả về JSON HOÀN CHỈNH — đóng đủ ngoặc, hợp lệ. Dạng:\n" +
    '{"title": tiêu đề SEO hấp dẫn chứa tên sản phẩm, dạng "[Tên rút gọn] - Có Nên Mua Không? Giá, Đánh Giá & Mua Ở Đâu Hoàn Tiền?", ' +
    '"metaDescription": khoảng 155 ký tự chứa tên sản phẩm + giá + hoàn tiền, ' +
    '"intro": đoạn mở đầu ~80 từ, ' +
    '"sections": [' +
    '{"q":"Thông tin & đặc điểm nổi bật","a":"~100 từ: mô tả sản phẩm dựa trên tên, danh mục, shop; công dụng; đối tượng phù hợp"},' +
    '{"q":"Đánh giá: sản phẩm có tốt không? Ưu & nhược điểm","a":"~100 từ: ưu điểm nổi bật và vài nhược điểm/lưu ý khách quan"},' +
    '{"q":"Giá bán và độ tin cậy","a":"~90 từ: mức giá có hợp lý không, dựa vào đánh giá sao và lượt bán nếu có"},' +
    '{"q":"Mua ở đâu rẻ nhất, có hoàn tiền không?","a":"~100 từ: nhấn mạnh mua qua Win-Win Back được hoàn tiền' +
    (estimatedCashback ? ` khoảng ${formatVnd(estimatedCashback)}` : "") +
    '"},' +
    '{"q":"Bao lâu thì nhận được tiền hoàn?","a":"~60 từ: tiền hoàn về ví sau khi đơn hoàn tất và hết thời gian đổi trả"}]}';

  let lastPreview = name;
  let lastWrite = 0;
  const raw = await nvidiaChat({
    system,
    user,
    maxTokens: 6000,
    temperature: 0.6,
    timeoutMs: 170_000,
    onDelta: onProgress
      ? async (partial) => {
          const preview = previewFromPartialArticle(partial);
          const now = Date.now();
          if (preview && preview !== lastPreview && now - lastWrite >= 550) {
            lastPreview = preview;
            lastWrite = now;
            await onProgress({ stage: "generating", preview });
          }
        }
      : undefined,
  });
  await onProgress?.({ stage: "generating", preview: previewFromPartialArticle(raw) });
  const parsed = parseJsonObject(raw);
  if (!parsed) return null;

  const title =
    (typeof parsed.title === "string" && parsed.title.trim()) ||
    `${name} - Có Nên Mua Không? Mua Ở Đâu Được Hoàn Tiền?`;
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

  const intro = typeof parsed.intro === "string" ? parsed.intro : null;

  return {
    title,
    metaDescription:
      typeof parsed.metaDescription === "string"
        ? parsed.metaDescription.slice(0, 300)
        : null,
    intro,
    sections,
    contentHtml: buildContentHtml({
      imageUrl: data?.imageUrl ?? null,
      productName: name,
      intro,
      sections,
    }),
    productName: name,
    category: normalizeArticleCategory(data?.category),
    price: data?.price ?? null,
    imageUrl: data?.imageUrl ?? null,
    estimatedCashback: estimatedCashback ?? null,
    slug,
  };
}

/**
 * Generate + store an article. Idempotent per (platform, productId).
 * Best-effort: returns null (never throws) so it can be fire-and-forget.
 */
export async function generateAndSaveArticle(
  input: GenerateArticleInput,
  onProgress?: (progress: ArticleProgress) => Promise<void>,
): Promise<Article | null> {
  try {
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

    const c = await buildArticle(input, onProgress);
    if (!c) return null;

    const inserted = await db
      .insert(articles)
      .values({
        slug: c.slug,
        platform: input.platform,
        productId: input.productId,
        userId: input.userId,
        title: c.title,
        metaDescription: c.metaDescription,
        intro: c.intro,
        sections: JSON.stringify(c.sections),
        contentHtml: c.contentHtml,
        productName: c.productName,
        category: c.category,
        price: c.price,
        imageUrl: c.imageUrl,
        productUrl: input.productUrl,
        affiliateShortCode: input.affiliateShortCode ?? null,
        estimatedCashback: c.estimatedCashback,
        status: "published",
      })
      .onConflictDoNothing()
      .returning();
    if (inserted[0]) return inserted[0];
    // Another link may have generated this product at the same time.
    const concurrent = await db
      .select()
      .from(articles)
      .where(and(eq(articles.platform, input.platform), eq(articles.productId, input.productId)))
      .limit(1);
    return concurrent[0] ?? null;
  } catch {
    return null;
  }
}

/** Admin: regenerate an article in place from fresh data (kept if AI fails). */
export async function regenerateArticle(id: string): Promise<Article | null> {
  const rows = await db
    .select()
    .from(articles)
    .where(eq(articles.id, id))
    .limit(1);
  const old = rows[0];
  if (!old) return null;
  const c = await buildArticle({
    platform: old.platform,
    productId: old.productId,
    productUrl: old.productUrl ?? "",
    userId: old.userId ?? undefined,
    affiliateShortCode: old.affiliateShortCode ?? undefined,
    estimatedCashback: old.estimatedCashback ?? undefined,
  });
  if (!c) return old; // keep the old article if generation failed
  const updated = await db
    .update(articles)
    .set({
      title: c.title,
      metaDescription: c.metaDescription,
      intro: c.intro,
      sections: JSON.stringify(c.sections),
      contentHtml: c.contentHtml,
      productName: c.productName,
      category: c.category,
      price: c.price,
      imageUrl: c.imageUrl,
      estimatedCashback: c.estimatedCashback,
    })
    .where(eq(articles.id, id))
    .returning();
  return updated[0] ?? old;
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

/** Admin: fetch one article by id (any status). */
export async function getArticleById(id: string): Promise<Article | null> {
  const rows = await db
    .select()
    .from(articles)
    .where(eq(articles.id, id))
    .limit(1);
  return rows[0] ?? null;
}

/** Admin: list one page of articles (most recent first). */
export async function listArticles(opts: { limit: number; offset: number }): Promise<Article[]> {
  return db
    .select()
    .from(articles)
    .orderBy(desc(articles.createdAt), desc(articles.id))
    .limit(opts.limit)
    .offset(opts.offset);
}

export type AdminArticleQuery = {
  q?: string;
  status?: "published" | "hidden";
  platform?: Platform;
  category?: string;
  sort?: "title" | "price" | "views" | "createdAt";
  dir?: "asc" | "desc";
  limit: number;
  offset: number;
};

/** Server-side filtering/sorting keeps pagination accurate across all articles. */
export async function listAdminArticles(opts: AdminArticleQuery): Promise<{ rows: Article[]; total: number }> {
  const conditions = [];
  if (opts.q?.trim()) conditions.push(ilike(articles.title, `%${opts.q.trim().slice(0, 150)}%`));
  if (opts.status) conditions.push(eq(articles.status, opts.status));
  if (opts.platform) conditions.push(eq(articles.platform, opts.platform));
  if (opts.category) conditions.push(await categoryCondition(opts.category));
  const where = conditions.length ? and(...conditions) : undefined;
  const sortColumn = {
    title: articles.title,
    price: articles.price,
    views: articles.views,
    createdAt: articles.createdAt,
  }[opts.sort ?? "createdAt"];
  const order = opts.dir === "asc" ? asc(sortColumn) : desc(sortColumn);
  const [[count], rows] = await Promise.all([
    db.select({ total: sql<number>`count(*)::int` }).from(articles).where(where),
    db.select().from(articles).where(where).orderBy(order, desc(articles.id)).limit(opts.limit).offset(opts.offset),
  ]);
  return { rows, total: count?.total ?? 0 };
}

/** Counts all articles, not only the currently visible page. */
export async function getArticleAdminStats(): Promise<{ total: number; published: number; hidden: number }> {
  const [row] = await db
    .select({
      total: sql<number>`count(*)::int`,
      published: sql<number>`count(*) filter (where ${articles.status} = 'published')::int`,
      hidden: sql<number>`count(*) filter (where ${articles.status} = 'hidden')::int`,
    })
    .from(articles);
  return row ?? { total: 0, published: 0, hidden: 0 };
}

export { UNCATEGORIZED } from "@/lib/articles/categories";

/** Match old raw marketplace labels and new canonical labels without a DB migration. */
async function categoryCondition(category: string) {
  const rawRows = await db.select({ raw: articles.category }).from(articles).groupBy(articles.category);
  const matches = rawRows.map(({ raw }) => raw).filter((raw) => normalizeArticleCategory(raw) === category);
  const names = matches.filter((raw): raw is string => raw !== null);
  const clauses = [];
  if (names.length) clauses.push(inArray(articles.category, names));
  if (matches.includes(null)) clauses.push(isNull(articles.category));
  return or(...clauses) ?? sql`false`;
}

/** Public: published articles, optionally filtered by normalized category. */
export async function listPublishedArticles(opts?: {
  category?: string;
  limit?: number;
  offset?: number;
}): Promise<Article[]> {
  const conds = [eq(articles.status, "published")];
  if (opts?.category) conds.push(await categoryCondition(opts.category));
  return db
    .select()
    .from(articles)
    .where(and(...conds))
    .orderBy(desc(articles.createdAt), desc(articles.id))
    .limit(opts?.limit ?? 200)
    .offset(opts?.offset ?? 0);
}

export interface CategoryCount {
  name: string;
  count: number;
}

/** Public: compact category counts, including articles created before normalization. */
export async function listArticleCategories(): Promise<CategoryCount[]> {
  const rows = await db
    .select({
      raw: articles.category,
      count: sql<number>`count(*)::int`,
    })
    .from(articles)
    .where(eq(articles.status, "published"))
    .groupBy(articles.category);
  const counts = new Map<string, number>();
  for (const row of rows) {
    const name = normalizeArticleCategory(row.raw);
    counts.set(name, (counts.get(name) ?? 0) + Number(row.count));
  }
  return [...counts].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
}

/** Public: prioritize category, then platform; fill remaining slots with recent articles. */
export async function listRelatedArticles(
  current: Article,
  limit = 4,
): Promise<Article[]> {
  const category = normalizeArticleCategory(current.category);
  const sameCategory = category === UNCATEGORIZED ? sql`false` : await categoryCondition(category);
  return db
    .select()
    .from(articles)
    .where(and(eq(articles.status, "published"), ne(articles.id, current.id)))
    .orderBy(
      sql`case when ${sameCategory} then 0 when ${articles.platform} = ${current.platform} then 1 else 2 end`,
      desc(articles.createdAt),
    )
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

const SANITIZE_OPTS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "br", "h1", "h2", "h3", "h4", "strong", "b", "em", "i", "u", "s",
    "sub", "sup", "blockquote", "ul", "ol", "li", "a", "img", "figure", "figcaption",
    "span", "div", "pre", "code", "hr", "iframe",
    "table", "thead", "tbody", "tr", "th", "td",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "title", "width", "height", "style"],
    // Quill video embeds (e.g. YouTube) render as an <iframe>.
    iframe: [
      "src", "width", "height", "frameborder", "allowfullscreen", "allow", "class", "style",
    ],
    "*": ["style", "class"],
  },
  // data: is only allowed for <img> (admin-pasted base64), never for links.
  // iframes (embedded video) must be https — no data:/http:.
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesByTag: { img: ["http", "https", "data"], iframe: ["https"] },
  allowProtocolRelative: false,
};

/** Sanitize editor/AI HTML before storing or rendering (XSS-safe). */
export function sanitizeArticleHtml(html: string): string {
  // Quill emits word gaps as non-breaking spaces (U+00A0 / &nbsp;), which stop
  // prose from wrapping and cause horizontal overflow. Collapse them back to
  // regular spaces so paragraphs wrap normally.
  const normalized = html.replace(/ /g, " ").replace(/&nbsp;/gi, " ");
  return sanitizeHtml(normalized, SANITIZE_OPTS);
}

/** Admin: save edited HTML body (sanitized). */
export async function updateArticleContent(
  id: string,
  input: { html: string; title: string; metaDescription: string; category: string; imageUrl: string },
): Promise<void> {
  await db
    .update(articles)
    .set({
      contentHtml: sanitizeArticleHtml(input.html),
      title: input.title,
      metaDescription: input.metaDescription || null,
      category: normalizeArticleCategory(input.category),
      imageUrl: input.imageUrl || null,
    })
    .where(eq(articles.id, id));
}

/** HTML body for rendering — stored content, or built from sections (old rows). */
export function articleContentHtml(a: Article): string {
  const html =
    a.contentHtml && a.contentHtml.trim()
      ? a.contentHtml
      : buildContentHtml({
          imageUrl: a.imageUrl,
          productName: a.productName ?? a.title,
          intro: a.intro,
          sections: parseSections(a.sections),
        });
  return sanitizeArticleHtml(html);
}
