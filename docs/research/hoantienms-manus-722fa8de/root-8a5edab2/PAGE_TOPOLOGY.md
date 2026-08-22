# Page Topology — win-win back

**URL:** https://hoantienms-6skvtbyd.manus.space/  
**Site key:** hoantienms-manus-722fa8de  
**Page key:** root-8a5edab2

## Sections (top to bottom)

| # | Name | Element | Background | Interaction Model |
|---|------|---------|------------|-------------------|
| 1 | **NavBar** | `header.hero-nav` | Transparent + gradient overlay | Static; smooth scroll on nav link click |
| 2 | **Hero** | `section.reference-hero` | `#082b4b` + radial gradients | Static |
| 3 | **Console** | `section#nhap-link.reference-console` | White card on dark bg | Click-driven (tab switch: TikTok/Shopee/Lazada) |
| 4 | **Partners** | `section#doi-tac` | `#fcfcf7` | Static (hover on cards) |
| 5 | **How It Works** | `section#cach-hoat-dong` | `#e9f5ef` | Static |
| 6 | **Benefits** | `section` (5th) | `#fcfcf7` | Static |
| 7 | **FAQ** | `section#giai-dap.reference-faq` | `#082b4b` | Click-driven (accordion expand) |
| 8 | **Final CTA** | `section.reference-final-cta` | `#edf6f7` | Static |
| 9 | **Footer** | `footer` | `#082b4b` | Static |

## Layout
- Full-width, single column
- Page scroll: native (no smooth scroll library)
- No scroll snap
- Max content width: ~1280px (with px-6 padding)
- Nav: absolute positioned, overlays hero
- No sticky sidebar

## Z-Index layers
- NavBar: z-30 (absolute top)
- Hero image: z-10
- Floating icon bubbles on hero: z-20

## Dependencies
- NavBar overlays Hero section (absolute positioned, top-0)
- Console section is visually inside/below the hero dark background
