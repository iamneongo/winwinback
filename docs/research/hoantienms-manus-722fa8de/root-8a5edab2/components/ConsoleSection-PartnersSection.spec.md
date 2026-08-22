# ConsoleSection + PartnersSection Specification

## Target files
- `src/components/sites/hoantienms-manus-722fa8de/root-8a5edab2/ConsoleSection.tsx`
- `src/components/sites/hoantienms-manus-722fa8de/root-8a5edab2/PartnersSection.tsx`

## Interaction model
- ConsoleSection: click-driven tab switch (TikTok/Shopee/Lazada)
- PartnersSection: static (hover on cards)

---

## 1. ConsoleSection

### Visual Description
A dark-bordered card that overlaps the bottom of the hero section. Has a header row, platform tabs, text input, submit button, and two status cards below.

### DOM Structure
```
<section id="nhap-link" class="reference-console relative mt-5 sm:mt-7">
  <div class="mx-auto max-w-screen-xl px-6">
    <div class="rounded-2xl border border-white/12 bg-[#082b4b]/95 backdrop-blur overflow-hidden">
      <!-- Header row -->
      <div class="flex items-center justify-between px-5 py-3 border-b border-white/10">
        <div class="flex items-center gap-2">
          <span class="h-2 w-2 rounded-full bg-[#b7e961]"> (green dot)
          <span class="text-[10px] font-bold tracking-widest text-white uppercase">KIỂM TRA HOÀN TIỀN</span>
        </div>
        <div class="flex items-center gap-1 text-[10px] text-white/60">
          <span class="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse">
          <span>• LIVE</span>
        </div>
      </div>
      <!-- White card content area -->
      <div class="bg-white rounded-xl m-3 p-5">
        <!-- Platform tabs -->
        <div class="flex gap-2 mb-4">
          <button (TikTok active state) class="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors bg-[#05111e] text-white">
            <span class="ww-store-icon ww-store-icon-tiktok w-5 h-5">
              <Music2 class="h-[55%] w-[55%] text-white" />
            </span>
            TikTok Shop
          </button>
          <button (Shopee inactive) class="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors text-gray-600 hover:bg-gray-100">
            <span class="ww-store-icon ww-store-icon-shopee w-5 h-5">
              <ShoppingBag class="h-[54%] w-[54%] text-white" />
            </span>
            Shopee
          </button>
          <button (Lazada inactive) ...>
            <span class="ww-store-icon ww-store-icon-lazada w-5 h-5">
              <Package class="h-[51%] w-[51%] text-white" />
            </span>
            Lazada
          </button>
        </div>
        <!-- Input row -->
        <div class="flex gap-3">
          <div class="flex-1 flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3">
            <Link2 class="h-4 w-4 text-[#6b8290] flex-shrink-0" />
            <input
              id="product-link"
              type="text"
              placeholder="Dán link sản phẩm vào đây (TikTok, Shopee hoặc Lazada)"
              class="flex-1 text-sm text-gray-500 outline-none bg-transparent placeholder:text-gray-400"
            />
          </div>
          <button class="rounded-full bg-[#b7e961] text-[#102e47] font-semibold px-5 py-3 flex items-center gap-2 text-sm whitespace-nowrap hover:bg-[#a8d455] transition-colors">
            Kiểm tra hoàn tiền
            <ArrowRight class="h-4 w-4" />
          </button>
        </div>
      </div>
      <!-- Status cards grid -->
      <div class="console-status-grid grid grid-cols-2 gap-px bg-white/10 mx-3 mb-3 rounded-xl overflow-hidden">
        <div class="bg-[#082b4b] p-4">
          <div class="flex items-center gap-2 mb-1">
            <ShieldCheck class="h-4 w-4 text-[#b7e961]" />
            <span class="text-[9px] font-bold tracking-widest text-white/60 uppercase">TRẠNG THÁI LINK</span>
          </div>
          <p class="text-sm font-semibold text-[#b7e961]">Sẵn sàng kiểm tra</p>
          <p class="text-xs text-white/50 mt-0.5">Dán link để xem hành trình hoàn tiền.</p>
        </div>
        <div class="bg-[#082b4b] p-4">
          <div class="flex items-center gap-2 mb-1">
            <ShoppingCart class="h-4 w-4 text-[#b7e961]" />
            <span class="text-[9px] font-bold tracking-widest text-white/60 uppercase">HÀNH TRÌNH MUA HÀNG</span>
          </div>
          <p class="text-sm font-semibold text-white">Link → Mua → Hoàn</p>
          <p class="text-xs text-white/50 mt-0.5">Ba bước đơn giản để nhận tiền về ví.</p>
        </div>
      </div>
    </div>
  </div>
</section>
```

### Tab States
- Active tab: `bg-[#05111e] text-white` (for TikTok), `bg-[#fc704b] text-white` (Shopee), `bg-[#7a5af8] text-white` (Lazada)
- Inactive tab: `text-gray-600 bg-transparent hover:bg-gray-100`
- Use useState to track active tab

### Store Icon Sizes (compact tabs)
- Container: w-5 h-5, border-radius 28%
- Icon inside: 55% of container (for Music2/TikTok), 54% (ShoppingBag/Shopee), 51% (Package/Lazada)

### Layout
- The section sits outside the hero bg, between hero and partners section
- The card has a dark navy background with white card inside

---

## 2. PartnersSection

### Visual Description
Cream background section with a heading on the left and description on the right, followed by 3 platform cards in a row.

### DOM Structure
```
<section id="doi-tac" class="bg-[#fcfcf7] py-14 sm:py-20">
  <div class="mx-auto max-w-screen-xl px-6">
    <!-- Header row: heading left, description right -->
    <div class="flex items-start justify-between gap-12 mb-12">
      <div>
        <p class="text-[10px] font-bold tracking-widest text-[#102e47]/50 uppercase mb-3">MUA TRÊN SÀN BẠN YÊU THÍCH</p>
        <h2 class="text-4xl sm:text-5xl font-bold text-[#102e47] leading-tight tracking-tight">
          Một thao tác thêm.<br/>
          <span class="text-[#102e47]">Ba điểm đến</span> thân thuộc.
        </h2>
      </div>
      <div class="max-w-sm flex-shrink-0 pt-8">
        <p class="text-base text-[#102e47]/70 leading-relaxed">
          Bạn không cần đổi thói quen mua sắm. Chỉ cần đi qua win-win back trước khi thanh toán để mở đường hoàn tiền.
        </p>
      </div>
    </div>
    <!-- Platform cards row -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <!-- TikTok Shop card -->
      <div class="reference-store-card group rounded-2xl bg-[#0d1f30] text-white p-6 text-left relative overflow-hidden hover:scale-[1.02] transition-transform cursor-pointer">
        <div class="ww-store-icon ww-store-icon-tiktok w-12 h-12 mb-4">
          <Music2 class="h-[55%] w-[55%] text-white" />
        </div>
        <p class="font-bold text-lg">TikTok Shop</p>
        <p class="text-sm text-white/60 mt-1">Săn deal, nhận hoàn tiền</p>
        <span class="absolute top-5 right-5 text-4xl font-black text-white/10 leading-none">01</span>
      </div>
      <!-- Shopee card -->
      <div class="reference-store-card group rounded-2xl bg-[#db3f26] text-white p-6 text-left relative overflow-hidden hover:scale-[1.02] transition-transform cursor-pointer">
        <div class="ww-store-icon ww-store-icon-shopee w-12 h-12 mb-4">
          <ShoppingBag class="h-[54%] w-[54%] text-white" />
        </div>
        <p class="font-bold text-lg">Shopee</p>
        <p class="text-sm text-white/60 mt-1">Mã giảm + hoàn tiền</p>
        <span class="absolute top-5 right-5 text-4xl font-black text-white/10 leading-none">02</span>
      </div>
      <!-- Lazada card -->
      <div class="reference-store-card group rounded-2xl bg-[#5b21b6] text-white p-6 text-left relative overflow-hidden hover:scale-[1.02] transition-transform cursor-pointer">
        <div class="ww-store-icon ww-store-icon-lazada w-12 h-12 mb-4">
          <Package class="h-[51%] w-[51%] text-white" />
        </div>
        <p class="font-bold text-lg">Lazada</p>
        <p class="text-sm text-white/60 mt-1">Ưu đãi mỗi ngày</p>
        <span class="absolute top-5 right-5 text-4xl font-black text-white/10 leading-none">03</span>
      </div>
    </div>
  </div>
</section>
```

### Platform card styles
- TikTok card bg: dark navy `#0d1f30` to `#1a3247` (dark)
- Shopee card bg: orange-red `#db3f26`
- Lazada card bg: purple `#5b21b6`
- Number badge: absolute top-right, very large, white/10 opacity (ghost number)
- Hover: scale-[1.02] with transition
- All cards equal height, grid-cols-3 on desktop

### Responsive
- Desktop: grid-cols-3
- Mobile: grid-cols-1 (stacked)
- Header: flex-col on mobile, flex-row on desktop

## Lucide Icons Used
- Music2 (TikTok), ShoppingBag (Shopee), Package (Lazada)
- Link2, ArrowRight, ShieldCheck, ShoppingCart (console section)

## Verification
- Use 'use client' for ConsoleSection only (has useState for tabs)
- PartnersSection is a server component
- Run `npx tsc --noEmit` before marking complete
