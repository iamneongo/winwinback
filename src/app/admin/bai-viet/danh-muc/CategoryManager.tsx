"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ManagedCategory } from "@/lib/articles/category-service";
import { createCategoryAction, deleteCategoryAction, renameCategoryAction } from "../actions";

export function CategoryManager({ categories }: { categories: ManagedCategory[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [destination, setDestination] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, startTransition] = useTransition();

  function run(task: () => Promise<{ ok: boolean; error?: string; moved?: number }>, onSuccess: (moved?: number) => void) {
    setError("");
    setNotice("");
    startTransition(async () => {
      try {
        const result = await task();
        if (!result.ok) { setError(result.error ?? "Không lưu được thay đổi."); return; }
        onSuccess(result.moved);
        router.refresh();
      } catch { setError("Có lỗi xảy ra. Vui lòng thử lại."); }
    });
  }

  return <div className="space-y-5">
    <form onSubmit={(event) => { event.preventDefault(); run(() => createCategoryAction(name), () => { setName(""); setNotice("Đã thêm danh mục."); }); }} className="flex flex-col gap-2 sm:flex-row">
      <label htmlFor="new-category" className="sr-only">Tên danh mục mới</label>
      <Input id="new-category" value={name} onChange={(event) => setName(event.target.value)} maxLength={80} placeholder="Tên danh mục mới" required className="h-10 max-w-md border-[#cddced]" />
      <Button type="submit" variant="cta" disabled={pending || !name.trim()} className="min-h-10 gap-2 px-4 font-bold text-[#173b5e]"><Plus className="size-4" /> Thêm danh mục</Button>
    </form>
    {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
    {notice && <p role="status" className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">{notice}</p>}
    <div className="overflow-hidden rounded-xl border border-[#dfe9f5] bg-white">
      <ul className="divide-y divide-[#e8eef6]">
        {categories.map((category) => <li key={category.name} className="px-4 py-3 sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {editing === category.name ? <form onSubmit={(event) => { event.preventDefault(); run(() => renameCategoryAction(category.name, editName), () => { setEditing(null); setNotice("Đã đổi tên danh mục và cập nhật các bài viết."); }); }} className="flex min-w-0 flex-1 flex-wrap gap-2"><label htmlFor="edit-category" className="sr-only">Tên danh mục</label><Input id="edit-category" value={editName} onChange={(event) => setEditName(event.target.value)} maxLength={80} required className="h-9 max-w-sm border-[#cddced]" /><Button type="submit" disabled={pending} className="h-9">Lưu</Button><Button type="button" variant="ghost" onClick={() => setEditing(null)} className="h-9"><X className="size-4" /> Hủy</Button></form>
              : <div className="min-w-0"><p className="font-bold text-[#11335e]">{category.name}</p><p className="text-xs text-[#58749a]">{category.count} bài viết</p></div>}
            {editing !== category.name && <div className="flex gap-1"><Button type="button" variant="ghost" onClick={() => { setEditing(category.name); setEditName(category.name); setDeleting(null); }} className="h-9 gap-1.5 text-[#234568]"><Pencil className="size-4" /> Sửa</Button><Button type="button" variant="ghost" onClick={() => { setDeleting(deleting === category.name ? null : category.name); setDestination(""); setEditing(null); }} className="h-9 gap-1.5 text-red-700 hover:bg-red-50"><Trash2 className="size-4" /> Xóa</Button></div>}
          </div>
          {deleting === category.name && <div className="mt-4 rounded-xl border border-[#dfe9f5] bg-[#f7fafc] p-4 text-sm text-[#234568]">
            <p className="font-bold text-[#11335e]">Xóa danh mục “{category.name}”?</p>
            {category.count > 0 ? <>
              <p className="mt-1 text-[#58749a]">{category.count} bài viết sẽ được chuyển sang danh mục bạn chọn trước khi xóa.</p>
              <div className="mt-4 max-w-md">
                <label htmlFor="move-category" className="mb-1.5 block text-sm font-semibold text-[#234568]">Chuyển bài viết sang</label>
                <Select value={destination || null} onValueChange={(value) => setDestination(value ?? "")} disabled={pending}>
                  <SelectTrigger id="move-category" className="h-11 border-[#cddced] bg-white px-3 text-[#234568] hover:border-[#8eafd4] focus-visible:border-[#1261ed] focus-visible:ring-[#1261ed]/20">
                    <SelectValue>{destination || "Chọn danh mục đích"}</SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-60 border border-[#dfe9f5] shadow-sm">
                    {categories.filter((item) => item.name !== category.name).map((item) => <SelectItem key={item.name} value={item.name} className="py-2.5 data-highlighted:bg-[#eaf4ff] data-highlighted:text-[#11335e]">{item.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </> : <p className="mt-1 text-[#58749a]">Danh mục này chưa có bài viết.</p>}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button type="button" variant="destructive" disabled={pending || (category.count > 0 && !destination) || categories.length < 2} onClick={() => run(() => deleteCategoryAction(category.name, destination || null, true), (moved) => { setDeleting(null); setNotice(moved ? `Đã chuyển ${moved} bài viết và xóa danh mục.` : "Đã xóa danh mục."); })}>Xác nhận xóa</Button>
              <Button type="button" variant="outline" onClick={() => setDeleting(null)}>Hủy</Button>
            </div>
          </div>}
        </li>)}
      </ul>
    </div>
  </div>;
}
