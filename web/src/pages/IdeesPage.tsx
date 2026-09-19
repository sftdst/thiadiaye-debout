import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { PageHeader } from '../components/PageHeader'
import { useMembreAuth } from '../context/MembreAuthContext'

interface Idee {
  id: number
  titre: string
  description: string
  votants_count: number
  membre: { nom: string }
}

export function IdeesPage() {
  const { membre } = useMembreAuth()
  const [idees, setIdees] = useState<Idee[]>([])
  const [loading, setLoading] = useState(true)
  const [titre, setTitre] = useState('')
  const [description, setDescription] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function load() {
    api
      .get('/idees')
      .then(({ data }) => setIdees(data))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  async function vote(ideeId: number) {
    setError(null)
    try {
      await api.post(`/idees/${ideeId}/vote`)
      load()
    } catch {
      setError('Vous avez déjà voté pour cette idée, ou une erreur est survenue.')
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    try {
      await api.post('/idees', { titre, description })
      setTitre('')
      setDescription('')
      setMessage("Merci ! Votre idée est soumise à validation avant publication.")
    } catch {
      setError("Impossible d'envoyer votre idée pour le moment.")
    }
  }

  return (
    <>
      <PageHeader
        title="Boîte à idées"
        subtitle="Proposez un projet pour Thiadiaye, la population vote pour les meilleures idées."
      />
      <div className="page-container">
        {membre ? (
          <form className="adhesion-form form-narrow" onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
            <h2 style={{ margin: 0 }}>Proposer une idée</h2>
            <label>
              Titre
              <input
                type="text"
                required
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
              />
            </label>
            <label>
              Description
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>
            {message && <p className="form-success">{message}</p>}
            {error && <p className="form-error">{error}</p>}
            <button type="submit" className="btn-primary">
              Soumettre
            </button>
          </form>
        ) : (
          <p className="auth-hint">
            <Link to="/connexion">Connectez-vous</Link> pour proposer une idée ou voter.
          </p>
        )}

        {loading && <p>Chargement…</p>}
        {!loading && idees.length === 0 && <p>Aucune idée approuvée pour le moment.</p>}

        <div className="card-grid">
          {idees.map((idee) => (
            <div key={idee.id} className="card">
              <h3>{idee.titre}</h3>
              <p>{idee.description}</p>
              <div className="poll-option-row">
                <span>Proposé par {idee.membre.nom}</span>
                <span>{idee.votants_count} soutien(s)</span>
              </div>
              {membre && (
                <button className="btn-link" onClick={() => vote(idee.id)}>
                  Soutenir cette idée
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
