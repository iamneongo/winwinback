import assert from "node:assert/strict";
import { test } from "node:test";
import { drawEmailBudget } from "../src/lib/lucky-draw/result-email-budget";

const usage = (dailyUsed: number, monthlyUsed = 125) => ({
  emails: {
    daily: { used: dailyUsed, limit: 100 },
    monthly: { used: monthlyUsed, limit: 3000 },
  },
});

test("limits each run to 25 and leaves 20 daily emails for other services", () => {
  assert.equal(drawEmailBudget(usage(2), 0), 25);
  assert.equal(drawEmailBudget(usage(79), 0), 1);
  assert.equal(drawEmailBudget(usage(80), 0), 0);
});

test("keeps its own 80-per-day cap even if provider usage lags", () => {
  assert.equal(drawEmailBudget(usage(2), 79), 1);
  assert.equal(drawEmailBudget(usage(2), 80), 0);
});

test("stops before monthly quota and on missing usage response", () => {
  assert.equal(drawEmailBudget(usage(2, 2979), 0), 1);
  assert.equal(drawEmailBudget({}, 0), 0);
});
