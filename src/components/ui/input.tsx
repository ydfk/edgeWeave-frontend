import * as React from "react"
import { Input as HeroInput } from "@heroui/react"

import { cn } from "../../lib/utils"

export type InputProps = React.ComponentProps<typeof HeroInput>

export function Input({ className, classNames, ...props }: InputProps) {
  return (
    <HeroInput
      classNames={{
        ...classNames,
        inputWrapper: cn(className, classNames?.inputWrapper),
        input: cn(className, classNames?.input),
      }}
      {...props}
    />
  )
}
