# NavBar + HeroSection Specification

## Target files
- `src/components/sites/hoantienms-manus-722fa8de/root-8a5edab2/NavBar.tsx`
- `src/components/sites/hoantienms-manus-722fa8de/root-8a5edab2/HeroSection.tsx`

## Screenshot reference
- `docs/design-references/hoantienms-manus-722fa8de/root-8a5edab2/`

## Interaction model
- NavBar: Static with scroll-to-section on nav link click (via anchor href)
- HeroSection: Static

---

## 1. NavBar

### DOM Structure
```
<header class="hero-nav absolute inset-x-0 top-0 z-30">
  <div class="ww-nav-gradient" (absolute inset-0, pointer-events-none)>
  <div class="mx-auto max-w-screen-xl px-6 flex items-center justify-between h-[73px]">
    <a href="#top" class="flex items-center gap-2">
      <svg (winwin arrow logo)>
      <span class="font-bold text-white">win-win back</span>
    </a>
    <nav class="flex items-center gap-6">
      <button onClick scrollTo("#cach-hoat-dong") class="text-white/74 font-bold text-[11px] uppercase tracking-wide">Cách hoạt động</button>
      <button onClick scrollTo("#doi-tac") ...>Đối tác</button>
      <button onClick scrollTo("#giai-dap") ...>Giải đáp</button>
    </nav>
    <a href="#nhap-link" class="nav-cta rounded-full bg-[#b7e961] text-[#14334c] font-semibold px-4 py-2 flex items-center gap-2">
      Nhập link ngay <ArrowRight icon />
    </a>
  </div>
</header>
```

### Computed Styles (NavBar)
- position: absolute, inset-x-0, top-0, z-index: 30
- height: 73px
- background: linear-gradient(rgba(5, 32, 57, 0.28), rgba(0, 0, 0, 0)) — via .ww-nav-gradient class
- container: max-w-screen-xl mx-auto px-6, flex, items-center, justify-between

### Logo SVG (exact content)
```svg
<svg viewBox="0 0 48 48" className="h-8 w-8" aria-hidden="true">
  <defs>
    <linearGradient id="winwin-arrow" x1="4" y1="42" x2="43" y2="5" gradientUnits="userSpaceOnUse">
      <stop stopColor="#9AD336"/>
      <stop offset="1" stopColor="#EABF39"/>
    </linearGradient>
  </defs>
  <path d="M6 36.5 17.5 23l7.4 6.7L37.8 11" fill="none" stroke="url(#winwin-arrow)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="7.5"/>
  <path d="M29.2 11h8.6v8.6" fill="none" stroke="#EABF39" strokeLinecap="round" strokeLinejoin="round" strokeWidth="7.5"/>
</svg>
```

### Logo Text
- Text: "win-win back"
- font-weight: 700
- color: white
- font-size: 18px (approx, not exact computed)

### Nav links
- color: `rgba(255,255,255,0.74)` (oklab white at 0.74 opacity)
- font-size: 11px
- font-weight: 700
- text-transform: uppercase? (No, but all-caps appearance from font features)
- On hover: opacity 1

### CTA Button "Nhập link ngay →"
- background: rgb(183, 233, 97) = `#b7e961`
- color: rgb(20, 51, 76) = `#14334c`
- border-radius: full (pill)
- padding: ~9px 14px
- font-size: 16px
- display: flex, align-items: center, gap: 6px
- Has ArrowRight lucide icon (h-3.5 w-3.5)
- On hover: slight brightness reduction

---

## 2. HeroSection

### DOM Structure
```
<section class="reference-hero relative isolate overflow-hidden ww-hero-bg pb-12 pt-[110px]">
  <div class="reference-hero-surface absolute inset-0 (gradient overlay, pointer-events-none)">
  <div class="mx-auto max-w-screen-xl px-6 flex items-start justify-between gap-8">
    <!-- Left content -->
    <div class="flex-1 max-w-[628px]">
      <!-- Eyebrow badge -->
      <div class="flex items-center gap-[9.6px] text-[9.28px] font-extrabold tracking-[1.392px] text-[#c5ed78]">
        <span class="h-px w-8 bg-[#c5ed78] opacity-60"> (horizontal line)
        TIỀN HOÀN MỖI ĐƠN · MINH BẠCH · NHANH CHÓNG
      </div>
      <!-- H1 -->
      <h1 class="mt-4 text-[76.8px] font-bold leading-[0.89] tracking-[-0.07em] text-white">
        Dán link.<br/>
        <span class="ww-lime-text-gradient">Nhận hoàn tiền.</span>
      </h1>
      <!-- Subtext -->
      <p class="mt-5 text-base text-white/70 max-w-[490px] leading-6">
        Chỉ một thao tác trước khi mua sắm trên TikTok Shop, Shopee hoặc Lazada. Chúng tôi theo dõi đường hoàn tiền về cho bạn.
      </p>
      <!-- Feature pills -->
      <div class="mt-8 flex items-center gap-5">
        <div class="flex items-center gap-2 text-sm text-white/80">
          <CircleCheck class="h-4 w-4 text-[#b7e961]" />
          Không phát sinh phí
        </div>
        <div class="flex items-center gap-2 text-sm text-white/80">
          <ShieldCheck class="h-4 w-4 text-[#b7e961]" />
          Minh bạch điều kiện
        </div>
      </div>
    </div>
    <!-- Right: Hero image -->
    <div class="relative flex-shrink-0 w-[360px] sm:w-[420px] xl:w-[480px]">
      <!-- Main wallet image -->
      <div class="relative overflow-hidden rounded-2xl aspect-[4/5]">
        <Image src="/sites/hoantienms-manus-722fa8de/root-8a5edab2/images/winwin-wallet.jpg" fill alt="Ví hoàn tiền 3D với mũi tên tăng trưởng" class="object-cover" />
      </div>
      <!-- Decorative floating icon bubbles around the image (absolute positioned) -->
      <!-- Purple bubble top-right -->
      <div class="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-purple-500/80 flex items-center justify-center">
        <span class="text-white text-xl">⊕</span>
      </div>
      <!-- Red shopping bubble right side -->
      <div class="absolute right-[-20px] top-1/4 w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
        <ShoppingBag class="h-5 w-5 text-white" />
      </div>
      <!-- Orange cart bubble right -->
      <div class="absolute right-[-32px] top-1/2 w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
        <ShoppingCart class="h-5 w-5 text-white" />
      </div>
      <!-- Purple gift bubble right-bottom -->
      <div class="absolute right-[-20px] bottom-1/4 w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
        <Gift class="h-5 w-5 text-white" />
      </div>
      <!-- Music note bubble left -->
      <div class="absolute left-[-20px] top-1/3 w-10 h-10 rounded-full ww-arrow-icon flex items-center justify-center">
        <Music2 class="h-5 w-5 text-white" />
      </div>
      <!-- Red shopping small bubble left-bottom -->
      <div class="absolute bottom-4 -left-4 w-10 h-10 rounded-full bg-red-500/90 flex items-center justify-center">
        <ShoppingBag class="h-4 w-4 text-white" />
      </div>
    </div>
  </div>
</section>
```

### Computed Styles (HeroSection)
- background-color: rgb(8, 43, 75) = `#082b4b`
- background-image: radial-gradients (handled by .ww-hero-bg class)
- padding-top: 126px (pt-[110px] + nav height)
- padding-bottom: 56px (pb-12)
- position: relative, isolate, overflow-hidden
- Inner container: mx-auto max-w-screen-xl px-6

### Hero H1
- font-size: 76.8px → use `text-[76.8px]` or `text-7xl` (72px) or custom
- font-weight: 700
- line-height: 68.352px (0.89 ratio) → use `leading-none` or `leading-[0.89]`
- letter-spacing: -5.376px = roughly -7% → use `tracking-[-0.07em]`
- Line 1 "Dán link.": color white
- Line 2 "Nhận hoàn tiền.": lime-to-gold gradient via `.ww-lime-text-gradient`

### Hero Badge Eyebrow
- font-size: 9.28px → use `text-[9.28px]`
- font-weight: 800 (extrabold)
- letter-spacing: 1.392px → `tracking-[1.392px]`
- color: rgb(197, 237, 120) = `#c5ed78`
- Preceded by a thin horizontal line (w-8 h-px bg-current)

### Hero Subtext
- font-size: 16px
- color: white/70 opacity
- max-width: 490px
- margin-top: 20px

### Feature Pills (below subtext)
- margin-top: 32px (mt-8)
- Each pill: flex, items-center, gap-2
- Icon: h-4 w-4, color `#b7e961`
- Text: sm, white/80

### Hero Image
- Source: `/sites/hoantienms-manus-722fa8de/root-8a5edab2/images/winwin-wallet.jpg`
- Original: 1536x1920 (portrait, 4:5 ratio)
- Container: relative, rounded-2xl, overflow-hidden
- The image has decorative floating icon bubbles positioned absolutely around it
- Bubbles appear at: top-right (purple globe), right-side at various heights, left-side

## Assets Used
- Wallet image: `/sites/hoantienms-manus-722fa8de/root-8a5edab2/images/winwin-wallet.jpg`
- CSS classes from globals.css: `.ww-hero-bg`, `.ww-nav-gradient`, `.ww-lime-text-gradient`, `.winwin-root`

## Lucide Icons Used
- ArrowRight (nav CTA)
- CircleCheck (hero pill 1)
- ShieldCheck (hero pill 2)
- Music2, ShoppingBag, ShoppingCart, Gift (hero image decorative bubbles)

## Responsive Behavior
- Desktop (≥1024px): 2-column, image on right ~480px wide
- Tablet (768px): 2-column, image shrinks
- Mobile (<640px): single column, image hidden or shown below text
- Image bubbles: hide on mobile

## TypeScript
Use `'use client'` for NavBar (scroll behavior on button click).
HeroSection is a server component (static).

## Verification
Run `npx tsc --noEmit` before marking complete.
