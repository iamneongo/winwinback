# SEO Module: P1/P2 operations

The advanced SEO features build on the P0 editor and public metadata implementation in `docs/seo-module-p0.md`. They do not change existing article URLs or publication status.

## Database migration and recovery

Run `node scripts/migrate-seo-advanced.mjs` against each database **before** deploying code that reads the new tables. The script uses `app_migrations`, an advisory transaction lock, and an atomic transaction. It adds `seo_templates`, `seo_audit_records`, `seo_audit_runs`, `seo_search_console`, `seo_search_metrics`, and `seo_ai_usage`. It does not mutate existing articles.

Take a database backup first, retain it outside the application container, and test restoration in a separate database. On 2026-10-20 the production Dokploy PostgreSQL backup was saved at `/var/lib/postgresql/manual-backups/winwinback-pre-seo-advanced-20261020.dump`; verify the persistent volume and copy the file to the normal off-site backup destination. Do not roll back by dropping these tables while the advanced version of the app is running. To revert application behavior, deploy the previous app version; retain the additive tables until a separately reviewed cleanup migration.

## Scheduled jobs

Both endpoints require `x-cron-secret: $CRON_SECRET` and return JSON. Configure an external scheduler to call:

- `GET /api/cron/seo-audit` daily, preferably outside peak traffic. It checks public articles and persists findings. External URL checks are limited and use DNS-pinned requests; a failed external check is advisory.
- `GET /api/cron/seo-search-console` daily after Search Console is connected. It imports page/date aggregates for the recent 28-day window. It returns `not_connected` without changing data before OAuth setup.

An endpoint existing is **not** evidence that a scheduler has been configured. Check the scheduler's execution history after deployment. For a one-off authenticated smoke test, call the endpoints with the cron header and verify the SEO dashboard's last-run/sync timestamps.

## Search Console

Configure `GSC_CLIENT_ID`, `GSC_CLIENT_SECRET`, and a random 32-byte hex `GSC_TOKEN_ENCRYPTION_KEY` in the server environment. Register `https://winwinback.com/api/admin/seo/search-console/callback` as the exact OAuth redirect URI in the Google client. The admin clicks Connect in `/admin/bai-viet/seo` and authorizes the read-only Search Console scope. Refresh tokens are AES-256-GCM encrypted in the database. This is site-performance reporting, not live keyword rank tracking; Google data can be delayed or incomplete.

Do not enable the connection with another site's Google client or property. Key rotation requires a planned reauthorization because existing stored tokens cannot be decrypted with a new key.

## Templates, audit, and AI

Templates use only the supported placeholders shown in the SEO dashboard. Applying a template in the manual editor is explicit; product-article generation applies the configured product/category template in its existing generation flow. Audit findings do not block publication. The AI assistant still runs only when requested by an admin and requires review before application. Per-user limits are 6 requests per minute on the single application replica and 60 requests per rolling 24 hours in the database. Token counts are logged when NVIDIA returns usage; cost is estimated only if both token-price environment variables are configured.

## QA after deployment

1. Run `npm run test:seo` and `npm run check` on the release source.
2. Verify `/admin/bai-viet/seo` loads for an admin and rejects an unauthenticated user.
3. Run the audit endpoint with the cron secret; confirm a last-run timestamp and findings in the dashboard.
4. Save a test template, preview it in the editor, apply it, save a draft, and reopen the draft. Confirm the published article remains unchanged until publishing.
5. After configuring Google OAuth, connect the correct verified property and run one sync. Compare one page/date row with Search Console, allowing for reporting delay.
6. Request one AI suggestion, reject it, then request and apply another. Confirm the usage table records the attempts and article text changes only after acceptance.
7. Confirm public article metadata and sitemap still follow the P0 rules; inspect a changed slug's permanent redirect.

The optional Google OAuth credentials and scheduled job configuration are deployment operations, not required for existing public SEO metadata to keep working.
