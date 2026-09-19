import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client'
import { PageHeader } from '../components/PageHeader'
import { useMembreAuth } from '../context/MembreAuthContext'

interface Live {
  id: number
  titre: string
  description: string | null
  statut: 'planifie' | 'en_cours' | 'termine'
  lien_stream: string | null
  lien_replay: string | null
  viewers_count: number
  quartier: { nom: string; couleur: string } | null
}

interface Message {
  id: number
  contenu: string
  membre: { nom: string }
}

function toEmbedUrl(url: string): string {
  const youtubeMatch = url.match(/(?:youtu\.be\/|v=)([\w-]{11})/)
  if (youtubeMatch) return `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1`

  return url
}

export function LiveWatchPage() {
  const { id } = useParams()
  const { membre } = useMembreAuth()
  const [live, setLive] = useState<Live | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [texte, setTexte] = useState('')
  const lastIdRef = useRef(0)

  useEffect(() => {
    api.get(`/lives/${id}`).then(({ data }) => setLive(data))
  }, [id])

  useEffect(() => {
    if (!live || live.statut !== 'en_cours') return

    api.post(`/lives/${id}/join`).catch(() => {})
    const viewerInterval = setInterval(() => {
      api.get(`/lives/${id}`).then(({ data }) => setLive(data))
    }, 8000)

    return () => {
      clearInterval(viewerInterval)
      api.post(`/lives/${id}/leave`).catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live?.statut, id])

  useEffect(() => {
    if (!live || live.statut !== 'en_cours') return

    const chatInterval = setInterval(() => {
      api.get(`/lives/${id}/chat`, { params: { apres: lastIdRef.current || undefined } }).then(({ data }) => {
        if (data.length > 0) {
          setMessages((prev) => [...prev, ...data])
          lastIdRef.current = data[data.length - 1].id
        }
      })
    }, 3000)

    return () => clearInterval(chatInterval)
  }, [live?.statut, id])

  async function envoyer(e: FormEvent) {
    e.preventDefault()
    if (!texte.trim()) return
    await api.post(`/lives/${id}/chat`, { contenu: texte })
    setTexte('')
  }

  if (!live) {
    return (
      <>
        <PageHeader title="Live" />
        <div className="page-container">
          <p>Chargement…</p>
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader title={live.titre} subtitle={live.description ?? undefined} />
      <div className="page-container" style={{ maxWidth: 860 }}>
      {live.statut === 'en_cours' && live.lien_stream && (
        <>
          <div className="badge-pill badge-live" style={{ marginBottom: '0.75rem' }}>
            EN DIRECT — {live.viewers_count} spectateur(s)
          </div>
          <div className="live-player">
            <iframe
              src={toEmbedUrl(live.lien_stream)}
              title={live.titre}
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>
        </>
      )}

      {live.statut === 'termine' && live.lien_replay && (
        <div className="live-player">
          <iframe src={toEmbedUrl(live.lien_replay)} title={live.titre} allowFullScreen />
        </div>
      )}

      {live.statut === 'planifie' && <p>Ce live n'a pas encore démarré.</p>}

      {live.statut === 'en_cours' && (
        <div className="card live-chat">
          <h2 style={{ margin: '0 0 0.75rem' }}>Chat en direct</h2>
          <div className="live-chat-messages">
            {messages.map((m) => (
              <p key={m.id}>
                <strong>{m.membre.nom} :</strong> {m.contenu}
              </p>
            ))}
            {messages.length === 0 && <p className="auth-hint">Soyez le premier à réagir !</p>}
          </div>
          {membre ? (
            <form onSubmit={envoyer} className="live-chat-form">
              <input
                type="text"
                placeholder="Votre message…"
                maxLength={500}
                value={texte}
                onChange={(e) => setTexte(e.target.value)}
              />
              <button type="submit" className="btn-primary">Envoyer</button>
            </form>
          ) : (
            <p className="auth-hint">
              <Link to="/connexion">Connectez-vous</Link> pour participer au chat.
            </p>
          )}
        </div>
      )}
      </div>
    </>
  )
}
