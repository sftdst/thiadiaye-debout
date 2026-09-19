import { useEffect, useState, type FormEvent } from 'react'
import { api } from '../api/client'
import { Modal } from '../components/Modal'

interface Quartier {
  id: number
  nom: string
}

interface Evenement {
  id: number
  titre: string
  description: string | null
  lieu: string | null
  debut_at: string
  lien_reunion: string | null
  quartier_id: number | null
  reserve_ambassadeurs: boolean
  inscriptions_count: number
  quartier: { nom: string } | null
}

const emptyForm = {
  titre: '',
  description: '',
  lieu: '',
  quartier_id: '',
  debut_at: '',
  lien_reunion: '',
  reserve_ambassadeurs: false,
}

function toDatetimeLocal(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function EvenementsPage() {
  const [evenements, setEvenements] = useState<Evenement[]>([])
  const [quartiers, setQuartiers] = useState<Quartier[]>([])
  const [search, setSearch] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const [loading, setLoading] = useState(true)

  function load() {
    setLoading(true)
    api
      .get('/admin/evenements')
      .then(({ data }) => setEvenements(data))
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

  function openEdit(e: Evenement) {
    setEditingId(e.id)
    setForm({
      titre: e.titre,
      description: e.description ?? '',
      lieu: e.lieu ?? '',
      quartier_id: e.quartier_id ? String(e.quartier_id) : '',
      debut_at: toDatetimeLocal(e.debut_at),
      lien_reunion: e.lien_reunion ?? '',
      reserve_ambassadeurs: e.reserve_ambassadeurs,
    })
    setModalOpen(true)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const payload = {
      ...form,
      quartier_id: form.quartier_id || undefined,
      lien_reunion: form.lien_reunion || undefined,
    }
    if (editingId) {
      await api.put(`/admin/evenements/${editingId}`, payload)
    } else {
      await api.post('/admin/evenements', payload)
    }
    setModalOpen(false)
    load()
  }

  async function remove(evenement: Evenement) {
    if (!confirm(`Supprimer "${evenement.titre}" ?`)) return
    await api.delete(`/admin/evenements/${evenement.id}`)
    load()
  }

  const filtered = evenements.filter((e) => e.titre.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <h1>Agenda citoyen</h1>

      <div className="list-toolbar">
        <input
          type="search"
          placeholder="Rechercher un événement…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <button type="button" className="btn-new" onClick={openCreate}>
          Nouvel événement
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
                <th>Date</th>
                <th>Quartier</th>
                <th>Inscrits</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id}>
                  <td>
                    {e.titre} {e.reserve_ambassadeurs && <span className="badge-pill">Ambassadeurs</span>}
                  </td>
                  <td>{new Date(e.debut_at).toLocaleString('fr-FR')}</td>
                  <td>{e.quartier?.nom ?? '—'}</td>
                  <td>{e.inscriptions_count}</td>
                  <td className="row-actions">
                    <button className="btn-link" onClick={() => openEdit(e)}>Modifier</button>
                    <button className="btn-link btn-danger" onClick={() => remove(e)}>Supprimer</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5}>Aucun événement trouvé.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Modifier l'événement" : 'Nouvel événement'}
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
            Lieu
            <input type="text" value={form.lieu} onChange={(e) => setForm({ ...form, lieu: e.target.value })} />
          </label>
          <label>
            Quartier (optionnel)
            <select value={form.quartier_id} onChange={(e) => setForm({ ...form, quartier_id: e.target.value })}>
              <option value="">—</option>
              {quartiers.map((q) => (
                <option key={q.id} value={q.id}>{q.nom}</option>
              ))}
            </select>
          </label>
          <label>
            Date et heure
            <input
              type="datetime-local"
              required
              value={form.debut_at}
              onChange={(e) => setForm({ ...form, debut_at: e.target.value })}
            />
          </label>
          <label>
            Lien de réunion en ligne (optionnel)
            <input type="url" value={form.lien_reunion} onChange={(e) => setForm({ ...form, lien_reunion: e.target.value })} />
          </label>
          <label className="checkbox-inline">
            <input
              type="checkbox"
              checked={form.reserve_ambassadeurs}
              onChange={(e) => setForm({ ...form, reserve_ambassadeurs: e.target.checked })}
            />
            Réservé aux ambassadeurs (réunion mensuelle)
          </label>
          <button type="submit" className="btn-primary">{editingId ? 'Mettre à jour' : 'Créer'}</button>
        </form>
      </Modal>
    </div>
  )
}
