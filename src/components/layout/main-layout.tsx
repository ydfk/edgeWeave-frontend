import { useState } from "react"
import { Outlet } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"
import { Header } from "./header"
import { Sidebar } from "./sidebar"
import { ToastProvider } from "../ui/toast-provider"

export function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <ToastProvider>
      <div className="min-h-screen bg-background bg-grid-pattern flex w-full overflow-hidden">
        {/* Sidebar - Sticky on Desktop, Fixed on Mobile */}
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 relative">
          <Header onMenuClick={() => setIsSidebarOpen(true)} />

          <main className="flex-1 w-full p-4 overflow-y-auto overflow-x-hidden scroll-smooth">
            <div className="w-full h-full reveal-content">
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Outlet />
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>
    </ToastProvider>
  )
}
