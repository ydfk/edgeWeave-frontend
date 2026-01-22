import { useState } from "react"
import { ThemeProvider } from "./components/theme-provider"
import { Sidebar } from "./components/layout/sidebar"
import { Header } from "./components/layout/header"
import { Outlet } from "react-router-dom"

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <ThemeProvider>
      <div className="flex min-h-screen bg-background text-foreground font-sans antialiased">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
          fixed inset-y-0 left-0 z-50 w-64 border-r bg-card transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:inset-auto
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        >
          <Sidebar onNavigate={() => setSidebarOpen(false)} />
        </aside>

        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

          <main className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </ThemeProvider>
  )
}

export default App
