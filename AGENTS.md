<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Win-Win Back

## What This Is
Landing page for Win-Win Back — a Vietnamese cashback service. Paste a product link from TikTok Shop or Shopee, get cashback to your wallet when the order completes.

## Tech Stack
- **Framework:** Next.js 16 (App Router, React 19, TypeScript strict, `output: standalone`)
- **Auth:** Better Auth (email + password, email verification via Resend). `users` doubles as Better Auth's `user` model; `sessions`/`accounts`/`verifications` are auth-owned. Passwords live in `accounts`.
- **DB:** Neon Postgres + Drizzle ORM
- **UI:** shadcn/ui (Base UI primitives, Tailwind CSS v4, `cn()` utility)
- **Icons:** Lucide React + local SVG components
- **Styling:** Tailwind CSS v4 with oklch design tokens
- **Email:** Resend (`src/lib/email.ts`; no-op when `RESEND_API_KEY` unset)
- **Deployment:** Docker (standalone Node server)

## Commands
- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run lint` — ESLint check
- `npm run typecheck` — TypeScript check
- `npm run check` — Run lint + typecheck + build

## Auth & Operations
- **Auth entry points:** `src/lib/auth.ts` (server, Better Auth), `src/lib/auth-client.ts` (browser). Route handler at `src/app/api/auth/[...all]/route.ts`. App code keeps using `getCurrentUser()` / `requireUser()` / `requireAdmin()` (`src/lib/auth/*`) — these now resolve the Better Auth session and return the `users` row.
- **Email verification:** required before sign-in (`requireEmailVerification: true`). If `RESEND_API_KEY` is unset the verification URL is logged to the server console (dev fallback).
- **Admin bootstrap:** emails in `ADMIN_EMAILS` (comma-separated) are granted the `admin` role at sign-up. To promote an existing user later: `npm run set-role -- <email> admin`.
- **DB schema changes:** edit `src/db/schema.ts`. `drizzle-kit push` needs a TTY (interactive) — in non-interactive shells apply DDL directly with a small `pg` script instead.
- **Order sync cron:** `GET /api/cron/sync-orders` with header `x-cron-secret: $CRON_SECRET`. Reconciles the connected TikTok creator's affiliate orders against known orders and auto-credits completed ones. New-order attribution stays with the affiliate webhook (`/api/webhooks/affiliate`). Schedule externally every 1–6h.
- **Required env:** `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `ADMIN_EMAILS`, `CRON_SECRET`, `WEBHOOK_SECRET`, `TIKTOK_APP_KEY/SECRET`, and optionally `RESEND_API_KEY` + `EMAIL_FROM`. See `.env.example`.

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
    ScrollReveal.tsx
  lib/
    utils.ts        # cn() utility (shadcn)
public/
  images/           # Site images
  favicon.svg, favicon.png
```
