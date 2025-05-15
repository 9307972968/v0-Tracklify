import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

interface LogItemProps {
  log: {
    id: string
    created_at: string
    keystroke: string
    device_id: string
  }
  isNew?: boolean
}

export function LogItem({ log, isNew = false }: LogItemProps) {
  const formattedTime = formatDistanceToNow(new Date(log.created_at), { addSuffix: true })

  return (
    <div
      className={cn(
        "flex flex-col space-y-1 rounded-md border border-border bg-card p-3 text-sm shadow-sm transition-all",
        isNew && "animate-highlight",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium text-primary">{log.device_id}</span>
        <span className="text-xs text-muted-foreground">{formattedTime}</span>
      </div>
      <div className="font-mono">{log.keystroke}</div>
    </div>
  )
}
