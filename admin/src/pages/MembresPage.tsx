import { useEffect, useState, type FormEvent } from 'react'
import { api } from '../api/client'
import { Modal } from '../components/Modal'
import { MembreCardPreview } from '../components/MembreCardPreview'
import { getBadgeColor } from '../utils/badgeColors'

interface Quartier {
  id: number
  nom: string
}

interface Membre {
  id: number
  numero_carte: string
  nom: string
  telephone: string
  role: string
  statut: 'en_attente' | 'approuve' | 'rejete'
  photo_profil_url: string | null
  cni_numero: string | null
  cni_recto_url: string | null
  cni_verso_url: string | null
  date_adhesion: string
  quartier: { id: number; nom: string; couleur: string }
  badges: { id: number; nom: string }[]
}

interface PaginatedResponse {
  data: Membre[]
  current_page: number
  last_page: number
  total: number
}

const emptyForm = { nom: '', telephone: '', password: '', quartier_id: '', langue_preferee: 'fr' }

const statutLabels: Record<Membre['statut'], string> = {
  en_attente: 'En attente',
  approuve: 'Approuvé',
  rejete: 'Rejeté',
}

const statutColors: Record<Membre['statut'], { bg: string; fg: string }> = {
  en_attente: { bg: '#fff3d6', fg: '#7a5200' },
  approuve: { bg: '#dcfce7', fg: '#166534' },
  rejete: { bg: '#fee2e2', fg: '#991b1b' },
}

export function MembresPage() {
  const [result, setResult] = useState<PaginatedResponse | null>(null)
  const [quartiers, setQuartiers] = useState<Quartier[]>([])
  const [search, setSearch] = useState('')
  const [statutFiltre, setStatutFiltre] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const [editingId, setEditingId] = useState<number | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState<string | null>(null)

  const [carteMembre, setCarteMembre] = useState<Membre | null>(null)
  const [reviewMembre, setReviewMembre] = useState<Membre | null>(null)
  const [reviewBusy, setReviewBusy] = useState(false)

  function load() {
    setLoading(true)
    api
      .get('/admin/membres', { params: { search: search || undefined, statut: statutFiltre || undefined, page } })
      .then(({ data }) => setResult(data))
      .finally(() => setLoading(false))
  }

  useEffect(load, [search, statutFiltre, page])
  useEffect(() => {
    api.get('/admin/quartiers').then(({ data }) => setQuartiers(data))
  }, [])

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setError(null)
    setModalOpen(true)
  }

  function openEdit(m: Membre) {
    setEditingId(m.id)
    setForm({
      nom: m.nom,
      telephone: m.telephone,
      password: '',
      quartier_id: String(m.quartier.id),
      langue_preferee: 'fr',
    })
    setError(null)
    setModalOpen(true)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      if (editingId) {
        await api.put(`/admin/membres/${editingId}`, {
          nom: form.nom,
          telephone: form.telephone,
          quartier_id: form.quartier_id,
          langue_preferee: form.langue_preferee,
        })
      } else {
        await api.post('/admin/membres', {
          ...form,
          password: form.password || undefined,
        })
      }
      setModalOpen(false)
      load()
    } catch {
      setError(
        editingId
          ? 'Impossible de mettre à jour ce membre (téléphone déjà utilisé ?).'
          : 'Impossible de créer ce membre (téléphone déjà utilisé ?).',
      )
    }
  }

  async function setStatut(membre: Membre, statut: Membre['statut']) {
    setReviewBusy(true)
    try {
      await api.patch(`/admin/membres/${membre.id}/statut`, { statut })
      setReviewMembre(null)
      load()
    } finally {
      setReviewBusy(false)
    }
  }

  return (
    <div>
      <h1>Membres</h1>

      <div className="filter-tabs">
        <button className={statutFiltre === '' ? 'active' : ''} onClick={() => { setPage(1); setStatutFiltre('') }}>
          Tous
        </button>
        <button className={statutFiltre === 'en_attente' ? 'active' : ''} onClick={() => { setPage(1); setStatutFiltre('en_attente') }}>
          En attente
        </button>
        <button className={statutFiltre === 'approuve' ? 'active' : ''} onClick={() => { setPage(1); setStatutFiltre('approuve') }}>
          Approuvés
        </button>
        <button className={statutFiltre === 'rejete' ? 'active' : ''} onClick={() => { setPage(1); setStatutFiltre('rejete') }}>
          Rejetés
        </button>
      </div>

      <div className="list-toolbar">
        <input
          type="search"
          placeholder="Rechercher par nom, téléphone, numéro de carte…"
          value={search}
          onChange={(e) => {
            setPage(1)
            setSearch(e.target.value)
          }}
          className="search-input"
        />
        <button type="button" className="btn-new" onClick={openCreate}>
          Nouveau membre
        </button>
      </div>

      {loading ? (
        <p>Chargement…</p>
      ) : (
        <>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Carte</th>
                  <th>Nom</th>
                  <th>Téléphone</th>
                  <th>Quartier</th>
                  <th>Statut</th>
                  <th>Rôle</th>
                  <th>Badges</th>
                  <th>Adhésion</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {result?.data.map((m) => (
                  <tr key={m.id}>
                    <td>{m.numero_carte}</td>
                    <td>{m.nom}</td>
                    <td>{m.telephone}</td>
                    <td>
                      <span className="color-dot" style={{ background: m.quartier.couleur }} />
                      {m.quartier.nom}
                    </td>
                    <td>
                      <span
                        className="badge-pill"
                        style={{ background: statutColors[m.statut].bg, color: statutColors[m.statut].fg }}
                      >
                        {statutLabels[m.statut]}
                      </span>
                    </td>
                    <td>{m.role}</td>
                    <td>
                      <div className="badge-stack">
                        {m.badges.map((b) => {
                          const c = getBadgeColor(b.nom)
                          return (
                            <span
                              key={b.id}
                              className="badge-pill"
                              style={{ background: c.bg, color: c.fg }}
                            >
                              {b.nom}
                            </span>
                          )
                        })}
                      </div>
                    </td>
                    <td>{new Date(m.date_adhesion).toLocaleDateString('fr-FR')}</td>
                    <td className="row-actions">
                      {m.statut === 'en_attente' && (
                        <button className="btn-link" onClick={() => setReviewMembre(m)}>
                          Vérifier
                        </button>
                      )}
                      <button className="btn-link" onClick={() => openEdit(m)}>
                        Modifier
                      </button>
                      <button className="btn-link" onClick={() => setCarteMembre(m)}>
                        Carte
                      </button>
                    </td>
                  </tr>
                ))}
                {result?.data.length === 0 && (
                  <tr>
                    <td colSpan={9}>Aucun membre trouvé.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {result && result.last_page > 1 && (
            <div className="pagination">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="btn-secondary"
              >
                Précédent
              </button>
              <span>
                Page {result.current_page} / {result.last_page}
              </span>
              <button
                disabled={page >= result.last_page}
                onClick={() => setPage((p) => p + 1)}
                className="btn-secondary"
              >
                Suivant
              </button>
            </div>
          )}
        </>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Modifier le membre' : 'Nouveau membre'}
      >
        <form className="card-form" onSubmit={handleSubmit}>
          <label>
            Nom complet
            <input type="text" required value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
          </label>
          <label>
            Téléphone
            <input
              type="tel"
              required
              value={form.telephone}
              onChange={(e) => setForm({ ...form, telephone: e.target.value })}
            />
          </label>
          {!editingId && (
            <label>
              Mot de passe (optionnel — espace personnel)
              <input
                type="password"
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </label>
          )}
          <label>
            Quartier
            <select
              required
              value={form.quartier_id}
              onChange={(e) => setForm({ ...form, quartier_id: e.target.value })}
            >
              <option value="" disabled>Sélectionner…</option>
              {quartiers.map((q) => (
                <option key={q.id} value={q.id}>{q.nom}</option>
              ))}
            </select>
          </label>
          <label>
            Langue préférée
            <select
              value={form.langue_preferee}
              onChange={(e) => setForm({ ...form, langue_preferee: e.target.value })}
            >
              <option value="fr">Français</option>
              <option value="wo">Wolof</option>
              <option value="srr">Sérère</option>
            </select>
          </label>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn-primary">
            {editingId ? 'Mettre à jour' : 'Créer le membre'}
          </button>
        </form>
      </Modal>

      <Modal open={!!carteMembre} onClose={() => setCarteMembre(null)} title="Carte de membre">
        {carteMembre && (
          <MembreCardPreview
            numeroCarte={carteMembre.numero_carte}
            nom={carteMembre.nom}
            quartier={carteMembre.quartier}
            dateAdhesion={carteMembre.date_adhesion}
            badge={carteMembre.badges[0]?.nom}
          />
        )}
      </Modal>

      <Modal open={!!reviewMembre} onClose={() => setReviewMembre(null)} title="Vérifier l'adhésion">
        {reviewMembre && (
          <div className="membre-review">
            <div className="membre-review-header">
              {reviewMembre.photo_profil_url && (
                <img src={reviewMembre.photo_profil_url} alt={reviewMembre.nom} className="membre-review-photo" />
              )}
              <div>
                <h3>{reviewMembre.nom}</h3>
                <p>{reviewMembre.telephone} — {reviewMembre.quartier.nom}</p>
                <p>CNI : <strong>{reviewMembre.cni_numero}</strong></p>
              </div>
            </div>

            <div className="membre-review-cni">
              {reviewMembre.cni_recto_url && (
                <div>
                  <span>Recto</span>
                  <img src={reviewMembre.cni_recto_url} alt="CNI recto" />
                </div>
              )}
              {reviewMembre.cni_verso_url && (
                <div>
                  <span>Verso</span>
                  <img src={reviewMembre.cni_verso_url} alt="CNI verso" />
                </div>
              )}
            </div>

            <div className="membre-review-actions">
              <button
                type="button"
                className="btn-primary"
                disabled={reviewBusy}
                onClick={() => setStatut(reviewMembre, 'approuve')}
              >
                Approuver
              </button>
              <button
                type="button"
                className="btn-danger-solid"
                disabled={reviewBusy}
                onClick={() => setStatut(reviewMembre, 'rejete')}
              >
                Rejeter
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
