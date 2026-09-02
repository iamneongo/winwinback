"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { affiliateLinks, users, withdrawals } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireUser } from "@/lib/auth/guards";
import { detectPlatform } from "@/lib/affiliate/platform";
import { getAffiliateProvider } from "@/lib/affiliate/providers";
import { generateShortCode } from "@/lib/shortcode";
import { recordWalletTx } from "@/lib/wallet";
import { minWithdrawal } from "@/lib/config";
import { platformLabel } from "@/lib/labels";

export type ActionState =
  | {
      error?: string;
      success?: string;
      /** Set after a link is created so the client can offer to open it. */
      link?: { goPath: string; platformName: string };
    }
  | undefined;

const profileSchema = z.object({
  name: z.string().trim().min(1, "Vui lòng nhập tên hiển thị").max(80),
});

export async function updateProfileAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = profileSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
  }

  await db
    .update(users)
    .set({ name: parsed.data.name })
    .where(eq(users.id, user.id));
  revalidatePath("/dashboard/tai-khoan");
  revalidatePath("/dashboard", "layout");
  return { success: "Đã cập nhật tên hiển thị" };
}

export async function updateNotificationPrefsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const flag = (key: string) => formData.get(key) === "true";
  await db
    .update(users)
    .set({
      notifyOrders: flag("notifyOrders"),
      notifyCashback: flag("notifyCashback"),
      notifySystemEmail: flag("notifySystemEmail"),
    })
    .where(eq(users.id, user.id));
  revalidatePath("/dashboard/tai-khoan");
  return { success: "Đã lưu tùy chọn thông báo" };
}

const linkSchema = z.object({
  url: z.string().trim().url("Link sản phẩm không hợp lệ"),
});

export async function createLinkAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = linkSchema.safeParse({ url: formData.get("url") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Link không hợp lệ" };
  }

  const platform = detectPlatform(parsed.data.url);
  if (!platform) {
    return { error: "Chỉ hỗ trợ link từ Shopee hoặc TikTok Shop" };
  }

  let affiliateUrl: string;
  let title: string | undefined;
  try {
    const result = await getAffiliateProvider(platform).convertLink(
      platform,
      parsed.data.url,
    );
    affiliateUrl = result.affiliateUrl;
    title = result.title;
  } catch (e) {
    return {
      error:
        e instanceof Error ? e.message : "Không tạo được link affiliate",
    };
  }

  // Generate a unique short code (retry on the rare collision).
  for (let attempt = 0; attempt < 5; attempt++) {
    const shortCode = generateShortCode();
    try {
      await db.insert(affiliateLinks).values({
        userId: user.id,
        platform,
        originalUrl: parsed.data.url,
        affiliateUrl,
        shortCode,
        title,
      });
      revalidatePath("/dashboard");
      return {
        success: "Đã tạo link affiliate",
        link: {
          goPath: `/go/${shortCode}`,
          platformName: platformLabel[platform] ?? "cửa hàng",
        },
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (!msg.includes("short_code")) {
        return { error: "Không lưu được link, thử lại sau" };
      }
    }
  }
  return { error: "Không tạo được mã link, thử lại" };
}

const withdrawalSchema = z.object({
  amount: z.coerce.number().int().positive("Số tiền không hợp lệ"),
  bankName: z.string().trim().min(1, "Nhập tên ngân hàng").max(80),
  bankAccount: z.string().trim().min(4, "Nhập số tài khoản").max(40),
  accountHolder: z.string().trim().min(1, "Nhập tên chủ tài khoản").max(80),
});

export async function requestWithdrawalAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = withdrawalSchema.safeParse({
    amount: formData.get("amount"),
    bankName: formData.get("bankName"),
    bankAccount: formData.get("bankAccount"),
    accountHolder: formData.get("accountHolder"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
  }

  const { amount, bankName, bankAccount, accountHolder } = parsed.data;
  if (amount < minWithdrawal) {
    return { error: `Số tiền rút tối thiểu là ${minWithdrawal.toLocaleString("vi-VN")} ₫` };
  }

  try {
    await db.transaction(async (tx) => {
      // Hold the funds now: debit the wallet and open a pending request.
      await recordWalletTx(tx, {
        userId: user.id,
        type: "withdrawal",
        amount: -amount,
        note: "Yêu cầu rút tiền",
      });
      await tx.insert(withdrawals).values({
        userId: user.id,
        amount,
        bankName,
        bankAccount,
        accountHolder,
      });
    });
  } catch (e) {
    if (e instanceof Error && e.message === "INSUFFICIENT_BALANCE") {
      return { error: "Số dư không đủ" };
    }
    return { error: "Không gửi được yêu cầu, thử lại sau" };
  }

  revalidatePath("/dashboard");
  return { success: "Đã gửi yêu cầu rút tiền" };
}
