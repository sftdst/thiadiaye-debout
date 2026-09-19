import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

interface SimplifiedModeContextValue {
  simplifie: boolean
  toggle: () => void
}

const SimplifiedModeContext = createContext<SimplifiedModeContextValue | null>(null)

export function SimplifiedModeProvider({ children }: { children: ReactNode }) {
  const [simplifie, setSimplifie] = useState(() => localStorage.getItem('mode_simplifie') === '1')

  useEffect(() => {
    document.body.classList.toggle('mode-simplifie', simplifie)
    localStorage.setItem('mode_simplifie', simplifie ? '1' : '0')
  }, [simplifie])

  function toggle() {
    setSimplifie((v) => !v)
  }

  return (
    <SimplifiedModeContext.Provider value={{ simplifie, toggle }}>{children}</SimplifiedModeContext.Provider>
  )
}

export function useSimplifiedMode() {
  const ctx = useContext(SimplifiedModeContext)
  if (!ctx) throw new Error('useSimplifiedMode must be used within SimplifiedModeProvider')
  return ctx
}
