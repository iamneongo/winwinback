import { requireUser } from "@/lib/auth/guards";
import {
  getShopeeDiscoverData,
  ShopeeDiscoverError,
} from "@/lib/affiliate/shopee/discover";

export const runtime = "nodejs";

export async function GET(request: Request) {
  await requireUser();
  const keyword = new URL(request.url).searchParams.get("q")?.trim().slice(0, 100) ?? "";
  const pageValue = Number(new URL(request.url).searchParams.get("page"));
  const page = Number.isSafeInteger(pageValue) && pageValue > 0 ? pageValue : 1;

  try {
    return Response.json(await getShopeeDiscoverData(keyword, page));
  } catch (error) {
    const message =
      error instanceof ShopeeDiscoverError
        ? error.message
        : "Không tải được ưu đãi Shopee";
    return Response.json({ message }, { status: 502 });
  }
}
