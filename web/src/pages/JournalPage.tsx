import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { PageHeader } from '../components/PageHeader'

interface Publication {
  id: number
  titre: string
  contenu: string
  type: 'actualite' | 'bilan'
  publie_at: string
}

interface Realisation {
  id: number
  titre: string
  description: string | null
  quartier: { nom: string; couleur: string }
  photo_avant_url: string | null
  photo_apres_url: string | null
}

interface TemoignageMembre {
  id: number
  contenu: string
  membre: { nom: string }
}

export function JournalPage() {
  const [publications, setPublications] = useState<Publication[]>([])
  const [realisations, setRealisations] = useState<Realisation[]>([])
  const [temoignages, setTemoignages] = useState<TemoignageMembre[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/publications'),
      api.get('/realisations'),
      api.get('/temoignages-membres'),
    ])
      .then(([p, r, t]) => {
        setPublications(p.data)
        setRealisations(r.data)
        setTemoignages(t.data)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <PageHeader
        title="Journal du mouvement"
        subtitle="Actualités, bilan et réalisations concrètes, quartier par quartier."
      />
      <div className="page-container">
        {loading && <p>Chargement…</p>}

        {temoignages[0] && (
          <div className="card" style={{ borderTop: '4px solid var(--primary)' }}>
            <span className="badge-pill">Témoignage de la semaine</span>
            <p>« {temoignages[0].contenu} »</p>
            <footer>— {temoignages[0].membre.nom}</footer>
          </div>
        )}

        <h2>Actualités & bilan</h2>
        <div className="card-grid">
          {publications.map((pub) => (
            <div key={pub.id} className="card">
              <span className="badge-pill">{pub.type === 'bilan' ? 'Bilan' : 'Actualité'}</span>
              <h3>{pub.titre}</h3>
              <p>{pub.contenu}</p>
              <span className="ranking-count">
                {new Date(pub.publie_at).toLocaleDateString('fr-FR')}
              </span>
            </div>
          ))}
        </div>
        {!loading && publications.length === 0 && <p>Aucune publication pour le moment.</p>}

        <h2>Réalisations par quartier</h2>
        <div className="video-grid">
          {realisations.map((r) => (
            <div key={r.id} className="card">
              <span className="color-dot" style={{ background: r.quartier.couleur }} />
              <span className="ranking-count">{r.quartier.nom}</span>
              <h3>{r.titre}</h3>
              {r.description && <p>{r.description}</p>}
              {(r.photo_avant_url || r.photo_apres_url) && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {r.photo_avant_url && <img src={r.photo_avant_url} alt="Avant" style={{ width: '50%', borderRadius: 'var(--radius)' }} />}
                  {r.photo_apres_url && <img src={r.photo_apres_url} alt="Après" style={{ width: '50%', borderRadius: 'var(--radius)' }} />}
                </div>
              )}
            </div>
          ))}
        </div>
        {!loading && realisations.length === 0 && <p>Aucune réalisation documentée pour le moment.</p>}
      </div>
    </>
  )
}
