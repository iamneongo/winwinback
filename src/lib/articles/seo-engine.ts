import { DomUtils, parseDocument } from "htmlparser2";
import type { ArticleDocument } from "./document";

export type SeoGroup = "SEO cơ bản" | "Nội dung" | "Hình ảnh & liên kết" | "Kỹ thuật";
export type SeoStatus = "passed" | "warning" | "failed" | "not_applicable";
export type SeoIssue = {
  id: string;
  group: SeoGroup;
  status: SeoStatus;
  severity: "info" | "warning" | "error";
  earnedPoints: number;
  maxPoints: number;
  message: string;
  suggestion: string;
  targetField: string;
};
export type SeoAnalysis = { score: number; passed: number; applicable: number; issues: SeoIssue[]; keywordCount: number; wordCount: number };
export type NormalizedSeoContent = {
  postTitle: string;
  slug: string;
  plainText: string;
  paragraphs: string[];
  headings: { level: number; text: string }[];
  images: { src: string; alt: string }[];
  links: { href: string; text: string; internal: boolean }[];
  coverImage: string;
  status: "draft" | "published" | "unpublished";
};

const normalizeText = (value: string) => value.normalize("NFC").replace(/\s+/gu, " ").trim();
const fold = (value: string) => normalizeText(value).toLocaleLowerCase("vi");
const countWords = (value: string) => {
  const Segmenter = Intl.Segmenter;
  if (Segmenter) {
    let count = 0;
    for (const part of new Segmenter("vi", { granularity: "word" }).segment(value)) if (part.isWordLike) count++;
    return count;
  }
  return value.match(/[\p{L}\p{N}]+/gu)?.length ?? 0;
};

/** One forgiving HTML parse per analysis. The editor remains unchanged. */
export function adaptArticleForSeo(doc: ArticleDocument, status: NormalizedSeoContent["status"] = "draft"): NormalizedSeoContent {
  const root = parseDocument(doc.html || "", { decodeEntities: true });
  const tags = DomUtils.findAll((node) => node.type === "tag", root.children);
  const headings: NormalizedSeoContent["headings"] = [];
  const paragraphs: string[] = [];
  const images: NormalizedSeoContent["images"] = [];
  const links: NormalizedSeoContent["links"] = [];
  for (const tag of tags) {
    const name = tag.name.toLowerCase();
    if (/^h[1-6]$/.test(name)) headings.push({ level: Number(name[1]), text: normalizeText(DomUtils.getText(tag)) });
    if (name === "p") {
      const text = normalizeText(DomUtils.getText(tag));
      if (text) paragraphs.push(text);
    }
    if (name === "img") images.push({ src: tag.attribs.src || "", alt: normalizeText(tag.attribs.alt || "") });
    if (name === "a") {
      const href = tag.attribs.href || "";
      let internal = /^\/(?!\/)/.test(href);
      if (!internal) {
        try { internal = new URL(href).hostname.toLowerCase() === "winwinback.com"; } catch { /* relative or invalid */ }
      }
      links.push({ href, text: normalizeText(DomUtils.getText(tag)), internal });
    }
  }
  const plainText = normalizeText(DomUtils.textContent(root));
  return { postTitle: normalizeText(doc.title), slug: doc.slug, plainText, paragraphs, headings, images, links, coverImage: doc.imageUrl, status };
}

export function effectiveSeo(doc: ArticleDocument) {
  const title = normalizeText(doc.seo.title || doc.title);
  const description = normalizeText(doc.metaDescription || doc.intro);
  return {
    title,
    description,
    canonical: doc.seo.canonical.trim(),
    socialTitle: normalizeText(doc.seo.socialTitle || title),
    socialDescription: normalizeText(doc.seo.socialDescription || description),
    socialImage: doc.seo.socialImage || doc.imageUrl,
  };
}

/** Rule-based editorial guidance, never a Google ranking score. */
export function analyzeSeo(doc: ArticleDocument, status: NormalizedSeoContent["status"] = "draft"): SeoAnalysis {
  const content = adaptArticleForSeo(doc, status);
  const wordCount = countWords(content.plainText);
  const effective = effectiveSeo(doc);
  const keyword = fold(doc.seo.keyword);
  const keywordCount = keyword ? [effective.title, effective.description, content.plainText].reduce((sum, text) => {
    const haystack = fold(text);
    return sum + haystack.split(keyword).length - 1;
  }, 0) : 0;
  const issues: SeoIssue[] = [];
  const add = (id: string, group: SeoGroup, weight: number, status: SeoStatus, message: string, suggestion: string, targetField: string) => {
    issues.push({ id, group, status, severity: status === "failed" ? "error" : status === "warning" ? "warning" : "info", earnedPoints: status === "passed" ? weight : status === "warning" ? Math.round(weight / 2) : 0, maxPoints: weight, message, suggestion, targetField });
  };
  add("title_present", "SEO cơ bản", 10, effective.title ? "passed" : "failed", effective.title ? "Có tiêu đề SEO hiệu lực." : "Chưa có tiêu đề bài viết.", "Đặt tiêu đề rõ chủ đề; tiêu đề SEO có thể để trống để dùng tiêu đề bài.", effective.title ? "seo-title" : "article-title");
  add("title_length", "SEO cơ bản", 7, !effective.title ? "not_applicable" : effective.title.length >= 30 && effective.title.length <= 65 ? "passed" : "warning", `Tiêu đề hiệu lực dài ${effective.title.length} ký tự.`, "Khoảng 30–65 ký tự chỉ là gợi ý; ưu tiên dễ hiểu, không cắt nghĩa.", "seo-title");
  add("description_present", "SEO cơ bản", 10, effective.description ? "passed" : "failed", effective.description ? "Có mô tả hiệu lực." : "Chưa có mô tả SEO hoặc đoạn giới thiệu.", "Viết mô tả tóm tắt nội dung thật; có thể dùng đoạn giới thiệu làm fallback.", "metaDescription");
  add("description_length", "SEO cơ bản", 6, !effective.description ? "not_applicable" : effective.description.length >= 100 && effective.description.length <= 160 ? "passed" : "warning", `Mô tả hiệu lực dài ${effective.description.length} ký tự.`, "Khoảng 100–160 ký tự chỉ là gợi ý; Google có thể dùng đoạn trích khác.", "metaDescription");
  add("focus_keyword_present", "SEO cơ bản", 8, keyword ? "passed" : "warning", keyword ? "Đã chọn từ khóa trọng tâm." : "Chưa chọn từ khóa trọng tâm.", "Chọn một cụm từ mô tả chính xác chủ đề bài.", "seo-keyword");
  add("keyword_relevance", "SEO cơ bản", 8, !keyword ? "not_applicable" : keywordCount ? "passed" : "warning", keywordCount ? "Từ khóa có mặt tự nhiên trong bài hoặc metadata." : "Chưa thấy từ khóa trọng tâm trong title, mô tả hoặc bài.", "Chỉ thêm ở vị trí phù hợp; không lặp máy móc để tăng điểm.", "content");
  const validSlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(content.slug);
  add("slug_quality", "SEO cơ bản", 7, !content.slug ? "warning" : validSlug && content.slug.length <= 90 ? "passed" : "warning", content.slug ? `Slug: ${content.slug}` : "Chưa đặt slug; hệ thống sẽ tạo khi lưu.", "Dùng slug ngắn, có nghĩa, chữ thường và dấu nối.", "slug");
  const h1 = content.headings.some((h) => h.level === 1);
  const h2 = content.headings.some((h) => h.level === 2);
  const headingJump = content.headings.some((h, index) => index > 0 && h.level > content.headings[index - 1].level + 1);
  const sensibleHeadings = !h1 && h2 && !headingJump;
  add("heading_structure", "Nội dung", 10, !content.plainText ? "not_applicable" : sensibleHeadings ? "passed" : "warning", sensibleHeadings ? "Nội dung có H2 và thứ tự heading hợp lý." : "Cấu trúc heading cần xem lại.", "Tiêu đề bài là H1 duy nhất; dùng H2–H4 theo thứ tự, tránh nhảy cấp.", "content");
  add("content_completeness", "Nội dung", 8, !content.plainText ? "failed" : content.paragraphs.length >= 2 && content.plainText.length >= 120 ? "passed" : "warning", `Nội dung có ${content.paragraphs.length} đoạn và ${wordCount} từ.`, "Bổ sung thông tin hữu ích và các đoạn văn thực tế; không cần đạt số từ cố định.", "content");
  const missingAlt = content.images.filter((image) => !image.alt).length;
  add("image_alt", "Hình ảnh & liên kết", 7, !content.images.length ? "not_applicable" : missingAlt ? "warning" : "passed", content.images.length ? `${missingAlt}/${content.images.length} ảnh thiếu ALT.` : "Bài không có ảnh nội dung.", "Mô tả ngắn gọn ảnh có ý nghĩa; không nhồi từ khóa.", "content");
  const internalLinks = content.links.filter((link) => {
    if (!link.internal) return false;
    try {
      const path = new URL(link.href, "https://winwinback.com").pathname;
      return /^\/(?:bai-viet|dieu-khoan|chinh-sach-bao-mat)(?:\/|$)/.test(path);
    } catch { return false; }
  }).length;
  add("internal_links", "Hình ảnh & liên kết", 8, !content.plainText ? "not_applicable" : internalLinks ? "passed" : "warning", internalLinks ? `Có ${internalLinks} liên kết nội bộ.` : "Chưa có liên kết nội bộ phù hợp.", "Liên kết tới trang thực sự liên quan, với anchor có nghĩa.", "content");
  let canonicalValid = true;
  if (effective.canonical) {
    try { const url = new URL(effective.canonical); canonicalValid = url.protocol === "https:" && !url.username && !url.password; } catch { canonicalValid = false; }
  }
  add("index_canonical", "Kỹ thuật", 6, status === "draft" ? "not_applicable" : canonicalValid ? "passed" : "failed", status === "draft" ? "Bản nháp không được lập chỉ mục." : canonicalValid ? "Canonical và robots hợp lệ." : "Canonical không hợp lệ.", "Kiểm tra canonical HTTPS và lựa chọn index/follow trước khi xuất bản.", "seo-canonical");
  add("social_preview", "Kỹ thuật", 5, !effective.socialImage ? "not_applicable" : effective.socialTitle && effective.socialDescription ? "passed" : "warning", effective.socialImage ? "Đã cấu hình ảnh chia sẻ." : "Chưa có ảnh chia sẻ hoặc ảnh bìa.", "Kiểm tra tiêu đề, mô tả và ảnh khi chia sẻ liên kết.", "seo-socialTitle");
  const applicable = issues.filter((issue) => issue.status !== "not_applicable");
  const max = applicable.reduce((sum, issue) => sum + issue.maxPoints, 0);
  const score = max ? Math.round(applicable.reduce((sum, issue) => sum + issue.earnedPoints, 0) / max * 100) : 0;
  return { score: Math.max(0, Math.min(100, score)), passed: applicable.filter((issue) => issue.status === "passed").length, applicable: applicable.length, issues, keywordCount, wordCount };
}
