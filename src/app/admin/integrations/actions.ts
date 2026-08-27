"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/guards";
import {
  connectTikTokWithAuthCode,
  refreshStoredTikTokToken,
  disconnectTikTok,
} from "@/lib/affiliate/tiktok/tokens";
import { TikTokApiError } from "@/lib/affiliate/tiktok/client";
import {
  fetchConnectedCreatorOrders,
  type TikTokOrderRow,
} from "@/lib/affiliate/tiktok/orders";

export type ActionState = { error?: string; success?: string } | undefined;

export type OrdersState =
  | { error?: string; rows?: TikTokOrderRow[]; fetchedAt?: string }
  | undefined;

const codeSchema = z.object({
  authCode: z.string().trim().min(4, "Nhập auth code từ TikTok"),
});

/** Manual fallback: exchange an auth code copied from the callback URL. */
export async function connectTikTokAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = codeSchema.safeParse({ authCode: formData.get("authCode") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
  }

  try {
    const data = await connectTikTokWithAuthCode(parsed.data.authCode);
    if (data.user_type !== 1) {
      return {
        error:
          "Token không phải tài khoản Creator (user_type ≠ 1). Hãy đăng nhập bằng tài khoản Affiliate Creator.",
      };
    }
    revalidatePath("/admin/integrations");
    return { success: "Đã kết nối TikTok Shop Affiliate Creator" };
  } catch (e) {
    if (e instanceof TikTokApiError) {
      return { error: `TikTok trả về lỗi (mã ${e.code}): ${e.message}` };
    }
    return { error: "Không kết nối được, kiểm tra lại auth code" };
  }
}

export async function refreshTikTokAction(): Promise<ActionState> {
  await requireAdmin();
  try {
    await refreshStoredTikTokToken();
    revalidatePath("/admin/integrations");
    return { success: "Đã làm mới access token" };
  } catch (e) {
    if (e instanceof TikTokApiError) {
      return { error: `Không làm mới được (mã ${e.code}): ${e.message}` };
    }
    return { error: "Không làm mới được token" };
  }
}

export async function disconnectTikTokAction(): Promise<ActionState> {
  await requireAdmin();
  await disconnectTikTok();
  revalidatePath("/admin/integrations");
  return { success: "Đã ngắt kết nối TikTok Shop" };
}

/** Fetch the connected creator's live affiliate orders from TikTok Shop. */
export async function fetchTikTokOrdersAction(): Promise<OrdersState> {
  await requireAdmin();
  try {
    const rows = await fetchConnectedCreatorOrders();
    return { rows, fetchedAt: new Date().toLocaleString("vi-VN") };
  } catch (e) {
    if (e instanceof TikTokApiError) {
      return { error: `TikTok trả về lỗi (mã ${e.code}): ${e.message}` };
    }
    return {
      error: e instanceof Error ? e.message : "Không tải được đơn hàng TikTok",
    };
  }
}
