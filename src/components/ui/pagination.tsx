import Link from "next/link";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

function Pagination({ className, ...props }: ComponentProps<"nav">) {
  return <nav data-slot="pagination" role="navigation" className={cn("mx-auto flex w-full justify-center", className)} {...props} />;
}

function PaginationContent({ className, ...props }: ComponentProps<"ul">) {
  return <ul data-slot="pagination-content" className={cn("flex flex-row items-center gap-1", className)} {...props} />;
}

function PaginationItem(props: ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />;
}

function PaginationLink({ className, isActive, ...props }: ComponentProps<typeof Link> & { isActive?: boolean }) {
  return <Link data-slot="pagination-link" aria-current={isActive ? "page" : undefined} className={cn("inline-flex size-9 items-center justify-center rounded-lg border border-transparent bg-white text-sm font-semibold text-[#345b76] transition-colors hover:bg-[#eaf5e4] hover:text-[#1d6430] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#65a935] sm:size-10", isActive && "bg-[#12365a] text-white hover:bg-[#12365a] hover:text-white", className)} {...props} />;
}

function PaginationPrevious(props: Omit<ComponentProps<typeof PaginationLink>, "children">) {
  return <PaginationLink aria-label="Trang trước" {...props}><ChevronLeft className="size-4" aria-hidden="true" /><span className="sr-only">Trước</span></PaginationLink>;
}

function PaginationNext(props: Omit<ComponentProps<typeof PaginationLink>, "children">) {
  return <PaginationLink aria-label="Trang sau" {...props}><ChevronRight className="size-4" aria-hidden="true" /><span className="sr-only">Sau</span></PaginationLink>;
}

function PaginationEllipsis() {
  return <span data-slot="pagination-ellipsis" aria-hidden="true" className="flex size-9 items-center justify-center text-[#607a97] sm:size-10"><MoreHorizontal className="size-4" /></span>;
}

export { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis };
