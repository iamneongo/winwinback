"use server";

import { revalidatePath } from "next/cache";
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
});

export async function createPeriodAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = periodSchema.safeParse({
    name: formData.get("name"),
    startAt: formData.get("startAt"),
    endAt: formData.get("endAt"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
  }
  const start = new Date(parsed.data.startAt);
  const end = new Date(parsed.data.endAt);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return { error: "Ngày không hợp lệ" };
  }
  if (end <= start) return { error: "Ngày đóng phải sau ngày mở" };

  await db.insert(luckyDrawPeriods).values({
    name: parsed.data.name,
    startAt: start,
    endAt: end,
    status: "open",
  });
  revalidatePath("/admin/rut-tham");
  return { success: "Đã tạo kỳ quay" };
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
