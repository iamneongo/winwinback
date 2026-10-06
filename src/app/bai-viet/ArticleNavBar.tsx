"use client";

import { usePathname } from "next/navigation";
import { NavBar } from "@/components/sections/NavBar";

export function ArticleNavBar() {
  const pathname = usePathname();
  return <NavBar variant={pathname === "/bai-viet" ? "news-overlay" : "solid"} />;
}
