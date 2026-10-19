"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Editor } from "@tiptap/react";
import Link from "next/link";
import { CheckCircle2, CircleAlert, Loader2, SlidersHorizontal, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArticleRichTextEditor } from "./ArticleRichTextEditor";
import { defaultSeo, seoChecks, type ArticleDocument } from "@/lib/articles/document";
import { saveStudioAction, versionsAction, assistArticleAction, listOutrosAction } from "./studio-actions";
import { MediaPicker } from "./MediaPicker";
import { StudioDialog } from "./StudioDialog";

const tasks = { outline: "Lập dàn ý", draft: "Viết bản nháp", rewrite: "Viết lại đoạn chọn", shorten: "Rút gọn đoạn chọn", expand: "Mở rộng đoạn chọn", metadata: "Tiêu đề SEO & mô tả", headings: "Gợi ý heading", faq: "Câu hỏi thường gặp", table: "Bảng so sánh", links: "Liên kết nội bộ", alt: "Alt theo mô tả ảnh" };
type Task = keyof typeof tasks;
type Proposal = { html: string; title: string; description: string; before: string; from: number; to: number; task: Task; source: string };
export function ArticleEditor(props: { id?: string; slug?: string; categories: string[]; initialHtml: string; initialTitle: string; initialDescription: string; initialCategory: string; initialImageUrl: string; initialDocument?: ArticleDocument; initialRevision?: number }) {
  const initial = useRef<ArticleDocument>(props.initialDocument ?? { title: props.initialTitle, slug: props.slug || "", html: props.initialHtml, intro: "", metaDescription: props.initialDescription, category: props.initialCategory || props.categories[0] || "", imageUrl: props.initialImageUrl, seo: defaultSeo() });
  const [doc, setDoc] = useState(initial.current); const latest = useRef(doc); latest.current = doc;
  const [id, setId] = useState(props.id); const idRef = useRef(props.id); const revision = useRef(props.initialRevision || 0);
  const [tab, setTab] = useState<"article" | "seo" | "ai">("article"); const [mobileSettings, setMobileSettings] = useState(false);
  const [error, setError] = useState(""); const [status, setStatus] = useState("Chưa có thay đổi"); const [saving, setSaving] = useState(false); const savingRef = useRef(false); const [blocked, setBlocked] = useState(false);
  const [media, setMedia] = useState<"cover" | "social" | null>(null); const [history, setHistory] = useState<Awaited<ReturnType<typeof versionsAction>> | null>(null);
  const [outros, setOutros] = useState<{ id: string; name: string }[]>([]);
  const [task, setTask] = useState<Task>("outline"); const [instruction, setInstruction] = useState(""); const [aiBusy, setAiBusy] = useState(false); const [proposal, setProposal] = useState<Proposal | null>(null);
  const editorRef = useRef<Editor | null>(null); const [editorKey, setEditorKey] = useState(0); const editorHtml = useRef(initial.current.html); const saved = useRef(JSON.stringify(initial.current));
  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  const settingsCloseRef = useRef<HTMLButtonElement>(null);
  const onReady = useCallback((editor: Editor) => { editorRef.current = editor; }, []);
  const update = (key: keyof ArticleDocument, value: string) => setDoc((d) => ({ ...d, [key]: value }));
  const updateSeo = (key: keyof ArticleDocument["seo"], value: string | boolean) => setDoc((d) => ({ ...d, seo: { ...d.seo, [key]: value } }));
  const save = useCallback(async (publish = false) => {
    if (savingRef.current) return;
    savingRef.current = true; setSaving(true); setError(""); setStatus(publish ? "Đang xuất bản…" : "Đang lưu bản nháp…");
    const snapshot = latest.current;
    try {
      const result = await saveStudioAction({ id: idRef.current, revision: revision.current, document: snapshot, publish });
      if (!result.ok) { setError(result.error); setStatus("Chưa lưu được"); setBlocked(true); return; }
      revision.current = result.revision; idRef.current = result.id; setId(result.id); saved.current = JSON.stringify(snapshot);
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
  const checks = seoChecks(doc);
  async function requestAi() {
    const editor = editorRef.current; const selection = editor?.state.selection; const from = selection?.from || 0; const to = selection?.to || 0;
    const selected = editor && from !== to ? editor.state.doc.textBetween(from, to, "\n") : "";
    if (["rewrite", "shorten", "expand"].includes(task) && !selected) { setError("Hãy chọn đoạn văn trong bài trước khi dùng chức năng này."); return; }
    const source = editor?.getHTML() || "";
    setAiBusy(true); setError("");
    try {
      const result = await assistArticleAction({ task, context: (selected || editor?.getText() || doc.title).slice(0, 24000), instruction, keyword: doc.seo.keyword });
      if (!result.ok) { setError(result.error); return; }
      setProposal({ ...result, before: selected || (task === "metadata" ? `${doc.seo.title}\n${doc.metaDescription}` : ""), from, to, task, source });
    } catch { setError("Không kết nối được AI. Bạn vẫn có thể tiếp tục viết."); } finally { setAiBusy(false); }
  }
  function applyProposal() {
    if (!proposal) return;
    if (proposal.task === "metadata") setDoc((d) => ({ ...d, metaDescription: proposal.description, seo: { ...d.seo, title: proposal.title } }));
    else {
      const editor = editorRef.current;
      if (!editor || editor.getHTML() !== proposal.source) { setError("Bài đã thay đổi sau khi gọi AI. Hãy tạo lại đề xuất để tránh thay nhầm đoạn."); return; }
      if (proposal.task === "alt") {
        if (editor.state.doc.nodeAt(proposal.from)?.type.name !== "image") { setError("Chọn ảnh cần áp dụng alt trước khi gọi AI."); return; }
        editor.chain().focus().setNodeSelection(proposal.from).updateAttributes("image", { alt: proposal.html.replace(/<[^>]+>/g, "").trim() }).run();
      } else if (["rewrite", "shorten", "expand"].includes(proposal.task)) editor.chain().focus().insertContentAt({ from: proposal.from, to: proposal.to }, proposal.html).run();
      else editor.chain().focus("end").insertContent(proposal.html).run();
    }
    setProposal(null);
  }
  const field = (key: "intro" | "metaDescription" | "slug", label: string, multiline = false) => <label className="block space-y-2 text-sm font-medium" htmlFor={key}>{label}{multiline ? <Textarea id={key} value={doc[key]} rows={3} onChange={(e) => update(key, e.target.value)} /> : <Input id={key} value={doc[key]} onChange={(e) => update(key, e.target.value)} />}</label>;
  const seoField = (key: "title" | "keyword" | "secondaryKeywords" | "canonical" | "socialTitle" | "socialDescription", label: string) => <label className="block space-y-2 text-sm font-medium" htmlFor={`seo-${key}`}>{label}<Input id={`seo-${key}`} value={doc.seo[key]} onChange={(e) => updateSeo(key, e.target.value)} /></label>;
  return <div className="space-y-4 text-[#173b5e]">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4"><p role="status" className="flex items-center gap-2 text-sm text-[#526f8e]">{saving && <Loader2 className="size-4 animate-spin" />}{status}</p><div className="flex flex-wrap gap-2">
      {id && <><Link href={`/admin/bai-viet/${id}/preview`} target="_blank" className="inline-flex items-center rounded-lg border px-3 text-sm">Xem bản đã lưu</Link><Button type="button" variant="outline" onClick={() => { versionsAction(id).then(setHistory).catch(() => setError("Không tải được lịch sử.")); }}>Lịch sử</Button></>}
      <Button type="button" variant="outline" disabled={saving} onClick={() => void save()}>Lưu nháp</Button><Button type="button" variant="cta" disabled={saving} onClick={() => void save(true)}>Xuất bản / Cập nhật</Button>
    </div></div>
    {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <Button ref={settingsButtonRef} type="button" variant="outline" className="lg:hidden" onClick={() => setMobileSettings(true)}><SlidersHorizontal className="mr-2 size-4" />Bài viết, SEO & AI</Button>
    <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0 space-y-4"><label className="block text-sm font-medium" htmlFor="article-title">Tiêu đề bài viết</label><Input id="article-title" placeholder="Đặt tiêu đề bài viết…" maxLength={180} value={doc.title} onChange={(e) => update("title", e.target.value)} className="h-12 text-lg font-semibold" />
        <ArticleRichTextEditor key={editorKey} initialHtml={editorHtml.current} onChange={(html) => setDoc((d) => ({ ...d, html }))} onReady={onReady} />
      </div>
      <aside className={`${mobileSettings ? "fixed inset-0 z-50 overflow-y-auto bg-white p-5" : "hidden"} min-w-0 lg:static lg:block lg:self-start lg:rounded-xl lg:border lg:p-4`} aria-label="Cài đặt bài viết" role={mobileSettings ? "dialog" : undefined} aria-modal={mobileSettings || undefined}>
        <div className="mb-4 flex items-center justify-between lg:hidden"><h2 className="font-semibold">Cài đặt bài viết</h2><Button ref={settingsCloseRef} type="button" variant="outline" onClick={() => setMobileSettings(false)}>Xong</Button></div>
        <div className="mb-5 flex border-b" role="tablist" aria-label="Bảng biên tập">{([['article', 'Bài viết'], ['seo', 'SEO'], ['ai', 'AI']] as const).map(([value, label]) => <button key={value} type="button" role="tab" aria-selected={tab === value} onClick={() => setTab(value)} className={`flex-1 px-3 py-3 text-sm font-semibold ${tab === value ? "border-b-2 border-green-600 text-green-700" : "text-[#526f8e]"}`}>{label}</button>)}</div>
        {tab === "article" && <div className="space-y-5">{field("intro", "Đoạn giới thiệu", true)}<label className="block space-y-2 text-sm font-medium">Danh mục<Select value={doc.category} onValueChange={(v) => { if (v) update("category", v); }}><SelectTrigger><SelectValue>{doc.category}</SelectValue></SelectTrigger><SelectContent>{props.categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></label>
          <div className="space-y-2"><p className="text-sm font-medium">Ảnh bìa</p>{doc.imageUrl && <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={doc.imageUrl.startsWith("https:") ? `/api/img?url=${encodeURIComponent(doc.imageUrl)}` : doc.imageUrl} alt="Ảnh bìa" className="aspect-video w-full rounded-lg object-cover" /></>}<div className="flex gap-2"><Button type="button" variant="outline" onClick={() => setMedia("cover")}>Chọn ảnh</Button>{doc.imageUrl && <Button type="button" variant="ghost" onClick={() => update("imageUrl", "")}>Gỡ ảnh</Button>}</div></div>
          <label className="block space-y-2 text-sm font-medium">Mẫu cuối bài<Select value={doc.seo.outro} onValueChange={(v) => { if (v) updateSeo("outro", v); }}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{outros.map((o) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}<SelectItem value="off">Không hiển thị</SelectItem></SelectContent></Select></label><Link href="/admin/bai-viet/mau-cuoi-bai" className="inline-block text-sm text-blue-700 underline">Quản lý mẫu cuối bài</Link>
        </div>}
        {tab === "seo" && <div className="space-y-5">{seoField("title", "Tiêu đề SEO (để trống dùng tiêu đề bài)")}{field("metaDescription", "Mô tả SEO", true)}{field("slug", "Đường dẫn bài viết")}<p className="text-xs text-[#526f8e]">Đổi URL khi xuất bản sẽ giữ chuyển hướng từ URL cũ.</p>{seoField("keyword", "Từ khóa chính")}{seoField("secondaryKeywords", "Từ khóa phụ")}
          <div className="rounded-lg bg-[#f4f8fc] p-3"><p className="text-xs">Xem trước tìm kiếm</p><p className="mt-2 truncate text-xs">winwinback.com/bai-viet/{doc.slug || "duong-dan"}</p><p className="mt-1 text-base text-blue-800">{doc.seo.title || doc.title || "Tiêu đề bài viết"}</p><p className="mt-1 line-clamp-3 text-sm">{doc.metaDescription || "Mô tả nội dung bài viết…"}</p></div>
          <div><h3 className="mb-2 text-sm font-semibold">Checklist · {checks.filter((c) => c.ok).length}/{checks.length}</h3><p className="mb-3 text-xs text-[#526f8e]">Gợi ý biên tập, không phải cam kết thứ hạng.</p><ul className="space-y-3">{checks.map((c) => <li key={c.text}><button type="button" className="flex gap-2 text-left text-xs leading-5" onClick={() => { setMobileSettings(false); const target = c.field === "keyword" ? "seo-keyword" : c.field; document.getElementById(target)?.focus(); if (target === "content") editorRef.current?.commands.focus(); }}>{c.ok ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-700" /> : <CircleAlert className="mt-0.5 size-4 shrink-0 text-amber-700" />}{c.text}</button></li>)}</ul></div>
          <details><summary className="cursor-pointer text-sm font-semibold">Chia sẻ mạng xã hội</summary><div className="mt-3 space-y-3">{seoField("socialTitle", "Tiêu đề chia sẻ")}{seoField("socialDescription", "Mô tả chia sẻ")}<Button type="button" variant="outline" onClick={() => setMedia("social")}>Chọn ảnh chia sẻ</Button><Button type="button" variant="ghost" onClick={() => updateSeo("socialImage", "")}>Dùng ảnh bìa</Button><div className="rounded-lg border p-3">{(doc.seo.socialImage || doc.imageUrl) && <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={doc.seo.socialImage || doc.imageUrl} alt="Xem trước ảnh chia sẻ" className="aspect-video w-full object-cover" /></>}<p className="mt-2 text-sm font-semibold">{doc.seo.socialTitle || doc.seo.title || doc.title}</p><p className="text-xs">{doc.seo.socialDescription || doc.metaDescription}</p></div></div></details>
          <details><summary className="cursor-pointer text-sm font-semibold">SEO nâng cao</summary><div className="mt-3 space-y-3">{seoField("canonical", "Canonical tùy chỉnh (HTTPS)")}<label className="flex gap-2 text-sm"><input type="checkbox" checked={doc.seo.noindex} onChange={(e) => updateSeo("noindex", e.target.checked)} />Không cho công cụ tìm kiếm lập chỉ mục</label></div></details>
        </div>}
        {tab === "ai" && <div className="space-y-4"><p className="text-sm leading-6">AI đề xuất, bạn quyết định. Kiểm tra lại dữ kiện trước khi xuất bản.</p><Select value={task} onValueChange={(v) => { if (v) setTask(v as Task); }}><SelectTrigger aria-label="Tác vụ AI"><SelectValue>{tasks[task]}</SelectValue></SelectTrigger><SelectContent>{Object.entries(tasks).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select><label className="block space-y-2 text-sm">Yêu cầu / thông tin nguồn<Textarea value={instruction} maxLength={4000} rows={6} onChange={(e) => setInstruction(e.target.value)} placeholder="Chủ đề, đối tượng đọc, dữ liệu chính xác cần dùng…" /></label><Button type="button" variant="cta" disabled={aiBusy} onClick={() => void requestAi()} className="w-full">{aiBusy ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Sparkles className="mr-2 size-4" />}{aiBusy ? "Đang tạo đề xuất…" : "Tạo đề xuất"}</Button><p className="text-xs text-[#526f8e]">Nội dung được gửi tới NVIDIA để xử lý. Không nhập thông tin cá nhân hoặc dữ liệu khách hàng.</p></div>}
      </aside>
    </div>
    {media && <MediaPicker onClose={() => setMedia(null)} onSelect={(url) => { if (media === "cover") update("imageUrl", url); else updateSeo("socialImage", url); }} />}
    {history && <StudioDialog title="Lịch sử phiên bản" onClose={() => setHistory(null)}><p className="mb-4 text-sm">Khôi phục vào bản nháp, không thay đổi bài công khai. Giữ 50 phiên bản gần nhất.</p><ul className="space-y-2">{history.map((v) => <li key={v.id} className="flex items-center justify-between gap-3 border-b py-3 text-sm"><span>{v.label}<br /><span className="text-xs">{new Date(v.createdAt).toLocaleString("vi-VN")}</span></span><Button type="button" variant="outline" onClick={() => { if (!window.confirm("Thay nội dung đang viết bằng phiên bản này?")) return; editorHtml.current = v.document.html; setDoc(v.document); setEditorKey((k) => k + 1); setHistory(null); }}>Khôi phục</Button></li>)}</ul></StudioDialog>}
    {proposal && <StudioDialog title={`Đề xuất AI · ${tasks[proposal.task]}`} onClose={() => setProposal(null)}><div className="space-y-4">{proposal.before && <div><h3 className="text-sm font-semibold">Trước</h3><p className="mt-2 whitespace-pre-wrap text-sm">{proposal.before}</p></div>}<div><h3 className="text-sm font-semibold">Đề xuất</h3>{proposal.task === "metadata" ? <div className="mt-2 text-sm"><p>{proposal.title}</p><p>{proposal.description}</p></div> : <div className="article-body mt-2 max-h-80 overflow-auto text-sm" dangerouslySetInnerHTML={{ __html: proposal.html }} />}</div><p className="text-xs">Nội dung mới được chèn cuối bài; chỉ thao tác sửa đoạn mới thay thế vùng đã chọn.</p><div className="flex gap-2"><Button type="button" variant="cta" onClick={applyProposal}>Áp dụng</Button><Button type="button" variant="outline" onClick={() => setProposal(null)}>Bỏ qua</Button></div></div></StudioDialog>}
  </div>;
}
