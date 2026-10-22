"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { StudioDialog } from "./StudioDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
type Media = { id: string; name: string; width: number; height: number };
export async function uploadArticleImage(file: File): Promise<{ url: string; width: number; height: number }> {
  if (file.size > 10 * 1024 * 1024) throw new Error("Ảnh tối đa 10 MB.");
  const data = new FormData(); data.set("file", file);
  const response = await fetch("/api/article-media", { method: "POST", body: data });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Không tải được ảnh.");
  return result;
}
export function MediaPicker({ onSelect, onClose }: { onSelect: (url: string, name: string) => void; onClose: () => void }) {
  const [items, setItems] = useState<Media[]>([]);
  const [error, setError] = useState("");
  const [blockedId, setBlockedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  async function removeUnused(item: Media) {
    if (!window.confirm(`Gỡ “${item.name}” khỏi thư viện ảnh?`)) return;
    setBusy(true);
    setError(""); setBlockedId(null);
    try {
      const response = await fetch(`/api/article-media/${item.id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) {
        if (response.status === 409) setBlockedId(item.id);
        throw new Error(result.error || "Không gỡ được ảnh.");
      }
      setItems((current) => current.filter((image) => image.id !== item.id));
      setTotal((current) => Math.max(0, current - 1));
      if (items.length === 1 && page > 1) setPage(page - 1);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không gỡ được ảnh.");
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    let active = true;
    setLoading(true);
    const timer = setTimeout(() => {
      fetch(`/api/article-media?manage=1&page=${page}&q=${encodeURIComponent(query)}`).then(async (response) => {
        if (!response.ok) throw new Error("Không tải được thư viện ảnh.");
        const result = await response.json() as { items: Media[]; total: number };
        if (active) { setItems(result.items); setTotal(result.total); }
      }).catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Không tải được thư viện ảnh."); })
        .finally(() => { if (active) setLoading(false); });
    }, query ? 250 : 0);
    return () => { active = false; clearTimeout(timer); };
  }, [page, query]);
  return <StudioDialog title="Thư viện ảnh" onClose={onClose}><div className="space-y-4"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm">JPEG, PNG, WebP hoặc AVIF · tối đa 10 MB. Ảnh được tối ưu khi tải lên.</p><Link href="/admin/bai-viet/thu-vien-anh" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-[#1261ed] underline underline-offset-2">Quản lý thư viện ảnh</Link></div>
    <Input type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={busy} aria-label="Tải ảnh mới" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; setBusy(true); setError(""); try { const uploaded = await uploadArticleImage(file); onSelect(uploaded.url, file.name.replace(/\.[^.]+$/, "")); onClose(); } catch (err) { setError(err instanceof Error ? err.message : "Không tải được ảnh."); } finally { setBusy(false); } }} />
    {busy && <p role="status">Đang tối ưu và tải ảnh…</p>}{error && <p role="alert" className="text-sm text-red-700">{error}{blockedId && <> <Link href={`/admin/bai-viet/thu-vien-anh?anh=${blockedId}`} target="_blank" rel="noopener noreferrer" className="font-semibold underline">Xem nơi sử dụng</Link></>}</p>}<Input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Tìm theo tên ảnh…" aria-label="Tìm ảnh" />
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{items.map((item) => <div key={item.id} className="min-w-0 overflow-hidden rounded-lg border p-2 text-xs"><button type="button" className="w-full text-left hover:bg-sky-50" onClick={() => { onSelect(`/api/article-media/${item.id}`, item.name.replace(/\.[^.]+$/, "")); onClose(); }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/api/article-media/${item.id}?thumb=1`} alt={item.name} className="mb-2 aspect-[3/2] w-full object-contain" loading="lazy" /><span className="block truncate">{item.name}</span><span>{item.width} × {item.height}</span></button><Button type="button" variant="ghost" size="sm" disabled={busy} className="mt-1 h-7 px-1 text-xs text-red-700" onClick={() => void removeUnused(item)}><Trash2 className="mr-1 size-3" />Gỡ ảnh</Button></div>)}</div>
    {loading && <p role="status" className="text-sm">Đang tải ảnh…</p>}
    {!loading && !items.length && !error && <p className="text-sm">{query ? "Không tìm thấy ảnh phù hợp." : "Chưa có ảnh. Tải ảnh đầu tiên để dùng lại cho các bài viết."}</p>}
    {total > 24 && <div className="flex items-center justify-between gap-2 text-sm"><span>Trang {page} / {Math.ceil(total / 24)}</span><div className="flex gap-2"><Button type="button" variant="outline" size="sm" disabled={page <= 1 || loading} onClick={() => setPage((value) => value - 1)}>Trước</Button><Button type="button" variant="outline" size="sm" disabled={page >= Math.ceil(total / 24) || loading} onClick={() => setPage((value) => value + 1)}>Sau</Button></div></div>}
  </div></StudioDialog>;
}
