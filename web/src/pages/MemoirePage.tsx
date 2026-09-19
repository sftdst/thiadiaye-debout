import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { PageHeader } from '../components/PageHeader'
import { useMembreAuth } from '../context/MembreAuthContext'

interface Temoignage {
  id: number
  auteur_nom: string
  contenu: string
}

interface MessageLivreOr {
  id: number
  auteur_nom: string
  message: string
}

export function MemoirePage() {
  const { membre } = useMembreAuth()
  const [temoignages, setTemoignages] = useState<Temoignage[]>([])
  const [livreOr, setLivreOr] = useState<MessageLivreOr[]>([])
  const [loading, setLoading] = useState(true)

  const [contenuTemoignage, setContenuTemoignage] = useState('')
  const [messageLivreOr, setMessageLivreOr] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)

  function load() {
    Promise.all([
      api.get('/memoire/temoignages'),
      api.get('/memoire/livre-or'),
    ]).then(([t, l]) => {
      setTemoignages(t.data)
      setLivreOr(l.data)
    }).finally(() => setLoading(false))
  }

  useEffect(load, [])

  async function submitTemoignage(e: FormEvent) {
    e.preventDefault()
    setFeedback(null)
    await api.post('/memoire/temoignages', { contenu: contenuTemoignage })
    setContenuTemoignage('')
    setFeedback("Merci pour votre témoignage, il sera publié après validation.")
  }

  async function submitLivreOr(e: FormEvent) {
    e.preventDefault()
    setFeedback(null)
    await api.post('/memoire/livre-or', { message: messageLivreOr })
    setMessageLivreOr('')
    setFeedback('Merci pour votre message, il sera publié après validation.')
  }

  return (
    <>
      <PageHeader
        title="Mémoire de Thiadiaye"
        subtitle="Témoignages des anciens et livre d'or de la population."
      />
      <div className="page-container">
        {loading && <p>Chargement…</p>}

        <div className="split-layout">
          <div>
            <h2>Témoignages des anciens</h2>
            {temoignages.map((t) => (
              <blockquote key={t.id} className="card">
                <p>« {t.contenu} »</p>
                <footer>— {t.auteur_nom}</footer>
              </blockquote>
            ))}
            {!loading && temoignages.length === 0 && <p>Aucun témoignage publié pour le moment.</p>}
          </div>

          <div>
            <h2>Livre d'or</h2>
            {livreOr.map((m) => (
              <div key={m.id} className="card">
                <p>{m.message}</p>
                <footer>— {m.auteur_nom}</footer>
              </div>
            ))}
            {!loading && livreOr.length === 0 && <p>Aucun message pour le moment.</p>}
          </div>
        </div>

        {membre ? (
          <div className="split-layout" style={{ marginTop: '1.5rem' }}>
            {feedback && (
              <p className="form-success" style={{ gridColumn: '1 / -1' }}>
                {feedback}
              </p>
            )}
            <form className="adhesion-form" onSubmit={submitTemoignage}>
              <h3 style={{ margin: 0 }}>Partager un témoignage</h3>
              <label>
                Votre souvenir de Thiadiaye
                <textarea
                  required
                  rows={3}
                  value={contenuTemoignage}
                  onChange={(e) => setContenuTemoignage(e.target.value)}
                />
              </label>
              <button type="submit" className="btn-primary">
                Envoyer
              </button>
            </form>

            <form className="adhesion-form" onSubmit={submitLivreOr}>
              <h3 style={{ margin: 0 }}>Signer le livre d'or</h3>
              <label>
                Votre message
                <textarea
                  required
                  rows={2}
                  value={messageLivreOr}
                  onChange={(e) => setMessageLivreOr(e.target.value)}
                />
              </label>
              <button type="submit" className="btn-primary">
                Signer
              </button>
            </form>
          </div>
        ) : (
          <p className="auth-hint" style={{ marginTop: '1.5rem' }}>
            <Link to="/connexion">Connectez-vous</Link> pour partager un témoignage ou signer le livre d'or.
          </p>
        )}
      </div>
    </>
  )
}
