import type React from "react"
import { cn } from "@/lib/utils"

interface LiveIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  isLive: boolean
}

export function LiveIndicator({ isLive, className, ...props }: LiveIndicatorProps) {
  return (
    <div className={cn("flex items-center gap-1.5", className)} {...props}>
      <div
        className={cn(
          "h-2 w-2 rounded-full",
          isLive ? "animate-pulse bg-green-500 shadow-sm shadow-green-500/50" : "bg-gray-300 dark:bg-gray-600",
        )}
      />
      <span className="text-xs font-medium">{isLive ? "Live" : "Offline"}</span>
    </div>
  )
}
