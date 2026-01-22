import type { ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"

interface RequireAuthProps {
  children: ReactNode
}

export function RequireAuth({ children }: RequireAuthProps) {
  const location = useLocation()
  const token = localStorage.getItem("token")

  if (!token) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  return children
}
