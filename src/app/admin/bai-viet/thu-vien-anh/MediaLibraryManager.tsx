"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ImagePlus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadArticleImage } from "../MediaPicker";

type Media = { id: string; name: string; width: number; height: number; bytes: number; createdAt: string };
type Usage = { kind: "article" | "draft" | "version" | "outro"; id: string; label: string; href: string; blocksRemoval: boolean };

const usageLabels: Record<Usage["kind"], string> = {
  article: "Bài đã lưu",
  draft: "Bản nháp",
  version: "Lịch sử",
  outro: "Mẫu cuối bài",
};

export function MediaLibraryManager({ initialId = null }: { initialId?: string | null }) {
  const [items, setItems] = useState<Media[]>([]);
  const [selectedRemote, setSelectedRemote] = useState<Media | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(initialId);
  const [usage, setUsage] = useState<Usage[]>([]);
  const [usageId, setUsageId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingUsage, setLoadingUsage] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => { setLoading(true); fetch(`/api/article-media?manage=1&page=${page}&q=${encodeURIComponent(query)}`).then(async (response) => {
      if (!response.ok) throw new Error("Không tải được thư viện ảnh.");
      const result = await response.json() as { items: Media[]; total: number };
      if (active) { setItems(result.items); setTotal(result.total); }
    }).catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Không tải được thư viện ảnh."); })
      .finally(() => { if (active) setLoading(false); }); }, query ? 250 : 0);
    return () => { active = false; clearTimeout(timer); };
  }, [query, page, reloadKey]);

  useEffect(() => {
    if (!selectedId) return;
    let active = true;
    setLoadingUsage(true);
    setUsage([]);
    setUsageId(null);
    fetch(`/api/article-media/${selectedId}?usage=1`).then(async (response) => {
      const result = await response.json() as { media?: Media; usage?: Usage[]; error?: string };
      if (!response.ok) throw new Error(result.error || "Không kiểm tra được nơi sử dụng ảnh.");
      if (active) { setSelectedRemote(result.media || null); setUsage(result.usage || []); setUsageId(selectedId); }
    }).catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Không kiểm tra được nơi sử dụng ảnh."); })
      .finally(() => { if (active) setLoadingUsage(false); });
    return () => { active = false; };
  }, [selectedId]);

  const selected = items.find((item) => item.id === selectedId) || (selectedRemote?.id === selectedId ? selectedRemote : undefined);
  const usageReady = !!selected && usageId === selected.id && !loadingUsage;
  const activeUsage = usage.filter((reference) => reference.blocksRemoval);

  async function upload(file: File | undefined) {
    if (!file) return;
    setBusy(true); setError("");
    try {
      const result = await uploadArticleImage(file);
      const id = result.url.split("/").pop();
      setQuery(""); setPage(1); setReloadKey((value) => value + 1);
      if (id) { setUsage([]); setUsageId(null); setSelectedId(id); }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không tải được ảnh.");
    } finally { setBusy(false); }
  }

  async function remove() {
    if (!selected || !usageReady || activeUsage.length) return;
    const historyNotice = usage.length ? " Ảnh vẫn được giữ trên volume để các phiên bản cũ có thể khôi phục." : "";
    if (!window.confirm(`Gỡ “${selected.name}” khỏi thư viện?${historyNotice}`)) return;
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/article-media/${selected.id}`, { method: "DELETE" });
      const result = await response.json() as { error?: string; usage?: Usage[] };
      if (!response.ok) {
        if (result.usage) setUsage(result.usage);
        throw new Error(result.error || "Không gỡ được ảnh.");
      }
      setItems((current) => current.filter((item) => item.id !== selected.id));
      setSelectedId(null);
      setSelectedRemote(null); setUsage([]); setUsageId(null); setReloadKey((value) => value + 1);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không gỡ được ảnh.");
    } finally { setBusy(false); }
  }

  return <div className="space-y-4">
    <div className="flex flex-wrap items-center gap-3">
      <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-lg bg-[#e9f6db] px-4 text-sm font-semibold text-[#1b6130] hover:bg-[#d9efc6] focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#287be5]">
        <ImagePlus className="size-4" /> Tải ảnh lên
        <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" disabled={busy} onChange={(event) => { void upload(event.target.files?.[0]); event.target.value = ""; }} />
      </label>
      <div className="relative min-w-[220px] flex-1 sm:max-w-sm"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#58749a]" /><Input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Tìm theo tên ảnh…" aria-label="Tìm theo tên ảnh" className="pl-9" /></div>
      <span className="text-sm text-[#526f8e]">{total} ảnh</span>
    </div>
    <p className="text-sm text-[#526f8e]">JPEG, PNG, WebP hoặc AVIF · tối đa 10 MB. Ảnh được tối ưu khi tải lên.</p>
    {busy && <p role="status" className="text-sm text-[#34527d]">Đang xử lý ảnh…</p>}
    {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0">
        {loading ? <p role="status" className="rounded-lg bg-[#f4f8fc] p-5 text-sm">Đang tải thư viện ảnh…</p> : items.length ?
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">{items.map((item) => <button key={item.id} type="button" aria-pressed={selectedId === item.id} onClick={() => { setError(""); setUsage([]); setUsageId(null); setSelectedRemote(null); setSelectedId(item.id); }} className={`min-w-0 overflow-hidden rounded-lg border bg-white p-2 text-left transition-colors hover:bg-[#f4f8fc] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#287be5] ${selectedId === item.id ? "border-[#287be5] bg-[#f4f8fc]" : "border-[#dfe9f5]"}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/api/article-media/${item.id}?thumb=1`} alt="" className="aspect-[4/3] w-full rounded-md bg-[#f4f8fc] object-contain" loading="lazy" />
            <span className="mt-2 block truncate text-sm font-medium text-[#173b5e]" title={item.name}>{item.name}</span>
            <span className="text-xs text-[#58749a]">{item.width} × {item.height}</span>
          </button>)}</div> : <p className="rounded-lg bg-[#f4f8fc] p-5 text-sm text-[#526f8e]">{total ? "Không có ảnh ở trang này." : query ? "Không có ảnh trùng tên tìm kiếm." : "Thư viện chưa có ảnh. Tải ảnh đầu tiên để dùng trong bài viết."}</p>}
        {total > 24 && <div className="mt-4 flex items-center justify-between gap-3 text-sm"><span className="text-[#526f8e]">Trang {page} / {Math.ceil(total / 24)}</span><div className="flex gap-2"><Button type="button" variant="outline" size="sm" disabled={page <= 1 || loading} onClick={() => setPage((value) => value - 1)}>Trước</Button><Button type="button" variant="outline" size="sm" disabled={page >= Math.ceil(total / 24) || loading} onClick={() => setPage((value) => value + 1)}>Sau</Button></div></div>}
      </div>
      <aside className="min-w-0 rounded-lg border border-[#dfe9f5] bg-white p-4 lg:self-start" aria-label="Chi tiết ảnh">
        {selected ? <div className="space-y-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/api/article-media/${selected.id}?thumb=1`} alt={selected.name} className="aspect-video w-full rounded-md bg-[#f4f8fc] object-contain" />
          <div><h2 className="break-words text-sm font-semibold text-[#173b5e]">{selected.name}</h2><p className="mt-1 text-xs text-[#526f8e]">{selected.width} × {selected.height} px · {(selected.bytes / 1024).toFixed(0)} KB</p></div>
          <div className="border-t border-[#e5edf6] pt-3"><h3 className="text-sm font-semibold text-[#173b5e]">Nơi sử dụng</h3>
            {loadingUsage ? <p className="mt-2 text-xs text-[#526f8e]">Đang kiểm tra…</p> : usage.length ? <ul className="mt-2 space-y-2">{usage.map((reference, index) => <li key={`${reference.kind}-${reference.id}-${index}`} className="text-xs"><span className="font-semibold text-[#34527d]">{usageLabels[reference.kind]}: </span><Link href={reference.href} className="text-[#1261ed] underline underline-offset-2">{reference.label}</Link></li>)}</ul> : <p className="mt-2 text-xs text-[#526f8e]">Không thấy ảnh trong nội dung hiện tại hoặc lịch sử.</p>}
          </div>
          {activeUsage.length ? <p className="text-xs text-[#526f8e]">Gỡ ảnh khỏi các vị trí trên rồi lưu bài trước khi gỡ khỏi thư viện.</p> : usage.length ? <p className="text-xs text-[#526f8e]">Chỉ còn trong lịch sử. Có thể gỡ khỏi thư viện; file gốc vẫn được giữ để khôi phục phiên bản.</p> : null}
          <Button type="button" variant="outline" size="sm" className="w-full text-red-700" disabled={busy || !usageReady || activeUsage.length > 0} onClick={() => void remove()}><Trash2 className="mr-2 size-4" />Gỡ khỏi thư viện</Button>
        </div> : <p className="text-sm text-[#526f8e]">Chọn một ảnh để xem nơi đang sử dụng và quản lý.</p>}
      </aside>
    </div>
  </div>;
}
