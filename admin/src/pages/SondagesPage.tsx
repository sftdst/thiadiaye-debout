import { useEffect, useState, type FormEvent } from 'react'
import { api } from '../api/client'
import { Modal } from '../components/Modal'

interface OptionSondage {
  id: number
  texte: string
  votes_count: number
}

interface Sondage {
  id: number
  question: string
  actif: boolean
  votes_count: number
  options: OptionSondage[]
}

const emptyForm = { question: '', options: ['', ''] }

export function SondagesPage() {
  const [sondages, setSondages] = useState<Sondage[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState<string | null>(null)

  function load() {
    setLoading(true)
    api
      .get('/admin/sondages')
      .then(({ data }) => setSondages(data))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setError(null)
    setModalOpen(true)
  }

  function openEdit(sondage: Sondage) {
    setEditingId(sondage.id)
    setForm({ question: sondage.question, options: sondage.options.map((o) => o.texte) })
    setError(null)
    setModalOpen(true)
  }

  function updateOption(index: number, value: string) {
    setForm((prev) => ({ ...prev, options: prev.options.map((o, i) => (i === index ? value : o)) }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      if (editingId) {
        await api.put(`/admin/sondages/${editingId}`, { question: form.question })
      } else {
        await api.post('/admin/sondages', {
          question: form.question,
          options: form.options.filter((o) => o.trim() !== ''),
        })
      }
      setModalOpen(false)
      load()
    } catch {
      setError('Impossible d\'enregistrer ce sondage (au moins 2 options requises).')
    }
  }

  async function toggleActif(sondage: Sondage) {
    await api.put(`/admin/sondages/${sondage.id}`, { actif: !sondage.actif })
    load()
  }

  async function remove(sondage: Sondage) {
    if (!confirm(`Supprimer le sondage "${sondage.question}" ?`)) return
    await api.delete(`/admin/sondages/${sondage.id}`)
    load()
  }

  const filtered = sondages.filter((s) => s.question.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <h1>Sondages</h1>

      <div className="list-toolbar">
        <input
          type="search"
          placeholder="Rechercher un sondage…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <button type="button" className="btn-new" onClick={openCreate}>
          Nouveau sondage
        </button>
      </div>

      {loading ? (
        <p>Chargement…</p>
      ) : (
        filtered.map((sondage) => (
          <div key={sondage.id} className="result-card">
            <div className="row-actions" style={{ justifyContent: 'space-between' }}>
              <h3>
                {sondage.question} {!sondage.actif && <span className="badge-pill">Clôturé</span>}
              </h3>
              <div className="row-actions">
                <button className="btn-link" onClick={() => openEdit(sondage)}>
                  Modifier
                </button>
                <button className="btn-link" onClick={() => toggleActif(sondage)}>
                  {sondage.actif ? 'Clôturer' : 'Réactiver'}
                </button>
                <button className="btn-link btn-danger" onClick={() => remove(sondage)}>
                  Supprimer
                </button>
              </div>
            </div>
            {sondage.options.map((option) => (
              <div key={option.id} className="poll-option-row">
                <span>{option.texte}</span>
                <span>{option.votes_count} vote(s)</span>
              </div>
            ))}
          </div>
        ))
      )}
      {!loading && filtered.length === 0 && <p>Aucun sondage trouvé.</p>}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Modifier le sondage' : 'Nouveau sondage'}>
        <form className="card-form" onSubmit={handleSubmit}>
          <label>
            Question
            <input
              type="text"
              required
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
            />
          </label>
          {editingId ? (
            <p className="auth-hint">
              Les options ne peuvent plus être modifiées une fois le sondage créé (des votes peuvent déjà y être liés).
            </p>
          ) : (
            <>
              {form.options.map((option, i) => (
                <label key={i}>
                  Option {i + 1}
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(i, e.target.value)}
                    required={i < 2}
                  />
                </label>
              ))}
              <button
                type="button"
                className="btn-link"
                onClick={() => setForm((prev) => ({ ...prev, options: [...prev.options, ''] }))}
              >
                + Ajouter une option
              </button>
            </>
          )}
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn-primary">
            {editingId ? 'Mettre à jour' : 'Créer le sondage'}
          </button>
        </form>
      </Modal>
    </div>
  )
}
