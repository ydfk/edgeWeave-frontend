import { useState } from "react"
import { Outlet } from "react-router-dom"
import { Header } from "./header"
import { Sidebar } from "./sidebar"

export function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background bg-grid-pattern flex w-full overflow-hidden">
      {/* Sidebar - Sticky on Desktop, Fixed on Mobile */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 relative">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="flex-1 w-full p-4 overflow-y-auto overflow-x-hidden scroll-smooth">
          <div className="w-full h-full reveal-content">
             <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
