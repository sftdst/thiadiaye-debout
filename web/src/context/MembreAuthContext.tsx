import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api } from '../api/client'

interface Membre {
  id: number
  nom: string
  telephone: string
  numero_carte: string
  role: 'membre' | 'ambassadeur'
}

interface MembreAuthContextValue {
  membre: Membre | null
  loading: boolean
  login: (telephone: string, password: string) => Promise<void>
  logout: () => void
}

const MembreAuthContext = createContext<MembreAuthContextValue | null>(null)

export function MembreAuthProvider({ children }: { children: ReactNode }) {
  const [membre, setMembre] = useState<Membre | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('membre_token')
    if (!token) {
      setLoading(false)
      return
    }

    api
      .get('/me')
      .then(({ data }) => {
        if (data.type === 'membre') setMembre(data.data)
      })
      .catch(() => localStorage.removeItem('membre_token'))
      .finally(() => setLoading(false))
  }, [])

  async function login(telephone: string, password: string) {
    const { data } = await api.post('/auth/membre/login', { telephone, password })
    localStorage.setItem('membre_token', data.token)
    setMembre(data.membre)
  }

  function logout() {
    localStorage.removeItem('membre_token')
    setMembre(null)
  }

  return (
    <MembreAuthContext.Provider value={{ membre, loading, login, logout }}>
      {children}
    </MembreAuthContext.Provider>
  )
}

export function useMembreAuth() {
  const ctx = useContext(MembreAuthContext)
  if (!ctx) throw new Error('useMembreAuth must be used within MembreAuthProvider')
  return ctx
}
