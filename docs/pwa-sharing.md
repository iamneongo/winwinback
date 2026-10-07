# Mobile share reception

- Android: install through Chrome. `/manifest.webmanifest` registers a GET share target at `/share-target` for `url`, `text`, and `title`.
- iOS: follow `/cai-dat-ung-dung#iphone` to create a share-sheet Shortcut. Text from Shortcut Input → URL Encode → Text containing `https://winwinback.com/share-target?text=` followed by the encoded variable → Open URLs. This opens Safari; it does not promise to open the installed PWA.
- The receiver validates and extracts a single supported URL, then redirects to existing `/start`. Existing login preservation and affiliate providers remain responsible for attribution and generation. No new env or DB migration is required.
- Invalid/multiple/oversized input returns to setup with a readable error. Other origins and credentials in URLs are rejected. Never fetch arbitrary shared URLs in this receiver.
- `public/sw.js` manages installation/activation only; it does not intercept requests. Android share launches, auth redirects and affiliate redirects use native browser navigation. A rejected fetch must not be replaced with an inaccurate offline page. No caching of account data and no background retries of purchases or Server Actions.
- Existing installations update the worker at the same `/sw.js` URL with `skipWaiting` and `clients.claim`. After deployment, open the site in Chrome while online, reload, then close/reopen the PWA before retrying a share. No clearing site data or signing out is required. This does not provide offline cashback functionality; real connection failures use the browser's network error UI.
- App icons are generated from the existing favicon by `node scripts/generate-pwa-icons.mjs` (Sharp bundled through Next).

## Verification

Run `npm run test:share`, lint, typecheck and production build. Service worker registration only runs in production, so verify with a production server on localhost or HTTPS.
With a production server on port 3100, run `npm run test:pwa` for HTTP receiver, sign-in handoff, manifest, icon and service worker checks. Set `PWA_TEST_BASE_URL` to test another deployment. Tests are unauthenticated and do not create affiliate records.

Device acceptance still needs real phones:
1. Android Chrome: install, sign in, share an actual Shopee product via the OS sheet, then repeat for TikTok. Verify popup, cashback, correct account and one new link per share. Also test signed-out handoff and a second share while PWA is already open.
2. iPhone Safari: create the documented Shortcut; share actual Shopee and TikTok products including promotional text and query parameters. Verify input survives sign-in. Adding to Home Screen alone is not sufficient for receiving shares on iOS.
3. Check missing/unsupported/multiple links; unsupported app-specific share menus may require opening More. Test airplane mode, reconnect and retry. Creating affiliate links and articles requires network access.
4. A one-tap iCloud Shortcut installation link must be created and shared from Apple's Shortcuts app on an Apple device. No unsigned downloadable shortcut or fabricated iCloud link is provided.
