"use client";

import Link from "next/link";
import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Check, Copy, ExternalLink, MoreHorizontal, ShoppingBag } from "lucide-react";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { ShopeeIcon, TikTokIcon } from "@/components/sections/BrandIcons";
import { platformLabel } from "@/lib/labels";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
    size: 90,
    enableSorting: false,
    cell: ({ row }) => <LinkActions row={row.original} baseUrl={baseUrl} />,
  },
  ];
}

function LinkActions({ row, baseUrl }: { row: MyLinkRow; baseUrl: string }) {
  const [copied, setCopied] = useState(false);
  const affiliatePath = `/go/${row.shortCode}`;

  async function copyAffiliateLink() {
    try {
      await navigator.clipboard.writeText(`${baseUrl}${affiliatePath}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access may be unavailable in an insecure context.
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon" aria-label={`Thao tác link ${row.title || row.shortCode}`} />}
      >
        <MoreHorizontal className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-52">
        <DropdownMenuLabel>Thao tác link</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => void copyAffiliateLink()}>
          {copied ? <Check className="text-[#168146]" /> : <Copy />}
          {copied ? "Đã sao chép link" : "Sao chép link hoàn tiền"}
        </DropdownMenuItem>
        <DropdownMenuItem render={<a href={affiliatePath} target="_blank" rel="noopener noreferrer" />}>
          <ShoppingBag /> Mua trên {platformLabel[row.platform]}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<a href={affiliatePath} target="_blank" rel="noopener noreferrer" />}>
          <ExternalLink /> Mở link hoàn tiền
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
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
