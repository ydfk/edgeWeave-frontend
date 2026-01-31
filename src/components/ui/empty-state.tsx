import * as React from "react"
import { cn } from "../../lib/utils"

export interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-20 text-center",
        "border-2 border-dashed border-muted rounded-xl",
        className
      )}
    >
      <Icon className="h-12 w-12 opacity-20 mb-4" />
      <h3 className="text-lg font-medium text-foreground">{title}</h3>
      {description ? (
        <p className="text-sm text-muted-foreground mt-2 max-w-sm">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}
