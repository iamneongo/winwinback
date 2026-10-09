"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { ExternalLink } from "lucide-react";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { ArticleProgress } from "@/components/dashboard/ArticleProgress";
import { platformLabel } from "@/lib/labels";

type MyArticleRow = {
  id: string;
  shortCode: string;
  title: string | null;
  platform: string;
  articleStatus: string | null;
  articleSlug: string | null;
  articleUpdatedAt: string | null;
  createdAt: string;
};

const columns: ColumnDef<MyArticleRow>[] = [
  { accessorKey: "title", header: "Sản phẩm", size: 320, cell: ({ row }) => <Link href={`/dashboard/bai-viet/${row.original.shortCode}`} className="line-clamp-2 break-words font-semibold text-[#1261ed] hover:underline">{row.original.title?.trim() || `Sản phẩm trên ${platformLabel[row.original.platform] ?? "sàn"}`}</Link> },
  { accessorKey: "platform", header: "Sàn", size: 105, enableSorting: false, cell: ({ row }) => platformLabel[row.original.platform] ?? row.original.platform },
  { accessorKey: "articleStatus", header: "Bài viết", size: 285, cell: ({ row }) => <ArticleProgress code={row.original.shortCode} initial={{ status: row.original.articleStatus, preview: null, slug: row.original.articleSlug, updatedAt: row.original.articleUpdatedAt }} allowRetry compact /> },
  { accessorKey: "createdAt", header: "Ngày tạo", size: 110, cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString("vi-VN") },
  { id: "link", header: "Link hoàn tiền", size: 130, enableSorting: false, cell: ({ row }) => <Link href={`/go/${row.original.shortCode}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-[#1261ed] hover:underline">Mở link <ExternalLink className="size-3.5" /></Link> },
];

export function MyArticlesTable({ rows, total, page }: { rows: MyArticleRow[]; total: number; page: number }) {
  return <AdminDataTable
    data={rows}
    columns={columns}
    totalRows={total}
    page={page}
    pageSize={12}
    ariaLabel="Bảng bài viết của bạn"
    searchPlaceholder="Tìm tên sản phẩm..."
    filters={[
      { key: "platform", label: "Tất cả sàn", options: [{ value: "shopee", label: "Shopee" }, { value: "tiktok", label: "TikTok Shop" }] },
      { key: "status", label: "Mọi trạng thái", options: [
        { value: "published", label: "Đã sẵn sàng" }, { value: "queued", label: "Đang chuẩn bị" },
        { value: "fetching_product", label: "Đang lấy sản phẩm" }, { value: "generating", label: "Đang viết" },
        { value: "failed", label: "Viết lỗi" }, { value: "unavailable", label: "Đã ẩn" },
      ] },
    ]}
    emptyMessage="Không có bài viết phù hợp. Thử đổi từ khóa hoặc bộ lọc."
    minWidth="950px"
    getRowHref={(row) => `/dashboard/bai-viet/${row.shortCode}`}
  />;
}
