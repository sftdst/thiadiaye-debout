import { useEffect, useState, type FormEvent } from 'react'
import { api } from '../api/client'
import { Modal } from '../components/Modal'

interface Quartier {
  id: number
  nom: string
}

interface Live {
  id: number
  titre: string
  type: 'maire' | 'quartier'
  statut: 'planifie' | 'en_cours' | 'termine'
  lien_stream: string | null
  lien_replay: string | null
  viewers_count: number
  planifie_at: string
  quartier: { nom: string } | null
}

const emptyForm = { titre: '', description: '', type: 'maire', quartier_id: '', lien_stream: '', planifie_at: '' }

const statutLabels: Record<Live['statut'], string> = {
  planifie: 'Planifié',
  en_cours: 'EN DIRECT',
  termine: 'Terminé',
}

export function LivesPage() {
  const [lives, setLives] = useState<Live[]>([])
  const [quartiers, setQuartiers] = useState<Quartier[]>([])
  const [search, setSearch] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [modalOpen, setModalOpen] = useState(false)
  const [replayModal, setReplayModal] = useState<Live | null>(null)
  const [lienReplay, setLienReplay] = useState('')
  const [loading, setLoading] = useState(true)

  function load() {
    setLoading(true)
    api
      .get('/admin/lives')
      .then(({ data }) => setLives(data))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    api.get('/admin/quartiers').then(({ data }) => setQuartiers(data))
  }, [])

  function openCreate() {
    setForm(emptyForm)
    setModalOpen(true)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    await api.post('/admin/lives', { ...form, quartier_id: form.quartier_id || undefined })
    setModalOpen(false)
    load()
  }

  async function demarrer(live: Live) {
    await api.post(`/admin/lives/${live.id}/demarrer`)
    load()
  }

  function openTerminer(live: Live) {
    setReplayModal(live)
    setLienReplay('')
  }

  async function terminer(e: FormEvent) {
    e.preventDefault()
    if (!replayModal) return
    await api.post(`/admin/lives/${replayModal.id}/terminer`, { lien_replay: lienReplay || undefined })
    setReplayModal(null)
    load()
  }

  async function remove(live: Live) {
    if (!confirm(`Supprimer "${live.titre}" ?`)) return
    await api.delete(`/admin/lives/${live.id}`)
    load()
  }

  const filtered = lives.filter((l) => l.titre.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <h1>Lives & diffusion en direct</h1>
      <p className="auth-hint">
        MVP intégration lien externe (YouTube/Facebook Live) — pas encore de service de streaming
        dédié (Mux/Agora), cf. Étape 0 du suivi projet.
      </p>

      <div className="list-toolbar">
        <input
          type="search"
          placeholder="Rechercher un live…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <button type="button" className="btn-new" onClick={openCreate}>
          Nouveau live
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
                <th>Date</th>
                <th>Statut</th>
                <th>Viewers</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((live) => (
                <tr key={live.id}>
                  <td>{live.titre}</td>
                  <td>{live.type === 'maire' ? 'Le maire' : live.quartier?.nom ?? 'Quartier'}</td>
                  <td>{new Date(live.planifie_at).toLocaleString('fr-FR')}</td>
                  <td>
                    <span className={live.statut === 'en_cours' ? 'badge-pill badge-live' : 'badge-pill'}>
                      {statutLabels[live.statut]}
                    </span>
                  </td>
                  <td>{live.viewers_count}</td>
                  <td className="row-actions">
                    {live.statut === 'planifie' && (
                      <button className="btn-link" onClick={() => demarrer(live)}>
                        Démarrer
                      </button>
                    )}
                    {live.statut === 'en_cours' && (
                      <button className="btn-link" onClick={() => openTerminer(live)}>
                        Terminer
                      </button>
                    )}
                    <button className="btn-link btn-danger" onClick={() => remove(live)}>
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6}>Aucun live trouvé.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nouveau live">
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
            Type
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="maire">Le maire</option>
              <option value="quartier">Un quartier</option>
            </select>
          </label>
          {form.type === 'quartier' && (
            <label>
              Quartier
              <select value={form.quartier_id} onChange={(e) => setForm({ ...form, quartier_id: e.target.value })}>
                <option value="">Sélectionner…</option>
                {quartiers.map((q) => (
                  <option key={q.id} value={q.id}>{q.nom}</option>
                ))}
              </select>
            </label>
          )}
          <label>
            Lien du stream (YouTube/Facebook Live)
            <input type="url" value={form.lien_stream} onChange={(e) => setForm({ ...form, lien_stream: e.target.value })} />
          </label>
          <label>
            Date et heure planifiées
            <input
              type="datetime-local"
              required
              value={form.planifie_at}
              onChange={(e) => setForm({ ...form, planifie_at: e.target.value })}
            />
          </label>
          <button type="submit" className="btn-primary">Planifier</button>
        </form>
      </Modal>

      <Modal open={!!replayModal} onClose={() => setReplayModal(null)} title="Terminer le live">
        <form className="card-form" onSubmit={terminer}>
          <p className="auth-hint">
            Le replay (si un lien est fourni) sera automatiquement ajouté à l'espace vidéo.
          </p>
          <label>
            Lien du replay (optionnel)
            <input type="url" value={lienReplay} onChange={(e) => setLienReplay(e.target.value)} />
          </label>
          <button type="submit" className="btn-primary">Terminer le live</button>
        </form>
      </Modal>
    </div>
  )
}
