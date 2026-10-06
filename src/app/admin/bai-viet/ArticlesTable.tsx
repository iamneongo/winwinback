"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { Ellipsis, ExternalLink, Eye, EyeOff, Pencil, RefreshCw, Trash2 } from "lucide-react";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/badge";
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

const columns: ColumnDef<ArticleTableRow>[] = [
  { accessorKey: "title", header: "Tiêu đề", size: 320, cell: ({ row }) => <Link href={`/bai-viet/${row.original.slug}`} target="_blank" className="inline-flex items-start gap-1 font-semibold text-[#1261ed] hover:underline"><span className="line-clamp-2 break-words">{row.original.title}</span><ExternalLink className="mt-0.5 size-3.5 shrink-0" /></Link> },
  { accessorKey: "platform", header: "Sàn", size: 95, enableSorting: false, cell: ({ row }) => platformLabel[row.original.platform] ?? row.original.platform },
  { accessorKey: "category", header: "Danh mục", size: 135, enableSorting: false, cell: ({ row }) => <span className="block truncate" title={row.original.category ?? undefined}>{row.original.category ?? "—"}</span> },
  { accessorKey: "price", header: "Giá", size: 115, cell: ({ row }) => row.original.price ? formatVnd(row.original.price) : "—" },
  { accessorKey: "views", header: "Lượt xem", size: 90, cell: ({ row }) => row.original.views },
  { accessorKey: "status", header: "Trạng thái", size: 105, enableSorting: false, cell: ({ row }) => <Badge variant={row.original.status === "published" ? "success" : "warning"}>{row.original.status === "published" ? "Hiển thị" : "Đã ẩn"}</Badge> },
  { accessorKey: "createdAt", header: "Ngày tạo", size: 110, cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString("vi-VN") },
  { id: "actions", header: "Thao tác", size: 76, enableSorting: false, cell: ({ row }) => {
    const article = row.original;
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button type="button" variant="ghost" size="icon-sm" aria-label={`Thao tác bài viết: ${article.title}`} />}
        >
          <Ellipsis className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-44">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
            <DropdownMenuItem render={<Link href={`/admin/bai-viet/${article.id}/sua`} />}>
              <Pencil /> Sửa bài viết
            </DropdownMenuItem>
            <form action={regenerateArticleAction}>
              <input type="hidden" name="id" value={article.id} />
              <DropdownMenuItem render={<button type="submit" className="w-full" />}>
                <RefreshCw /> Tạo lại nội dung
              </DropdownMenuItem>
            </form>
            <form action={toggleArticleAction}>
              <input type="hidden" name="id" value={article.id} />
              <input type="hidden" name="status" value={article.status === "published" ? "hidden" : "published"} />
              <DropdownMenuItem render={<button type="submit" className="w-full" />}>
                {article.status === "published" ? <><EyeOff /> Ẩn bài viết</> : <><Eye /> Hiện bài viết</>}
              </DropdownMenuItem>
            </form>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <form action={deleteArticleAction}>
              <input type="hidden" name="id" value={article.id} />
              <DropdownMenuItem variant="destructive" render={<button type="submit" className="w-full" />}>
                <Trash2 /> Xóa bài viết
              </DropdownMenuItem>
            </form>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
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
