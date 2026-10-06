import { eq } from "drizzle-orm";
import { db } from "@/db";
import { articles } from "@/db/schema";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new Response(null, { status: 404 });
  const [article] = await db
    .select({ imageUrl: articles.imageUrl, status: articles.status })
    .from(articles)
    .where(eq(articles.id, id))
    .limit(1);
  const image = article?.imageUrl;
  if (article?.status !== "published" || !image?.startsWith("data:image/jpeg;base64,")) {
    return new Response(null, { status: 404 });
  }
  const encoded = image.slice("data:image/jpeg;base64,".length);
  if (encoded.length > 450_000 || !/^[A-Za-z0-9+/=]+$/.test(encoded)) {
    return new Response(null, { status: 404 });
  }
  return new Response(Buffer.from(encoded, "base64"), {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=300, must-revalidate",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
