import { eq } from "drizzle-orm";
import { db } from "@/db";
import { missionClaims } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return new Response("Forbidden", { status: 403 });
  }

  const { id } = await context.params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return new Response("Not found", { status: 404 });
  }

  const [claim] = await db
    .select({ data: missionClaims.proofImageData, mime: missionClaims.proofImageMime })
    .from(missionClaims)
    .where(eq(missionClaims.id, id))
    .limit(1);

  if (!claim?.data || !claim.mime || !["image/png", "image/jpeg", "image/webp"].includes(claim.mime)) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(new Uint8Array(Buffer.from(claim.data, "base64")), {
    headers: {
      "Content-Type": claim.mime,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
