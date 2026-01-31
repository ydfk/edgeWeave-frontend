import * as React from "react"
import { Card, CardBody, Checkbox } from "@heroui/react"
import { cn } from "../../lib/utils"

export interface ListCardProps {
  icon: React.ComponentType<{ className?: string }>
  iconClassName?: string
  title: string
  description?: string
  meta?: React.ReactNode
  actions?: React.ReactNode
  isSelected?: boolean
  onSelect?: () => void
  isPressable?: boolean
  onPress?: () => void
  className?: string
}

export function ListCard({
  icon: Icon,
  iconClassName,
  title,
  description,
  meta,
  actions,
  isSelected,
  onSelect,
  isPressable,
  onPress,
  className,
}: ListCardProps) {
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
      <CardBody className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          {onSelect && (
            <div
              className="flex items-center self-center"
              onClick={(e) => e.stopPropagation()}
            >
              <Checkbox
                isSelected={isSelected}
                onValueChange={onSelect}
                size="sm"
              />
            </div>
          )}
          <div
            className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
              iconClassName || "bg-orange-100 text-orange-600"
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="space-y-1 min-w-0">
            <h3 className="font-medium text-foreground truncate">{title}</h3>
            {description ? (
              <p className="text-sm text-muted-foreground line-clamp-1 break-all">
                {description}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-4 pl-14 md:pl-0">
          {meta && (
            <div className="flex flex-col items-end text-xs text-muted-foreground">
              {meta}
            </div>
          )}
          {actions && (
            <div
              className="flex items-center gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              {actions}
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  )
}
