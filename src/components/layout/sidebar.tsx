import { LayoutDashboard, Server, Workflow, Rss, Download, Users, Settings, LogOut } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { NavLink, useNavigate } from "react-router-dom";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  onNavigate?: () => void;
}

export function Sidebar({ className, onNavigate }: SidebarProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/auth/login");
  };

  const navItems = [
    { icon: LayoutDashboard, label: "仪表盘", href: "/" },
    { icon: Server, label: "节点管理", href: "/nodes" },
    { icon: Workflow, label: "规则管理", href: "/rules" },
    { icon: Rss, label: "订阅管理", href: "/subscriptions" },
    { icon: Download, label: "输出管理", href: "/outputs" },
    { icon: Users, label: "用户管理", href: "/users" },
    { icon: Settings, label: "系统设置", href: "/settings" },
  ];

  return (
    <div className={cn("pb-12 min-h-screen flex flex-col", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="flex items-center gap-2 px-4 mb-6">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Workflow className="h-5 w-5 text-primary-foreground" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">EdgeWeave</h2>
          </div>
          <div className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    "w-full justify-start gap-2 inline-flex items-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2",
                    isActive
                      ? "bg-secondary text-secondary-foreground"
                      : "hover:bg-accent hover:text-accent-foreground"
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-auto px-3 pb-4">
         <Button 
            variant="ghost" 
            className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
            onClick={handleLogout}
         >
            <LogOut className="h-4 w-4" />
            退出登录
         </Button>
      </div>
    </div>
  );
}
