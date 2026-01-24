import { ThemeProvider } from "./components/theme-provider"
import { MainLayout } from "./components/layout/main-layout"
import { useEffect } from "react"
import { useLocation } from "react-router-dom"

function App() {
  const location = useLocation()

  // Keep the subtle scroll reveal effect from original
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view")
          }
        })
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    )

    const timeoutId = setTimeout(() => {
      document.querySelectorAll(".reveal").forEach((el) => observer.observe(el))
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      observer.disconnect()
    }
  }, [location.pathname])

  return (
    <ThemeProvider>
      <MainLayout />
    </ThemeProvider>
  )
}

export default App
