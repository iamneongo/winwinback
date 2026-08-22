# Behaviors — win-win back

## Scroll Behaviors
- No scroll-triggered header change observed (header stays transparent/gradient, does not shrink or change bg on scroll)
- No scroll-snap sections
- No IntersectionObserver-driven animations observed
- No parallax effects
- No Lenis or Locomotive Scroll

## Click/Interaction Behaviors

### Nav CTA "Nhập link ngay"
- Scrolls to `#nhap-link` section (smooth scroll via `href="#nhap-link"` anchor)
- Background: lime green `rgb(183, 233, 97)`, rounded pill shape

### Nav links (Cách hoạt động, Đối tác, Giải đáp)
- Scroll to respective sections: `#cach-hoat-dong`, `#doi-tac`, `#giai-dap`

### Console Section — Tab Switch
- Three tabs: TikTok Shop, Shopee, Lazada
- Default: TikTok Shop active
- Click a tab → tab gets active state (filled background matching platform color)
- INTERACTION MODEL: click-driven tab switch, no content change (same placeholder text)

### FAQ Accordion
- Three FAQ items, all collapsed by default
- Click question → expands to show answer
- Chevron icon rotates 180deg on expand
- One or multiple can be open at once

## Hover States
- Nav links: white text opacity 0.74 → full white (opacity 1) on hover
- CTA button "Nhập link ngay": slight darkening or scale on hover
- Partner cards (reference-store-card): group hover — likely scale or border glow
- "Thử với link của bạn →" link: text underline on hover
- FAQ items: subtle bg change on hover

## Responsive
- Desktop (≥1024px): 2-col layout in hero, how-it-works, benefits sections
- Mobile (<640px): single column, hero image hidden or stacked
- Tablet (~768px): intermediate behavior
