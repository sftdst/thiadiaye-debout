import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { PageHeader } from '../components/PageHeader'

interface ArchivePhoto {
  id: number
  titre: string
  description: string | null
  url: string
  annee: number | null
}

export function ImagesPage() {
  const [photos, setPhotos] = useState<ArchivePhoto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/memoire/photos')
      .then(({ data }) => setPhotos(data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <PageHeader
        title="Image"
        subtitle="Photos d'archive et moments forts du mouvement Thiadiaye Debout."
      />
      <div className="page-container">
        {loading ? (
          <p>Chargement…</p>
        ) : (
          <div className="video-grid">
            {photos.map((photo) => (
              <a key={photo.id} href={photo.url} target="_blank" rel="noreferrer" className="card video-card">
                <h3>{photo.titre}</h3>
                {photo.annee && <span className="badge-pill">{photo.annee}</span>}
                {photo.description && <p>{photo.description}</p>}
              </a>
            ))}
            {photos.length === 0 && <p>Aucune photo pour le moment.</p>}
          </div>
        )}
      </div>
    </>
  )
}
