import assert from "node:assert/strict";
import test from "node:test";
import { visiblePages } from "../src/lib/pagination";

test("pagination stays compact at the beginning, middle, and end", () => {
  assert.deepEqual(visiblePages(1, 34), [1, 2, "ellipsis", 34]);
  assert.deepEqual(visiblePages(17, 34), [1, "ellipsis", 16, 17, 18, "ellipsis", 34]);
  assert.deepEqual(visiblePages(34, 34), [1, "ellipsis", 33, 34]);
  assert.deepEqual(visiblePages(2, 3), [1, 2, 3]);
});
