import * as React from "react"
import { Card, CardBody, Checkbox } from "@heroui/react"
import { cn } from "../../lib/utils"

export interface GridCardProps {
  icon: React.ComponentType<{ className?: string }>
  iconClassName?: string
  title: string
  description?: string
  footer?: React.ReactNode
  actions?: React.ReactNode
  isSelected?: boolean
  onSelect?: () => void
  isPressable?: boolean
  onPress?: () => void
  className?: string
}

export function GridCard({
  icon: Icon,
  iconClassName,
  title,
  description,
  footer,
  actions,
  isSelected,
  onSelect,
  isPressable,
  onPress,
  className,
}: GridCardProps) {
  return (
    <Card
      isPressable={isPressable}
      onPress={onPress}
      className={cn(
        "border-none shadow-sm hover:shadow-lg transition-all group relative overflow-hidden",
        isSelected ? "ring-2 ring-primary" : "",
        className
      )}
    >
      <CardBody className="p-6 space-y-4">
        {onSelect && (
          <div className="absolute top-3 left-3 z-10">
            <Checkbox
              isSelected={isSelected}
              onValueChange={onSelect}
              size="sm"
            />
          </div>
        )}

        <div className="flex items-start justify-between pl-8">
          <div
            className={cn(
              "p-2 rounded-lg transition-colors",
              iconClassName ||
                "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
            )}
          >
            <Icon className="h-6 w-6" />
          </div>
          {actions && (
            <div
              className="flex items-center gap-1 -mr-2 -mt-2"
              onClick={(e) => e.stopPropagation()}
            >
              {actions}
            </div>
          )}
        </div>

        <div>
          <h3 className="font-semibold text-lg tracking-tight">{title}</h3>
          {description ? (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {description}
            </p>
          ) : null}
        </div>

        {footer && (
          <div className="pt-2 flex items-center gap-4 text-xs text-muted-foreground font-mono border-t border-border/50">
            {footer}
          </div>
        )}
      </CardBody>
    </Card>
  )
}
