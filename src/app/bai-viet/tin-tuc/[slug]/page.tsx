import { redirect } from "next/navigation";

/** Former sample guides are no longer part of the live article catalogue. */
export default function LegacyEditorialArticlePage() {
  redirect("/bai-viet");
}
