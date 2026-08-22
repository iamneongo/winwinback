# Design Tokens — win-win back

## Colors

| Token | Value | Usage |
|-------|-------|-------|
| `bg-navy` | `#082b4b` | Hero bg, FAQ bg, Footer bg |
| `bg-cream` | `#fcfcf7` | Partners bg, Benefits bg |
| `bg-mint` | `#e9f5ef` | How it works bg |
| `bg-ice` | `#edf6f7` | Final CTA bg |
| `theme-color` | `#0b2f55` | Meta theme-color |
| `text-dark-navy` | `rgb(16, 46, 71)` = `#102e47` | Logo text, headings on light bg |
| `text-white` | `rgb(255,255,255)` | H1 on dark bg |
| `text-white-70` | `oklab(1 0 0 / 0.70)` | Body text on dark bg |
| `text-white-74` | `oklab(1 0 0 / 0.74)` | Nav links on dark bg |
| `lime-green` | `rgb(183, 233, 97)` = `#b7e961` | CTA button bg, console dot |
| `lime-gold-gradient` | `linear-gradient(105deg, #b7e961, #cfe35a 48%, #eabf39)` | Hero H1 "Nhận hoàn tiền." span |
| `badge-green` | `rgb(197, 237, 120)` = `#c5ed78` | Hero badge text |
| `accent-green` | `#b7e961` | Icons accent, check icons |
| `tiktok-bg` | `linear-gradient(145deg, #05111e, #1b3142)` | TikTok store icon bg |
| `shopee-bg` | `linear-gradient(145deg, #fc704b, #db3f26)` | Shopee store icon bg |
| `lazada-bg` | `linear-gradient(145deg, purple range)` | Lazada store icon bg |
| `border-white-12` | `rgba(255,255,255,0.12)` | Console card border on dark |
| `input-gray` | `#6b8290` | Console input icon color |

## Typography

| Element | Font | Size | Weight | Line Height | Letter Spacing |
|---------|------|------|--------|-------------|----------------|
| All | Google Sans Flex | varies | varies | varies | varies |
| Hero H1 | Google Sans Flex | 76.8px | 700 | 68.352px | -5.376px |
| Hero badge | Google Sans Flex | 9.28px | 800 | 13.92px | 1.392px |
| Hero subtext | Google Sans Flex | 16px | 400 | 24px | normal |
| Nav links | Google Sans Flex | 11px | 700 | auto | normal |
| Section H2 | Google Sans Flex | ~48-56px | 700 | tight | negative |
| Body | Google Sans Flex | 16px | 400 | 24px | normal |

## Spacing Scale (Tailwind-based)
- Section padding: `py-14 sm:py-20` (56px / 80px)
- Large sections: `py-16 sm:py-24` (64px / 96px)
- Hero: `pt-[110px] pb-12` (110px top, 48px bottom)
- Container: max-w-screen-xl + px-6

## Border Radius
- Buttons (pill): `rounded-full`
- Cards: `rounded-2xl` (~16px)
- Console card: `rounded-2xl`
- Store icon bubbles: `rounded-[28%]`
- Image containers: `rounded-2xl`

## Shadows
- Console card: subtle shadow on white card
- Nav CTA button: subtle glow on lime bg

## Hero Background Gradient
```
radial-gradient(circle at 76% 27%, rgba(163, 225, 78, 0.26), transparent 19%),
radial-gradient(circle at 68% 71%, rgba(234, 191, 57, 0.12), transparent 22%),
solid #082b4b
```

## Nav Header Gradient
```
linear-gradient(rgba(5, 32, 57, 0.28), rgba(0, 0, 0, 0))
```
