import "server-only";
import { and, count, eq, isNull, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  users,
  affiliateLinks,
  orders,
  missionClaims,
  referralRewards,
  type User,
} from "@/db/schema";
import { recordWalletTx } from "@/lib/wallet";
import { generateShortCode } from "@/lib/shortcode";
import { createNotification, notifyAdmins } from "@/lib/notifications";
import { formatVnd } from "@/lib/config";
import { type Mission } from "./catalog";
import { getMission, listMissions } from "./definitions";
import { FIRST_ORDER_WAIT_MS } from "./eligibility";

export type MissionState =
  | "locked" // auto: requirement not met yet
  | "claimable" // auto/referral: ready to claim the reward
  | "in_progress" // referral: some but not enough invites
  | "available" // manual: can submit proof
  | "submitted" // manual: waiting for admin review
  | "approved" // done + credited
  | "rejected"; // manual: admin rejected (can resubmit)

export type MissionView = Mission & {
  state: MissionState;
  progress?: { current: number; target: number };
  adminNote?: string | null;
};

type Duplicate = { duplicate: true };
type ActionResult = { ok: true } | { error: string };

function isUniqueViolation(e: unknown): boolean {
  const msg = e instanceof Error ? e.message : String(e);
  return /duplicate key|unique|mission_claims_user_mission/i.test(msg);
}

/** Ensure the user has an invite code; generate one lazily on first need. */
export async function ensureReferralCode(user: User): Promise<string> {
  if (user.referralCode) return user.referralCode;
  for (let i = 0; i < 6; i++) {
    const code = generateShortCode(6);
    try {
      await db
        .update(users)
        .set({ referralCode: code })
        .where(and(eq(users.id, user.id), isNull(users.referralCode)));
      // Re-read to return whatever code now sits on the row (handles a race
      // where a concurrent request set it first).
      const rows = await db
        .select({ referralCode: users.referralCode })
        .from(users)
        .where(eq(users.id, user.id))
        .limit(1);
      const stored = rows[0]?.referralCode;
      if (stored) return stored;
    } catch (e) {
      if (!isUniqueViolation(e)) throw e;
      // Code collided with another user's — try a fresh one.
    }
  }
  throw new Error("Không tạo được mã giới thiệu");
}

/** Count friends whose qualifying order already paid the two-sided bonus. */
export async function getReferralCount(userId: string): Promise<number> {
  const rows = await db
    .select({ n: count() })
    .from(referralRewards)
    .where(and(eq(referralRewards.referrerUserId, userId), isNull(referralRewards.reversedAt)));
  return rows[0]?.n ?? 0;
}

/**
 * Attach a referrer to `user` from an invite code, once. No-op if the user was
 * already referred, the code is unknown, or it resolves to the user itself.
 */
export async function attachReferral(user: User, code: string): Promise<void> {
  if (user.referredBy || !code) return;
  // The invitation must precede the first purchase; a late referral cookie
  // cannot retroactively claim a completed order.
  const [existingOrder] = await db.select({ id: orders.id }).from(orders)
    .where(eq(orders.userId, user.id)).limit(1);
  if (existingOrder) return;
  const rows = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.referralCode, code))
    .limit(1);
  const referrer = rows[0];
  if (!referrer || referrer.id === user.id) return;
  await db
    .update(users)
    .set({ referredBy: referrer.id, referredAt: new Date() })
    .where(and(eq(users.id, user.id), isNull(users.referredBy)));
}

/** Build the mission list with per-user state for the dashboard page. */
export async function getMissionState(user: User): Promise<MissionView[]> {
  const [missions, claims, linkRow, orderRow] = await Promise.all([
    listMissions(),
    db
      .select({
        missionKey: missionClaims.missionKey,
        status: missionClaims.status,
        adminNote: missionClaims.adminNote,
      })
      .from(missionClaims)
      .where(eq(missionClaims.userId, user.id)),
    db
      .select({ n: count() })
      .from(affiliateLinks)
      .where(eq(affiliateLinks.userId, user.id)),
    db
      .select({ n: count() })
      .from(orders)
      .where(and(
        eq(orders.userId, user.id),
        eq(orders.status, "completed"),
        sql`${orders.commissionAmount} > 0`,
        lte(orders.cashbackCreditedAt, new Date(Date.now() - FIRST_ORDER_WAIT_MS)),
      )),
  ]);
  const claimByKey = new Map(claims.map((c) => [c.missionKey, c]));
  const hasLink = (linkRow[0]?.n ?? 0) > 0;
  const hasSettledOrderT3 = (orderRow[0]?.n ?? 0) > 0;

  return missions.map((m): MissionView => {
    const claim = claimByKey.get(m.key);
    if (claim?.status === "approved") {
      return { ...m, state: "approved" };
    }
    if (claim?.status === "submitted") {
      return { ...m, state: "submitted" };
    }
    if (m.kind === "auto") {
      const met = m.check === "hasLink" ? hasLink : hasSettledOrderT3;
      return { ...m, state: met ? "claimable" : "locked" };
    }
    if (m.kind === "referral") {
      return { ...m, state: "in_progress" };
    }
    // manual
    if (claim?.status === "rejected") {
      return { ...m, state: "rejected", adminNote: claim.adminNote };
    }
    return { ...m, state: "available" };
  });
}

/** Credit a mission reward + record the claim atomically. */
async function grantReward(
  userId: string,
  mission: Mission,
): Promise<ActionResult | Duplicate> {
  try {
    await db.transaction(async (tx) => {
      await tx.insert(missionClaims).values({
        userId,
        missionKey: mission.key,
        status: "approved",
        reward: mission.reward,
        processedAt: new Date(),
      });
      await recordWalletTx(tx, {
        userId,
        type: "reward",
        amount: mission.reward,
        note: `Thưởng nhiệm vụ: ${mission.title}`,
      });
    });
  } catch (e) {
    if (isUniqueViolation(e)) return { duplicate: true };
    throw e;
  }
  await notifyRewarded(userId, mission);
  return { ok: true };
}

async function notifyRewarded(userId: string, mission: Mission): Promise<void> {
  await createNotification({
    userId,
    type: "reward",
    title: "Bạn nhận thưởng nhiệm vụ 🎁",
    body: `Nhiệm vụ “${mission.title}” — +${formatVnd(mission.reward)} vào ví.`,
    href: "/dashboard/vi",
  }).catch(() => {});
}

/** Claim a one-time auto mission whose condition the user has met. */
export async function claimMission(
  user: User,
  missionKey: string,
): Promise<ActionResult> {
  const mission = await getMission(missionKey);
  if (!mission) return { error: "Nhiệm vụ không tồn tại" };

  if (mission.kind === "auto") {
    const met =
      mission.check === "hasLink"
        ? (
            await db
              .select({ n: count() })
              .from(affiliateLinks)
              .where(eq(affiliateLinks.userId, user.id))
          )[0].n > 0
        : (
            await db
              .select({ n: count() })
              .from(orders)
              .where(and(
                eq(orders.userId, user.id),
                eq(orders.status, "completed"),
                sql`${orders.commissionAmount} > 0`,
                lte(orders.cashbackCreditedAt, new Date(Date.now() - FIRST_ORDER_WAIT_MS)),
              ))
          )[0].n > 0;
    if (!met) return { error: "Bạn chưa hoàn thành điều kiện nhiệm vụ này" };
  } else if (mission.kind === "referral") {
    return { error: "Thưởng mời bạn được cộng tự động khi đơn hợp lệ" };
  } else {
    return { error: "Nhiệm vụ này cần gửi bằng chứng để duyệt" };
  }

  const res = await grantReward(user.id, mission);
  if ("duplicate" in res) return { error: "Bạn đã nhận thưởng nhiệm vụ này rồi" };
  return res;
}

/** Submit (or resubmit after rejection) proof for a manual mission. */
export async function submitMissionProof(
  user: User,
  missionKey: string,
  evidence: { link: string | null; imageData: string | null; imageMime: string | null },
): Promise<ActionResult> {
  const mission = await getMission(missionKey);
  if (!mission || mission.kind !== "manual") {
    return { error: "Nhiệm vụ không hợp lệ" };
  }
  const existing = await db
    .select()
    .from(missionClaims)
    .where(
      and(
        eq(missionClaims.userId, user.id),
        eq(missionClaims.missionKey, missionKey),
      ),
    )
    .limit(1);
  const claim = existing[0];
  if (claim?.status === "approved") {
    return { error: "Nhiệm vụ đã hoàn thành" };
  }
  if (claim?.status === "submitted") {
    return { error: "Bằng chứng đang chờ duyệt" };
  }
  if (claim) {
    // Resubmit after a rejection.
    await db
      .update(missionClaims)
      .set({
        status: "submitted", reward: mission.reward, proof: evidence.link,
        proofImageData: evidence.imageData, proofImageMime: evidence.imageMime,
        adminNote: null, processedAt: null,
      })
      .where(eq(missionClaims.id, claim.id));
  } else {
    await db.insert(missionClaims).values({
      userId: user.id,
      missionKey,
      status: "submitted",
      reward: mission.reward,
      proof: evidence.link,
      proofImageData: evidence.imageData,
      proofImageMime: evidence.imageMime,
    });
  }
  await notifyAdmins({
    type: "system",
    title: "Nhiệm vụ chờ duyệt",
    body: `${user.name || "Người dùng"} gửi bằng chứng cho “${mission.title}”.`,
    href: "/admin/nhiem-vu",
  }).catch(() => {});
  return { ok: true };
}

// --- Admin ---------------------------------------------------------------

export type PendingClaim = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  missionKey: string;
  missionTitle: string;
  reward: number;
  proof: string | null;
  hasImage: boolean;
  createdAt: Date;
};

/** Manual mission claims awaiting admin review, newest first. */
export async function listPendingClaims(): Promise<PendingClaim[]> {
  const [rows, missions] = await Promise.all([db
    .select({
      id: missionClaims.id,
      userId: missionClaims.userId,
      userName: users.name,
      userEmail: users.email,
      missionKey: missionClaims.missionKey,
      reward: missionClaims.reward,
      proof: missionClaims.proof,
      imageMime: missionClaims.proofImageMime,
      createdAt: missionClaims.createdAt,
    })
    .from(missionClaims)
    .innerJoin(users, eq(users.id, missionClaims.userId))
    .where(eq(missionClaims.status, "submitted"))
    .orderBy(missionClaims.createdAt), listMissions()]);
  const byKey = new Map(missions.map((mission) => [mission.key, mission]));
  return rows.map((r) => ({
    ...r,
    hasImage: Boolean(r.imageMime),
    missionTitle: byKey.get(r.missionKey)?.title ?? r.missionKey,
  }));
}

export async function approveClaim(claimId: string): Promise<ActionResult> {
  const rows = await db
    .select()
    .from(missionClaims)
    .where(eq(missionClaims.id, claimId))
    .limit(1);
  const claim = rows[0];
  if (!claim) return { error: "Không tìm thấy nhiệm vụ" };
  if (claim.status !== "submitted") return { error: "Nhiệm vụ đã được xử lý" };
  const mission = await getMission(claim.missionKey);
  const reward = claim.reward;

  const credited = await db.transaction(async (tx) => {
    const updated = await tx
      .update(missionClaims)
      .set({ status: "approved", reward, processedAt: new Date() })
      .where(and(eq(missionClaims.id, claimId), eq(missionClaims.status, "submitted")))
      .returning({ id: missionClaims.id });
    if (!updated.length) return false;
    await recordWalletTx(tx, {
      userId: claim.userId,
      type: "reward",
      amount: reward,
      note: `Thưởng nhiệm vụ: ${mission?.title ?? claim.missionKey}`,
    });
    return true;
  });
  if (!credited) return { error: "Nhiệm vụ đã được xử lý" };
  if (mission) await notifyRewarded(claim.userId, mission);
  return { ok: true };
}

export async function rejectClaim(
  claimId: string,
  note: string,
): Promise<ActionResult> {
  const rows = await db
    .select()
    .from(missionClaims)
    .where(eq(missionClaims.id, claimId))
    .limit(1);
  const claim = rows[0];
  if (!claim) return { error: "Không tìm thấy nhiệm vụ" };
  if (claim.status !== "submitted") return { error: "Nhiệm vụ đã được xử lý" };
  const mission = await getMission(claim.missionKey);

  const updated = await db
    .update(missionClaims)
    .set({ status: "rejected", adminNote: note || null, processedAt: new Date() })
    .where(and(eq(missionClaims.id, claimId), eq(missionClaims.status, "submitted")))
    .returning({ id: missionClaims.id });
  if (!updated.length) return { error: "Nhiệm vụ đã được xử lý" };
  await createNotification({
    userId: claim.userId,
    type: "system",
    title: "Nhiệm vụ chưa được duyệt",
    body: `Nhiệm vụ “${mission?.title ?? claim.missionKey}” bị từ chối${note ? `: ${note}` : ""}. Bạn có thể gửi lại.`,
    href: "/dashboard/nhiem-vu",
  }).catch(() => {});
  return { ok: true };
}

/** Count of manual claims awaiting review (for the admin nav badge/metric). */
export async function countPendingClaims(): Promise<number> {
  const rows = await db
    .select({ n: count() })
    .from(missionClaims)
    .where(eq(missionClaims.status, "submitted"));
  return rows[0]?.n ?? 0;
}
