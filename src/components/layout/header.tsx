import { Search, Bell, Menu } from "lucide-react"
import { Button } from "../ui/button"
import { ThemeToggle } from "../theme-toggle"

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
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
         <div className="relative w-full hidden sm:block group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 transition-colors group-hover:text-primary" />
            <input
              type="text"
              placeholder="搜索资源..."
              className="flex h-10 w-full rounded-full border border-border/50 bg-secondary/50 pl-10 pr-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/50 transition-all placeholder:text-muted-foreground/50"
            />
          </div>
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

        <div className="flex items-center gap-3 pl-1 cursor-pointer group">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-sm font-semibold leading-none text-foreground/90 group-hover:text-primary transition-colors">Admin</span>
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">System</span>
          </div>
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center font-bold text-xs ring-2 ring-transparent group-hover:ring-primary/20 transition-all shadow-md">
            AD
          </div>
        </div>
      </div>
    </header>
  )
}
