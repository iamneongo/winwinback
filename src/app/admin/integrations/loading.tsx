import { Skeleton } from "@/components/ui/skeleton";

const sk = "bg-[#e7eef7]";

function MetricSkeleton() {
  return (
    <div className="rounded-xl border border-[#e4ebf5] bg-white p-4">
      <div className="flex items-center gap-3">
        <Skeleton className={`size-10 rounded-full ${sk}`} />
        <Skeleton className={`h-3 w-28 ${sk}`} />
      </div>
      <Skeleton className={`mt-4 h-7 w-16 ${sk}`} />
      <Skeleton className={`mt-2 h-3 w-32 ${sk}`} />
    </div>
  );
}

function MarketplaceSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-[#e4ebf5] bg-white">
      <div className="flex items-center justify-between border-b border-[#edf1f7] px-5 py-4">
        <div className="flex items-center gap-3">
          <Skeleton className={`size-10 rounded-lg ${sk}`} />
          <div className="space-y-2">
            <Skeleton className={`h-4 w-28 ${sk}`} />
            <Skeleton className={`h-3 w-36 ${sk}`} />
          </div>
        </div>
        <Skeleton className={`h-6 w-24 rounded-full ${sk}`} />
      </div>
      <div className="space-y-3 p-5">
        <Skeleton className={`h-4 w-full ${sk}`} />
        <Skeleton className={`h-4 w-3/4 ${sk}`} />
        <Skeleton className={`h-11 w-full rounded-lg ${sk}`} />
      </div>
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

      <section className="mt-3 grid gap-3 xl:grid-cols-2">
        <MarketplaceSkeleton />
        <MarketplaceSkeleton />
      </section>

      <section className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1.65fr)_minmax(360px,1fr)]">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-[#e4ebf5] bg-white"
          >
            <div className="border-b border-[#edf1f7] px-5 py-4">
              <Skeleton className={`h-4 w-48 ${sk}`} />
            </div>
            <div className="space-y-4 p-5">
              {Array.from({ length: 2 }).map((_, j) => (
                <Skeleton key={j} className={`h-10 w-full ${sk}`} />
              ))}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
