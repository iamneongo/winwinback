import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { runInNewContext } from "node:vm";

const source = await readFile(new URL("../public/sw.js", import.meta.url), "utf8");

function loadWorker() {
  const handlers = new Map();
  const calls = [];
  runInNewContext(source, {
    self: {
      addEventListener: (name, callback) => handlers.set(name, callback),
      skipWaiting: async () => { calls.push("skipWaiting"); },
      clients: { claim: async () => { calls.push("claim"); } },
    },
    fetch: () => assert.fail("Worker must not initiate network requests"),
    caches: { open: () => assert.fail("Worker must not cache private data") },
  });
  return { handlers, calls };
}

test("share, auth, dashboard and affiliate navigation stay browser-owned", () => {
  const { handlers } = loadWorker();
  assert.equal(handlers.has("fetch"), false);
  assert.equal(handlers.has("sync"), false);
});

test("updated worker activates and claims existing PWA clients", async () => {
  const { handlers, calls } = loadWorker();
  for (const name of ["install", "activate"]) {
    const pending = [];
    handlers.get(name)({ waitUntil: (promise) => pending.push(promise) });
    assert.equal(pending.length, 1);
    await Promise.all(pending);
  }
  assert.deepEqual(calls, ["skipWaiting", "claim"]);
});
