"use server";

import { revalidatePath } from "next/cache";
import { and, eq, gt, lt, ne, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { luckyDrawPeriods } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/guards";
import { runDraw } from "@/lib/lucky-draw/service";
import { formatVnd } from "@/lib/config";

export type ActionState = { error?: string; success?: string } | undefined;

const periodSchema = z.object({
  name: z.string().trim().min(1, "Nhập tên kỳ").max(120),
  startAt: z.string().min(1, "Chọn ngày mở"),
  endAt: z.string().min(1, "Chọn ngày đóng"),
  adminContribution: z.coerce.number().int().min(0).max(100_000_000),
  fundingNote: z.string().trim().max(500),
  includeCommissionFund: z.boolean(),
});

function parsePeriod(formData: FormData) {
  const parsed = periodSchema.safeParse({
    name: formData.get("name"),
    startAt: formData.get("startAt"),
    endAt: formData.get("endAt"),
    adminContribution: formData.get("adminContribution"),
    fundingNote: formData.get("fundingNote") ?? "",
    includeCommissionFund: formData.get("includeCommissionFund") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" } as const;
  const start = new Date(parsed.data.startAt);
  const end = new Date(parsed.data.endAt);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return { error: "Ngày không hợp lệ" } as const;
  if (end <= start) return { error: "Ngày đóng phải sau ngày mở" } as const;
  if (!parsed.data.includeCommissionFund && parsed.data.adminContribution === 0) {
    return { error: "Cần nhập tiền admin tài trợ hoặc chọn cộng quỹ tích lũy" } as const;
  }
  return { data: { ...parsed.data, start, end } } as const;
}

async function checkOverlap(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  start: Date,
  end: Date,
  exceptId?: string,
) {
  // Serialize schedule changes so two concurrent admins cannot create
  // overlapping open periods and promise the same commission fund twice.
  await tx.execute(sql`select pg_advisory_xact_lock(20261020, 1)`);
  const [overlap] = await tx.select({ id: luckyDrawPeriods.id })
    .from(luckyDrawPeriods)
    .where(and(
      eq(luckyDrawPeriods.status, "open"),
      lt(luckyDrawPeriods.startAt, end),
      gt(luckyDrawPeriods.endAt, start),
      exceptId ? ne(luckyDrawPeriods.id, exceptId) : undefined,
    ))
    .limit(1);
  return Boolean(overlap);
}

export async function createPeriodAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = parsePeriod(formData);
  if ("error" in parsed) return { error: parsed.error };
  const { data } = parsed;
  if (data.end <= new Date()) return { error: "Ngày đóng kỳ mới phải ở tương lai" };
  const created = await db.transaction(async (tx) => {
    if (await checkOverlap(tx, data.start, data.end)) return false;
    await tx.insert(luckyDrawPeriods).values({
      name: data.name,
      startAt: data.start,
      endAt: data.end,
      adminContribution: data.adminContribution,
      includeCommissionFund: data.includeCommissionFund,
      fundingNote: data.fundingNote || null,
      fundingUpdatedBy: admin.id,
      fundingUpdatedAt: new Date(),
      status: "open",
    });
    return true;
  });
  if (!created) return { error: "Khoảng thời gian trùng với một kỳ đang mở khác." };
  revalidatePath("/admin/rut-tham");
  revalidatePath("/dashboard/rut-tham");
  return { success: "Đã tạo kỳ quay" };
}

const updateSchema = z.object({ periodId: z.string().uuid() });

export async function updatePeriodAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const idResult = updateSchema.safeParse({ periodId: formData.get("periodId") });
  if (!idResult.success) return { error: "Kỳ quay không hợp lệ" };
  const parsed = parsePeriod(formData);
  if ("error" in parsed) return { error: parsed.error };
  const { data } = parsed;
  const result = await db.transaction(async (tx) => {
    // Same advisory lock as create, before reading the period to prevent
    // schedule races with another edit or new period.
    await tx.execute(sql`select pg_advisory_xact_lock(20261020, 1)`);
    const [period] = await tx.select().from(luckyDrawPeriods)
      .where(eq(luckyDrawPeriods.id, idResult.data.periodId)).for("update").limit(1);
    if (!period) return "missing" as const;
    if (period.status !== "open") return "drawn" as const;
    if (period.startAt <= new Date() && (
      data.adminContribution < period.adminContribution ||
      (period.includeCommissionFund && !data.includeCommissionFund)
    )) return "reducePrize" as const;
    if (await checkOverlap(tx, data.start, data.end, period.id)) return "overlap" as const;
    await tx.update(luckyDrawPeriods).set({
      name: data.name,
      startAt: data.start,
      endAt: data.end,
      adminContribution: data.adminContribution,
      includeCommissionFund: data.includeCommissionFund,
      fundingNote: data.fundingNote || null,
      fundingUpdatedBy: admin.id,
      fundingUpdatedAt: new Date(),
    }).where(eq(luckyDrawPeriods.id, period.id));
    return "updated" as const;
  });
  if (result === "missing") return { error: "Không tìm thấy kỳ quay" };
  if (result === "drawn") return { error: "Kỳ đã quay không thể chỉnh sửa" };
  if (result === "reducePrize") return { error: "Kỳ đã mở không thể giảm giải thưởng đã công bố. Bạn vẫn có thể tăng tiền tài trợ." };
  if (result === "overlap") return { error: "Khoảng thời gian trùng với một kỳ đang mở khác." };
  revalidatePath("/admin/rut-tham");
  revalidatePath(`/admin/rut-tham/${idResult.data.periodId}`);
  revalidatePath("/dashboard/rut-tham");
  return { success: "Đã cập nhật kỳ quay và ngân sách" };
}

const drawSchema = z.object({ periodId: z.string().uuid() });

export async function runDrawAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = drawSchema.safeParse({ periodId: formData.get("periodId") });
  if (!parsed.success) return { error: "Dữ liệu không hợp lệ" };

  try {
    const r = await runDraw(parsed.data.periodId);
    revalidatePath("/admin/rut-tham");
    revalidatePath("/dashboard/rut-tham");
    const msg =
      r.ticketCount === 0
        ? `Không có phiếu nào — toàn bộ quỹ ${formatVnd(r.pot)} cộng dồn sang kỳ sau.`
        : r.exactMatch
          ? `Số trúng ${r.winningNumber}: ${r.winners.length} người trúng, chia tổng ${formatVnd(r.paidOut)}.`
          : `Không ai trùng ${r.winningNumber}. ${r.winners.length} phiếu gần nhất nhận ${formatVnd(r.paidOut)} (20%); còn ${formatVnd(r.rollover)} cộng dồn.`;
    return { success: msg };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Quay số thất bại" };
  }
}
