"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/guards";
import { isUuid } from "@/lib/is-uuid";
import type { ContactMessageStatus } from "@/lib/contact";

export async function updateContactMessageStatus(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!isUuid(id) || !(["new", "read", "resolved"] satisfies ContactMessageStatus[]).includes(status as ContactMessageStatus)) {
    throw new Error("Invalid contact message update");
  }

  await db.update(contactMessages)
    .set({ status, updatedAt: new Date() })
    .where(eq(contactMessages.id, id));
  revalidatePath("/admin/lien-he");
  revalidatePath(`/admin/lien-he/${id}`);
}
