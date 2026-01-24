import * as React from "react"
import { Button as HeroButton } from "@heroui/react"

import { cn } from "../../lib/utils"

type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link"

type ButtonSize = "default" | "sm" | "lg" | "icon"

type NextButtonProps = React.ComponentProps<typeof HeroButton>

export type ButtonProps = Omit<
  NextButtonProps,
  "variant" | "size" | "color" | "isIconOnly"
> & {
  variant?: ButtonVariant
  size?: ButtonSize
}

const variantMap: Record<
  ButtonVariant,
  { color: "default" | "primary" | "secondary" | "danger"; variant: "solid" | "bordered" | "light" | "ghost" | "flat" }
> = {
  default: { color: "primary", variant: "solid" },
  destructive: { color: "danger", variant: "solid" },
  outline: { color: "default", variant: "bordered" },
  secondary: { color: "secondary", variant: "solid" },
  ghost: { color: "default", variant: "ghost" },
  link: { color: "primary", variant: "light" },
}

const sizeMap: Record<ButtonSize, "sm" | "md" | "lg"> = {
  default: "md",
  sm: "sm",
  lg: "lg",
  icon: "sm",
}

export function Button({
  variant = "default",
  size = "default",
  className,
  ...props
}: ButtonProps) {
  const mapped = variantMap[variant]
  const isIconOnly = size === "icon"

  return (
    <HeroButton
      color={mapped.color}
      variant={mapped.variant}
      size={sizeMap[size]}
      isIconOnly={isIconOnly}
      className={cn(className)}
      {...props}
    />
  )
}
