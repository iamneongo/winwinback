"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import {
  BadgePercent,
  ChevronRight,
  Clock3,
  Search,
  ShoppingBag,
  Star,
} from "lucide-react";
import type {
  ShopeeCampaign,
  ShopeeDiscoverResponse,
  ShopeeOfferProduct,
} from "@/lib/affiliate/shopee/discover-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShopeeIcon, TikTokIcon } from "@/components/sections/BrandIcons";

function PlatformBadge({ platform }: { platform: "shopee" | "tiktok" }) {
  const isShopee = platform === "shopee";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-bold ${isShopee ? "bg-[#fff0ec] text-[#d94125]" : "bg-[#10151d] text-white"}`}
    >
      <span className={`flex h-4 w-4 items-center justify-center rounded ${isShopee ? "bg-[#ee4d2d]" : "bg-black"}`}>
        {isShopee ? <ShopeeIcon white className="h-2.5 w-2.5" /> : <TikTokIcon className="h-2.5 w-2.5" />}
      </span>
      {isShopee ? "Shopee" : "TikTok Shop"}
    </span>
  );
}

function formatVnd(value: number | null): string {
  if (value === null) return "Đang cập nhật giá";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatRate(rate: number | null): string {
  if (rate === null) return "Hoa hồng đang cập nhật";
  return `Hoa hồng ${(rate * 100).toLocaleString("vi-VN", { maximumFractionDigits: 2 })}%`;
}

function formatEndTime(timestamp: number | null): string | null {
  if (!timestamp) return null;
  const date = new Date(timestamp * 1000);
  if (Number.isNaN(date.getTime()) || date.getTime() < Date.now()) return null;
  return `Đến ${date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}`;
}

function ProductSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-[#e4ebf5] bg-white">
      <div className="aspect-square animate-pulse bg-[#edf3fb]" />
      <div className="space-y-3 p-3.5">
        <div className="h-4 w-5/6 animate-pulse rounded bg-[#edf3fb]" />
        <div className="h-4 w-2/5 animate-pulse rounded bg-[#edf3fb]" />
        <div className="h-8 animate-pulse rounded-lg bg-[#edf3fb]" />
      </div>
    </div>
  );
}

function CampaignCard({ campaign }: { campaign: ShopeeCampaign }) {
  const ending = formatEndTime(campaign.endTime);
  return (
    <a
      href={campaign.link}
      target="_blank"
      rel="noreferrer"
      aria-label={`Mở ưu đãi Shopee: ${campaign.name}`}
      className="group flex min-h-28 overflow-hidden rounded-xl border border-[#e4ebf5] bg-white transition-colors hover:border-[#ee4d2d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ee4d2d]"
    >
      <div className="relative w-28 shrink-0 bg-[#f4f7fb] sm:w-32">
        {campaign.image ? (
          <Image
            src={campaign.image}
            alt=""
            fill
            unoptimized
            sizes="128px"
            className="object-cover"
          />
        ) : (
          <BadgePercent className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-[#ee4d2d]" />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col p-3">
        <PlatformBadge platform="shopee" />
        <p className="mt-1.5 line-clamp-2 text-sm font-bold leading-5 text-[#173861] group-hover:text-[#d94125]">
          {campaign.name}
        </p>
        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-2 text-xs font-semibold">
          <span className="text-[#df482b]">{formatRate(campaign.commissionRate)}</span>
          {ending && (
            <span className="inline-flex items-center gap-1 text-[#6681a7]">
              <Clock3 className="h-3.5 w-3.5" /> {ending}
            </span>
          )}
          <span className="inline-flex items-center gap-0.5 text-[#315a90]">
            Xem ưu đãi <ChevronRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </a>
  );
}

function ProductCard({ product }: { product: ShopeeOfferProduct }) {
  const price = product.price ?? product.priceMin ?? product.priceMax;
  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-xl border border-[#e4ebf5] bg-white transition-colors hover:border-[#b7d979]">
      <div className="relative aspect-square bg-[#f4f7fb]">
        {product.image ? (
          <Image
            src={product.image}
            alt=""
            fill
            unoptimized
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover transition-transform duration-200 group-hover:scale-[1.025] motion-reduce:transition-none"
          />
        ) : (
          <ShoppingBag className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 text-[#9ab0ca]" />
        )}
        {product.commissionRate !== null && (
          <span className="absolute left-2 top-2 rounded-md bg-[#ee4d2d] px-2 py-1 text-[11px] font-bold text-white">
            {(product.commissionRate * 100).toLocaleString("vi-VN", { maximumFractionDigits: 2 })}% HH
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3 sm:p-3.5">
        <PlatformBadge platform="shopee" />
        <p className="mt-1.5 line-clamp-2 min-h-10 text-sm font-bold leading-5 text-[#173861]">
          {product.name}
        </p>
        <p className="mt-1 truncate text-xs text-[#6681a7]">{product.shopName || "Shop Shopee"}</p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <strong className="truncate text-sm text-[#df482b]">{formatVnd(price)}</strong>
          {product.rating !== null && (
            <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[#6681a7]">
              <Star className="h-3.5 w-3.5 fill-[#eabf39] text-[#eabf39]" />
              {product.rating.toFixed(1)}
            </span>
          )}
        </div>
        <p className="mt-1 text-xs font-semibold text-[#55a61b]">{formatRate(product.commissionRate)}</p>
        <Link
          href={`/dashboard?url=${encodeURIComponent(product.link)}`}
          className="mt-3 inline-flex h-9 items-center justify-center gap-1 rounded-lg bg-[#edf9df] px-3 text-xs font-bold text-[#28711a] transition-colors hover:bg-[#ddf4bf] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#55a61b]"
        >
          <span className="sm:hidden">Tạo link</span>
          <span className="hidden sm:inline">Tạo link hoàn tiền</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
}

export function ShopeeDiscover() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState<ShopeeDiscoverResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load(keyword = "") {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/shopee/discover?q=${encodeURIComponent(keyword)}`);
      const body = (await response.json()) as ShopeeDiscoverResponse & { message?: string };
      if (!response.ok) throw new Error(body.message || "Không tải được ưu đãi Shopee");
      setData(body);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Không tải được ưu đãi Shopee");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function onSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void load(query.trim());
  }

  return (
    <main className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-7 sm:py-7 lg:px-6 lg:pb-8">
      <section className="overflow-hidden rounded-xl bg-[#062f54] px-4 py-5 text-white sm:px-7 sm:py-6">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <PlatformBadge platform="shopee" />
            <PlatformBadge platform="tiktok" />
          </div>
          <h1 className="mt-3 text-2xl font-black tracking-tight text-balance sm:text-3xl">Sàn sale</h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-5 text-white/78">
            Deal, voucher và sản phẩm giảm giá theo từng sàn.
          </p>
          <form onSubmit={onSearch} className="mt-5 flex max-w-xl gap-2">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm sản phẩm, ví dụ: kem chống nắng"
              aria-label="Tìm sản phẩm Shopee có hoa hồng"
              className="h-10 bg-white text-[#173861] placeholder:text-[#6681a7]"
            />
            <Button type="submit" variant="cta" disabled={loading} className="h-10 px-4">
              <Search className="h-4 w-4" /> <span className="hidden sm:inline">Tìm</span>
            </Button>
          </form>
        </div>
      </section>

      {error ? (
        <section className="mt-5 rounded-xl border border-[#f1c7c3] bg-[#fff6f5] p-5 text-sm text-[#9b3026]">
          <p className="font-bold">Chưa tải được ưu đãi</p>
          <p className="mt-1">{error}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => void load(query.trim())}>
            Thử lại
          </Button>
        </section>
      ) : (
        <>
          <section className="mt-5">
            <div className="flex min-w-0 items-end justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <PlatformBadge platform="shopee" />
                  <h2 className="text-lg font-black text-[#173861]">Voucher Shopee</h2>
                </div>
                <p className="mt-1 text-sm text-[#6681a7]">Deal đang chạy</p>
              </div>
              {data?.dataSource && data.dataSource !== "unknown" && (
                <span className="hidden text-xs font-semibold text-[#6681a7] sm:block">
                  Dữ liệu {data.dataSource === "api" ? "mới" : "từ bộ nhớ đệm"}
                </span>
              )}
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {loading
                ? Array.from({ length: 4 }, (_, index) => <ProductSkeleton key={index} />)
                : data?.campaigns.map((campaign) => <CampaignCard key={`${campaign.name}-${campaign.link}`} campaign={campaign} />)}
            </div>
            {!loading && data?.campaigns.length === 0 && (
              <p className="mt-3 rounded-xl border border-dashed border-[#d7e3f1] bg-white px-4 py-5 text-sm text-[#6681a7]">Hiện chưa có chiến dịch để hiển thị.</p>
            )}
          </section>

          <section className="mt-5 rounded-xl bg-[#10151d] p-4 text-white sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-5">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <PlatformBadge platform="tiktok" />
                <h2 className="text-base font-black">TikTok Shop</h2>
              </div>
              <p className="mt-1.5 max-w-2xl text-sm leading-5 text-white/72">
                Dán link sản phẩm để kiểm tra hoa hồng và tạo link hoàn tiền.
              </p>
            </div>
            <Link
              href="/dashboard#tao-link"
              className="mt-4 inline-flex h-10 shrink-0 items-center justify-center gap-1 rounded-lg bg-white px-4 text-sm font-bold text-[#10151d] transition-colors hover:bg-[#e9f6cf] sm:mt-0"
            >
              Kiểm tra link TikTok <ChevronRight className="h-4 w-4" />
            </Link>
          </section>

          <section className="mt-6">
            <div className="flex min-w-0 items-end justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <PlatformBadge platform="shopee" />
                  <h2 className="truncate text-lg font-black text-[#173861]">{query.trim() ? `Kết quả: ${query.trim()}` : "Sản phẩm giảm giá"}</h2>
                </div>
                <p className="mt-1 text-sm text-[#6681a7]">Tạo link để nhận hoàn tiền</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {loading
                ? Array.from({ length: 8 }, (_, index) => <ProductSkeleton key={index} />)
                : data?.products.map((product) => <ProductCard key={product.itemId} product={product} />)}
            </div>
            {!loading && data?.products.length === 0 && (
              <p className="mt-3 rounded-xl border border-dashed border-[#d7e3f1] bg-white px-4 py-5 text-sm text-[#6681a7]">Không tìm thấy sản phẩm có hoa hồng. Hãy thử một từ khóa khác.</p>
            )}
          </section>
        </>
      )}
    </main>
  );
}
