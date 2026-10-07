/*
 * Lifecycle-only worker. Let the browser perform requests and redirects natively,
 * including Android share-target launches and authentication handoffs.
 * Do not wrap navigations in fetch/respondWith: a rejected fetch is not proof
 * that the device is offline. Never cache account data or retry Server Actions.
 * Keep this script at the same URL so installed clients replace the old worker.
 */
self.addEventListener("install", (event) => event.waitUntil(self.skipWaiting()));
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
