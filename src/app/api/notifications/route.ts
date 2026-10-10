import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/guards";
import { getBellData } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireUser();
  const data = await getBellData(user.id);
  return NextResponse.json(data, {
    headers: { "Cache-Control": "private, no-store, max-age=0" },
  });
}
