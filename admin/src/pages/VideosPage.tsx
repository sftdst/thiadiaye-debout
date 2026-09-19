import { useEffect, useState, type FormEvent } from 'react'
import { api } from '../api/client'
import { Modal } from '../components/Modal'

interface Quartier {
  id: number
  nom: string
}

interface Video {
  id: number
  titre: string
  description: string | null
  type: string
  url: string
  quartier_id: number | null
  statut: 'en_attente' | 'publiee' | 'rejetee'
  quartier: { nom: string } | null
  membre: { nom: string } | null
}

const emptyForm = { titre: '', description: '', type: 'message', url: '', quartier_id: '' }

export function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [quartiers, setQuartiers] = useState<Quartier[]>([])
  const [search, setSearch] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  function load() {
    setLoading(true)
    api
      .get('/admin/videos')
      .then(({ data }) => setVideos(data.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    api.get('/admin/quartiers').then(({ data }) => setQuartiers(data))
  }, [])

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setError(null)
    setModalOpen(true)
  }

  function openEdit(v: Video) {
    setEditingId(v.id)
    setForm({
      titre: v.titre,
      description: v.description ?? '',
      type: v.type,
      url: v.url,
      quartier_id: v.quartier_id ? String(v.quartier_id) : '',
    })
    setError(null)
    setModalOpen(true)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    const payload = { ...form, quartier_id: form.quartier_id || undefined }
    try {
      if (editingId) {
        await api.put(`/admin/videos/${editingId}`, payload)
      } else {
        await api.post('/admin/videos', payload)
      }
      setModalOpen(false)
      load()
    } catch {
      setError("Impossible d'enregistrer cette vidéo (vérifiez l'URL).")
    }
  }

  async function remove(video: Video) {
    if (!confirm(`Supprimer la vidéo "${video.titre}" ?`)) return
    await api.delete(`/admin/videos/${video.id}`)
    load()
  }

  const filtered = videos.filter((v) => v.titre.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <h1>Espace vidéo</h1>

      <div className="list-toolbar">
        <input
          type="search"
          placeholder="Rechercher une vidéo…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <button type="button" className="btn-new" onClick={openCreate}>
          Nouvelle vidéo
        </button>
      </div>

      {loading ? (
        <p>Chargement…</p>
      ) : (
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Titre</th>
                <th>Type</th>
                <th>Quartier</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <tr key={v.id}>
                  <td>{v.titre}</td>
                  <td>{v.type}</td>
                  <td>{v.quartier?.nom ?? '—'}</td>
                  <td>{v.statut}</td>
                  <td className="row-actions">
                    <button className="btn-link" onClick={() => openEdit(v)}>
                      Modifier
                    </button>
                    <button className="btn-link btn-danger" onClick={() => remove(v)}>
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5}>Aucune vidéo trouvée.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Modifier la vidéo' : 'Ajouter une vidéo'}
      >
        <form className="card-form" onSubmit={handleSubmit}>
          <label>
            Titre
            <input
              type="text"
              required
              value={form.titre}
              onChange={(e) => setForm({ ...form, titre: e.target.value })}
            />
          </label>
          <label>
            Description
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </label>
          <label>
            URL
            <input
              type="url"
              required
              placeholder="https://…"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
            />
          </label>
          <label>
            Type
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="message">Message du maire</option>
              <option value="temoignage">Témoignage</option>
              <option value="realisation">Réalisation</option>
              <option value="replay">Replay live</option>
            </select>
          </label>
          <label>
            Quartier (optionnel)
            <select
              value={form.quartier_id}
              onChange={(e) => setForm({ ...form, quartier_id: e.target.value })}
            >
              <option value="">—</option>
              {quartiers.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.nom}
                </option>
              ))}
            </select>
          </label>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn-primary">
            {editingId ? 'Mettre à jour' : 'Publier'}
          </button>
        </form>
      </Modal>
    </div>
  )
}
