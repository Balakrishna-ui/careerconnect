"use client"

import * as React from "react"

// ─── Types ───────────────────────────────────────────────────────────────────

type Theme = "light" | "dark" | "system"

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: "light" | "dark"
}

// ─── Context ─────────────────────────────────────────────────────────────────

const ThemeContext = React.createContext<ThemeContextValue>({
  theme: "system",
  setTheme: () => {},
  resolvedTheme: "light",
})

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useTheme() {
  return React.useContext(ThemeContext)
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getSystemPreference(): "light" | "dark" {
  if (typeof window === "undefined") return "light"
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function getStoredTheme(): Theme {
  try {
    return (localStorage.getItem("cc-theme") as Theme) || "system"
  } catch {
    return "system"
  }
}

function resolve(theme: Theme): "light" | "dark" {
  return theme === "system" ? getSystemPreference() : theme
}

function applyTheme(resolved: "light" | "dark") {
  const root = document.documentElement
  root.classList.remove("light", "dark")
  root.classList.add(resolved)
}

// ─── Provider ────────────────────────────────────────────────────────────────

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  /** Kept for API-compat with next-themes — unused in this implementation */
  attribute?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme)
  const [resolvedTheme, setResolvedTheme] = React.useState<"light" | "dark">("light")

  // On mount: read stored preference, apply class, subscribe to system changes
  React.useEffect(() => {
    const stored = getStoredTheme()
    const resolved = resolve(stored)
    setThemeState(stored)
    setResolvedTheme(resolved)
    applyTheme(resolved)

    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const onChange = () => {
      if (getStoredTheme() === "system") {
        const r = getSystemPreference()
        setResolvedTheme(r)
        applyTheme(r)
      }
    }
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  const setTheme = React.useCallback((next: Theme) => {
    try { localStorage.setItem("cc-theme", next) } catch {}
    const resolved = resolve(next)
    setThemeState(next)
    setResolvedTheme(resolved)
    applyTheme(resolved)
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

