import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold whitespace-nowrap [&>svg]:size-3 [&>svg]:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-[#eaf2ff] text-[#287be5]",
        secondary: "bg-[#f2f5f9] text-[#7188a6]",
        success: "bg-[#e7f7ef] text-[#168146]",
        warning: "bg-[#fff5df] text-[#d88700]",
        destructive: "bg-[#fee9e8] text-[#d34843]",
        info: "bg-[#f2e8ff] text-[#853ac7]",
        outline: "border border-[#dbe6f2] text-[#506a90]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
