import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { PageHeader } from '../components/PageHeader'

interface Video {
  id: number
  titre: string
  description: string | null
  type: 'message' | 'temoignage' | 'realisation' | 'replay'
  url: string
  quartier: { nom: string; couleur: string } | null
}

const typeLabels: Record<Video['type'], string> = {
  message: 'Message du maire',
  temoignage: 'Témoignage',
  realisation: 'Réalisation',
  replay: 'Replay live',
}

export function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [filtre, setFiltre] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api
      .get('/videos', { params: { type: filtre || undefined } })
      .then(({ data }) => setVideos(data.data))
      .finally(() => setLoading(false))
  }, [filtre])

  return (
    <>
      <PageHeader
        title="Espace vidéo"
        subtitle="Messages du maire, témoignages, réalisations et replays des lives."
      />
      <div className="page-container">
      <div className="filter-tabs">
        <button className={filtre === '' ? 'active' : ''} onClick={() => setFiltre('')}>
          Toutes
        </button>
        {Object.entries(typeLabels).map(([value, label]) => (
          <button
            key={value}
            className={filtre === value ? 'active' : ''}
            onClick={() => setFiltre(value)}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Chargement…</p>
      ) : (
        <div className="video-grid">
          {videos.map((video) => (
            <a key={video.id} href={video.url} target="_blank" rel="noreferrer" className="card video-card">
              <span className="badge-pill">{typeLabels[video.type]}</span>
              <h3>{video.titre}</h3>
              {video.description && <p>{video.description}</p>}
              {video.quartier && (
                <span className="quartier-tag">
                  <span className="color-dot" style={{ background: video.quartier.couleur }} />
                  {video.quartier.nom}
                </span>
              )}
            </a>
          ))}
          {videos.length === 0 && <p>Aucune vidéo pour le moment.</p>}
        </div>
      )}
      </div>
    </>
  )
}
