import * as React from "react"
import { Button } from "./button"
import { SimpleModal } from "./simple-modal"

export interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  isDestructive?: boolean
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "确认",
  cancelText = "取消",
  isDestructive = false,
}: ConfirmDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false)

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
      onClose()
    } catch (error) {
      console.error("Confirm action failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = React.useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose()
      }
    },
    [isOpen, isLoading, onClose]
  )

  React.useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  return (
    <SimpleModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      isLoading={isLoading}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={isDestructive ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="text-sm text-muted-foreground">
        {description || "此操作无法撤销，请确认是否继续。"}
      </div>
    </SimpleModal>
  )
}

// Hook for imperative usage
interface UseConfirmOptions {
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  isDestructive?: boolean
}

export function useConfirm() {
  const [state, setState] = React.useState<{
    isOpen: boolean
    options: UseConfirmOptions
    resolve: ((value: boolean) => void) | null
  }>({
    isOpen: false,
    options: { title: "" },
    resolve: null,
  })

  const confirm = React.useCallback((options: UseConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        isOpen: true,
        options,
        resolve,
      })
    })
  }, [])

  const handleConfirm = React.useCallback(() => {
    state.resolve?.(true)
    setState({ isOpen: false, options: { title: "" }, resolve: null })
  }, [state.resolve])

  const handleCancel = React.useCallback(() => {
    state.resolve?.(false)
    setState({ isOpen: false, options: { title: "" }, resolve: null })
  }, [state.resolve])

  const dialog = state.isOpen ? (
    <ConfirmDialog
      isOpen={state.isOpen}
      onClose={handleCancel}
      onConfirm={handleConfirm}
      {...state.options}
    />
  ) : null

  return { confirm, dialog }
}
