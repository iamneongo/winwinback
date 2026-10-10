"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { affiliateLinks, bankAccounts, users, withdrawals } from "@/db/schema";
import { and, eq, lt, ne, or } from "drizzle-orm";
import { requireUser } from "@/lib/auth/guards";
import { detectPlatform } from "@/lib/affiliate/platform";
import { getAffiliateProvider } from "@/lib/affiliate/providers";
import { runArticleGeneration } from "@/lib/articles/progress";
import { generateShortCode } from "@/lib/shortcode";
import { recordWalletTx } from "@/lib/wallet";
import { notifyNewWithdrawalRequest } from "@/lib/notify";
import { minWithdrawal, cashbackRate } from "@/lib/config";
import { platformLabel } from "@/lib/labels";

export type ActionState =
  | {
      error?: string;
      success?: string;
      /** Set after a link is created so the client can offer to open it. */
      link?: {
        goPath: string;
        articleCode?: string;
        platformName: string;
        /** Estimated cashback for the buyer in VND, when resolvable. For a
         * product with several SKUs this is the lower bound and
         * `estimatedCashbackMax` the upper bound. */
        estimatedCashback?: number;
        estimatedCashbackMax?: number;
      };
      /**
       * Set when the pasted product cannot earn cashback (no affiliate program
       * for it). The UI shows a friendly popup instead of a raw error.
       */
      ineligible?: { platformName: string };
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

  const platformName = platformLabel[platform] ?? "sàn này";

  // Generate the short code up front so it can be embedded in the affiliate
  // link as a tracking sub id (used for order→user attribution).
  const shortCode = generateShortCode();

  let affiliateUrl: string;
  let title: string | undefined;
  let productId: string | undefined;
  let estimatedCashback: number | undefined;
  let estimatedCashbackMax: number | undefined;
  try {
    const result = await getAffiliateProvider(platform).convertLink(
      platform,
      parsed.data.url,
      { subId: shortCode, userId: user.id },
    );
    affiliateUrl = result.affiliateUrl;
    title = result.title;
    productId = result.productId;
    estimatedCashback =
      result.estimatedCommission != null
        ? Math.round(result.estimatedCommission * cashbackRate)
        : undefined;
    estimatedCashbackMax =
      result.estimatedCommissionMax != null
        ? Math.round(result.estimatedCommissionMax * cashbackRate)
        : undefined;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    // Only a known product-eligibility response belongs in the ineligible
    // dialog. Worker/network/auth failures must stay visible as errors.
    if (/sản phẩm.*(chưa tạo được link affiliate|không tham gia|không tìm thấy)|not eligible|no commission/i.test(msg)) {
      return { ineligible: { platformName } };
    }
    return { error: msg || `Không kiểm tra được link ${platformName}. Vui lòng thử lại.` };
  }

  // Insert with the pre-generated code; retry with a fresh code on the rare
  // collision (the embedded sub id then only matters for Shopee attribution,
  // which also falls back to item-id matching).
  let code = shortCode;
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      await db.insert(affiliateLinks).values({
        userId: user.id,
        platform,
        originalUrl: parsed.data.url,
        affiliateUrl,
        productId,
        shortCode: code,
        title,
        articleStatus: productId ? "queued" : null,
        articleUpdatedAt: productId ? new Date() : null,
      });
      revalidatePath("/dashboard");
      // Next.js keeps this work alive after the link response is sent. Its
      // progress is stored on the link so the popup can reconnect later.
      if (productId) {
        after(() => runArticleGeneration(code));
      }
      return {
        success: "Đã tạo link affiliate",
        link: {
          goPath: `/go/${code}`,
          articleCode: productId ? code : undefined,
          platformName: platformLabel[platform] ?? "cửa hàng",
          estimatedCashback,
          estimatedCashbackMax,
        },
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (!msg.includes("short_code")) {
        return { error: "Không lưu được link, thử lại sau" };
      }
      code = generateShortCode();
    }
  }
  return { error: "Không tạo được mã link, thử lại" };
}

export async function retryArticleAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const code = formData.get("code");
  if (typeof code !== "string" || !/^[a-zA-Z0-9]{4,32}$/.test(code)) return;

  const staleBefore = new Date(Date.now() - 4 * 60_000);
  const [link] = await db
    .update(affiliateLinks)
    .set({ articleStatus: "queued", articlePreview: null, articleUpdatedAt: new Date() })
    .where(and(
      eq(affiliateLinks.shortCode, code),
      eq(affiliateLinks.userId, user.id),
      ne(affiliateLinks.productId, ""),
      or(
        eq(affiliateLinks.articleStatus, "failed"),
        and(
          ne(affiliateLinks.articleStatus, "published"),
          lt(affiliateLinks.articleUpdatedAt, staleBefore),
        ),
      ),
    ))
    .returning({ shortCode: affiliateLinks.shortCode });
  if (!link) return;
  after(() => runArticleGeneration(link.shortCode));
  revalidatePath("/dashboard/bai-viet");
}

const withdrawalSchema = z.object({
  amount: z.coerce.number().int().positive("Số tiền không hợp lệ"),
  bankName: z.string().trim().min(1, "Nhập tên ngân hàng").max(80),
  bankAccount: z.string().trim().min(4, "Nhập số tài khoản").max(40),
  accountHolder: z.string().trim().min(1, "Nhập tên chủ tài khoản").max(80),
});

const bankAccountSchema = z.object({
  bankName: z.string().trim().min(1, "Nhập tên ngân hàng").max(80),
  bankAccount: z.string().trim().min(4, "Nhập số tài khoản").max(40),
  accountHolder: z.string().trim().min(1, "Nhập tên chủ tài khoản").max(80),
});

export async function saveBankAccountAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = bankAccountSchema.safeParse({
    bankName: formData.get("bankName"),
    bankAccount: formData.get("bankAccount"),
    accountHolder: formData.get("accountHolder"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Thông tin ngân hàng chưa hợp lệ" };
  }

  try {
    await db.insert(bankAccounts).values({ userId: user.id, ...parsed.data }).onConflictDoUpdate({
      target: bankAccounts.userId,
      set: { ...parsed.data, updatedAt: new Date() },
    });
  } catch {
    return { error: "Không lưu được tài khoản ngân hàng. Vui lòng thử lại." };
  }

  revalidatePath("/dashboard/tai-khoan");
  revalidatePath("/dashboard/vi");
  return { success: "Đã lưu tài khoản ngân hàng." };
}

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

  let withdrawalId: string;
  try {
    const createdWithdrawal = await db.transaction(async (tx) => {
      // Hold the funds now: debit the wallet and open a pending request.
      await recordWalletTx(tx, {
        userId: user.id,
        type: "withdrawal",
        amount: -amount,
        note: "Yêu cầu rút tiền",
      });
      const [withdrawal] = await tx.insert(withdrawals).values({
        userId: user.id,
        amount,
        bankName,
        bankAccount,
        accountHolder,
      }).returning({ id: withdrawals.id });
      return withdrawal;
    });
    withdrawalId = createdWithdrawal.id;
  } catch (e) {
    if (e instanceof Error && e.message === "INSUFFICIENT_BALANCE") {
      return { error: "Số dư không đủ" };
    }
    return { error: "Không gửi được yêu cầu, thử lại sau" };
  }

  // Best-effort admin notification; never block the user's request.
  await notifyNewWithdrawalRequest({
    withdrawalId,
    userId: user.id,
    userName: user.name,
    amount,
  }).catch(() => {});

  revalidatePath("/dashboard");
  return { success: "Đã gửi yêu cầu rút tiền" };
}
