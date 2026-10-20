import assert from "node:assert/strict";
import { test } from "node:test";
import { balanceAfterDraw, periodPrizePool } from "../src/lib/lucky-draw/funding";

test("admin pledge and accumulated commission combine only when selected", () => {
  assert.equal(periodPrizePool(2_000_000, true, 5_160), 2_005_160);
  assert.equal(periodPrizePool(2_000_000, false, 5_160), 2_000_000);
});

test("unpaid pledge rolls forward while excluded commission remains untouched", () => {
  assert.equal(balanceAfterDraw(5_160, 2_000_000, 2_000_000), 5_160);
  assert.equal(balanceAfterDraw(5_160, 2_000_000, 400_000), 1_605_160);
  assert.equal(balanceAfterDraw(5_160, 2_000_000, 0), 2_005_160);
});
