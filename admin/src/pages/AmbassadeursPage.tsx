import { useEffect, useState, type FormEvent } from 'react'
import { api } from '../api/client'
import { Modal } from '../components/Modal'

interface Membre {
  id: number
  nom: string
  telephone: string
  role: string
  quartier: { nom: string }
}

interface ContenuFormation {
  id: number
  titre: string
  contenu: string | null
  url: string | null
}

const emptyForm = { titre: '', contenu: '', url: '' }

export function AmbassadeursPage() {
  const [membres, setMembres] = useState<Membre[]>([])
  const [formations, setFormations] = useState<ContenuFormation[]>([])
  const [search, setSearch] = useState('')
  const [searchFormation, setSearchFormation] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  function loadMembres() {
    api.get('/admin/membres', { params: { search: search || undefined } }).then(({ data }) => setMembres(data.data))
  }

  function loadFormations() {
    api.get('/admin/contenus-formation').then(({ data }) => setFormations(data))
  }

  useEffect(loadMembres, [search])
  useEffect(loadFormations, [])

  async function toggleRole(membre: Membre) {
    const nouveauRole = membre.role === 'ambassadeur' ? 'membre' : 'ambassadeur'
    await api.patch(`/admin/membres/${membre.id}/role`, { role: nouveauRole })
    loadMembres()
  }

  function openCreateFormation() {
    setEditingId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function openEditFormation(f: ContenuFormation) {
    setEditingId(f.id)
    setForm({ titre: f.titre, contenu: f.contenu ?? '', url: f.url ?? '' })
    setModalOpen(true)
  }

  async function submitFormation(e: FormEvent) {
    e.preventDefault()
    if (editingId) {
      await api.put(`/admin/contenus-formation/${editingId}`, form)
    } else {
      await api.post('/admin/contenus-formation', form)
    }
    setModalOpen(false)
    loadFormations()
  }

  async function removeFormation(f: ContenuFormation) {
    if (!confirm(`Supprimer "${f.titre}" ?`)) return
    await api.delete(`/admin/contenus-formation/${f.id}`)
    loadFormations()
  }

  const filteredFormations = formations.filter((f) =>
    f.titre.toLowerCase().includes(searchFormation.toLowerCase()),
  )

  return (
    <div>
      <h1>Réseau des ambassadeurs</h1>

      <h2>Promouvoir un membre</h2>
      <div className="list-toolbar">
        <input
          type="search"
          placeholder="Rechercher un membre…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
      </div>
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Quartier</th>
              <th>Rôle</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {membres.map((m) => (
              <tr key={m.id}>
                <td>{m.nom}</td>
                <td>{m.quartier.nom}</td>
                <td>{m.role}</td>
                <td className="row-actions">
                  <button className="btn-link" onClick={() => toggleRole(m)}>
                    {m.role === 'ambassadeur' ? 'Rétrograder en membre' : 'Promouvoir ambassadeur'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 style={{ marginTop: '2rem' }}>Contenu de formation</h2>
      <div className="list-toolbar">
        <input
          type="search"
          placeholder="Rechercher un contenu…"
          value={searchFormation}
          onChange={(e) => setSearchFormation(e.target.value)}
          className="search-input"
        />
        <button type="button" className="btn-new" onClick={openCreateFormation}>
          Nouveau contenu
        </button>
      </div>

      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>Titre</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredFormations.map((f) => (
              <tr key={f.id}>
                <td>{f.titre}</td>
                <td className="row-actions">
                  <button className="btn-link" onClick={() => openEditFormation(f)}>Modifier</button>
                  <button className="btn-link btn-danger" onClick={() => removeFormation(f)}>Supprimer</button>
                </td>
              </tr>
            ))}
            {filteredFormations.length === 0 && (
              <tr>
                <td colSpan={2}>Aucun contenu trouvé.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Modifier le contenu de formation' : 'Nouveau contenu de formation'}
      >
        <form className="card-form" onSubmit={submitFormation}>
          <label>
            Titre
            <input type="text" required value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} />
          </label>
          <label>
            Contenu texte
            <textarea rows={2} value={form.contenu} onChange={(e) => setForm({ ...form, contenu: e.target.value })} />
          </label>
          <label>
            Lien vidéo (optionnel)
            <input type="url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
          </label>
          <button type="submit" className="btn-primary">{editingId ? 'Mettre à jour' : 'Ajouter'}</button>
        </form>
      </Modal>
    </div>
  )
}
