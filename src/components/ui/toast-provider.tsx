import * as React from "react"
import { AnimatePresence } from "framer-motion"
import { Toast, ToastVariant } from "./toast"

interface ToastData {
  id: string
  message: string
  variant: ToastVariant
  duration?: number
}

interface ToastContextValue {
  toast: (options: Omit<ToastData, "id">) => void
  dismiss: (id: string) => void
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined)

const MAX_TOASTS = 3

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastData[]>([])

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = React.useCallback(
    ({ message, variant, duration }: Omit<ToastData, "id">) => {
      const id = Math.random().toString(36).substring(2, 9)
      const newToast: ToastData = {
        id,
        message,
        variant,
        duration: duration ?? (variant === "error" ? undefined : 4000),
      }

      setToasts((prev) => {
        const updated = [...prev, newToast]
        // 保持最多 3 条，移除最旧的
        if (updated.length > MAX_TOASTS) {
          return updated.slice(updated.length - MAX_TOASTS)
        }
        return updated
      })

      // 自动消失 (error 需要手动关闭)
      if (newToast.duration) {
        setTimeout(() => dismiss(id), newToast.duration)
      }
    },
    [dismiss]
  )

  const value = React.useMemo(() => ({ toast, dismiss }), [toast, dismiss])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed top-4 right-4 z-50 flex flex-col gap-2">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <Toast key={t.id} {...t} onDismiss={dismiss} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within ToastProvider")
  }
  return context
}
