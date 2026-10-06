"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { ExternalLink, Eye, EyeOff, Pencil, RefreshCw, Trash2 } from "lucide-react";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/badge";
import { formatVnd } from "@/lib/config";
import { platformLabel } from "@/lib/labels";
import { deleteArticleAction, regenerateArticleAction, toggleArticleAction } from "./actions";

export type ArticleTableRow = {
  id: string;
  slug: string;
  title: string;
  platform: "shopee" | "tiktok";
  category: string | null;
  price: number | null;
  views: number;
  status: string;
  createdAt: string;
};

const actionClass = "inline-flex min-h-9 w-full items-center justify-center gap-1 rounded-lg border border-[#d9e5f4] px-2 font-semibold text-[#34527d] hover:bg-[#f6f9fd]";

const columns: ColumnDef<ArticleTableRow>[] = [
  { accessorKey: "title", header: "Tiêu đề", size: 320, cell: ({ row }) => <Link href={`/bai-viet/${row.original.slug}`} target="_blank" className="inline-flex items-start gap-1 font-semibold text-[#1261ed] hover:underline"><span className="line-clamp-2 break-words">{row.original.title}</span><ExternalLink className="mt-0.5 size-3.5 shrink-0" /></Link> },
  { accessorKey: "platform", header: "Sàn", size: 95, enableSorting: false, cell: ({ row }) => platformLabel[row.original.platform] ?? row.original.platform },
  { accessorKey: "category", header: "Danh mục", size: 135, enableSorting: false, cell: ({ row }) => <span className="block truncate" title={row.original.category ?? undefined}>{row.original.category ?? "—"}</span> },
  { accessorKey: "price", header: "Giá", size: 115, cell: ({ row }) => row.original.price ? formatVnd(row.original.price) : "—" },
  { accessorKey: "views", header: "Lượt xem", size: 90, cell: ({ row }) => row.original.views },
  { accessorKey: "status", header: "Trạng thái", size: 105, enableSorting: false, cell: ({ row }) => <Badge variant={row.original.status === "published" ? "success" : "warning"}>{row.original.status === "published" ? "Hiển thị" : "Đã ẩn"}</Badge> },
  { accessorKey: "createdAt", header: "Ngày tạo", size: 110, cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString("vi-VN") },
  { id: "actions", header: "Thao tác", size: 220, enableSorting: false, cell: ({ row }) => {
    const article = row.original;
    return <div className="grid grid-cols-2 gap-1.5">
      <Link href={`/admin/bai-viet/${article.id}/sua`} className={actionClass}><Pencil className="size-3.5" /> Sửa</Link>
      <form action={regenerateArticleAction}><input type="hidden" name="id" value={article.id} /><button type="submit" className={actionClass}><RefreshCw className="size-3.5" /> Tạo lại</button></form>
      <form action={toggleArticleAction}><input type="hidden" name="id" value={article.id} /><input type="hidden" name="status" value={article.status === "published" ? "hidden" : "published"} /><button type="submit" className={actionClass}>{article.status === "published" ? <><EyeOff className="size-3.5" /> Ẩn</> : <><Eye className="size-3.5" /> Hiện</>}</button></form>
      <form action={deleteArticleAction}><input type="hidden" name="id" value={article.id} /><button type="submit" className={`${actionClass} border-[#f3c6d0] text-[#d34862] hover:bg-[#fee9ee]`}><Trash2 className="size-3.5" /> Xóa</button></form>
    </div>;
  } },
];

export function ArticlesTable({ rows, total, page }: { rows: ArticleTableRow[]; total: number; page: number }) {
  return <AdminDataTable
    data={rows}
    columns={columns}
    totalRows={total}
    page={page}
    pageSize={20}
    ariaLabel="Bảng bài viết SEO"
    searchPlaceholder="Tìm tiêu đề bài viết..."
    filters={[
      { key: "platform", label: "Tất cả sàn", options: [{ value: "shopee", label: "Shopee" }, { value: "tiktok", label: "TikTok Shop" }] },
      { key: "status", label: "Mọi trạng thái", options: [{ value: "published", label: "Hiển thị" }, { value: "hidden", label: "Đã ẩn" }] },
    ]}
    emptyMessage="Không có bài viết phù hợp."
    minWidth="1190px"
  />;
}
