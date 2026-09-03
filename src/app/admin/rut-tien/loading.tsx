import { Skeleton } from "@/components/ui/skeleton";

const sk = "bg-[#e7eef7]";

function MetricSkeleton() {
  return (
    <div className="rounded-xl border border-[#e4ebf5] bg-white p-4">
      <div className="flex items-center gap-3">
        <Skeleton className={`size-10 rounded-full ${sk}`} />
        <Skeleton className={`h-3 w-24 ${sk}`} />
      </div>
      <Skeleton className={`mt-4 h-7 w-20 ${sk}`} />
    </div>
  );
}

export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-5">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <MetricSkeleton key={i} />
        ))}
      </section>

      <section className="mt-3 overflow-hidden rounded-xl border border-[#e4ebf5] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf1f7] px-5 py-4">
          <div className="space-y-2">
            <Skeleton className={`h-4 w-48 ${sk}`} />
            <Skeleton className={`h-3 w-56 ${sk}`} />
          </div>
          <div className="flex gap-2">
            <Skeleton className={`h-9 w-56 rounded-lg ${sk}`} />
            <Skeleton className={`h-9 w-40 rounded-lg ${sk}`} />
          </div>
        </div>
        <div className="px-5 py-3">
          <div className="flex items-center gap-4 border-b border-[#edf1f7] pb-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className={`h-3 flex-1 ${sk}`} />
            ))}
          </div>
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 border-b border-[#f1f5fa] py-3.5"
            >
              <div className="flex flex-1 items-center gap-2">
                <Skeleton className={`size-7 rounded-full ${sk}`} />
                <Skeleton className={`h-3 w-24 ${sk}`} />
              </div>
              {Array.from({ length: 5 }).map((_, j) => (
                <Skeleton key={j} className={`h-3 flex-1 ${sk}`} />
              ))}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
