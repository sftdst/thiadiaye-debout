import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { PageHeader } from '../components/PageHeader'

interface Live {
  id: number
  titre: string
  type: 'maire' | 'quartier'
  statut: 'planifie' | 'en_cours' | 'termine'
  planifie_at: string
  lien_replay: string | null
  viewers_count: number
  quartier: { nom: string; couleur: string } | null
}

interface LivesResponse {
  en_cours: Live[]
  planifies: Live[]
  replays: Live[]
}

export function LivesPage() {
  const [data, setData] = useState<LivesResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/lives')
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false))
  }, [])

  if (loading || !data) {
    return (
      <>
        <PageHeader title="Lives & diffusion en direct" />
        <div className="page-container">
          <p>Chargement…</p>
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="Lives & diffusion en direct"
        subtitle="Suivez les réunions publiques en direct et retrouvez les replays."
      />
      <div className="page-container">
        {data.en_cours.length > 0 && (
          <>
            <h2>🔴 En direct maintenant</h2>
            <div className="card-grid">
              {data.en_cours.map((live) => (
                <Link key={live.id} to={`/lives/${live.id}`} className="card live-card-live">
                  <span className="badge-pill badge-live">EN DIRECT</span>
                  <h3>{live.titre}</h3>
                  <p className="auth-hint">{live.viewers_count} spectateur(s)</p>
                </Link>
              ))}
            </div>
          </>
        )}

        <h2>Prochains lives</h2>
        <div className="card-grid">
          {data.planifies.map((live) => (
            <div key={live.id} className="card">
              <h3>{live.titre}</h3>
              <p className="poll-option-row">
                <span>{new Date(live.planifie_at).toLocaleString('fr-FR')}</span>
                <span>{live.type === 'maire' ? 'Le maire' : live.quartier?.nom}</span>
              </p>
            </div>
          ))}
        </div>
        {data.planifies.length === 0 && <p>Aucun live planifié pour le moment.</p>}

        <h2>Replays</h2>
        <div className="video-grid">
          {data.replays.map((live) => (
            <a key={live.id} href={live.lien_replay ?? '#'} target="_blank" rel="noreferrer" className="card video-card">
              <span className="badge-pill">Replay</span>
              <h3>{live.titre}</h3>
            </a>
          ))}
        </div>
        {data.replays.length === 0 && <p>Aucun replay disponible pour le moment.</p>}
      </div>
    </>
  )
}
