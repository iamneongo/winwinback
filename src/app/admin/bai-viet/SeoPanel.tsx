"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, CircleAlert, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ArticleDocument, ArticleSeo } from "@/lib/articles/document";
import { analyzeSeo, effectiveSeo, type SeoGroup } from "@/lib/articles/seo-engine";

const groups: SeoGroup[] = ["SEO cơ bản", "Nội dung", "Hình ảnh & liên kết", "Kỹ thuật"];
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://winwinback.com").replace(/\/$/, "");

export function SeoPanel({ doc, published, update, updateSeo, chooseSocialImage, focusEditor }: {
  doc: ArticleDocument;
  published: boolean;
  update: (key: "slug" | "metaDescription", value: string) => void;
  updateSeo: <K extends keyof ArticleSeo>(key: K, value: ArticleSeo[K]) => void;
  chooseSocialImage: () => void;
  focusEditor: () => void;
}) {
  const [analysis, setAnalysis] = useState(() => analyzeSeo(doc, published ? "published" : "draft"));
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [secondaryInput, setSecondaryInput] = useState(doc.seo.secondaryKeywords.join(", "));
  const effective = effectiveSeo(doc);
  const canonicalError = doc.seo.canonical && (() => {
    try { const url = new URL(doc.seo.canonical); return url.protocol !== "https:" || Boolean(url.username || url.password); } catch { return true; }
  })();

  useEffect(() => {
    const timer = setTimeout(() => setAnalysis(analyzeSeo(doc, published ? "published" : "draft")), 400);
    return () => clearTimeout(timer);
  }, [doc, published]);

  function jump(target: string) {
    if (target === "content") { focusEditor(); return; }
    if (["seo-canonical", "seo-socialTitle"].includes(target)) document.querySelector<HTMLDetailsElement>("[data-seo-advanced]")?.setAttribute("open", "");
    requestAnimationFrame(() => {
      const field = document.getElementById(target);
      field?.scrollIntoView({ behavior: "smooth", block: "center" });
      field?.focus();
    });
  }

  function textField(key: "title" | "keyword" | "canonical" | "socialTitle" | "socialDescription", label: string, maxLength: number) {
    return <label className="block space-y-2 text-sm font-medium" htmlFor={`seo-${key}`}>
      <span className="flex justify-between gap-2"><span>{label}</span><span className="font-normal text-[#526f8e]">{doc.seo[key].length}/{maxLength}</span></span>
      <Input id={`seo-${key}`} value={doc.seo[key]} maxLength={maxLength} onChange={(e) => updateSeo(key, e.target.value)} />
    </label>;
  }

  return <div className="space-y-5">
    <section className="rounded-lg border border-[#dbe6f3] bg-[#f8fbff] p-4" aria-label="Điểm SEO">
      <div className="flex items-center justify-between gap-3"><div><p className="text-sm font-semibold">Điểm SEO · {analysis.score}/100</p><p className="mt-1 text-xs text-[#526f8e]">{analysis.passed}/{analysis.applicable} mục áp dụng đã đạt</p></div><span className={`text-sm font-semibold ${analysis.score >= 75 ? "text-green-700" : analysis.score >= 45 ? "text-amber-700" : "text-red-700"}`}>{analysis.score >= 75 ? "Tốt" : analysis.score >= 45 ? "Cần cải thiện" : "Cần bổ sung"}</span></div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#e4edf8]" role="progressbar" aria-valuenow={analysis.score} aria-valuemin={0} aria-valuemax={100} aria-label="Điểm SEO"><div className="h-full rounded-full bg-[#4ea821] transition-[width]" style={{ width: `${analysis.score}%` }} /></div>
      <p className="mt-2 text-xs text-[#526f8e]">Điểm gợi ý biên tập, không phải điểm của Google hoặc cam kết thứ hạng.</p>
    </section>

    <section className="rounded-lg bg-[#f4f8fc] p-3" aria-label="Bản mô phỏng kết quả tìm kiếm">
      <div className="flex items-center justify-between gap-2"><h3 className="text-sm font-semibold">Xem trước Google</h3><div className="flex rounded-md border bg-white p-0.5" role="group" aria-label="Chế độ xem trước"><button type="button" aria-pressed={previewMode === "desktop"} onClick={() => setPreviewMode("desktop")} className={`rounded px-2 py-1 text-xs ${previewMode === "desktop" ? "bg-[#dff4d4] font-semibold" : ""}`}>Desktop</button><button type="button" aria-pressed={previewMode === "mobile"} onClick={() => setPreviewMode("mobile")} className={`rounded px-2 py-1 text-xs ${previewMode === "mobile" ? "bg-[#dff4d4] font-semibold" : ""}`}>Mobile</button></div></div>
      <div className={`mt-3 min-w-0 ${previewMode === "mobile" ? "max-w-[250px]" : ""}`}><p className="truncate text-xs text-[#526f8e]">{siteUrl}/bai-viet/{doc.slug || "duong-dan"}</p><p className="mt-1 line-clamp-2 text-base text-blue-800">{effective.title || "Tiêu đề bài viết"} | Win-Win Back</p><p className="mt-1 line-clamp-3 text-sm text-[#526f8e]">{effective.description || "Mô tả nội dung bài viết…"}</p></div>
      <p className="mt-3 flex items-start gap-1 text-xs text-[#526f8e]"><Info className="mt-0.5 size-3 shrink-0" />Bản mô phỏng; Google có thể viết lại tiêu đề và đoạn trích.</p>
    </section>

    <section className="space-y-3" aria-label="Từ khóa SEO"><h3 className="text-sm font-semibold">Từ khóa</h3>{textField("keyword", "Từ khóa chính", 100)}<label className="block space-y-2 text-sm font-medium" htmlFor="seo-secondaryKeywords">Từ khóa phụ<Input id="seo-secondaryKeywords" value={secondaryInput} maxLength={500} onChange={(e) => { const text = e.target.value; setSecondaryInput(text); updateSeo("secondaryKeywords", [...new Set(text.split(",").map((part) => part.trim()).filter(Boolean))]); }} placeholder="Ngăn cách bằng dấu phẩy" /></label><p className="text-xs text-[#526f8e]">Từ khóa chính xuất hiện khoảng {analysis.keywordCount} lần trong tiêu đề, mô tả và bài. Chỉ dùng để tham khảo.</p></section>

    <section className="space-y-3" aria-label="Thiết lập metadata"><h3 className="text-sm font-semibold">Meta settings</h3>{textField("title", "Tiêu đề SEO (trống dùng tiêu đề bài)", 180)}<p className="text-xs text-[#526f8e]">Gợi ý khoảng 30–65 ký tự, không bắt buộc.</p><label className="block space-y-2 text-sm font-medium" htmlFor="metaDescription"><span className="flex justify-between gap-2"><span>Mô tả SEO (trống dùng đoạn giới thiệu)</span><span className="font-normal text-[#526f8e]">{doc.metaDescription.length}/300</span></span><Textarea id="metaDescription" value={doc.metaDescription} rows={3} maxLength={300} onChange={(e) => update("metaDescription", e.target.value)} /></label><p className="text-xs text-[#526f8e]">Gợi ý khoảng 100–160 ký tự, không chặn xuất bản.</p><label className="block space-y-2 text-sm font-medium" htmlFor="slug">Đường dẫn bài viết<Input id="slug" value={doc.slug} maxLength={160} onChange={(e) => update("slug", e.target.value)} /></label><p className="text-xs text-[#526f8e]">Đổi slug sau xuất bản sẽ chuyển hướng URL cũ.</p></section>

    <section aria-label="Checklist SEO"><h3 className="mb-3 text-sm font-semibold">Checklist · {analysis.passed}/{analysis.applicable}</h3>{groups.map((group) => <div key={group} className="mb-4"><h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#526f8e]">{group}</h4><ul className="space-y-2">{analysis.issues.filter((issue) => issue.group === group).map((issue) => <li key={issue.id}><button type="button" onClick={() => jump(issue.targetField)} className="flex w-full gap-2 rounded-md p-1 text-left text-xs leading-5 hover:bg-[#f4f8fc] focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600">{issue.status === "passed" ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-700" /> : <CircleAlert className={`mt-0.5 size-4 shrink-0 ${issue.status === "failed" ? "text-red-700" : "text-amber-700"}`} />}<span><span className="block font-medium">{issue.message}</span><span className="block text-[#526f8e]">{issue.status === "not_applicable" ? "Không áp dụng. " : ""}{issue.suggestion}</span></span></button></li>)}</ul></div>)}</section>

    <details data-seo-advanced className="rounded-lg border p-3"><summary className="cursor-pointer text-sm font-semibold">SEO nâng cao & chia sẻ mạng xã hội</summary><div className="mt-4 space-y-4">{textField("canonical", "Canonical tùy chỉnh (HTTPS)", 2000)}{canonicalError && <p role="alert" className="text-xs text-red-700">Canonical phải là URL HTTPS hợp lệ và không chứa thông tin đăng nhập.</p>}<label className="flex gap-2 text-sm"><input type="checkbox" checked={!doc.seo.noindex} onChange={(e) => updateSeo("noindex", !e.target.checked)} />Cho phép lập chỉ mục</label><label className="flex gap-2 text-sm"><input type="checkbox" checked={doc.seo.follow} onChange={(e) => updateSeo("follow", e.target.checked)} />Cho phép theo liên kết</label><label className="block space-y-2 text-sm font-medium">Loại schema<Select value={doc.seo.schemaType} onValueChange={(value) => { if (value === "Article" || value === "WebPage") updateSeo("schemaType", value); }}><SelectTrigger aria-label="Loại schema"><SelectValue>{doc.seo.schemaType}</SelectValue></SelectTrigger><SelectContent><SelectItem value="Article">Article</SelectItem><SelectItem value="WebPage">WebPage</SelectItem></SelectContent></Select></label>{textField("socialTitle", "Tiêu đề chia sẻ", 180)}{textField("socialDescription", "Mô tả chia sẻ", 300)}<div><p className="mb-2 text-sm font-medium">Ảnh chia sẻ</p><div className="flex flex-wrap gap-2"><Button type="button" variant="outline" onClick={chooseSocialImage}>Chọn ảnh</Button><Button type="button" variant="ghost" onClick={() => updateSeo("socialImage", "")}>Dùng ảnh bìa</Button></div><div className="mt-3 overflow-hidden rounded-lg border"><div className="aspect-video bg-[#f4f8fc]">{effective.socialImage && <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={effective.socialImage} alt="Xem trước ảnh chia sẻ" className="size-full object-cover" /></>}</div><div className="space-y-1 p-3"><p className="line-clamp-2 text-sm font-semibold">{effective.socialTitle || "Tiêu đề bài viết"}</p><p className="line-clamp-2 text-xs text-[#526f8e]">{effective.socialDescription || "Mô tả bài viết"}</p></div></div></div></div></details>
  </div>;
}
