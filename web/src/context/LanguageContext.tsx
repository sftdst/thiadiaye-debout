import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api } from '../api/client'

type Langue = 'fr' | 'wo' | 'srr'

interface LanguageContextValue {
  langue: Langue
  setLangue: (l: Langue) => void
  t: (cle: string, fallbackFr: string) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [langue, setLangueState] = useState<Langue>(() => {
    return (localStorage.getItem('langue') as Langue) || 'fr'
  })
  const [traductions, setTraductions] = useState<Record<string, string>>({})

  useEffect(() => {
    if (langue === 'fr') {
      setTraductions({})
      return
    }
    api.get('/traductions', { params: { langue } }).then(({ data }) => setTraductions(data))
  }, [langue])

  function setLangue(l: Langue) {
    localStorage.setItem('langue', l)
    setLangueState(l)
  }

  function t(cle: string, fallbackFr: string): string {
    return traductions[cle] ?? fallbackFr
  }

  return <LanguageContext.Provider value={{ langue, setLangue, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
