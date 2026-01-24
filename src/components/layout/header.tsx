import { Search, Bell, Menu, LogOut } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { ThemeToggle } from "../theme-toggle"
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
} from "@heroui/react"

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate()

  const handleLogout = () => {
    // 清除本地存储的认证信息
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    // 跳转到登录页
    navigate('/auth/login')
  }

  return (
    <header className="h-16 sticky top-0 z-40 w-full px-4 md:px-6 flex items-center gap-4 bg-background/60 backdrop-blur-md border-b border-border/40 transition-all duration-300">
      {/* Mobile Menu Trigger */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden -ml-2 text-muted-foreground hover:text-foreground hover:bg-muted/50"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Global Search */}
      <div className="flex-1 flex max-w-md">
         <Input
           placeholder="搜索资源..."
           startContent={<Search className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />}
           className="hidden sm:flex"
           classNames={{
             base: "max-w-full sm:max-w-[20rem] h-10",
             mainWrapper: "h-full",
             input: "text-small",
             inputWrapper: "h-full font-normal text-default-500 bg-secondary/50 dark:bg-default-500/20 rounded-full border border-border/50",
           }}
           isClearable
           radius="full"
           size="sm"
         />
      </div>

      <div className="flex-1" />

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
         <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-all duration-300"
        >
          <Bell className="h-5 w-5" />
        </Button>

        <ThemeToggle />

        <div className="h-6 w-px bg-border/60 mx-1 hidden sm:block" />

        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <div className="flex items-center gap-3 pl-1 cursor-pointer group hover:bg-secondary/50 p-1 pr-2 rounded-full transition-all">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-sm font-semibold leading-none text-foreground/90 group-hover:text-primary transition-colors">Admin</span>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">System</span>
              </div>
              <Avatar
                isBordered
                className="transition-transform"
                color="primary"
                name="AD"
                size="sm"
                src=""
              />
            </div>
          </DropdownTrigger>
          <DropdownMenu aria-label="Profile Actions" variant="flat">
            <DropdownItem key="profile" className="h-14 gap-2">
              <p className="font-semibold">Signed in as</p>
              <p className="font-semibold">admin@example.com</p>
            </DropdownItem>
            <DropdownItem key="settings" onClick={() => navigate('/settings')}>
              My Settings
            </DropdownItem>
            <DropdownItem key="help_and_feedback">
              Help & Feedback
            </DropdownItem>
            <DropdownItem key="logout" color="danger" onPress={handleLogout} startContent={<LogOut className="h-4 w-4" />}>
              Log Out
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </header>
  )
}
