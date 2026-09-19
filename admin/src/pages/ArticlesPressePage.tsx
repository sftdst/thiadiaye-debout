import { useEffect, useState, type FormEvent } from 'react'
import { api } from '../api/client'
import { Modal } from '../components/Modal'

interface ArticlePresse {
  id: number
  titre: string
  source: string
  lien: string
  image_url: string | null
  date_publication: string | null
}

const emptyForm = {
  titre: '',
  source: '',
  lien: '',
  image_url: '',
  date_publication: '',
}

export function ArticlesPressePage() {
  const [articles, setArticles] = useState<ArticlePresse[]>([])
  const [search, setSearch] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  function load() {
    setLoading(true)
    api
      .get('/articles-presse')
      .then(({ data }) => setArticles(data))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setError(null)
    setModalOpen(true)
  }

  function openEdit(a: ArticlePresse) {
    setEditingId(a.id)
    setForm({
      titre: a.titre,
      source: a.source,
      lien: a.lien,
      image_url: a.image_url ?? '',
      date_publication: a.date_publication ? a.date_publication.slice(0, 10) : '',
    })
    setError(null)
    setModalOpen(true)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      if (editingId) {
        await api.put(`/admin/articles-presse/${editingId}`, form)
      } else {
        await api.post('/admin/articles-presse', form)
      }
      setModalOpen(false)
      load()
    } catch {
      setError("Impossible d'enregistrer cet article (vérifie les liens saisis).")
    }
  }

  async function remove(article: ArticlePresse) {
    if (!confirm(`Supprimer l'article "${article.titre}" ?`)) return
    await api.delete(`/admin/articles-presse/${article.id}`)
    load()
  }

  const filtered = articles.filter((a) => a.titre.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <h1>Revue de presse</h1>

      <div className="list-toolbar">
        <input
          type="search"
          placeholder="Rechercher un article…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <button type="button" className="btn-new" onClick={openCreate}>
          Nouvel article
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
                <th>Source</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id}>
                  <td>{a.titre}</td>
                  <td>{a.source}</td>
                  <td>{a.date_publication ? a.date_publication.slice(0, 10) : '—'}</td>
                  <td className="row-actions">
                    <button className="btn-link" onClick={() => openEdit(a)}>
                      Modifier
                    </button>
                    <button className="btn-link btn-danger" onClick={() => remove(a)}>
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4}>Aucun article trouvé.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Modifier l'article" : 'Nouvel article de presse'}
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
            Source (ex. Le Soleil, APS…)
            <input
              type="text"
              required
              value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value })}
            />
          </label>
          <label>
            Lien de l'article
            <input
              type="url"
              required
              placeholder="https://…"
              value={form.lien}
              onChange={(e) => setForm({ ...form, lien: e.target.value })}
            />
          </label>
          <label>
            Image (URL, optionnel)
            <input
              type="url"
              placeholder="https://…"
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            />
          </label>
          <label>
            Date de publication
            <input
              type="date"
              value={form.date_publication}
              onChange={(e) => setForm({ ...form, date_publication: e.target.value })}
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn-primary">
            {editingId ? 'Mettre à jour' : "Ajouter l'article"}
          </button>
        </form>
      </Modal>
    </div>
  )
}
