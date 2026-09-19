import { useEffect, useState, type FormEvent } from 'react'
import { api } from '../api/client'
import { Modal } from '../components/Modal'

interface Publication {
  id: number
  titre: string
  contenu: string
  type: 'actualite' | 'bilan'
  statut: 'brouillon' | 'publiee'
}

const emptyForm = { titre: '', contenu: '', type: 'actualite' }

export function PublicationsPage() {
  const [publications, setPublications] = useState<Publication[]>([])
  const [search, setSearch] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  function load() {
    setLoading(true)
    api
      .get('/admin/publications')
      .then(({ data }) => setPublications(data))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function openEdit(pub: Publication) {
    setEditingId(pub.id)
    setForm({ titre: pub.titre, contenu: pub.contenu, type: pub.type })
    setModalOpen(true)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (editingId) {
      await api.put(`/admin/publications/${editingId}`, form)
    } else {
      await api.post('/admin/publications', { ...form, statut: 'publiee' })
    }
    setModalOpen(false)
    load()
  }

  async function toggleStatut(pub: Publication) {
    await api.put(`/admin/publications/${pub.id}`, {
      statut: pub.statut === 'publiee' ? 'brouillon' : 'publiee',
    })
    load()
  }

  async function remove(pub: Publication) {
    if (!confirm(`Supprimer "${pub.titre}" ?`)) return
    await api.delete(`/admin/publications/${pub.id}`)
    load()
  }

  const filtered = publications.filter((p) => p.titre.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <h1>Journal du mouvement</h1>

      <div className="list-toolbar">
        <input
          type="search"
          placeholder="Rechercher une publication…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <button type="button" className="btn-new" onClick={openCreate}>
          Nouvelle publication
        </button>
      </div>

      {loading ? (
        <p>Chargement…</p>
      ) : (
        filtered.map((pub) => (
          <div key={pub.id} className="result-card">
            <div className="row-actions" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <h3>
                {pub.titre} <span className="badge-pill">{pub.type}</span>
              </h3>
              <div className="row-actions">
                <button className="btn-link" onClick={() => openEdit(pub)}>
                  Modifier
                </button>
                <button className="btn-link" onClick={() => toggleStatut(pub)}>
                  {pub.statut === 'publiee' ? 'Repasser en brouillon' : 'Publier'}
                </button>
                <button className="btn-link btn-danger" onClick={() => remove(pub)}>
                  Supprimer
                </button>
              </div>
            </div>
            <p>{pub.contenu}</p>
            <span className="badge-pill">{pub.statut}</span>
          </div>
        ))
      )}
      {!loading && filtered.length === 0 && <p>Aucune publication trouvée.</p>}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Modifier la publication' : 'Nouvelle publication'}
      >
        <form className="card-form" onSubmit={handleSubmit}>
          <label>
            Titre
            <input type="text" required value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} />
          </label>
          <label>
            Type
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="actualite">Actualité</option>
              <option value="bilan">Bilan</option>
            </select>
          </label>
          <label>
            Contenu
            <textarea
              required
              rows={4}
              value={form.contenu}
              onChange={(e) => setForm({ ...form, contenu: e.target.value })}
            />
          </label>
          <button type="submit" className="btn-primary">
            {editingId ? 'Mettre à jour' : 'Publier'}
          </button>
        </form>
      </Modal>
    </div>
  )
}
