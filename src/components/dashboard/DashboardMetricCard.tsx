import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cardClass } from "@/components/dashboard/ui";

type DashboardMetricCardProps = {
  icon: ReactNode;
  label: string;
  value: string;
  href: string;
  action: string;
};

export function DashboardMetricCard({ icon, label, value, href, action }: DashboardMetricCardProps) {
  return (
    <article className={`${cardClass} min-h-[8.5rem] min-w-0`}>
      <div className="flex min-w-0 items-start gap-3">
        <span className="block shrink-0" aria-hidden="true">{icon}</span>
        <div className="min-w-0">
          <p className="text-xs font-medium text-[#536f98]">{label}</p>
          <p className="mt-1 break-words text-2xl font-black leading-tight tracking-tight text-[#0d315d]">
            {value}
          </p>
          <Link
            href={href}
            className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#1766e7] hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1766e7]"
          >
            {action} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
