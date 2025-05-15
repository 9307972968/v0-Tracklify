import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Step {
  title: string
  description?: string
}

interface StepsProps {
  steps: Step[]
  currentStep?: number
  className?: string
}

export function Steps({ steps, currentStep = 0, className }: StepsProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <ol className="space-y-4">
        {steps.map((step, index) => {
          const isActive = index === currentStep
          const isCompleted = index < currentStep

          return (
            <li key={index} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border text-center",
                    isActive && "border-primary bg-primary text-primary-foreground",
                    isCompleted && "border-primary bg-primary text-primary-foreground",
                    !isActive && !isCompleted && "border-muted-foreground text-muted-foreground",
                  )}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : <span>{index + 1}</span>}
                </div>
                {index !== steps.length - 1 && (
                  <div className={cn("h-full w-px bg-muted-foreground/30", isCompleted && "bg-primary")} />
                )}
              </div>
              <div className="pb-8 pt-1">
                <h3 className="font-medium">{step.title}</h3>
                {step.description && <p className="text-sm text-muted-foreground">{step.description}</p>}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
