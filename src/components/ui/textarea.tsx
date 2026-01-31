import * as React from "react"
import { Textarea as HeroTextarea } from "@heroui/react"

import { cn } from "../../lib/utils"

export type TextareaProps = React.ComponentProps<typeof HeroTextarea>

export function Textarea({ className, classNames, ...props }: TextareaProps) {
  return (
    <HeroTextarea
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
