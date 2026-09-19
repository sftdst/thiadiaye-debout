import { useEffect, useState, type FormEvent } from 'react'
import { api } from '../api/client'
import { Modal } from '../components/Modal'

interface Defi {
  id: number
  titre: string
  description: string | null
  objectif_membres: number
  date_limite: string
  actif: boolean
}

const emptyForm = { titre: '', description: '', objectif_membres: '', date_limite: '' }

function toDateInputValue(iso: string) {
  return iso.slice(0, 10)
}

export function DefisPage() {
  const [defis, setDefis] = useState<Defi[]>([])
  const [search, setSearch] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  function load() {
    setLoading(true)
    api
      .get('/admin/defis')
      .then(({ data }) => setDefis(data))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setError(null)
    setModalOpen(true)
  }

  function openEdit(defi: Defi) {
    setEditingId(defi.id)
    setForm({
      titre: defi.titre,
      description: defi.description ?? '',
      objectif_membres: String(defi.objectif_membres),
      date_limite: toDateInputValue(defi.date_limite),
    })
    setError(null)
    setModalOpen(true)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    const payload = { ...form, objectif_membres: Number(form.objectif_membres) }
    try {
      if (editingId) {
        await api.put(`/admin/defis/${editingId}`, payload)
      } else {
        await api.post('/admin/defis', payload)
      }
      setModalOpen(false)
      load()
    } catch {
      setError('Impossible d\'enregistrer ce défi.')
    }
  }

  async function toggleActif(defi: Defi) {
    await api.put(`/admin/defis/${defi.id}`, { actif: !defi.actif })
    load()
  }

  async function remove(defi: Defi) {
    if (!confirm(`Supprimer le défi "${defi.titre}" ?`)) return
    await api.delete(`/admin/defis/${defi.id}`)
    load()
  }

  const filtered = defis.filter((d) => d.titre.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <h1>Défis collectifs</h1>

      <div className="list-toolbar">
        <input
          type="search"
          placeholder="Rechercher un défi…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <button type="button" className="btn-new" onClick={openCreate}>
          Nouveau défi
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
                <th>Objectif</th>
                <th>Date limite</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((defi) => (
                <tr key={defi.id}>
                  <td>{defi.titre}</td>
                  <td>{defi.objectif_membres}</td>
                  <td>{new Date(defi.date_limite).toLocaleDateString('fr-FR')}</td>
                  <td>{defi.actif ? 'Actif' : 'Inactif'}</td>
                  <td className="row-actions">
                    <button className="btn-link" onClick={() => openEdit(defi)}>
                      Modifier
                    </button>
                    <button className="btn-link" onClick={() => toggleActif(defi)}>
                      {defi.actif ? 'Désactiver' : 'Activer'}
                    </button>
                    <button className="btn-link btn-danger" onClick={() => remove(defi)}>
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5}>Aucun défi trouvé.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Modifier le défi' : 'Nouveau défi'}>
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
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </label>
          <label>
            Objectif (nombre de membres)
            <input
              type="number"
              required
              min={1}
              value={form.objectif_membres}
              onChange={(e) => setForm({ ...form, objectif_membres: e.target.value })}
            />
          </label>
          <label>
            Date limite
            <input
              type="date"
              required
              value={form.date_limite}
              onChange={(e) => setForm({ ...form, date_limite: e.target.value })}
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn-primary">
            {editingId ? 'Mettre à jour' : 'Créer'}
          </button>
        </form>
      </Modal>
    </div>
  )
}
