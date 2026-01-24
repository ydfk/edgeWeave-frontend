import * as React from "react"
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react"

export interface SimpleModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  footer?: React.ReactNode
  children: React.ReactNode
}

export function SimpleModal({
  isOpen,
  onClose,
  title,
  description,
  footer,
  children,
}: SimpleModalProps) {
  return (
    <Modal isOpen={isOpen} onOpenChange={(open) => !open && onClose()} size="lg">
      <ModalContent>
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
            {footer ? <ModalFooter>{footer}</ModalFooter> : null}
          </>
        )}
      </ModalContent>
    </Modal>
  )
}
