# HowItWorksSection + BenefitsSection + FAQSection + FinalCTASection + Footer Specification

## Target files
- `src/components/sites/hoantienms-manus-722fa8de/root-8a5edab2/HowItWorksSection.tsx`
- `src/components/sites/hoantienms-manus-722fa8de/root-8a5edab2/BenefitsSection.tsx`
- `src/components/sites/hoantienms-manus-722fa8de/root-8a5edab2/FAQSection.tsx`
- `src/components/sites/hoantienms-manus-722fa8de/root-8a5edab2/FinalCTASection.tsx`
- `src/components/sites/hoantienms-manus-722fa8de/root-8a5edab2/Footer.tsx`

## Interaction model
- HowItWorksSection: static
- BenefitsSection: static
- FAQSection: click-driven accordion (use 'use client')
- FinalCTASection: static
- Footer: static

---

## 1. HowItWorksSection

### Visual Description
Mint green background. Left side: large heading + description + CTA link + image. Right side: vertical timeline of 3 steps.

### DOM Structure
```
<section id="cach-hoat-dong" class="relative overflow-hidden bg-[#e9f5ef] py-16 sm:py-24">
  <div class="mx-auto max-w-screen-xl px-6">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
      <!-- Left column -->
      <div>
        <p class="text-[10px] font-bold tracking-widest text-[#102e47]/50 uppercase mb-4">LỘ TRÌNH 3 BƯỚC</p>
        <h2 class="text-4xl sm:text-5xl font-bold text-[#102e47] leading-tight tracking-tight mb-4">
          Mua sắm vốn đơn giản.<br/>
          <span class="text-[#3d7a45]">Hoàn tiền cũng vậy.</span>
        </h2>
        <p class="text-base text-[#102e47]/70 leading-relaxed mb-6 max-w-sm">
          Chúng tôi giữ quy trình nhẹ nhất có thể: chuẩn bị link, mua trên sàn quen thuộc, sau đó nhận tiền hoàn khi đơn đủ điều kiện.
        </p>
        <a href="#nhap-link" class="inline-flex items-center gap-1 text-[#102e47] font-semibold text-sm hover:underline">
          Thử với link của bạn <ArrowRight class="h-4 w-4" />
        </a>
        <!-- Phone image -->
        <div class="mt-8 rounded-2xl overflow-hidden max-w-[320px]">
          <Image
            src="/sites/hoantienms-manus-722fa8de/root-8a5edab2/images/mobile-link-card.jpg"
            width={640}
            height={800}
            alt="Điện thoại minh họa thao tác dán link hoàn tiền"
            class="w-full object-cover"
          />
        </div>
      </div>
      <!-- Right column: step timeline -->
      <div class="relative flex flex-col gap-0">
        <!-- Vertical line connecting steps -->
        <div class="absolute left-[22px] top-8 bottom-8 w-px bg-[#102e47]/15">
        
        <!-- Step 1 -->
        <div class="reference-flow-item flex gap-5 pb-10 relative">
          <div class="flex-shrink-0 w-11 h-11 rounded-full bg-white border-2 border-[#b7e961]/60 flex items-center justify-center z-10">
            <Copy class="h-5 w-5 text-[#102e47]/70" />
          </div>
          <div>
            <p class="text-[9px] font-bold tracking-widest text-[#102e47]/40 uppercase mb-1">BƯỚC 01</p>
            <p class="font-bold text-lg text-[#102e47]">Dán link sản phẩm</p>
            <p class="text-sm text-[#102e47]/60 leading-relaxed mt-1">Sao chép link món đồ bạn đang xem và dán vào ô kiểm tra.</p>
          </div>
        </div>
        
        <!-- Step 2 -->
        <div class="reference-flow-item flex gap-5 pb-10 relative">
          <div class="flex-shrink-0 w-11 h-11 rounded-full bg-white border-2 border-[#b7e961]/60 flex items-center justify-center z-10">
            <ShoppingCart class="h-5 w-5 text-[#102e47]/70" />
          </div>
          <div>
            <p class="text-[9px] font-bold tracking-widest text-[#102e47]/40 uppercase mb-1">BƯỚC 02</p>
            <p class="font-bold text-lg text-[#102e47]">Mua hàng như thường</p>
            <p class="text-sm text-[#102e47]/60 leading-relaxed mt-1">Tiếp tục mua sắm trên sàn quen thuộc với ưu đãi bạn đang có.</p>
          </div>
        </div>
        
        <!-- Step 3 -->
        <div class="reference-flow-item flex gap-5 relative">
          <div class="flex-shrink-0 w-11 h-11 rounded-full bg-white border-2 border-[#b7e961]/60 flex items-center justify-center z-10">
            <Wallet class="h-5 w-5 text-[#102e47]/70" />
          </div>
          <div>
            <p class="text-[9px] font-bold tracking-widest text-[#102e47]/40 uppercase mb-1">BƯỚC 03</p>
            <p class="font-bold text-lg text-[#102e47]">Nhận tiền về ví</p>
            <p class="text-sm text-[#102e47]/60 leading-relaxed mt-1">Tiền hoàn được ghi nhận khi đơn hàng hoàn tất theo điều kiện chương trình.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- Decorative large circle watermark in background -->
  <div class="absolute -left-32 -top-32 w-96 h-96 rounded-full border border-[#102e47]/10 pointer-events-none">
</section>
```

### Styles
- Background: `#e9f5ef`
- H2 second line color: a dark green `#3d7a45` or `text-[#2d6a4f]`
- Step icons: circular white badge w-11 h-11, border lime/60, flex-center
- Step number: 9px, uppercase, tracking-widest, dark/40
- Step title: lg font-bold, dark
- Step desc: sm, dark/60
- Vertical connector: absolute left-[22px], w-px bg-dark/15

---

## 2. BenefitsSection

### Visual Description
Cream background. Image on left with overlay label. Text + bullet list on right.

### DOM Structure
```
<section class="bg-[#fcfcf7] py-16 sm:py-24">
  <div class="mx-auto max-w-screen-xl px-6">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <!-- Left: Image with overlay badge -->
      <div class="relative">
        <!-- Badge overlay at top of image -->
        <div class="absolute top-4 left-4 z-10 flex items-center gap-2 bg-[#082b4b] text-white text-[10px] font-bold tracking-widest rounded-full px-3 py-1.5 uppercase">
          CHECKPOINT · TIỀN VỀ VÍ
        </div>
        <!-- Route illustration image -->
        <div class="rounded-2xl overflow-hidden">
          <Image
            src="/sites/hoantienms-manus-722fa8de/root-8a5edab2/images/route-illustration.jpg"
            width={960}
            height={640}
            alt="Đường dẫn lên biểu trưng cho hành trình hoàn tiền"
            class="w-full object-cover"
          />
        </div>
        <!-- Bottom right "Rõ từng chặng" badge -->
        <div class="absolute bottom-4 right-4 bg-white rounded-full px-3 py-1.5 text-xs font-semibold text-[#102e47] flex items-center gap-1 shadow-sm">
          <CircleCheck class="h-3.5 w-3.5 text-[#b7e961]" />
          Rõ từng chặng
        </div>
      </div>
      <!-- Right: text + benefits list -->
      <div>
        <p class="text-[10px] font-bold tracking-widest text-[#102e47]/50 uppercase mb-4">THÊM LỢI ÍCH, GIỮ THÓI QUEN</p>
        <h2 class="text-4xl sm:text-5xl font-bold text-[#102e47] leading-tight tracking-tight mb-8">
          Không đổi thói quen.<br/>
          Chỉ thêm <span class="ww-lime-text-gradient">một lợi ích.</span>
        </h2>
        <ul class="space-y-6">
          <li class="flex gap-4">
            <Check class="h-5 w-5 text-[#4a9c5d] mt-0.5 flex-shrink-0" />
            <div>
              <p class="font-semibold text-[#102e47]">Điều kiện rõ ràng</p>
              <p class="text-sm text-[#102e47]/60 mt-1">Thông tin hoàn tiền được nêu theo chương trình và loại sản phẩm.</p>
            </div>
          </li>
          <li class="flex gap-4">
            <Check class="h-5 w-5 text-[#4a9c5d] mt-0.5 flex-shrink-0" />
            <div>
              <p class="font-semibold text-[#102e47]">Giữ nguyên ưu đãi</p>
              <p class="text-sm text-[#102e47]/60 mt-1">Bạn vẫn dùng mã giảm giá và khuyến mãi hợp lệ trên sàn.</p>
            </div>
          </li>
          <li class="flex gap-4">
            <Check class="h-5 w-5 text-[#4a9c5d] mt-0.5 flex-shrink-0" />
            <div>
              <p class="font-semibold text-[#102e47]">Thao tác có bảo vệ</p>
              <p class="text-sm text-[#102e47]/60 mt-1">Chỉ cần link sản phẩm, không yêu cầu thông tin thanh toán.</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</section>
```

### Styles
- Background: `#fcfcf7`
- Image: `route-illustration.jpg`, 3:2 ratio, rounded-2xl
- Overlay badge (top): dark navy bg, white text, rounded-full, absolute
- Check icon color: `#4a9c5d` (green checkmark)
- Gradient "một lợi ích." text: uses `.ww-lime-text-gradient`

---

## 3. FAQSection

### Visual Description
Dark navy background. Left: image + description. Right: accordion FAQ items + "see all" button.

### DOM Structure
```
<section id="giai-dap" class="reference-faq bg-[#082b4b] py-16 sm:py-20 text-white">
  <div class="mx-auto max-w-screen-xl px-6">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
      <!-- Left side -->
      <div>
        <h2 class="text-4xl sm:text-5xl font-bold text-white leading-tight tracking-tight mb-4">
          Bạn hỏi.<br/>Chúng tôi nói rõ.
        </h2>
        <p class="text-base text-white/60 mb-8 max-w-xs leading-relaxed">
          Các câu trả lời ngắn gọn trước khi bạn bắt đầu hành trình mua sắm có hoàn tiền.
        </p>
        <!-- FAQ image: cashback-seal with dark rounded bg -->
        <div class="rounded-2xl overflow-hidden max-w-[280px] bg-[#0d2d47]">
          <Image
            src="/sites/hoantienms-manus-722fa8de/root-8a5edab2/images/cashback-seal.jpg"
            width={640}
            height={640}
            alt="Dấu xác nhận hoàn tiền"
            class="w-full object-cover"
          />
        </div>
      </div>
      <!-- Right side: accordion -->
      <div class="space-y-0 border-t border-white/15">
        {/* FAQ Item 1 */}
        <FAQItem question="Tôi có cần trả thêm phí khi dùng không?" answer="Không. Bạn chỉ thanh toán giá hiển thị trên sàn. Tiền hoàn được ghi nhận khi đơn hàng đáp ứng điều kiện của chương trình." />
        {/* FAQ Item 2 */}
        <FAQItem question="Khi nào tiền hoàn được ghi nhận?" answer="Thời gian ghi nhận phụ thuộc vào quy trình xác nhận đơn hàng của từng đối tác và loại sản phẩm." />
        {/* FAQ Item 3 */}
        <FAQItem question="Tôi vẫn có thể dùng mã giảm giá của sàn chứ?" answer="Có. Bạn vẫn có thể áp dụng những mã giảm giá và khuyến mãi hợp lệ trên sàn trước khi thanh toán." />
        
        <div class="pt-6">
          <a href="#" class="inline-flex items-center gap-2 text-sm font-semibold text-white border border-white/30 rounded-full px-5 py-2.5 hover:bg-white/10 transition-colors">
            Xem tất cả câu hỏi <ArrowRight class="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  </div>
</section>
```

### FAQItem Sub-component
```tsx
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div class="border-b border-white/15 py-5">
      <button
        onClick={() => setOpen(!open)}
        class="w-full flex items-center justify-between text-left gap-4"
      >
        <span class="font-semibold text-white text-base">{question}</span>
        <ChevronDown class={`h-5 w-5 text-white/60 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <p class="mt-3 text-sm text-white/60 leading-relaxed">{answer}</p>
      )}
    </div>
  );
}
```

### FAQ Item Styles
- Border-bottom: `border-white/15`
- Question: font-semibold text-white text-base
- Chevron: rotates 180deg when open
- Answer: text-sm text-white/60 leading-relaxed, appears when open
- "Xem tất cả câu hỏi": outlined rounded-full button, white text

---

## 4. FinalCTASection

### Visual Description
Light ice blue background (#edf6f7). Large heading on left. CTA button on right. Decorative circular watermark on right side.

### DOM Structure
```
<section class="reference-final-cta relative overflow-hidden bg-[#edf6f7] py-14 sm:py-18">
  <!-- Decorative large circle watermark (right side) -->
  <div class="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full border-[40px] border-white/40 pointer-events-none translate-x-1/3">
  
  <div class="mx-auto max-w-screen-xl px-6 relative z-10">
    <div class="flex items-center justify-between gap-8">
      <div>
        <p class="text-[10px] font-bold tracking-widest text-[#102e47]/50 uppercase mb-4">ĐIỂM ĐẾN: TIỀN HOÀN VỀ VÍ</p>
        <h2 class="text-4xl sm:text-5xl font-bold text-[#102e47] leading-tight tracking-tight">
          Dán link. Đi mua.<br/>
          Để <span class="ww-lime-text-gradient">tiền hoàn</span> theo sau.
        </h2>
      </div>
      <div class="flex-shrink-0">
        <a href="#nhap-link" class="inline-flex items-center gap-2 bg-[#102e47] text-white font-semibold px-6 py-3.5 rounded-full hover:bg-[#0a1e30] transition-colors">
          Nhập link sản phẩm <ArrowRight class="h-4 w-4" />
        </a>
      </div>
    </div>
  </div>
</section>
```

### Styles
- Background: `#edf6f7`
- H2: 4xl-5xl, font-bold, `#102e47`, leading-tight, tracking-tight
- "tiền hoàn" span: `.ww-lime-text-gradient`
- CTA button: dark navy `#102e47` bg, white text, rounded-full
- Decorative circle: large, right-aligned, `border-white/40`
- Eyebrow: 10px, uppercase, tracking-widest, dark/50

---

## 5. Footer

### Visual Description
Dark navy background (#082b4b). Logo + description on left. Nav links on right.

### DOM Structure
```
<footer class="bg-[#082b4b] py-10">
  <div class="mx-auto max-w-screen-xl px-6">
    <div class="flex items-start justify-between gap-8">
      <!-- Left: logo + desc -->
      <div class="max-w-xs">
        <div class="flex items-center gap-2 mb-3">
          <svg (winwin arrow logo - same as nav) viewBox="0 0 48 48" class="h-7 w-7" />
          <span class="font-bold text-white text-lg">win-win back</span>
        </div>
        <p class="text-sm text-white/50 leading-relaxed">
          Nền tảng hỗ trợ hành trình mua sắm có hoàn tiền, minh bạch và nhanh chóng.
        </p>
      </div>
      <!-- Right: nav links -->
      <nav class="flex items-center gap-6">
        <a href="#cach-hoat-dong" class="text-sm text-white/60 hover:text-white transition-colors">Cách hoạt động</a>
        <a href="#doi-tac" class="text-sm text-white/60 hover:text-white transition-colors">Đối tác</a>
        <a href="#giai-dap" class="text-sm text-white/60 hover:text-white transition-colors">Giải đáp</a>
      </nav>
    </div>
  </div>
</footer>
```

### Logo SVG (same as NavBar, reuse it)
```svg
<svg viewBox="0 0 48 48" class="h-7 w-7" aria-hidden="true">
  <defs>
    <linearGradient id="winwin-arrow-footer" x1="4" y1="42" x2="43" y2="5" gradientUnits="userSpaceOnUse">
      <stop stopColor="#9AD336"/>
      <stop offset="1" stopColor="#EABF39"/>
    </linearGradient>
  </defs>
  <path d="M6 36.5 17.5 23l7.4 6.7L37.8 11" fill="none" stroke="url(#winwin-arrow-footer)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="7.5"/>
  <path d="M29.2 11h8.6v8.6" fill="none" stroke="#EABF39" strokeLinecap="round" strokeLinejoin="round" strokeWidth="7.5"/>
</svg>
```
Note: Use a different gradient id "winwin-arrow-footer" to avoid SVG id collision with the NavBar logo.

## Lucide Icons Used (all sections)
- Copy (step 1)
- ShoppingCart (step 2, console status)
- Wallet (step 3)
- ArrowRight (links)
- Check (benefits list)
- ChevronDown (FAQ accordion)
- CircleCheck (benefits image badge)

## Global CSS classes used
All from `src/app/globals.css`:
- `.winwin-root` — apply to the page wrapper
- `.ww-lime-text-gradient` — gradient text
- `.ww-hero-bg` — hero background
- `.ww-nav-gradient` — nav overlay
- `.ww-store-icon`, `.ww-store-icon-tiktok`, `.ww-store-icon-shopee`, `.ww-store-icon-lazada`

## Image paths (all downloaded)
- `/sites/hoantienms-manus-722fa8de/root-8a5edab2/images/winwin-wallet.jpg` — hero
- `/sites/hoantienms-manus-722fa8de/root-8a5edab2/images/mobile-link-card.jpg` — how-it-works
- `/sites/hoantienms-manus-722fa8de/root-8a5edab2/images/route-illustration.jpg` — benefits
- `/sites/hoantienms-manus-722fa8de/root-8a5edab2/images/cashback-seal.jpg` — FAQ

## Responsive (all sections)
- Desktop (≥1024px): 2-column layouts with lg:grid-cols-2
- Mobile (<640px): single column, flex-col

## Verification
- FAQSection needs 'use client'
- All others are server components
- Run `npx tsc --noEmit` before marking complete
