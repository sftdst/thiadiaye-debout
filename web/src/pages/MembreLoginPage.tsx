import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMembreAuth } from '../context/MembreAuthContext'

export function MembreLoginPage() {
  const { login } = useMembreAuth()
  const navigate = useNavigate()
  const [telephone, setTelephone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(telephone, password)
      navigate('/')
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { errors?: Record<string, string[]> } } })?.response?.data
        ?.errors?.telephone?.[0]
      setError(message ?? 'Identifiants invalides.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="adhesion-page">
      <h1>Connexion membre</h1>
      <form className="adhesion-form" onSubmit={handleSubmit}>
        <label>
          Téléphone
          <input
            type="tel"
            required
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
          />
        </label>
        <label>
          Mot de passe
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>
      <p className="auth-hint">
        Pas encore membre ? <a href="/adhesion">Adhérez au mouvement</a>
      </p>
    </div>
  )
}
