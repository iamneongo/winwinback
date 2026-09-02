import { Skeleton } from "@/components/ui/skeleton";
import { cardClass } from "@/components/dashboard/ui";

const sk = "bg-[#e7eef7]";

export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-7 sm:py-7 lg:px-6 lg:pb-8 lg:pt-0">
      <Skeleton className={`h-[11rem] w-full rounded-xl sm:h-[13.5rem] ${sk}`} />
      <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`${cardClass} min-h-[8.5rem]`}>
            <Skeleton className={`h-10 w-10 rounded-full ${sk}`} />
            <Skeleton className={`mt-3 h-4 w-24 ${sk}`} />
            <Skeleton className={`mt-2 h-7 w-32 ${sk}`} />
          </div>
        ))}
      </section>
      <section className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.9fr)_minmax(19rem,1fr)]">
        <div className={`${cardClass} space-y-3`}>
          <Skeleton className={`h-5 w-40 ${sk}`} />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className={`h-11 w-full ${sk}`} />
          ))}
        </div>
        <div className={`${cardClass} space-y-3`}>
          <Skeleton className={`h-5 w-32 ${sk}`} />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className={`h-11 w-full ${sk}`} />
          ))}
        </div>
      </section>
      <section className="mt-5">
        <div className={cardClass}>
          <Skeleton className={`h-5 w-32 ${sk}`} />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className={`h-12 w-full ${sk}`} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
