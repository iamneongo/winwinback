import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

/** Preserve a pasted link across sign-in before Dashboard's auth layout runs. */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const url = request.nextUrl.searchParams.get("url")?.trim();
  const target = url
    ? `/dashboard?url=${encodeURIComponent(url)}&intent=${crypto.randomUUID()}#tao-link`
    : "/dashboard#tao-link";
  const user = await getCurrentUser();
  const destination = user
    ? target
    : `/login?next=${encodeURIComponent(target)}`;
  return NextResponse.redirect(new URL(destination, request.url));
}
