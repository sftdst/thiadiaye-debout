import { useEffect, useState, type FormEvent } from 'react'
import { api } from '../api/client'
import { Modal } from '../components/Modal'

interface Traduction {
  id: number
  cle: string
  langue: string
  texte: string
}

interface Audio {
  id: number
  cle: string
  langue: string
  url: string
}

const emptyTraductionForm = { cle: '', langue: 'wo', texte: '' }
const emptyAudioForm = { cle: '', langue: 'wo', url: '' }

export function TraductionsPage() {
  const [langue, setLangue] = useState('wo')
  const [traductions, setTraductions] = useState<Traduction[]>([])
  const [audios, setAudios] = useState<Audio[]>([])
  const [search, setSearch] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState(emptyTraductionForm)

  const [audioModalOpen, setAudioModalOpen] = useState(false)
  const [audioForm, setAudioForm] = useState(emptyAudioForm)

  function loadTraductions() {
    api.get('/admin/traductions', { params: { langue } }).then(({ data }) => setTraductions(data))
  }

  function loadAudios() {
    api.get('/admin/fichiers-audio', { params: { langue } }).then(({ data }) => setAudios(data))
  }

  useEffect(loadTraductions, [langue])
  useEffect(loadAudios, [langue])

  function openCreate() {
    setEditingId(null)
    setForm({ ...emptyTraductionForm, langue })
    setModalOpen(true)
  }

  function openEdit(t: Traduction) {
    setEditingId(t.id)
    setForm({ cle: t.cle, langue: t.langue, texte: t.texte })
    setModalOpen(true)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (editingId) {
      await api.put(`/admin/traductions/${editingId}`, { texte: form.texte })
    } else {
      await api.post('/admin/traductions', form)
    }
    setModalOpen(false)
    loadTraductions()
  }

  async function remove(t: Traduction) {
    if (!confirm(`Supprimer la traduction "${t.cle}" ?`)) return
    await api.delete(`/admin/traductions/${t.id}`)
    loadTraductions()
  }

  function openCreateAudio() {
    setAudioForm({ ...emptyAudioForm, langue })
    setAudioModalOpen(true)
  }

  async function submitAudio(e: FormEvent) {
    e.preventDefault()
    await api.post('/admin/fichiers-audio', audioForm)
    setAudioModalOpen(false)
    loadAudios()
  }

  async function removeAudio(a: Audio) {
    if (!confirm(`Supprimer le message vocal "${a.cle}" ?`)) return
    await api.delete(`/admin/fichiers-audio/${a.id}`)
    loadAudios()
  }

  const filtered = traductions.filter((t) => t.cle.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <h1>Version multilingue</h1>
      <p className="auth-hint">
        Le français reste la langue par défaut de l'interface. Pas de synthèse vocale automatique
        fiable en wolof/sérère — les messages audio doivent être enregistrés par des locuteurs
        natifs puis ajoutés ici via un lien hébergé.
      </p>

      <div className="filter-tabs">
        <button className={langue === 'wo' ? 'active' : ''} onClick={() => setLangue('wo')}>
          Wolof
        </button>
        <button className={langue === 'srr' ? 'active' : ''} onClick={() => setLangue('srr')}>
          Sérère
        </button>
      </div>

      <h2>Traductions texte</h2>
      <div className="list-toolbar">
        <input
          type="search"
          placeholder="Rechercher une clé…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <button type="button" className="btn-new" onClick={openCreate}>
          Nouvelle traduction
        </button>
      </div>

      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>Clé</th>
              <th>Texte</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id}>
                <td><code>{t.cle}</code></td>
                <td>{t.texte}</td>
                <td className="row-actions">
                  <button className="btn-link" onClick={() => openEdit(t)}>Modifier</button>
                  <button className="btn-link btn-danger" onClick={() => remove(t)}>Supprimer</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={3}>Aucune traduction pour cette langue.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h2 style={{ marginTop: '2rem' }}>Messages vocaux</h2>
      <div className="list-toolbar">
        <button type="button" className="btn-new" onClick={openCreateAudio}>
          Nouveau message vocal
        </button>
      </div>
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>Clé</th>
              <th>Écouter</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {audios.map((a) => (
              <tr key={a.id}>
                <td><code>{a.cle}</code></td>
                <td><audio controls src={a.url} style={{ height: 32 }} /></td>
                <td className="row-actions">
                  <button className="btn-link btn-danger" onClick={() => removeAudio(a)}>Supprimer</button>
                </td>
              </tr>
            ))}
            {audios.length === 0 && (
              <tr>
                <td colSpan={3}>Aucun message vocal pour cette langue.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Modifier la traduction' : 'Nouvelle traduction'}>
        <form className="card-form" onSubmit={handleSubmit}>
          <label>
            Clé (ex : accueil.bienvenue)
            <input
              type="text"
              required
              disabled={!!editingId}
              value={form.cle}
              onChange={(e) => setForm({ ...form, cle: e.target.value })}
            />
          </label>
          <label>
            Langue
            <select
              disabled={!!editingId}
              value={form.langue}
              onChange={(e) => setForm({ ...form, langue: e.target.value })}
            >
              <option value="wo">Wolof</option>
              <option value="srr">Sérère</option>
            </select>
          </label>
          <label>
            Texte traduit
            <textarea rows={3} required value={form.texte} onChange={(e) => setForm({ ...form, texte: e.target.value })} />
          </label>
          <button type="submit" className="btn-primary">{editingId ? 'Mettre à jour' : 'Enregistrer'}</button>
        </form>
      </Modal>

      <Modal open={audioModalOpen} onClose={() => setAudioModalOpen(false)} title="Nouveau message vocal">
        <form className="card-form" onSubmit={submitAudio}>
          <label>
            Clé (ex : chatbot.menu_principal)
            <input type="text" required value={audioForm.cle} onChange={(e) => setAudioForm({ ...audioForm, cle: e.target.value })} />
          </label>
          <label>
            Langue
            <select value={audioForm.langue} onChange={(e) => setAudioForm({ ...audioForm, langue: e.target.value })}>
              <option value="wo">Wolof</option>
              <option value="srr">Sérère</option>
            </select>
          </label>
          <label>
            URL du fichier audio hébergé
            <input type="url" required value={audioForm.url} onChange={(e) => setAudioForm({ ...audioForm, url: e.target.value })} />
          </label>
          <button type="submit" className="btn-primary">Enregistrer</button>
        </form>
      </Modal>
    </div>
  )
}
