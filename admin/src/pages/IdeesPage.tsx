import { useEffect, useState } from 'react'
import { api } from '../api/client'

interface Idee {
  id: number
  titre: string
  description: string
  statut: 'en_attente' | 'approuvee' | 'rejetee'
  votants_count: number
  membre: { nom: string }
}

export function IdeesPage() {
  const [idees, setIdees] = useState<Idee[]>([])
  const [statut, setStatut] = useState('en_attente')
  const [loading, setLoading] = useState(true)

  function load() {
    setLoading(true)
    api
      .get('/admin/idees', { params: { statut } })
      .then(({ data }) => setIdees(data.data))
      .finally(() => setLoading(false))
  }

  useEffect(load, [statut])

  async function updateStatut(idee: Idee, nouveauStatut: 'approuvee' | 'rejetee') {
    await api.patch(`/admin/idees/${idee.id}`, { statut: nouveauStatut })
    load()
  }

  return (
    <div>
      <h1>Modération des idées</h1>

      <div className="filter-tabs">
        {[
          ['en_attente', 'En attente'],
          ['approuvee', 'Approuvées'],
          ['rejetee', 'Rejetées'],
        ].map(([value, label]) => (
          <button
            key={value}
            className={statut === value ? 'active' : ''}
            onClick={() => setStatut(value)}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Chargement…</p>
      ) : (
        idees.map((idee) => (
          <div key={idee.id} className="result-card">
            <h3>{idee.titre}</h3>
            <p>{idee.description}</p>
            <div className="row-actions" style={{ justifyContent: 'space-between' }}>
              <span>
                Par {idee.membre.nom} — {idee.votants_count} soutien(s)
              </span>
              {idee.statut === 'en_attente' && (
                <div className="row-actions">
                  <button className="btn-link" onClick={() => updateStatut(idee, 'approuvee')}>
                    Approuver
                  </button>
                  <button className="btn-link btn-danger" onClick={() => updateStatut(idee, 'rejetee')}>
                    Rejeter
                  </button>
                </div>
              )}
            </div>
          </div>
        ))
      )}
      {!loading && idees.length === 0 && <p>Aucune idée dans cette catégorie.</p>}
    </div>
  )
}
