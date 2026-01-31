import * as React from "react"
import { Checkbox } from "@heroui/react"
import { Search } from "lucide-react"
import { cn } from "../../lib/utils"
import { Input } from "./input"

export interface PageHeaderProps {
  title: string
  description?: string
  search?: {
    value: string
    onChange: (value: string) => void
    placeholder?: string
  }
  actions?: React.ReactNode
  selectAll?: {
    checked: boolean
    onChange: (checked: boolean) => void
    label?: string
  }
  className?: string
}

export function PageHeader({
  title,
  description,
  search,
  actions,
  selectAll,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 reveal",
        className
      )}
    >
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description ? (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          ) : null}
        </div>
        {selectAll ? (
          <Checkbox
            isSelected={selectAll.checked}
            onValueChange={selectAll.onChange}
            size="sm"
            classNames={{
              wrapper: "group-hover:border-primary transition-colors",
            }}
          >
            {selectAll.label || "全选"}
          </Checkbox>
        ) : null}
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        {search ? (
          <Input
            placeholder={search.placeholder || "搜索..."}
            startContent={
              <Search className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
            }
            className="w-full sm:w-64"
            classNames={{
              inputWrapper:
                "bg-secondary/50 dark:bg-default-500/20 border-border/50 hover:border-primary/50 transition-colors",
            }}
            radius="lg"
            value={search.value}
            onChange={(e) => search.onChange(e.target.value)}
            size="sm"
          />
        ) : null}
        {actions}
      </div>
    </div>
  )
}
