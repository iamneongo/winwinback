import "server-only";
import { and, eq, gte, isNotNull, isNull, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import { orders, referralRewards, users } from "@/db/schema";
import { recordWalletTx } from "@/lib/wallet";
import { createNotification } from "@/lib/notifications";
import { formatVnd } from "@/lib/config";
import { getMission } from "./definitions";
import { referralOrderEligible } from "./eligibility";

const REFERRAL_MISSION_KEY = "invite_qualified";

/** Pay both people once for a referred customer's qualifying completed order. */
export async function settleReferralReward(orderId: string): Promise<boolean> {
  const mission = await getMission(REFERRAL_MISSION_KEY);
  if (!mission || mission.kind !== "referral" || mission.reward <= 0) return false;

  const paid = await db.transaction(async (tx) => {
    const [order] = await tx.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    if (!order) return null;

    const [referred] = await tx.select({
      id: users.id,
      name: users.name,
      referredBy: users.referredBy,
      referredAt: users.referredAt,
      createdAt: users.createdAt,
    }).from(users).where(eq(users.id, order.userId)).limit(1);
    if (!referred?.referredBy || !referred.referredAt || referred.referredBy === referred.id) return null;
    if (!referralOrderEligible({
      joinedAt: referred.createdAt,
      referredAt: referred.referredAt,
      orderedAt: order.orderedAt,
      completed: order.status === "completed",
      cashbackCreditedAt: order.cashbackCreditedAt,
      commissionAmount: order.commissionAmount,
    })) return null;

    const inserted = await tx.insert(referralRewards).values({
      referredUserId: referred.id,
      referrerUserId: referred.referredBy,
      orderId: order.id,
      missionKey: mission.key,
      rewardEach: mission.reward,
    }).onConflictDoNothing().returning({ referredUserId: referralRewards.referredUserId });
    if (!inserted.length) return null;

    await recordWalletTx(tx, {
      userId: referred.referredBy,
      type: "reward",
      amount: mission.reward,
      orderId: order.id,
      note: `Thưởng mời bạn: ${referred.name}`,
    });
    await recordWalletTx(tx, {
      userId: referred.id,
      type: "reward",
      amount: mission.reward,
      orderId: order.id,
      note: "Thưởng tham gia qua lời mời và hoàn thành đơn đầu tiên",
    });
    return { referrerId: referred.referredBy, referredId: referred.id, amount: mission.reward };
  });

  if (!paid) return false;
  await Promise.all([
    createNotification({
      userId: paid.referrerId,
      type: "reward",
      title: "Bạn nhận thưởng mời bạn",
      body: `+${formatVnd(paid.amount)} vì người bạn được mời đã hoàn thành đơn hợp lệ.`,
      href: "/dashboard/vi",
    }),
    createNotification({
      userId: paid.referredId,
      type: "reward",
      title: "Bạn nhận thưởng từ lời mời",
      body: `+${formatVnd(paid.amount)} sau đơn mua hợp lệ đầu tiên.`,
      href: "/dashboard/vi",
    }),
  ]).catch(() => {});
  return true;
}

/** Claw back invitation bonuses when the source order is later cancelled. */
export async function reverseReferralReward(orderId: string): Promise<boolean> {
  return db.transaction(async (tx) => {
    const [bonus] = await tx.select().from(referralRewards)
      .where(eq(referralRewards.orderId, orderId)).for("update").limit(1);
    if (!bonus || bonus.reversedAt) return false;

    async function debitAvailable(userId: string, note: string): Promise<number> {
      const [user] = await tx.select({ balance: users.balance }).from(users)
        .where(eq(users.id, userId)).for("update").limit(1);
      const debit = Math.min(bonus.rewardEach, Math.max(0, user?.balance ?? 0));
      if (debit > 0) await recordWalletTx(tx, {
        userId,
        type: "adjustment",
        amount: -debit,
        orderId,
        note,
      });
      return bonus.rewardEach - debit;
    }

    const referrerUnrecovered = await debitAvailable(bonus.referrerUserId, "Thu hồi thưởng mời bạn do đơn bị hủy");
    const referredUnrecovered = await debitAvailable(bonus.referredUserId, "Thu hồi thưởng từ lời mời do đơn bị hủy");
    await tx.update(referralRewards).set({
      reversedAt: new Date(),
      referrerUnrecovered,
      referredUnrecovered,
    }).where(eq(referralRewards.referredUserId, bonus.referredUserId));
    if (referrerUnrecovered > 0 || referredUnrecovered > 0) {
      const note = `Cần thu hồi thưởng mời bạn: người mời ${formatVnd(referrerUnrecovered)}, người được mời ${formatVnd(referredUnrecovered)}.`;
      await tx.update(orders).set({
        adminNote: sql`concat_ws(E'\n', ${orders.adminNote}, ${note})`,
      }).where(eq(orders.id, orderId));
    }
    return true;
  });
}

/** Retry eligible orders after provider/worker timing or a transient failure. */
export async function reconcileReferralRewards(limit = 100): Promise<number> {
  const candidates = await db.select({ orderId: orders.id })
    .from(orders)
    .innerJoin(users, eq(users.id, orders.userId))
    .leftJoin(referralRewards, eq(referralRewards.referredUserId, users.id))
    .where(and(
      eq(orders.status, "completed"),
      isNotNull(orders.cashbackCreditedAt),
      sql`${orders.commissionAmount} > 0`,
      isNotNull(users.referredBy),
      isNotNull(users.referredAt),
      isNull(referralRewards.referredUserId),
      gte(orders.orderedAt, users.referredAt),
      lte(orders.orderedAt, sql`${users.createdAt} + interval '60 days'`),
    ))
    .orderBy(orders.orderedAt)
    .limit(limit);
  let awarded = 0;
  for (const { orderId } of candidates) {
    if (await settleReferralReward(orderId)) awarded++;
  }
  return awarded;
}

export async function reconcileReferralReversals(limit = 100): Promise<number> {
  const rows = await db.select({ orderId: referralRewards.orderId })
    .from(referralRewards)
    .innerJoin(orders, eq(orders.id, referralRewards.orderId))
    .where(and(eq(orders.status, "cancelled"), isNull(referralRewards.reversedAt)))
    .limit(limit);
  let reversed = 0;
  for (const { orderId } of rows) {
    if (await reverseReferralReward(orderId)) reversed++;
  }
  return reversed;
}
