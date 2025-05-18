import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface LiveIndicatorProps {
  isLive: boolean
  className?: string
}

export function LiveIndicator({ isLive, className }: LiveIndicatorProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "flex items-center gap-1.5 px-1.5 py-0.5 text-xs font-medium",
        isLive ? "border-green-500 text-green-500" : "border-yellow-500 text-yellow-500",
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", isLive ? "bg-green-500 animate-pulse" : "bg-yellow-500")} />
      {isLive ? "LIVE" : "CONNECTING"}
    </Badge>
  )
}
