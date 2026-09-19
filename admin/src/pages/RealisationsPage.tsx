import { useEffect, useState, type FormEvent } from 'react'
import { api } from '../api/client'
import { Modal } from '../components/Modal'

interface Quartier {
  id: number
  nom: string
}

interface Realisation {
  id: number
  titre: string
  description: string | null
  quartier_id: number
  quartier: { nom: string }
  photo_avant_url: string | null
  photo_apres_url: string | null
  date_realisation: string | null
}

const emptyForm = {
  titre: '',
  description: '',
  quartier_id: '',
  photo_avant_url: '',
  photo_apres_url: '',
  date_realisation: '',
}

export function RealisationsPage() {
  const [realisations, setRealisations] = useState<Realisation[]>([])
  const [quartiers, setQuartiers] = useState<Quartier[]>([])
  const [search, setSearch] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  function load() {
    setLoading(true)
    api
      .get('/realisations')
      .then(({ data }) => setRealisations(data))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    api.get('/admin/quartiers').then(({ data }) => setQuartiers(data))
  }, [])

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function openEdit(r: Realisation) {
    setEditingId(r.id)
    setForm({
      titre: r.titre,
      description: r.description ?? '',
      quartier_id: String(r.quartier_id),
      photo_avant_url: r.photo_avant_url ?? '',
      photo_apres_url: r.photo_apres_url ?? '',
      date_realisation: r.date_realisation ? r.date_realisation.slice(0, 10) : '',
    })
    setModalOpen(true)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (editingId) {
      await api.put(`/admin/realisations/${editingId}`, form)
    } else {
      await api.post('/admin/realisations', form)
    }
    setModalOpen(false)
    load()
  }

  async function remove(realisation: Realisation) {
    if (!confirm(`Supprimer "${realisation.titre}" ?`)) return
    await api.delete(`/admin/realisations/${realisation.id}`)
    load()
  }

  const filtered = realisations.filter((r) => r.titre.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <h1>Réalisations</h1>

      <div className="list-toolbar">
        <input
          type="search"
          placeholder="Rechercher une réalisation…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <button type="button" className="btn-new" onClick={openCreate}>
          Nouvelle réalisation
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
                <th>Quartier</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td>{r.titre}</td>
                  <td>{r.quartier.nom}</td>
                  <td className="row-actions">
                    <button className="btn-link" onClick={() => openEdit(r)}>Modifier</button>
                    <button className="btn-link btn-danger" onClick={() => remove(r)}>Supprimer</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={3}>Aucune réalisation trouvée.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Modifier la réalisation' : 'Nouvelle réalisation'}
      >
        <form className="card-form" onSubmit={handleSubmit}>
          <label>
            Titre
            <input type="text" required value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} />
          </label>
          <label>
            Description
            <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </label>
          <label>
            Quartier
            <select required value={form.quartier_id} onChange={(e) => setForm({ ...form, quartier_id: e.target.value })}>
              <option value="" disabled>Sélectionner…</option>
              {quartiers.map((q) => (
                <option key={q.id} value={q.id}>{q.nom}</option>
              ))}
            </select>
          </label>
          <label>
            Photo avant (URL)
            <input type="url" value={form.photo_avant_url} onChange={(e) => setForm({ ...form, photo_avant_url: e.target.value })} />
          </label>
          <label>
            Photo après (URL)
            <input type="url" value={form.photo_apres_url} onChange={(e) => setForm({ ...form, photo_apres_url: e.target.value })} />
          </label>
          <label>
            Date
            <input type="date" value={form.date_realisation} onChange={(e) => setForm({ ...form, date_realisation: e.target.value })} />
          </label>
          <button type="submit" className="btn-primary">{editingId ? 'Mettre à jour' : 'Ajouter'}</button>
        </form>
      </Modal>
    </div>
  )
}
