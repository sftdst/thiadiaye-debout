import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { PageHeader } from '../components/PageHeader'
import { useMembreAuth } from '../context/MembreAuthContext'

interface OptionSondage {
  id: number
  texte: string
  votes_count: number
}

interface Sondage {
  id: number
  question: string
  options: OptionSondage[]
}

export function SondagesPage() {
  const { membre } = useMembreAuth()
  const [sondages, setSondages] = useState<Sondage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  function load() {
    api
      .get('/sondages')
      .then(({ data }) => setSondages(data))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  async function vote(sondageId: number, optionId: number) {
    setError(null)
    try {
      await api.post(`/sondages/${sondageId}/vote`, { option_sondage_id: optionId })
      load()
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      setError(status === 409 ? 'Vous avez déjà voté pour ce sondage.' : 'Impossible de voter.')
    }
  }

  return (
    <>
      <PageHeader
        title="Sondages citoyens"
        subtitle="Une question, un tap : donnez votre avis et voyez les résultats en temps réel."
      />
      <div className="page-container">
        {!membre && (
          <p className="auth-hint">
            <Link to="/connexion">Connectez-vous</Link> pour voter aux sondages.
          </p>
        )}
        {error && <p className="form-error">{error}</p>}

        {loading && <p>Chargement…</p>}
        {!loading && sondages.length === 0 && <p>Aucun sondage actif pour le moment.</p>}

        <div className="card-grid">
          {sondages.map((sondage) => {
            const total = sondage.options.reduce((sum, o) => sum + o.votes_count, 0)
            return (
              <div key={sondage.id} className="card">
                <h2>{sondage.question}</h2>
                {sondage.options.map((option) => {
                  const pct = total > 0 ? Math.round((option.votes_count / total) * 100) : 0
                  return (
                    <div key={option.id} className="poll-option">
                      <div className="poll-option-row">
                        <span>{option.texte}</span>
                        <span>
                          {option.votes_count} vote{option.votes_count > 1 ? 's' : ''} ({pct}%)
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                      {membre && (
                        <button className="btn-link" onClick={() => vote(sondage.id, option.id)}>
                          Voter pour cette option
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
