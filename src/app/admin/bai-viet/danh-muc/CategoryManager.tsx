"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { Ellipsis, Pencil, Plus, Trash2 } from "lucide-react";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ManagedCategory } from "@/lib/articles/category-service";
import { createCategoryAction, deleteCategoryAction, renameCategoryAction } from "../actions";

type CategoryRow = ManagedCategory & { id: string };

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

  const rows: CategoryRow[] = categories.map((category) => ({ ...category, id: category.name }));
  const columns: ColumnDef<CategoryRow>[] = [
    {
      accessorKey: "name",
      header: "Tên danh mục",
      size: 430,
      cell: ({ row }) => <span className="block truncate font-semibold text-[#11335e]" title={row.original.name}>{row.original.name}</span>,
    },
    {
      accessorKey: "count",
      header: "Bài viết",
      size: 130,
      cell: ({ row }) => <span className="tabular-nums">{row.original.count}</span>,
    },
    {
      id: "actions",
      header: "Thao tác",
      size: 90,
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const category = row.original;
        return <DropdownMenu>
          <DropdownMenuTrigger render={<Button type="button" variant="ghost" size="icon-sm" aria-label={`Thao tác danh mục: ${category.name}`} />}>
            <Ellipsis className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-44">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => { setEditing(category.name); setEditName(category.name); setDeleting(null); }}>
                <Pencil /> Đổi tên
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem variant="destructive" onClick={() => { setDeleting(category.name); setDestination(""); setEditing(null); }}>
                <Trash2 /> Xóa danh mục
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>;
      },
    },
  ];

  return <div className="space-y-4">
    <form onSubmit={(event) => { event.preventDefault(); run(() => createCategoryAction(name), () => { setName(""); setNotice("Đã thêm danh mục."); }); }} className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <label htmlFor="new-category" className="sr-only">Tên danh mục mới</label>
      <Input id="new-category" value={name} onChange={(event) => setName(event.target.value)} maxLength={80} placeholder="Tên danh mục mới" required className="h-9 w-full border-[#dbe6f3] sm:max-w-sm" />
      <Button type="submit" variant="cta" disabled={pending || !name.trim()} className="min-h-9 gap-2 px-4 font-bold text-[#173b5e]"><Plus className="size-4" /> Thêm danh mục</Button>
    </form>
    {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
    {notice && <p role="status" className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">{notice}</p>}
    <AdminDataTable
      data={rows}
      columns={columns}
      totalRows={rows.length}
      page={1}
      pageSize={20}
      mode="client"
      ariaLabel="Bảng danh mục bài viết"
      searchPlaceholder="Tìm danh mục..."
      emptyMessage="Không có danh mục phù hợp."
      minWidth="650px"
      renderExpandedRow={(category) => editing === category.name ? <form
        onSubmit={(event) => { event.preventDefault(); run(() => renameCategoryAction(category.name, editName), () => { setEditing(null); setNotice("Đã đổi tên danh mục và cập nhật các bài viết."); }); }}
        className="flex flex-wrap items-end gap-2 border-t border-[#e8eef6] bg-[#f8fbff] px-4 py-4"
      >
        <div className="min-w-[220px] flex-1 sm:max-w-md">
          <label htmlFor="edit-category" className="mb-1.5 block text-sm font-semibold text-[#234568]">Đổi tên danh mục</label>
          <Input id="edit-category" value={editName} onChange={(event) => setEditName(event.target.value)} maxLength={80} required className="h-9 border-[#cddced] bg-white" />
        </div>
        <Button type="submit" disabled={pending} className="h-9">Lưu</Button>
        <Button type="button" variant="outline" onClick={() => setEditing(null)} className="h-9">Hủy</Button>
      </form> : deleting === category.name ? <div className="border-t border-[#e8eef6] bg-[#f8fbff] px-4 py-4 text-sm text-[#234568]">
        <p className="font-bold text-[#11335e]">Xóa danh mục “{category.name}”?</p>
        {category.count > 0 ? <>
          <p className="mt-1 text-[#58749a]">{category.count} bài viết sẽ được chuyển sang danh mục bạn chọn trước khi xóa.</p>
          <div className="mt-3 max-w-md">
            <label htmlFor="move-category" className="mb-1.5 block text-sm font-semibold text-[#234568]">Chuyển bài viết sang</label>
            <Select value={destination || null} onValueChange={(value) => setDestination(value ?? "")} disabled={pending}>
              <SelectTrigger id="move-category" className="h-10 border-[#cddced] bg-white px-3 text-[#234568] hover:border-[#8eafd4] focus-visible:border-[#1261ed] focus-visible:ring-[#1261ed]/20">
                <SelectValue>{destination || "Chọn danh mục đích"}</SelectValue>
              </SelectTrigger>
              <SelectContent className="max-h-60 border border-[#dfe9f5] shadow-sm">
                {categories.filter((item) => item.name !== category.name).map((item) => <SelectItem key={item.name} value={item.name} className="py-2.5 data-highlighted:bg-[#eaf4ff] data-highlighted:text-[#11335e]">{item.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </> : <p className="mt-1 text-[#58749a]">Danh mục này chưa có bài viết.</p>}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button type="button" variant="destructive" disabled={pending || (category.count > 0 && !destination) || categories.length < 2} onClick={() => run(() => deleteCategoryAction(category.name, destination || null, true), (moved) => { setDeleting(null); setNotice(moved ? `Đã chuyển ${moved} bài viết và xóa danh mục.` : "Đã xóa danh mục."); })}>Xác nhận xóa</Button>
          <Button type="button" variant="outline" onClick={() => setDeleting(null)}>Hủy</Button>
        </div>
      </div> : null}
    />
  </div>;
}
