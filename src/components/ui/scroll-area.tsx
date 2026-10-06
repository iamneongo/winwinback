"use client"

import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area"
import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

function ScrollArea({ className, ...props }: ComponentProps<typeof ScrollAreaPrimitive.Root>) {
  return <ScrollAreaPrimitive.Root data-slot="scroll-area" className={cn("relative overflow-hidden", className)} {...props} />
}

function ScrollAreaViewport({ className, ...props }: ComponentProps<typeof ScrollAreaPrimitive.Viewport>) {
  return <ScrollAreaPrimitive.Viewport data-slot="scroll-area-viewport" className={cn("size-full rounded-[inherit] outline-none", className)} {...props} />
}

function ScrollAreaContent({ className, ...props }: ComponentProps<typeof ScrollAreaPrimitive.Content>) {
  return <ScrollAreaPrimitive.Content data-slot="scroll-area-content" className={className} {...props} />
}

function ScrollBar({ className, orientation = "vertical", ...props }: ComponentProps<typeof ScrollAreaPrimitive.Scrollbar>) {
  return (
    <ScrollAreaPrimitive.Scrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={cn(
        "flex touch-none select-none p-0.5 transition-colors",
        orientation === "vertical" ? "h-full w-2.5 border-l border-l-transparent" : "h-2.5 flex-col border-t border-t-transparent",
        className,
      )}
      {...props}
    >
      <ScrollAreaPrimitive.Thumb data-slot="scroll-area-thumb" className="relative flex-1 rounded-full bg-[#a8bad1] hover:bg-[#7189a7]" />
    </ScrollAreaPrimitive.Scrollbar>
  )
}

function ScrollAreaCorner(props: ComponentProps<typeof ScrollAreaPrimitive.Corner>) {
  return <ScrollAreaPrimitive.Corner data-slot="scroll-area-corner" {...props} />
}

export { ScrollArea, ScrollAreaViewport, ScrollAreaContent, ScrollBar, ScrollAreaCorner }
