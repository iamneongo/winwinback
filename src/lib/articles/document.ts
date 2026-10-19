import { z } from "zod";

const webUrl = z.string().max(2000).refine((v) => !v || /^https:\/\/[^\s]+$/.test(v), "URL phải dùng HTTPS.");
const imageUrl = z.string().max(450_000).refine((v) => !v || /^https:\/\//.test(v) || /^\/api\/article-media\/[a-f0-9-]+$/.test(v) || /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(v), "Đường dẫn ảnh không hợp lệ.");
export const seoSchema = z.object({
  title: z.string().max(180).default(""),
  keyword: z.string().max(100).default(""),
  secondaryKeywords: z.string().max(500).default(""),
  canonical: webUrl.default(""),
  noindex: z.boolean().default(false),
  socialTitle: z.string().max(180).default(""),
  socialDescription: z.string().max(300).default(""),
  socialImage: imageUrl.default(""),
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
export function seoChecks(doc: ArticleDocument) {
  const title = doc.seo.title || doc.title;
  const keyword = doc.seo.keyword.trim().toLocaleLowerCase("vi");
  const images = doc.html.match(/<img\b[^>]*>/gi) || [];
  return [
    { field: "seo-title", ok: title.length >= 30 && title.length <= 65, text: "Tiêu đề SEO rõ ý, khoảng 30–65 ký tự." },
    { field: "metaDescription", ok: doc.metaDescription.length >= 100 && doc.metaDescription.length <= 160, text: "Mô tả SEO khoảng 100–160 ký tự." },
    { field: "keyword", ok: Boolean(keyword), text: "Chọn từ khóa trọng tâm để định hướng bài." },
    { field: "seo-title", ok: Boolean(keyword) && title.toLocaleLowerCase("vi").includes(keyword), text: "Đưa chủ đề/từ khóa vào tiêu đề một cách tự nhiên." },
    { field: "content", ok: /<h[234]\b/i.test(doc.html) && !/<h1\b/i.test(doc.html), text: "Chia nội dung bằng H2–H4; không thêm H1 trong bài." },
    { field: "content", ok: images.every((image) => /\balt=["'][^"']+/.test(image)), text: "Ảnh trong nội dung có văn bản thay thế." },
    { field: "content", ok: /href=["'](?:\/bai-viet\/|https:\/\/winwinback.com\/bai-viet\/)/i.test(doc.html), text: "Thêm liên kết nội bộ phù hợp với nội dung." },
  ];
}
