import { z } from "zod";

const webUrl = z.string().trim().max(2000).refine((v) => {
  if (!v) return true;
  try {
    const url = new URL(v);
    return url.protocol === "https:" && Boolean(url.hostname) && !url.username && !url.password;
  } catch { return false; }
}, "URL phải là HTTPS hợp lệ, không chứa thông tin đăng nhập.");
const imageUrl = z.string().max(450_000).refine((v) => !v || /^https:\/\//.test(v) || /^\/api\/article-media\/[a-f0-9-]+$/.test(v) || /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(v), "Đường dẫn ảnh không hợp lệ.");
const secondaryKeywords = z.preprocess((value) => typeof value === "string" ? value.split(",") : value,
  z.array(z.string().trim().max(100)).max(20).transform((items) => {
    const seen = new Set<string>();
    return items.filter((item) => {
      const key = item.toLocaleLowerCase("vi").replace(/\s+/g, " ");
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }).default([]));
export const seoSchema = z.object({
  title: z.string().max(180).default(""),
  keyword: z.string().max(100).default(""),
  secondaryKeywords,
  canonical: webUrl.default(""),
  noindex: z.boolean().default(false),
  follow: z.boolean().default(true),
  socialTitle: z.string().max(180).default(""),
  socialDescription: z.string().max(300).default(""),
  socialImage: imageUrl.default(""),
  schemaType: z.enum(["Article", "WebPage"]).default("Article"),
  outro: z.string().max(80).default("default"),
});
export type ArticleSeo = z.infer<typeof seoSchema>;
export const documentSchema = z.object({
  title: z.string().trim().max(180),
  slug: z.string().max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$|^$/, "URL chỉ gồm chữ thường, số và dấu gạch ngang."),
  html: z.string().max(600_000),
  intro: z.string().max(2000),
  metaDescription: z.string().max(300),
  category: z.string().max(80),
  imageUrl,
  seo: seoSchema,
});
export type ArticleDocument = z.infer<typeof documentSchema>;
export const defaultSeo = (): ArticleSeo => seoSchema.parse({});
export function articleSlug(title: string) {
  return title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120).replace(/-+$/, "");
}
export function publicationErrors(doc: ArticleDocument) {
  return [!doc.title.trim() && "Nhập tiêu đề bài viết.", !doc.html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim() && "Nhập nội dung bài viết.", !doc.category && "Chọn danh mục."].filter((v): v is string => Boolean(v));
}
