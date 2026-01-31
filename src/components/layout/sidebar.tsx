import { useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  Server,
  Workflow,
  Download,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Activity
} from "lucide-react"
import { cn } from "../../lib/utils"
import { Button } from "../ui/button"

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  const navItems = [
    { icon: LayoutDashboard, label: "仪表盘", href: "/" },
    { icon: Server, label: "节点管理", href: "/nodes" },
    { icon: Workflow, label: "规则管理", href: "/rules" },
    { icon: Download, label: "输出管理", href: "/outputs" },
    { icon: Users, label: "用户管理", href: "/users" },
    { icon: Settings, label: "系统设置", href: "/settings" },
  ]

  const toggleCollapse = () => {
    setCollapsed(!collapsed)
  }

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsOpen(false)}
      />

      {/* Floating Sidebar Container */}
      <aside
        className={cn(
          "fixed md:sticky top-0 left-0 z-50 min-h-screen transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) flex flex-col py-3 pl-3",
          collapsed ? "w-[80px]" : "w-[260px]",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex-1 flex flex-col bg-card/90 backdrop-blur-xl border border-border/60 shadow-xl shadow-black/5 rounded-2xl overflow-hidden relative group/sidebar">

          {/* Logo Area */}
          <div className="h-20 flex items-center px-4 shrink-0 relative z-10">
            <div
              className="flex items-center gap-3 overflow-hidden cursor-pointer group/logo"
              onClick={() => navigate('/')}
            >
              <div className="relative h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 group-hover/logo:scale-110 group-hover/logo:rotate-3">
                <Activity className="h-6 w-6" />
                <div className="absolute inset-0 bg-white/20 rounded-xl blur-md opacity-0 group-hover/logo:opacity-100 transition-opacity" />
              </div>
              <div className={cn(
                  "flex flex-col transition-all duration-500",
                  collapsed ? "opacity-0 w-0 translate-x-10" : "opacity-100 w-auto translate-x-0"
                )}>
                <span className="text-xl font-bold tracking-tight text-foreground/90">
                  EdgeWeave
                </span>
                <span className="text-[10px] uppercase font-semibold text-primary tracking-widest">
                  Network Pulse
                </span>
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent my-1" />

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-2 custom-scrollbar">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "relative flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors duration-300 group overflow-hidden whitespace-nowrap outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring",
                    isActive
                      ? "text-primary-foreground shadow-md shadow-primary/25"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/60",
                    collapsed && "justify-center px-0"
                  )
                }
                title={collapsed ? item.label : undefined}
                aria-label={collapsed ? item.label : undefined}
              >
                {({ isActive }) => (
                  <>
                    {/* Active Background - Gradient */}
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 -z-10 rounded-xl" />
                    )}

                    {/* Icon */}
                    <item.icon className={cn(
                      "h-5 w-5 shrink-0 transition-transform duration-300",
                      isActive ? "scale-110" : "group-hover:scale-110",
                      collapsed && "h-6 w-6"
                    )} />

                    {/* Label */}
                    <span className={cn(
                      "transition-all duration-500 font-semibold",
                      collapsed ? "opacity-0 w-0 translate-x-4 absolute" : "opacity-100 relative translate-x-0"
                    )}>
                      {item.label}
                    </span>

                    {/* Active Indicator Dot (Only when expanded) */}
                    {!collapsed && isActive && (
                      <div className="absolute right-3 h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-border/40 space-y-2 shrink-0 bg-secondary/20">
             <Button
              variant="ghost"
              size="sm"
              onClick={toggleCollapse}
              className={cn(
                "w-full justify-between hidden md:flex text-muted-foreground hover:text-foreground hover:bg-background/50",
                collapsed ? "justify-center px-0 h-10 w-10 mx-auto rounded-xl" : "px-3"
              )}
            >
              <span className={cn(collapsed && "hidden")}>折叠菜单</span>
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>

            {!collapsed && (
              <div className="text-xs text-center text-muted-foreground/60 py-2">
                v1.2.0-beta
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
