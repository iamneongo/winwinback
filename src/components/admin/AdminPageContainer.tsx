import { cn } from "@/lib/utils";

/** Shared outer width and horizontal gutters for every admin route. */
export const ADMIN_PAGE_CONTAINER_CLASS = "mx-auto w-full min-w-0 max-w-[1600px] px-4 sm:px-6 lg:px-5";

export function AdminPageContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main className={cn(ADMIN_PAGE_CONTAINER_CLASS, className)}>
      {children}
    </main>
  );
}
