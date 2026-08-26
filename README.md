# Win-Win Back

Landing page for **Win-Win Back** — a Vietnamese cashback service. Paste a product
link from TikTok Shop or Shopee and get cashback to your wallet when the order
completes.

## Tech Stack

- [Next.js 16](https://nextjs.org) (App Router, React 19, TypeScript strict, static export)
- [Tailwind CSS v4](https://tailwindcss.com) with oklch design tokens
- [shadcn/ui](https://ui.shadcn.com) primitives + `cn()` utility
- [Lucide](https://lucide.dev) icons + local SVG components

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command             | Description                      |
| ------------------- | -------------------------------- |
| `npm run dev`       | Start the dev server             |
| `npm run build`     | Production build (static export) |
| `npm run start`     | Serve the production build       |
| `npm run lint`      | ESLint check                     |
| `npm run typecheck` | TypeScript check                 |
| `npm run check`     | lint + typecheck + build         |

## Project Structure

```
src/
  app/              # Routes: page, layout, not-found, globals.css
  components/
    sections/       # Page sections (Hero, Console, FAQ, Footer, ...)
    ui/             # shadcn/ui primitives
  lib/utils.ts      # cn() helper
public/
  images/           # Site images
```

## Deployment

Builds to a static export and is served via Docker. See `Dockerfile` and
`docker-compose.yml`.
