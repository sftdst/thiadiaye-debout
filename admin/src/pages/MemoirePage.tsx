import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { api } from '../api/client'
import { Modal } from '../components/Modal'

interface ArchivePhoto {
  id: number
  titre: string
  description: string | null
  url: string
  annee: number | null
}

interface ModerableItem {
  id: number
  auteur_nom: string
  statut: 'en_attente' | 'publie' | 'rejete'
  contenu?: string
  message?: string
}

const emptyPhotoForm = { titre: '', description: '', url: '', annee: '' }

export function MemoirePage() {
  const [photos, setPhotos] = useState<ArchivePhoto[]>([])
  const [temoignages, setTemoignages] = useState<ModerableItem[]>([])
  const [livreOr, setLivreOr] = useState<ModerableItem[]>([])
  const [search, setSearch] = useState('')
  const [photoForm, setPhotoForm] = useState(emptyPhotoForm)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function load() {
    api.get('/memoire/photos').then(({ data }) => setPhotos(data))
    api.get('/admin/memoire/temoignages', { params: { statut: 'en_attente' } }).then(({ data }) => setTemoignages(data.data))
    api.get('/admin/memoire/livre-or', { params: { statut: 'en_attente' } }).then(({ data }) => setLivreOr(data.data))
  }

  useEffect(load, [])

  function openCreate() {
    setEditingId(null)
    setPhotoForm(emptyPhotoForm)
    setPhotoFile(null)
    setError(null)
    setModalOpen(true)
  }

  function openEdit(photo: ArchivePhoto) {
    setEditingId(photo.id)
    setPhotoForm({
      titre: photo.titre,
      description: photo.description ?? '',
      url: photo.url,
      annee: photo.annee ? String(photo.annee) : '',
    })
    setPhotoFile(null)
    setError(null)
    setModalOpen(true)
  }

  function handlePhotoFile(e: ChangeEvent<HTMLInputElement>) {
    setPhotoFile(e.target.files?.[0] ?? null)
  }

  async function submitPhoto(e: FormEvent) {
    e.preventDefault()
    setError(null)
    const payload = new FormData()
    payload.append('titre', photoForm.titre)
    if (photoForm.description) payload.append('description', photoForm.description)
    if (photoForm.annee) payload.append('annee', photoForm.annee)
    if (photoFile) {
      payload.append('photo', photoFile)
    } else if (photoForm.url) {
      payload.append('url', photoForm.url)
    }
    try {
      if (editingId) {
        payload.append('_method', 'PUT')
        await api.post(`/admin/memoire/photos/${editingId}`, payload)
      } else {
        await api.post('/admin/memoire/photos', payload)
      }
      setModalOpen(false)
      load()
    } catch {
      setError("Impossible d'enregistrer cette photo (fournissez une URL ou une image).")
    }
  }

  async function removePhoto(photo: ArchivePhoto) {
    if (!confirm(`Supprimer la photo "${photo.titre}" ?`)) return
    await api.delete(`/admin/memoire/photos/${photo.id}`);
    load()
  }

  async function moderateTemoignage(id: number, statut: 'publie' | 'rejete') {
    await api.patch(`/admin/memoire/temoignages/${id}`, { statut })
    load()
  }

  async function moderateLivreOr(id: number, statut: 'publie' | 'rejete') {
    await api.patch(`/admin/memoire/livre-or/${id}`, { statut })
    load()
  }

  const filteredPhotos = photos.filter((p) => p.titre.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <h1>Mémoire de Thiadiaye</h1>

      <div className="list-toolbar">
        <input
          type="search"
          placeholder="Rechercher une photo…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <button type="button" className="btn-new" onClick={openCreate}>
          Nouvelle photo
        </button>
      </div>

      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>Titre</th>
              <th>Année</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredPhotos.map((p) => (
              <tr key={p.id}>
                <td>{p.titre}</td>
                <td>{p.annee ?? '—'}</td>
                <td className="row-actions">
                  <button className="btn-link" onClick={() => openEdit(p)}>
                    Modifier
                  </button>
                  <button className="btn-link btn-danger" onClick={() => removePhoto(p)}>
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
            {filteredPhotos.length === 0 && (
              <tr>
                <td colSpan={3}>Aucune photo trouvée.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h2>Témoignages en attente de modération</h2>
      {temoignages.map((t) => (
        <div key={t.id} className="result-card">
          <p>{t.contenu}</p>
          <div className="row-actions" style={{ justifyContent: 'space-between' }}>
            <span>— {t.auteur_nom}</span>
            <div className="row-actions">
              <button className="btn-link" onClick={() => moderateTemoignage(t.id, 'publie')}>
                Publier
              </button>
              <button className="btn-link btn-danger" onClick={() => moderateTemoignage(t.id, 'rejete')}>
                Rejeter
              </button>
            </div>
          </div>
        </div>
      ))}
      {temoignages.length === 0 && <p>Aucun témoignage en attente.</p>}

      <h2>Livre d'or en attente de modération</h2>
      {livreOr.map((m) => (
        <div key={m.id} className="result-card">
          <p>{m.message}</p>
          <div className="row-actions" style={{ justifyContent: 'space-between' }}>
            <span>— {m.auteur_nom}</span>
            <div className="row-actions">
              <button className="btn-link" onClick={() => moderateLivreOr(m.id, 'publie')}>
                Publier
              </button>
              <button className="btn-link btn-danger" onClick={() => moderateLivreOr(m.id, 'rejete')}>
                Rejeter
              </button>
            </div>
          </div>
        </div>
      ))}
      {livreOr.length === 0 && <p>Aucun message en attente.</p>}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Modifier la photo d'archive" : "Nouvelle photo d'archive"}
      >
        <form className="card-form" onSubmit={submitPhoto}>
          <label>
            Titre
            <input
              type="text"
              required
              value={photoForm.titre}
              onChange={(e) => setPhotoForm({ ...photoForm, titre: e.target.value })}
            />
          </label>
          <label>
            Description
            <textarea
              rows={2}
              value={photoForm.description}
              onChange={(e) => setPhotoForm({ ...photoForm, description: e.target.value })}
            />
          </label>
          <label>
            Image (upload)
            <input type="file" accept="image/*" onChange={handlePhotoFile} />
          </label>
          <label>
            Ou URL de l'image
            <input
              type="url"
              placeholder="https://…"
              value={photoForm.url}
              onChange={(e) => setPhotoForm({ ...photoForm, url: e.target.value })}
            />
          </label>
          <label>
            Année
            <input
              type="number"
              value={photoForm.annee}
              onChange={(e) => setPhotoForm({ ...photoForm, annee: e.target.value })}
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn-primary">
            {editingId ? 'Mettre à jour' : 'Ajouter'}
          </button>
        </form>
      </Modal>
    </div>
  )
}
