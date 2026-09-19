import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { PageHeader } from '../components/PageHeader'

interface QuartierClassement {
  id: number
  nom: string
  couleur: string
  membres_count: number
}

interface Defi {
  id: number
  titre: string
  description: string | null
  objectif_membres: number
  progression: number
  date_limite: string
}

export function ClassementPage() {
  const [quartiers, setQuartiers] = useState<QuartierClassement[]>([])
  const [defis, setDefis] = useState<Defi[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/classement/quartiers'), api.get('/defis')])
      .then(([q, d]) => {
        setQuartiers(q.data)
        setDefis(d.data)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <>
        <PageHeader title="Classement & défis" />
        <div className="page-container">
          <p>Chargement…</p>
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="Classement & défis"
        subtitle="Le quartier le plus mobilisé et les objectifs collectifs du mouvement."
      />
      <div className="page-container split-layout">
        <div>
          <h2>Défis collectifs</h2>
          {defis.map((defi) => {
            const pct = Math.min(100, Math.round((defi.progression / defi.objectif_membres) * 100))
            return (
              <div key={defi.id} className="card">
                <h3 style={{ margin: '0 0 0.5rem' }}>{defi.titre}</h3>
                {defi.description && <p>{defi.description}</p>}
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                </div>
                <p className="poll-option-row">
                  <span>
                    {defi.progression} / {defi.objectif_membres} membres
                  </span>
                  <span>
                    Avant le {new Date(defi.date_limite).toLocaleDateString('fr-FR')}
                  </span>
                </p>
              </div>
            )
          })}
          {defis.length === 0 && <p>Aucun défi actif pour le moment.</p>}
        </div>

        <div>
          <h2>Classement des quartiers</h2>
          <ol className="ranking-list">
            {quartiers.map((q) => (
              <li key={q.id}>
                <span className="color-dot" style={{ background: q.couleur }} />
                <span className="ranking-name">{q.nom}</span>
                <span className="ranking-count">{q.membres_count} membres</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </>
  )
}
