import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { PageHeader } from '../components/PageHeader'
import { useMembreAuth } from '../context/MembreAuthContext'

interface Evenement {
  id: number
  titre: string
  description: string | null
  lieu: string | null
  debut_at: string
  lien_reunion: string | null
  inscriptions_count: number
  quartier: { nom: string; couleur: string } | null
}

export function AgendaPage() {
  const { membre } = useMembreAuth()
  const [evenements, setEvenements] = useState<Evenement[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)

  function load() {
    api
      .get('/evenements')
      .then(({ data }) => setEvenements(data))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  async function inscrire(id: number) {
    setMessage(null)
    try {
      await api.post(`/evenements/${id}/inscription`)
      setMessage('Inscription confirmée !')
      load()
    } catch {
      setMessage('Vous êtes déjà inscrit, ou une erreur est survenue.')
    }
  }

  return (
    <>
      <PageHeader
        title="Agenda citoyen"
        subtitle="Réunions publiques, actions terrain et rendez-vous du mouvement."
      />
      <div className="page-container">
        {!membre && (
          <p className="auth-hint">
            <Link to="/connexion">Connectez-vous</Link> pour vous inscrire aux événements.
          </p>
        )}
        {message && <p className="form-success">{message}</p>}

        {loading && <p>Chargement…</p>}

        <div className="card-grid">
          {evenements.map((e) => (
            <div key={e.id} className="card">
              <h3>{e.titre}</h3>
              {e.description && <p>{e.description}</p>}
              <p className="poll-option-row">
                <span>{new Date(e.debut_at).toLocaleString('fr-FR')}</span>
                <span>{e.inscriptions_count} inscrit(s)</span>
              </p>
              {e.lieu && <p className="auth-hint">📍 {e.lieu}</p>}
              {e.quartier && (
                <p className="quartier-tag">
                  <span className="color-dot" style={{ background: e.quartier.couleur }} />
                  {e.quartier.nom}
                </p>
              )}
              {e.lien_reunion && (
                <p>
                  <a href={e.lien_reunion} target="_blank" rel="noreferrer">
                    Lien de connexion
                  </a>
                </p>
              )}
              {membre && (
                <button className="btn-primary" onClick={() => inscrire(e.id)}>
                  Je participe
                </button>
              )}
            </div>
          ))}
        </div>
        {!loading && evenements.length === 0 && <p>Aucun événement à venir pour le moment.</p>}
      </div>
    </>
  )
}
