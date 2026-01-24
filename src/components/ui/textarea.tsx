import * as React from "react"
import { Textarea as HeroTextarea } from "@heroui/react"

import { cn } from "../../lib/utils"

export type TextareaProps = React.ComponentProps<typeof HeroTextarea>

export function Textarea({ className, classNames, ...props }: TextareaProps) {
  return (
    <HeroTextarea
      classNames={{
        ...classNames,
        inputWrapper: cn(className, classNames?.inputWrapper),
        input: cn(className, classNames?.input),
      }}
      {...props}
    />
  )
}
