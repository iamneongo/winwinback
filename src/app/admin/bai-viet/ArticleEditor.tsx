"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Editor } from "@tiptap/react";
import Link from "next/link";
import { Loader2, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArticleRichTextEditor } from "./ArticleRichTextEditor";
import { defaultSeo, type ArticleDocument, type ArticleSeo } from "@/lib/articles/document";
import { saveStudioAction, versionsAction, listOutrosAction } from "./studio-actions";
import { MediaPicker } from "./MediaPicker";
import { StudioDialog } from "./StudioDialog";
import { SeoPanel } from "./SeoPanel";
import { previewSeoTemplateAction } from "./seo-actions";

export function ArticleEditor(props: { id?: string; slug?: string; manual?: boolean; categories: string[]; initialHtml: string; initialTitle: string; initialDescription: string; initialCategory: string; initialImageUrl: string; initialDocument?: ArticleDocument; initialRevision?: number; initialPublished?: boolean }) {
  const initial = useRef<ArticleDocument>(props.initialDocument ?? { title: props.initialTitle, slug: props.slug || "", html: props.initialHtml, intro: "", metaDescription: props.initialDescription, category: props.initialCategory || props.categories[0] || "", imageUrl: props.initialImageUrl, seo: defaultSeo() });
  const [doc, setDoc] = useState(initial.current); const latest = useRef(doc); latest.current = doc;
  const [id, setId] = useState(props.id); const idRef = useRef(props.id); const revision = useRef(props.initialRevision || 0);
  const [tab, setTab] = useState<"article" | "seo">("article"); const [mobileSettings, setMobileSettings] = useState(false);
  const [published, setPublished] = useState(props.initialPublished ?? false);
  const [error, setError] = useState(""); const [status, setStatus] = useState("Chưa có thay đổi"); const [saving, setSaving] = useState(false); const savingRef = useRef(false); const [blocked, setBlocked] = useState(false);
  const [media, setMedia] = useState<"cover" | "social" | null>(null); const [history, setHistory] = useState<Awaited<ReturnType<typeof versionsAction>> | null>(null);
  const [outros, setOutros] = useState<{ id: string; name: string }[]>([]);
  const [templatePreview, setTemplatePreview] = useState<{ key: string; title: string; description: string } | null>(null);
  const editorRef = useRef<Editor | null>(null); const [editorKey, setEditorKey] = useState(0); const editorHtml = useRef(initial.current.html); const saved = useRef(JSON.stringify(initial.current));
  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  const settingsCloseRef = useRef<HTMLButtonElement>(null);
  const onReady = useCallback((editor: Editor) => { editorRef.current = editor; }, []);
  const update = (key: keyof ArticleDocument, value: string) => setDoc((d) => ({ ...d, [key]: value }));
  const updateSeo = <K extends keyof ArticleSeo>(key: K, value: ArticleSeo[K]) => setDoc((d) => ({ ...d, seo: { ...d.seo, [key]: value } }));
  const save = useCallback(async (publish = false) => {
    if (savingRef.current) return;
    savingRef.current = true; setSaving(true); setError(""); setStatus(publish ? "Đang xuất bản…" : "Đang lưu bản nháp…");
    const snapshot = latest.current;
    try {
      const result = await saveStudioAction({ id: idRef.current, revision: revision.current, document: snapshot, publish });
      if (!result.ok) { setError(result.error); setStatus("Chưa lưu được"); setBlocked(true); return; }
      revision.current = result.revision; idRef.current = result.id; setId(result.id); saved.current = JSON.stringify(snapshot);
      if (publish) setPublished(true);
      setStatus(publish ? "Đã xuất bản" : "Đã lưu bản nháp"); setBlocked(false);
    } catch { setError("Không lưu được. Nội dung vẫn nằm trong trình soạn thảo; hãy thử lại."); setStatus("Chưa lưu được"); setBlocked(true); }
    finally { savingRef.current = false; setSaving(false); }
  }, []);
  useEffect(() => { if (blocked || saving || JSON.stringify(doc) === saved.current) return; const timer = setTimeout(() => void save(), 1800); return () => clearTimeout(timer); }, [doc, saving, blocked, save]);
  useEffect(() => { const handler = (event: BeforeUnloadEvent) => { if (JSON.stringify(latest.current) !== saved.current) { event.preventDefault(); event.returnValue = ""; } }; window.addEventListener("beforeunload", handler); return () => window.removeEventListener("beforeunload", handler); }, []);
  useEffect(() => { listOutrosAction().then(setOutros).catch(() => setError("Không tải được mẫu cuối bài. Hãy kiểm tra migration.")); }, []);
  useEffect(() => {
    if (!mobileSettings) return;
    const previousOverflow = document.body.style.overflow;
    const returnFocus = settingsButtonRef.current;
    document.body.style.overflow = "hidden";
    settingsCloseRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setMobileSettings(false); };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      returnFocus?.focus();
    };
  }, [mobileSettings]);
  const field = (key: "intro" | "metaDescription" | "slug", label: string, multiline = false) => <label className="block space-y-2 text-sm font-medium" htmlFor={key}>{label}{multiline ? <Textarea id={key} value={doc[key]} rows={3} onChange={(e) => update(key, e.target.value)} /> : <Input id={key} value={doc[key]} onChange={(e) => update(key, e.target.value)} />}</label>;
  return <div className="space-y-4 text-[#173b5e]">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4"><p role="status" className="flex items-center gap-2 text-sm text-[#526f8e]">{saving && <Loader2 className="size-4 animate-spin" />}{status}</p><div className="flex flex-wrap gap-2">
      {id && <><Link href={`/admin/bai-viet/${id}/preview`} target="_blank" className="inline-flex items-center rounded-lg border px-3 text-sm">Xem bản đã lưu</Link><Button type="button" variant="outline" onClick={() => { versionsAction(id).then(setHistory).catch(() => setError("Không tải được lịch sử.")); }}>Lịch sử</Button></>}
      <Button type="button" variant="outline" disabled={saving} onClick={() => void save()}>Lưu nháp</Button><Button type="button" variant="cta" disabled={saving} onClick={() => void save(true)}>Xuất bản / Cập nhật</Button>
    </div></div>
    {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <Button ref={settingsButtonRef} type="button" variant="outline" className="lg:hidden" onClick={() => setMobileSettings(true)}><SlidersHorizontal className="mr-2 size-4" />Bài viết & SEO</Button>
    <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0 space-y-4"><label className="block text-sm font-medium" htmlFor="article-title">Tiêu đề bài viết</label><Input id="article-title" placeholder="Đặt tiêu đề bài viết…" maxLength={180} value={doc.title} onChange={(e) => update("title", e.target.value)} className="h-12 text-lg font-semibold" />
        <ArticleRichTextEditor key={editorKey} initialHtml={editorHtml.current} onChange={(html) => setDoc((d) => ({ ...d, html }))} onReady={onReady} />
      </div>
      <aside className={`${mobileSettings ? "fixed inset-0 z-50 overflow-y-auto bg-white p-5" : "hidden"} min-w-0 lg:static lg:block lg:self-start lg:rounded-xl lg:border lg:p-4`} aria-label="Cài đặt bài viết" role={mobileSettings ? "dialog" : undefined} aria-modal={mobileSettings || undefined}>
        <div className="mb-4 flex items-center justify-between lg:hidden"><h2 className="font-semibold">Cài đặt bài viết</h2><Button ref={settingsCloseRef} type="button" variant="outline" onClick={() => setMobileSettings(false)}>Xong</Button></div>
        <div className="mb-5 flex border-b" role="tablist" aria-label="Bảng biên tập">{([['article', 'Bài viết'], ['seo', 'SEO']] as const).map(([value, label]) => <button key={value} type="button" role="tab" aria-selected={tab === value} onClick={() => setTab(value)} className={`flex-1 px-3 py-3 text-sm font-semibold ${tab === value ? "border-b-2 border-green-600 text-green-700" : "text-[#526f8e]"}`}>{label}</button>)}</div>
        {tab === "article" && <div className="space-y-5">{field("intro", "Đoạn giới thiệu", true)}<label className="block space-y-2 text-sm font-medium">Danh mục<Select value={doc.category} onValueChange={(v) => { if (v) update("category", v); }}><SelectTrigger><SelectValue>{doc.category}</SelectValue></SelectTrigger><SelectContent>{props.categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></label>
          <div className="space-y-2"><p className="text-sm font-medium">Ảnh bìa</p>{doc.imageUrl && <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={doc.imageUrl.startsWith("https:") ? `/api/img?url=${encodeURIComponent(doc.imageUrl)}` : doc.imageUrl} alt="Ảnh bìa" className="aspect-video w-full rounded-lg object-cover" /></>}<div className="flex gap-2"><Button type="button" variant="outline" onClick={() => setMedia("cover")}>Chọn ảnh</Button>{doc.imageUrl && <Button type="button" variant="ghost" onClick={() => update("imageUrl", "")}>Gỡ ảnh</Button>}</div></div>
          <label className="block space-y-2 text-sm font-medium">Mẫu cuối bài<Select value={doc.seo.outro} onValueChange={(v) => { if (v) updateSeo("outro", v); }}><SelectTrigger><SelectValue>{doc.seo.outro === "off" ? "Không hiển thị" : outros.find((o) => o.id === doc.seo.outro)?.name || "Mẫu thương hiệu mặc định"}</SelectValue></SelectTrigger><SelectContent>{outros.map((o) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}<SelectItem value="off">Không hiển thị</SelectItem></SelectContent></Select></label><Link href="/admin/bai-viet/mau-cuoi-bai" className="inline-block text-sm text-blue-700 underline">Quản lý mẫu cuối bài</Link>
        </div>}
        {tab === "seo" && <div className="space-y-4"><SeoPanel key={editorKey} doc={doc} published={published} update={update} updateSeo={updateSeo} chooseSocialImage={() => setMedia("social")} focusEditor={() => { setMobileSettings(false); requestAnimationFrame(() => editorRef.current?.commands.focus()); }} /><Button type="button" variant="outline" className="w-full" onClick={() => { previewSeoTemplateAction({ document: doc, manual: props.manual ?? !props.id }).then((value) => { if (value) setTemplatePreview(value); else setError("Chưa có mẫu SEO cho danh mục hoặc loại bài này."); }).catch(() => setError("Không tải được mẫu SEO.")); }}>Xem mẫu SEO phù hợp</Button></div>}
      </aside>
    </div>
    {media && <MediaPicker onClose={() => setMedia(null)} onSelect={(url) => { if (media === "cover") update("imageUrl", url); else updateSeo("socialImage", url); }} />}
    {templatePreview && <StudioDialog title="Áp dụng mẫu SEO" onClose={() => setTemplatePreview(null)}><div className="space-y-4 text-sm"><p>Mẫu: {templatePreview.key}. Chỉ thay tiêu đề SEO và meta description sau khi bạn xác nhận.</p><p className="rounded-lg bg-[#f3f7fc] p-3"><strong>Tiêu đề:</strong> {templatePreview.title}<br /><strong>Mô tả:</strong> {templatePreview.description}</p><div className="flex gap-2"><Button type="button" variant="cta" onClick={() => { setDoc((d) => ({ ...d, metaDescription: templatePreview.description, seo: { ...d.seo, title: templatePreview.title } })); setTemplatePreview(null); }}>Áp dụng</Button><Button type="button" variant="outline" onClick={() => setTemplatePreview(null)}>Bỏ qua</Button></div></div></StudioDialog>}
    {history && <StudioDialog title="Lịch sử phiên bản" onClose={() => setHistory(null)}><p className="mb-4 text-sm">Khôi phục vào bản nháp, không thay đổi bài công khai. Giữ 50 phiên bản gần nhất.</p><ul className="space-y-2">{history.map((v) => <li key={v.id} className="flex items-center justify-between gap-3 border-b py-3 text-sm"><span>{v.label}<br /><span className="text-xs">{new Date(v.createdAt).toLocaleString("vi-VN")}</span></span><Button type="button" variant="outline" onClick={() => { if (!window.confirm("Thay nội dung đang viết bằng phiên bản này?")) return; editorHtml.current = v.document.html; setDoc(v.document); setEditorKey((k) => k + 1); setHistory(null); }}>Khôi phục</Button></li>)}</ul></StudioDialog>}
  </div>;
}
