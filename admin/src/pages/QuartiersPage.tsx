import { useEffect, useState, type FormEvent } from 'react'
import { api } from '../api/client'
import { Modal } from '../components/Modal'

interface Quartier {
  id: number
  nom: string
  couleur: string
  membres_count: number
  geojson: object | null
}

const emptyForm = { nom: '', couleur: '#027EED', geojson: '' }

export function QuartiersPage() {
  const [quartiers, setQuartiers] = useState<Quartier[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function load() {
    setLoading(true)
    api
      .get('/admin/quartiers')
      .then(({ data }) => setQuartiers(data))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setError(null)
    setModalOpen(true)
  }

  function openEdit(q: Quartier) {
    setEditingId(q.id)
    setForm({ nom: q.nom, couleur: q.couleur, geojson: q.geojson ? JSON.stringify(q.geojson) : '' })
    setError(null)
    setModalOpen(true)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    let geojson
    try {
      geojson = form.geojson.trim() ? JSON.parse(form.geojson) : null
    } catch {
      setError('Le GeoJSON saisi est invalide (JSON mal formé).')
      return
    }
    try {
      const payload = { nom: form.nom, couleur: form.couleur, geojson }
      if (editingId) {
        await api.put(`/admin/quartiers/${editingId}`, payload)
      } else {
        await api.post('/admin/quartiers', payload)
      }
      setModalOpen(false)
      load()
    } catch {
      setError("Impossible d'enregistrer ce quartier (nom déjà utilisé ?).")
    }
  }

  async function handleDelete(q: Quartier) {
    if (!confirm(`Supprimer le quartier "${q.nom}" ?`)) return
    try {
      await api.delete(`/admin/quartiers/${q.id}`)
      load()
    } catch {
      alert('Ce quartier ne peut pas être supprimé (des membres y sont rattachés).')
    }
  }

  const filtered = quartiers.filter((q) => q.nom.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <h1>Quartiers</h1>

      <div className="list-toolbar">
        <input
          type="search"
          placeholder="Rechercher un quartier…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <button type="button" className="btn-new" onClick={openCreate}>
          Nouveau quartier
        </button>
      </div>

      {loading ? (
        <p>Chargement…</p>
      ) : (
        <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Couleur</th>
              <th>Membres</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((q) => (
              <tr key={q.id}>
                <td>
                  <span className="color-dot" style={{ background: q.couleur }} />
                  {q.nom}
                </td>
                <td>{q.couleur}</td>
                <td>{q.membres_count}</td>
                <td className="row-actions">
                  <button className="btn-link" onClick={() => openEdit(q)}>
                    Modifier
                  </button>
                  <button className="btn-link btn-danger" onClick={() => handleDelete(q)}>
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4}>Aucun quartier trouvé.</td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Modifier le quartier' : 'Nouveau quartier'}
      >
        <form className="card-form" onSubmit={handleSubmit}>
          <label>
            Nom du quartier
            <input
              type="text"
              required
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
            />
          </label>
          <label>
            Couleur
            <input
              type="color"
              value={form.couleur}
              onChange={(e) => setForm({ ...form, couleur: e.target.value })}
            />
          </label>
          <label>
            Tracé GeoJSON (carte interactive — optionnel)
            <textarea
              rows={4}
              placeholder='{"type":"Polygon","coordinates":[...]}'
              value={form.geojson}
              onChange={(e) => setForm({ ...form, geojson: e.target.value })}
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn-primary">
            {editingId ? 'Mettre à jour' : 'Créer le quartier'}
          </button>
        </form>
      </Modal>
    </div>
  )
}
