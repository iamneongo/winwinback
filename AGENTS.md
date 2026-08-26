<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Win-Win Back

## What This Is
Landing page for Win-Win Back — a Vietnamese cashback service. Paste a product link from TikTok Shop or Shopee, get cashback to your wallet when the order completes.

## Tech Stack
- **Framework:** Next.js 16 (App Router, React 19, TypeScript strict, static export)
- **UI:** shadcn/ui (Radix primitives, Tailwind CSS v4, `cn()` utility)
- **Icons:** Lucide React + local SVG components
- **Styling:** Tailwind CSS v4 with oklch design tokens
- **Deployment:** Docker (static export served via `serve`)

## Commands
- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run lint` — ESLint check
- `npm run typecheck` — TypeScript check
- `npm run check` — Run lint + typecheck + build

## Code Style
- TypeScript strict mode, no `any`
- Named exports, PascalCase components, camelCase utils
- Tailwind utility classes
- 2-space indentation
- Responsive: mobile-first

## Project Structure
```
src/
  app/              # Next.js routes (page, layout, not-found, globals.css)
  components/
    sections/       # Page sections (Hero, Console, FAQ, Footer, ...)
    ui/             # shadcn/ui primitives
    SmoothScroll.tsx, ScrollReveal.tsx
  lib/
    utils.ts        # cn() utility (shadcn)
public/
  images/           # Site images
  favicon.svg, favicon.png
```
