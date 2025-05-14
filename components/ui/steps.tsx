import * as React from "react"
import { cn } from "@/lib/utils"

interface StepsProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function Steps({ className, children, ...props }: StepsProps) {
  const childrenArray = React.Children.toArray(children)
  const steps = childrenArray.map((step, index) => {
    return React.cloneElement(step as React.ReactElement, {
      index: index + 1,
      isLast: index === childrenArray.length - 1,
    })
  })

  return (
    <div className={cn("space-y-4", className)} {...props}>
      {steps}
    </div>
  )
}

interface StepProps extends React.HTMLAttributes<HTMLDivElement> {
  index?: number
  isLast?: boolean
}

export function Step({ className, children, index, isLast, ...props }: StepProps) {
  return (
    <div className={cn("relative", className)} {...props}>
      <div className="flex items-start gap-4">
        <div className="flex flex-col items-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-background text-sm font-medium">
            {index}
          </div>
          {!isLast && <div className="mt-2 h-full w-px bg-border" />}
        </div>
        <div className="pb-8">{children}</div>
      </div>
    </div>
  )
}
