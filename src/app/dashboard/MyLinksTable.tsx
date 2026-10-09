"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { ExternalLink } from "lucide-react";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { BuyButton } from "@/components/dashboard/BuyButton";
import { CopyLink } from "@/components/dashboard/CopyLink";
import { ShopeeIcon, TikTokIcon } from "@/components/sections/BrandIcons";
import { platformLabel } from "@/lib/labels";

export type MyLinkRow = {
  id: string;
  shortCode: string;
  title: string | null;
  originalUrl: string;
  platform: "shopee" | "tiktok";
  clicks: number;
  createdAt: string;
};

function createColumns(baseUrl: string): ColumnDef<MyLinkRow>[] {
  return [
  {
    accessorKey: "title",
    header: "Sản phẩm / link",
    size: 310,
    cell: ({ row }) => (
      <div className="min-w-0">
        <Link
          href={`/dashboard/link/${row.original.shortCode}`}
          className="line-clamp-2 break-words font-semibold text-[#1261ed] hover:underline"
          title={row.original.title || row.original.originalUrl}
        >
          {row.original.title?.trim() || row.original.originalUrl}
        </Link>
        <span className="mt-1 block truncate text-[11px] text-[#6681a7]" title={row.original.originalUrl}>
          {row.original.originalUrl}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "platform",
    header: "Sàn",
    size: 130,
    enableSorting: false,
    cell: ({ row }) => (
      <span className="inline-flex items-center gap-2 font-semibold text-[#244a7c]">
        <span className={`inline-flex size-6 shrink-0 items-center justify-center rounded-md ${row.original.platform === "shopee" ? "bg-[#ee4d2d]" : "bg-[#090b0f]"}`}>
          {row.original.platform === "shopee" ? <ShopeeIcon className="size-3.5" white /> : <TikTokIcon className="size-4" />}
        </span>
        {platformLabel[row.original.platform]}
      </span>
    ),
  },
  {
    accessorKey: "clicks",
    header: "Lượt bấm",
    size: 100,
    cell: ({ row }) => <span className="font-medium text-[#35537c]">{row.original.clicks.toLocaleString("vi-VN")}</span>,
  },
  {
    accessorKey: "createdAt",
    header: "Ngày tạo",
    size: 110,
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString("vi-VN"),
  },
  {
    id: "actions",
    header: "Thao tác",
    size: 210,
    enableSorting: false,
    cell: ({ row }) => {
      return (
        <div className="flex flex-wrap items-center gap-2">
          <CopyLink value={`${baseUrl}/go/${row.original.shortCode}`} />
          <BuyButton href={`/go/${row.original.shortCode}`} platformName={platformLabel[row.original.platform]} />
          <Link href={`/go/${row.original.shortCode}`} target="_blank" rel="noopener noreferrer" aria-label="Mở link hoàn tiền" className="inline-flex size-9 items-center justify-center rounded-lg border border-[#cbd9ec] text-[#315a90] hover:bg-[#f1f6fc]">
            <ExternalLink className="size-4" />
          </Link>
        </div>
      );
    },
  },
  ];
}

export function MyLinksTable({
  rows,
  total,
  page,
  baseUrl,
}: {
  rows: MyLinkRow[];
  total: number;
  page: number;
  baseUrl: string;
}) {
  const columns = createColumns(baseUrl);

  return (
    <AdminDataTable
      data={rows}
      columns={columns}
      totalRows={total}
      page={page}
      pageSize={8}
      ariaLabel="Bảng link của bạn"
      searchPlaceholder="Tìm sản phẩm hoặc link..."
      filters={[{
        key: "platform",
        label: "Tất cả sàn",
        options: [
          { value: "shopee", label: "Shopee" },
          { value: "tiktok", label: "TikTok Shop" },
        ],
      }]}
      emptyMessage="Không có link phù hợp. Thử đổi từ khóa hoặc bộ lọc."
      minWidth="860px"
      getRowHref={(row) => `/dashboard/link/${row.shortCode}`}
    />
  );
}
