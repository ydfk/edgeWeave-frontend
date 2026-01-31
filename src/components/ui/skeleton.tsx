import { Card, CardBody } from "@heroui/react"
import { cn } from "../../lib/utils"

export interface SkeletonProps {
  variant: "list" | "grid" | "card"
  count?: number
  className?: string
}

export function Skeleton({
  variant,
  count = 3,
  className,
}: SkeletonProps) {
  if (variant === "grid") {
    return (
      <div
        className={cn(
          "grid gap-6 md:grid-cols-2 lg:grid-cols-3",
          className
        )}
      >
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardBody className="p-6 space-y-4">
              <div className="h-12 w-12 rounded-lg bg-muted" />
              <div className="h-4 w-3/4 rounded bg-muted" />
              <div className="h-4 w-1/2 rounded bg-muted" />
            </CardBody>
          </Card>
        ))}
      </div>
    )
  }

  if (variant === "list") {
    return (
      <div className={cn("space-y-4", className)}>
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardBody className="p-6 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 rounded bg-muted" />
                <div className="h-3 w-1/2 rounded bg-muted" />
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    )
  }

  // card variant - single card
  return (
    <Card className={cn("animate-pulse", className)}>
      <CardBody className="p-6 space-y-4">
        <div className="h-12 w-12 rounded-lg bg-muted" />
        <div className="h-4 w-3/4 rounded bg-muted" />
        <div className="h-4 w-1/2 rounded bg-muted" />
      </CardBody>
    </Card>
  )
}
