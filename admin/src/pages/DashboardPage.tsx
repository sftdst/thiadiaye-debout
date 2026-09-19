import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { getBadgeColor } from '../utils/badgeColors'

interface Quartier {
  id: number
  nom: string
  couleur: string
}

interface Evenement {
  id: number
  titre: string
  debut_at: string
  inscriptions_count: number
  quartier: { nom: string; couleur: string } | null
}

interface Defi {
  id: number
  titre: string
  objectif_membres: number
  progression: number
  date_limite: string
}

interface Dashboard {
  kpis: {
    total_membres: number
    total_quartiers: number
    total_ambassadeurs: number
    total_realisations: number
    sondages_actifs: number
    total_votes: number
    videos_publiees: number
    publications_publiees: number
    evenements_a_venir: number
    idees_approuvees: number
  }
  moderation_en_attente: {
    idees: number
    videos: number
    temoignages_anciens: number
    temoignages_membres: number
    messages_livre_or: number
  }
  membres_par_quartier: (Quartier & { membres_count: number })[]
  badges_distribution: { id: number; nom: string; membres_count: number }[]
  adhesions_par_jour: { jour: string; total: number }[]
  defis_actifs: Defi[]
  evenements_a_venir: Evenement[]
  top_ambassadeurs: { id: number; nom: string; filleuls_count: number }[]
}

const moderationLabels: Record<string, { label: string; to: string }> = {
  idees: { label: 'Idées en attente', to: '/idees' },
  videos: { label: 'Vidéos en attente', to: '/videos' },
  temoignages_anciens: { label: 'Témoignages (mémoire)', to: '/memoire' },
  temoignages_membres: { label: 'Témoignage de la semaine', to: '/publications' },
  messages_livre_or: { label: "Livre d'or", to: '/memoire' },
}

export function DashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/admin/dashboard')
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false))
  }, [])

  if (loading || !data) return <p>Chargement…</p>

  const totalModeration = Object.values(data.moderation_en_attente).reduce((a, b) => a + b, 0)
  const maxQuartier = Math.max(1, ...data.membres_par_quartier.map((q) => q.membres_count))
  const maxBadge = Math.max(1, ...data.badges_distribution.map((b) => b.membres_count))
  const maxJour = Math.max(1, ...data.adhesions_par_jour.map((d) => d.total))

  return (
    <div>
      <h1>Tableau de bord</h1>

      <div className="stat-cards stat-cards-grid">
        <div className="stat-card">
          <span className="stat-value">{data.kpis.total_membres}</span>
          <span className="stat-label">Membres adhérents</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{data.kpis.total_quartiers}</span>
          <span className="stat-label">Quartiers</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{data.kpis.total_ambassadeurs}</span>
          <span className="stat-label">Ambassadeurs</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{data.kpis.total_realisations}</span>
          <span className="stat-label">Réalisations</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{data.kpis.sondages_actifs}</span>
          <span className="stat-label">Sondages actifs</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{data.kpis.total_votes}</span>
          <span className="stat-label">Votes exprimés</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{data.kpis.videos_publiees}</span>
          <span className="stat-label">Vidéos publiées</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{data.kpis.publications_publiees}</span>
          <span className="stat-label">Publications</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{data.kpis.evenements_a_venir}</span>
          <span className="stat-label">Événements à venir</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{data.kpis.idees_approuvees}</span>
          <span className="stat-label">Idées approuvées</span>
        </div>
      </div>

      {totalModeration > 0 && (
        <div className="dashboard-widget dashboard-widget-alert">
          <h2>⚠ Modération en attente ({totalModeration})</h2>
          <div className="moderation-grid">
            {Object.entries(data.moderation_en_attente)
              .filter(([, count]) => count > 0)
              .map(([key, count]) => (
                <Link key={key} to={moderationLabels[key]?.to ?? '/'} className="moderation-item">
                  <span className="moderation-count">{count}</span>
                  <span>{moderationLabels[key]?.label ?? key}</span>
                </Link>
              ))}
          </div>
        </div>
      )}

      <div className="dashboard-grid">
        <div className="dashboard-widget">
          <h2>Adhésions (14 derniers jours)</h2>
          <div className="bar-chart-admin">
            {data.adhesions_par_jour.map((d) => (
              <div key={d.jour} className="bar-chart-admin-col" title={`${d.jour} : ${d.total}`}>
                <div className="bar-chart-admin-bar" style={{ height: `${(d.total / maxJour) * 100}%` }} />
              </div>
            ))}
            {data.adhesions_par_jour.length === 0 && <p className="auth-hint">Pas encore de données.</p>}
          </div>
        </div>

        <div className="dashboard-widget">
          <h2>Membres par quartier</h2>
          {data.membres_par_quartier.map((q) => (
            <div key={q.id} className="mini-bar-row">
              <span className="color-dot" style={{ background: q.couleur }} />
              <span className="mini-bar-label">{q.nom}</span>
              <div className="mini-bar-track">
                <div
                  className="mini-bar-fill"
                  style={{ width: `${(q.membres_count / maxQuartier) * 100}%`, background: q.couleur }}
                />
              </div>
              <span className="mini-bar-value">{q.membres_count}</span>
            </div>
          ))}
        </div>

        <div className="dashboard-widget">
          <h2>Répartition des badges</h2>
          {data.badges_distribution.map((b) => {
            const c = getBadgeColor(b.nom)
            return (
              <div key={b.id} className="mini-bar-row">
                <span className="mini-bar-label">{b.nom}</span>
                <div className="mini-bar-track">
                  <div
                    className="mini-bar-fill"
                    style={{ width: `${(b.membres_count / maxBadge) * 100}%`, background: c.bg }}
                  />
                </div>
                <span className="mini-bar-value">{b.membres_count}</span>
              </div>
            )
          })}
        </div>

        <div className="dashboard-widget">
          <h2>Défis actifs</h2>
          {data.defis_actifs.map((d) => {
            const pct = Math.min(100, Math.round((d.progression / d.objectif_membres) * 100))
            return (
              <div key={d.id} style={{ marginBottom: '1rem' }}>
                <div className="poll-option-row">
                  <span>{d.titre}</span>
                  <span>{d.progression} / {d.objectif_membres}</span>
                </div>
                <div className="progress-bar-admin">
                  <div className="progress-bar-admin-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
          {data.defis_actifs.length === 0 && <p className="auth-hint">Aucun défi actif.</p>}
        </div>

        <div className="dashboard-widget">
          <h2>Prochains événements</h2>
          {data.evenements_a_venir.map((e) => (
            <div key={e.id} className="result-card" style={{ boxShadow: 'none', padding: '0.75rem 0', borderBottom: '1px solid var(--border)', marginBottom: 0, borderRadius: 0 }}>
              <strong>{e.titre}</strong>
              <div className="poll-option-row">
                <span>{new Date(e.debut_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                <span>{e.inscriptions_count} inscrit(s)</span>
              </div>
            </div>
          ))}
          {data.evenements_a_venir.length === 0 && <p className="auth-hint">Aucun événement à venir.</p>}
        </div>

        <div className="dashboard-widget">
          <h2>Top ambassadeurs</h2>
          {data.top_ambassadeurs.map((a, i) => (
            <div key={a.id} className="mini-bar-row">
              <span className="ranking-badge">{i + 1}</span>
              <span className="mini-bar-label">{a.nom}</span>
              <span className="mini-bar-value">{a.filleuls_count} recrutement(s)</span>
            </div>
          ))}
          {data.top_ambassadeurs.length === 0 && <p className="auth-hint">Aucun ambassadeur pour le moment.</p>}
        </div>
      </div>
    </div>
  )
}
