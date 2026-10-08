import assert from "node:assert/strict";
import { test } from "node:test";
import { DEFAULT_MISSIONS } from "../src/lib/missions/catalog";
import { FIRST_ORDER_WAIT_MS, REFERRAL_WINDOW_MS, firstOrderRewardReady, referralOrderEligible } from "../src/lib/missions/eligibility";

test("NHVU defaults have the requested rewards and stable unique keys", () => {
  assert.equal(new Set(DEFAULT_MISSIONS.map((mission) => mission.key)).size, DEFAULT_MISSIONS.length);
  assert.deepEqual(DEFAULT_MISSIONS.map(({ key, reward }) => [key, reward]), [
    ["first_order", 5_000],
    ["join_group", 5_000],
    ["video_1000", 10_000],
    ["video_5000", 10_000],
    ["video_10000", 30_000],
    ["video_50000", 50_000],
    ["video_200000", 100_000],
    ["invite_qualified", 20_000],
  ]);
});

test("first order unlocks only at T+3 after cashback settlement", () => {
  const settledAt = new Date("2026-10-01T10:00:00.000Z");
  assert.equal(firstOrderRewardReady(null, new Date("2026-10-10T10:00:00.000Z")), false);
  assert.equal(firstOrderRewardReady(settledAt, new Date(settledAt.getTime() + FIRST_ORDER_WAIT_MS - 1)), false);
  assert.equal(firstOrderRewardReady(settledAt, new Date(settledAt.getTime() + FIRST_ORDER_WAIT_MS)), true);
});

test("invitation bonus requires a settled commission order within 60 days", () => {
  const joinedAt = new Date("2026-08-01T00:00:00.000Z");
  const base = {
    joinedAt,
    referredAt: joinedAt,
    orderedAt: new Date(joinedAt.getTime() + REFERRAL_WINDOW_MS),
    completed: true,
    cashbackCreditedAt: new Date("2026-10-02T00:00:00.000Z"),
    commissionAmount: 1_000,
  };
  assert.equal(referralOrderEligible(base), true);
  assert.equal(referralOrderEligible({ ...base, orderedAt: new Date(base.orderedAt.getTime() + 1) }), false);
  assert.equal(referralOrderEligible({ ...base, completed: false }), false);
  assert.equal(referralOrderEligible({ ...base, cashbackCreditedAt: null }), false);
  assert.equal(referralOrderEligible({ ...base, commissionAmount: 0 }), false);
  assert.equal(referralOrderEligible({ ...base, orderedAt: new Date(joinedAt.getTime() - 1) }), false);
  assert.equal(referralOrderEligible({ ...base, referredAt: new Date(base.orderedAt.getTime() + 1) }), false);
});
