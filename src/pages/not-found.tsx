import { AlertCircle } from "lucide-react"
import { Button } from "../components/ui/button"
import { useNavigate, useLocation, useRouteError } from "react-router-dom"

export function NotFound() {
  const navigate = useNavigate()
  const location = useLocation()
  const error: any = useRouteError()

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
      <div className="rounded-full bg-destructive/10 p-6">
        <AlertCircle className="h-16 w-16 text-destructive" />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">404</h1>
        <p className="text-xl font-medium text-muted-foreground">页面未找到</p>
        <p className="text-muted-foreground max-w-sm mx-auto">
          您访问的页面不存在或已被移除。
        </p>
        <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
          <p>Current Path: {location.pathname}</p>
          {error && (
            <div className="text-red-500 mt-2 text-left">
              <p className="font-bold">Error Details:</p>
              <pre>{JSON.stringify(error, null, 2)}</pre>
              <p>{error.statusText || error.message}</p>
              {error.stack && <pre className="whitespace-pre-wrap">{error.stack}</pre>}
            </div>
          )}
        </div>
      </div>
      <Button onClick={() => navigate("/")} size="lg">
        返回首页
      </Button>
    </div>
  )
}
