# Article studio rollout

## Status on 19 October 2026

- Development Neon migration `20261019_article_studio_v1` was applied and the database integration test passed.
- Dokploy production received a full `pg_dump -Fc` backup at `/var/lib/postgresql/18/docker/article-studio-backups/before-studio-20261019.dump`. Its table of contents was verified; a separate restore test remains to be done.
- The same migration was applied to production. The post-migration check found 42 articles, 42 reserved historical slugs, one default outro and all new tables.
- The named volume `winwinback-article-media` is configured at `/app/storage/article-media`. It takes effect on the next application deployment; confirm UID/GID 1000 write access and persistence after redeploy.

## Required order

1. Take a full PostgreSQL backup using Dokploy's backup facility or `pg_dump` and verify it in an isolated restore database. The migration also makes an article JSON snapshot; this is **not** a replacement for a full DB backup.
2. Mount a persistent volume at `/app/storage/article-media`, owned by UID/GID 1000 (the image runs as `node`). Set `ARTICLE_MEDIA_DIR=/app/storage/article-media`. Deploy one replica; a local volume is not shared between hosts.
3. With runtime DATABASE_URL configured, run `npm run db:migrate-article-studio` from the source checkout. The SQL is transactional, advisory-locked, additive, versioned in `app_migrations`, and safe to rerun. Do not run DDL on startup or per request.
4. Deploy the new image only after migration succeeds. Test private draft preview, upload, save, publish, metadata and a historical slug's HTTP 301.
5. Redeploy once and check that the uploaded image remains accessible. Include the volume in scheduled backup; restore DB and volume together so IDs and files remain matched.

## Rollback

Roll back the application image, leaving additive schema and media volume in place. Do not drop new tables or columns: drafts and revisions would be lost. Restore from backup only as a separately approved recovery operation. Old code does not understand separate drafts; avoid editing articles through the old editor during rollback.

## AI and limits

Uses existing NVIDIA_API_KEY/NVIDIA_BASE_URL/NVIDIA_MODEL; no secret reaches the browser. Admin assistant permits one in-flight request and six calls/minute per admin in this single-replica deployment. Timeouts preserve content. Restart resets the in-memory limit; use a shared limiter before scaling replicas.

## Media

New media accepts static JPEG/PNG/WebP/AVIF, at most 10 MB and 40 million pixels. Files are re-encoded into WebP with a 360px thumbnail; names on disk are UUIDs. Existing base64 images remain readable. Run `node scripts/convert-article-images.mjs` for a dry-run and `--apply` to convert after backup. Never delete media files directly: articles, drafts, versions, and templates may reference them.

## Acceptance

- `npm run test:articles`, `npm run lint`, `npm run typecheck`, `npm run build`.
- Two tabs editing the same revision must produce a conflict, not an overwrite.
- Draft save does not change published title/body/SEO; preview requires an admin session.
- Published noindex article stays out of sitemap; old slug returns 301 without dropping referral query.
- Image alt/caption/alignment and merged table cells survive save/reopen.
- AI error leaves the article intact; accepted proposals only change their intended target.
- Check 390px and desktop layouts, upload access control and media persistence after restart.
