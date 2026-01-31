import * as React from "react"
import { motion } from "framer-motion"
import { X, CheckCircle2, AlertCircle, AlertTriangle } from "lucide-react"
import { cn } from "../../lib/utils"

export type ToastVariant = "success" | "error" | "warning"

export interface ToastProps {
  id: string
  message: string
  variant: ToastVariant
  onDismiss: (id: string) => void
}

const variantStyles: Record<ToastVariant, string> = {
  success: "bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100",
  error: "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100",
  warning: "bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100",
}

const variantIcons: Record<ToastVariant, React.ComponentType<{ className?: string }>> = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
}

export function Toast({ id, message, variant, onDismiss }: ToastProps) {
  const Icon = variantIcons[variant]

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-lg border p-4 shadow-lg",
        variantStyles[variant]
      )}
    >
      <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={() => onDismiss(id)}
        className={cn(
          "flex-shrink-0 rounded-md p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/10",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
        )}
        aria-label="关闭通知"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  )
}
