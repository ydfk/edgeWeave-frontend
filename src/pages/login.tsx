import { useState } from "react"
import { useRequest } from "alova/client"
import { useNavigate, useLocation } from "react-router-dom"
import { login } from "../lib/api/methods/user"
import { Button } from "../components/ui/button"
import { Lock, User, AlertCircle, Workflow, ArrowRight } from "lucide-react"

export function Login() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || "/"

  const {
    send: loginRequest,
    loading,
    error,
  } = useRequest(login, {
    immediate: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) return

    try {
      // Pass the data as the request body
      await loginRequest({ username, password })
      // Token is handled by alova middleware in src/lib/api/index.ts
      navigate(from, { replace: true })
    } catch (err) {
      console.error("Login failed", err)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-[100px]" />
      </div>

      <div className="w-full max-w-md p-8 z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="mb-8 text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20 mb-4">
            <Workflow className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">EdgeWeave</h1>
          <p className="text-muted-foreground">登录以管理您的节点与工作流</p>
        </div>

        <div className="bg-card border text-card-foreground shadow-xl rounded-2xl overflow-hidden backdrop-blur-sm">
          <div className="p-8 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  htmlFor="username"
                >
                  账号
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-2.5 text-muted-foreground">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    id="username"
                    type="text"
                    placeholder="请输入用户名"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-9 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  htmlFor="password"
                >
                  密码
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-2.5 text-muted-foreground">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    placeholder="请输入密码"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-9 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md animate-in slide-in-from-top-2 duration-300">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error.message || "登录失败，请检查用户名或密码"}</span>
                </div>
              )}

              <Button
                type="submit"
                className="w-full group relative overflow-hidden"
                disabled={loading}
              >
                <span
                  className={`flex items-center justify-center gap-2 transition-transform duration-300 ${
                    loading
                      ? "translate-y-0"
                      : "group-hover:-translate-y-[150%]"
                  }`}
                >
                  {loading ? "登录中..." : "立即登录"}
                </span>
                {!loading && (
                  <span className="absolute inset-0 flex items-center justify-center gap-2 translate-y-[150%] transition-transform duration-300 group-hover:translate-y-0">
                    进入系统 <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>
          </div>

          <div className="bg-muted/50 p-4 text-center text-xs text-muted-foreground border-t">
            &copy; {new Date().getFullYear()} EdgeWeave System. All rights
            reserved.
          </div>
        </div>
      </div>
    </div>
  )
}
