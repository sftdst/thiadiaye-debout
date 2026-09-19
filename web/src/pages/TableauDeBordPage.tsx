import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { PageHeader } from '../components/PageHeader'

interface TableauDeBord {
  total_membres: number
  total_quartiers: number
  total_realisations: number
  adhesions_par_jour: { jour: string; total: number }[]
  carte_chaleur_quartiers: { id: number; nom: string; couleur: string; membres_count: number }[]
}

export function TableauDeBordPage() {
  const [data, setData] = useState<TableauDeBord | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/tableau-de-bord')
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false))
  }, [])

  if (loading || !data) {
    return (
      <>
        <PageHeader title="Tableau de bord public" />
        <div className="page-container">
          <p>Chargement…</p>
        </div>
      </>
    )
  }

  const maxParJour = Math.max(1, ...data.adhesions_par_jour.map((d) => d.total))
  const maxQuartier = Math.max(1, ...data.carte_chaleur_quartiers.map((q) => q.membres_count))

  function partager() {
    const url = window.location.href
    if (navigator.share) {
      navigator.share({ title: 'Thiadiaye Debout — Tableau de bord', url })
    } else {
      navigator.clipboard.writeText(url)
      alert('Lien copié !')
    }
  }

  return (
    <>
      <PageHeader
        title="Tableau de bord public"
        subtitle="La progression du mouvement en temps réel, sans inscription."
      />
      <div className="page-container">
        <div className="stat-cards-web">
          <div className="card stat-card-web">
            <span className="stat-value-web">{data.total_membres}</span>
            <span className="auth-hint">Membres</span>
          </div>
          <div className="card stat-card-web">
            <span className="stat-value-web">{data.total_quartiers}</span>
            <span className="auth-hint">Quartiers</span>
          </div>
          <div className="card stat-card-web">
            <span className="stat-value-web">{data.total_realisations}</span>
            <span className="auth-hint">Réalisations</span>
          </div>
        </div>

        <div className="split-layout">
          <div>
            <h2>Progression des adhésions (30 derniers jours)</h2>
            <div className="bar-chart">
              {data.adhesions_par_jour.map((d) => (
                <div key={d.jour} className="bar-chart-col" title={`${d.jour} : ${d.total}`}>
                  <div
                    className="bar-chart-bar"
                    style={{ height: `${(d.total / maxParJour) * 100}%` }}
                  />
                </div>
              ))}
              {data.adhesions_par_jour.length === 0 && <p>Pas encore de données.</p>}
            </div>
          </div>

          <div>
            <h2>Carte de chaleur des quartiers</h2>
            <ol className="ranking-list">
              {data.carte_chaleur_quartiers.map((q) => (
                <li key={q.id}>
                  <span className="color-dot" style={{ background: q.couleur }} />
                  <span className="ranking-name">{q.nom}</span>
                  <div className="progress-bar" style={{ flex: 1, margin: '0 0.75rem' }}>
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${(q.membres_count / maxQuartier) * 100}%`, background: q.couleur }}
                    />
                  </div>
                  <span className="ranking-count">{q.membres_count}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <button className="btn-primary" onClick={partager} style={{ marginTop: '1.5rem' }}>
          Partager ce tableau de bord
        </button>
      </div>
    </>
  )
}
