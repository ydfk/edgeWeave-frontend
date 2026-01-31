import * as React from "react"
import { Input as HeroInput } from "@heroui/react"

import { cn } from "../../lib/utils"

export type InputProps = React.ComponentProps<typeof HeroInput>

export function Input({ className, classNames, ...props }: InputProps) {
  return (
    <HeroInput
      radius="lg"
      classNames={{
        ...classNames,
        inputWrapper: cn(
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1",
          className,
          classNames?.inputWrapper
        ),
        input: cn("focus-visible:outline-none", classNames?.input),
      }}
      {...props}
    />
  )
}
