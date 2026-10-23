"use client";
import { useEffect, useState } from "react";
import { type Editor, useEditorState } from "@tiptap/react";
import ImageExtension from "@tiptap/extension-image";
import { mergeAttributes } from "@tiptap/core";
import type { DOMOutputSpec } from "@tiptap/pm/model";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StudioDialog } from "./StudioDialog";
import { MediaPicker } from "./MediaPicker";
import { searchArticleLinks } from "./studio-actions";

function imageElement(element: HTMLElement): HTMLImageElement | null {
  return element.tagName === "FIGURE"
    ? element.querySelector("img")
    : element instanceof HTMLImageElement ? element : null;
}

export const ArticleImage = ImageExtension.extend({
  parseHTML() {
    return [
      { tag: "figure", getAttrs: (element) => imageElement(element as HTMLElement)?.getAttribute("src") ? {} : false },
      { tag: this.options.allowBase64 ? "img[src]" : 'img[src]:not([src^="data:"])' },
    ];
  },
  addAttributes() {
    return {
      src: { default: null, parseHTML: (el) => imageElement(el)?.getAttribute("src") },
      alt: { default: null, parseHTML: (el) => imageElement(el)?.getAttribute("alt") },
      title: { default: null, parseHTML: (el) => imageElement(el)?.getAttribute("title") },
      width: { default: null, parseHTML: (el) => imageElement(el)?.getAttribute("width") },
      height: { default: null, parseHTML: (el) => imageElement(el)?.getAttribute("height") },
      caption: { default: "", parseHTML: (el) => el.closest("figure")?.querySelector("figcaption")?.textContent || "" },
      align: { default: "center", parseHTML: (el) => el.closest("figure")?.getAttribute("data-align") || "center" },
    };
  },
  renderHTML({ HTMLAttributes }): DOMOutputSpec {
    const { caption, align, ...attrs } = HTMLAttributes;
    return ["figure", { "data-align": align }, ["img", mergeAttributes(attrs)], ...(caption ? [["figcaption", {}, String(caption)] as DOMOutputSpec] : [])];
  },
});
export function EditorTools({ editor }: { editor: Editor }) {
  const [media, setMedia] = useState<"insert" | "replace" | null>(null);
  const [image, setImage] = useState<{ alt: string; caption: string; width: string; align: string } | null>(null);
  const [link, setLink] = useState<{ href: string; text: string; blank: boolean; nofollow: boolean; sponsored: boolean } | null>(null);
  const [search, setSearch] = useState(""); const [results, setResults] = useState<{ title: string; slug: string }[]>([]); const [error, setError] = useState("");
  const selection = useEditorState({ editor, selector: ({ editor: e }) => ({ table: e.isActive("table"), image: e.isActive("image"), position: e.state.selection.from }) });
  useEffect(() => { if (!link) return; let cancelled = false; const timer = setTimeout(() => { searchArticleLinks(search).then((r) => { if (!cancelled) setResults(r); }).catch(() => { if (!cancelled) setError("Không tìm được bài viết."); }); }, 300); return () => { cancelled = true; clearTimeout(timer); }; }, [search, link]);
  return <>
    <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap px-2 py-1 [&>button]:shrink-0">
      <Button type="button" variant="ghost" size="sm" onClick={() => { const a = editor.getAttributes("link"); setError(""); setLink({ href: a.href || "", text: editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to), blank: a.target === "_blank", nofollow: (a.rel || "").includes("nofollow"), sponsored: (a.rel || "").includes("sponsored") }); }}>Liên kết</Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => setMedia("insert")}>Thư viện ảnh</Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>Bảng so sánh</Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().insertContent('<blockquote><p><strong>Lưu ý:</strong> Nhập thông tin cần lưu ý.</p></blockquote>').run()}>Lưu ý</Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().insertContent('<p><strong>Tìm hiểu thêm trên Win-Win Back</strong></p><p><a href="/register">Bắt đầu mua sắm</a></p>').run()}>CTA</Button>
    </div>
    {selection?.table && <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap border-t border-[#e5edf6] px-2 py-1 [&>button]:shrink-0" aria-label="Chỉnh bảng">{([
      ["Thêm hàng", () => editor.chain().focus().addRowAfter().run()], ["Xóa hàng", () => editor.chain().focus().deleteRow().run()], ["Thêm cột", () => editor.chain().focus().addColumnAfter().run()], ["Xóa cột", () => editor.chain().focus().deleteColumn().run()], ["Gộp ô", () => editor.chain().focus().mergeCells().run()], ["Tách ô", () => editor.chain().focus().splitCell().run()], ["Hàng tiêu đề", () => editor.chain().focus().toggleHeaderRow().run()], ["Xóa bảng", () => editor.chain().focus().deleteTable().run()],
    ] as [string, () => boolean][]).map(([label, run]) => <Button key={label} type="button" variant="ghost" size="sm" onClick={run}>{label}</Button>)}</div>}
    {selection?.image && <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap border-t border-[#e5edf6] bg-[#f3f8fd] px-2 py-1 [&>button]:shrink-0" aria-label="Thao tác với ảnh đã chọn">
      <span className="px-1 text-xs font-semibold text-[#34527d]">Ảnh đã chọn</span>
      <Button type="button" variant="outline" size="sm" onMouseDown={(event) => event.preventDefault()} onClick={() => setMedia("replace")}>Đổi ảnh</Button>
      <Button type="button" variant="outline" size="sm" onMouseDown={(event) => event.preventDefault()} onClick={() => { const a = editor.getAttributes("image"); setImage({ alt: a.alt || "", caption: a.caption || "", width: String(a.width || ""), align: a.align || "center" }); }}>Sửa alt, chú thích & kích thước</Button>
      <Button type="button" variant="ghost" size="sm" className="text-red-700 hover:text-red-800" onMouseDown={(event) => event.preventDefault()} onClick={() => editor.chain().focus().deleteSelection().run()}>Gỡ khỏi bài</Button>
    </div>}
    {media && <MediaPicker onClose={() => setMedia(null)} onSelect={(url, name) => { if (media === "replace") editor.chain().focus().updateAttributes("image", { src: url, alt: name }).run(); else editor.chain().focus().setImage({ src: url, alt: name }).run(); setMedia(null); }} />}
    {image && <StudioDialog title="Thông tin ảnh" onClose={() => setImage(null)}><div className="space-y-3">{([['alt', 'Văn bản thay thế'], ['caption', 'Chú thích'], ['width', 'Chiều rộng (px)']] as const).map(([key, label]) => <label key={key} className="block text-sm">{label}<Input value={image[key]} onChange={(e) => setImage({ ...image, [key]: e.target.value })} /></label>)}<label className="block text-sm">Căn ảnh<select className="ml-2 rounded border p-2" value={image.align} onChange={(e) => setImage({ ...image, align: e.target.value })}><option value="left">Trái</option><option value="center">Giữa</option><option value="right">Phải</option></select></label><Button type="button" onClick={() => { editor.chain().focus().updateAttributes("image", { ...image, width: image.width ? Math.min(1800, Math.max(80, Number(image.width) || 800)) : null }).run(); setImage(null); }}>Áp dụng</Button></div></StudioDialog>}
    {link && <StudioDialog title="Chèn liên kết" onClose={() => setLink(null)}><div className="space-y-3"><label className="block text-sm">Văn bản liên kết<Input value={link.text} onChange={(e) => setLink({ ...link, text: e.target.value })} /></label><label className="block text-sm">Đường dẫn<Input value={link.href} onChange={(e) => setLink({ ...link, href: e.target.value })} placeholder="https://… hoặc /bai-viet/…" /></label>{([['blank', 'Mở tab mới'], ['nofollow', 'Nofollow'], ['sponsored', 'Liên kết quảng cáo / affiliate']] as const).map(([key, label]) => <label key={key} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={link[key]} onChange={(e) => setLink({ ...link, [key]: e.target.checked })} />{label}</label>)}<Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm bài nội bộ…" aria-label="Tìm bài nội bộ" /><ul className="max-h-40 overflow-auto">{results.map((r) => <li key={r.slug}><button type="button" className="w-full p-2 text-left text-sm hover:bg-sky-50" onClick={() => setLink({ ...link, href: `/bai-viet/${r.slug}`, text: link.text || r.title })}>{r.title}</button></li>)}</ul>{error && <p role="alert" className="text-red-700">{error}</p>}<div className="flex gap-2"><Button type="button" onClick={() => { if (!/^(https?:\/\/|mailto:|\/(?!\/))/.test(link.href)) { setError("Liên kết không hợp lệ."); return; } const attrs = { href: link.href, target: link.blank ? "_blank" : null, rel: [link.blank && "noopener noreferrer", link.nofollow && "nofollow", link.sponsored && "sponsored"].filter(Boolean).join(" ") || null }; editor.chain().focus().extendMarkRange("link").insertContent({ type: "text", text: link.text || link.href, marks: [{ type: "link", attrs }] }).run(); setLink(null); }}>Áp dụng</Button><Button type="button" variant="outline" onClick={() => { editor.chain().focus().extendMarkRange("link").unsetLink().run(); setLink(null); }}>Gỡ liên kết</Button></div></div></StudioDialog>}
  </>;
}
