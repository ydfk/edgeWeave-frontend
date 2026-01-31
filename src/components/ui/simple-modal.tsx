import * as React from "react"
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react"
import { cn } from "../../lib/utils"

export interface SimpleModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  footer?: React.ReactNode
  children: React.ReactNode
  size?: "sm" | "md" | "lg" | "xl"
  isLoading?: boolean
  className?: string
}

const sizeMap: Record<string, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
}

export function SimpleModal({
  isOpen,
  onClose,
  title,
  description,
  footer,
  children,
  size = "lg",
  isLoading,
  className,
}: SimpleModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      size={size}
      className={cn("animate-zoom-in max-h-[90vh]", className)}
      scrollBehavior="inside"
    >
      <ModalContent className={sizeMap[size]}>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <span>{title}</span>
              {description ? (
                <span className="text-sm text-muted-foreground">
                  {description}
                </span>
              ) : null}
            </ModalHeader>
            <ModalBody>{children}</ModalBody>
            {footer ? (
              <ModalFooter className="gap-2" style={{ pointerEvents: isLoading ? "none" : "auto", opacity: isLoading ? 0.6 : 1 }}>
                {isLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="h-4 w-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    处理中...
                  </div>
                ) : null}
                {footer}
              </ModalFooter>
            ) : null}
          </>
        )}
      </ModalContent>
    </Modal>
  )
}
