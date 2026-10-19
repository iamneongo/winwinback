"use client";
import { useEffect, useState } from "react";
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
  const [items, setItems] = useState<Media[]>([]); const [error, setError] = useState(""); const [busy, setBusy] = useState(false); const [query, setQuery] = useState("");
  async function removeUnused(item: Media) {
    if (!window.confirm(`Gỡ “${item.name}” khỏi thư viện ảnh?`)) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/article-media/${item.id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Không gỡ được ảnh.");
      setItems((current) => current.filter((image) => image.id !== item.id));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không gỡ được ảnh.");
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => { fetch("/api/article-media").then(async (r) => { if (!r.ok) throw new Error(); setItems(await r.json()); }).catch(() => setError("Không tải được thư viện ảnh.")); }, []);
  return <StudioDialog title="Thư viện ảnh" onClose={onClose}><div className="space-y-4"><p className="text-sm">JPEG, PNG, WebP hoặc AVIF · tối đa 10 MB. Ảnh được tối ưu khi tải lên.</p>
    <Input type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={busy} aria-label="Tải ảnh mới" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; setBusy(true); setError(""); try { const uploaded = await uploadArticleImage(file); onSelect(uploaded.url, file.name.replace(/\.[^.]+$/, "")); onClose(); } catch (err) { setError(err instanceof Error ? err.message : "Không tải được ảnh."); } finally { setBusy(false); } }} />
    {busy && <p role="status">Đang tối ưu và tải ảnh…</p>}{error && <p role="alert" className="text-sm text-red-700">{error}</p>}<Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm theo tên ảnh…" aria-label="Tìm ảnh" />
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{items.filter((item) => item.name.toLowerCase().includes(query.toLowerCase())).map((item) => <div key={item.id} className="min-w-0 overflow-hidden rounded-lg border p-2 text-xs"><button type="button" className="w-full text-left hover:bg-sky-50" onClick={() => { onSelect(`/api/article-media/${item.id}`, item.name.replace(/\.[^.]+$/, "")); onClose(); }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/api/article-media/${item.id}?thumb=1`} alt={item.name} className="mb-2 aspect-[3/2] w-full object-contain" loading="lazy" /><span className="block truncate">{item.name}</span><span>{item.width} × {item.height}</span></button><Button type="button" variant="ghost" size="sm" disabled={busy} className="mt-1 h-7 px-1 text-xs text-red-700" onClick={() => void removeUnused(item)}><Trash2 className="mr-1 size-3" />Gỡ ảnh</Button></div>)}</div>{!items.length && !error && <p className="text-sm">Chưa có ảnh. Tải ảnh đầu tiên để dùng lại cho các bài viết.</p>}
  </div></StudioDialog>;
}
