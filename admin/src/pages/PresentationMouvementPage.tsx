import { useEffect, useState, type FormEvent } from 'react'
import { api } from '../api/client'

interface Presentation {
  id: number
  description: string | null
  president_nom: string | null
  president_titre: string | null
  president_bio: string | null
  president_photo_url: string | null
}

const emptyForm = { description: '', president_nom: '', president_titre: '', president_bio: '' }

export function PresentationMouvementPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    api
      .get<Presentation>('/presentation-mouvement')
      .then(({ data }) => {
        setForm({
          description: data.description ?? '',
          president_nom: data.president_nom ?? '',
          president_titre: data.president_titre ?? '',
          president_bio: data.president_bio ?? '',
        })
        setPhotoUrl(data.president_photo_url)
      })
      .finally(() => setLoading(false))
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setSaving(true)
    try {
      const payload = new FormData()
      payload.append('description', form.description)
      payload.append('president_nom', form.president_nom)
      payload.append('president_titre', form.president_titre)
      payload.append('president_bio', form.president_bio)
      if (photoFile) {
        payload.append('photo', photoFile)
      }
      const { data } = await api.post<Presentation>('/admin/presentation-mouvement', payload)
      setPhotoUrl(data.president_photo_url)
      setPhotoFile(null)
      setSuccess(true)
    } catch {
      setError("Impossible d'enregistrer la présentation du mouvement.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p>Chargement…</p>

  return (
    <div>
      <h1>Présentation du mouvement</h1>
      <p>Ce contenu est affiché sur la page d'accueil du site public.</p>

      <form className="card-form" onSubmit={handleSubmit}>
        <label>
          Description du mouvement
          <textarea
            rows={5}
            required
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </label>

        <label>
          Nom du président
          <input
            type="text"
            required
            value={form.president_nom}
            onChange={(e) => setForm({ ...form, president_nom: e.target.value })}
          />
        </label>

        <label>
          Titre / fonction
          <input
            type="text"
            placeholder="Ex. Président du mouvement"
            value={form.president_titre}
            onChange={(e) => setForm({ ...form, president_titre: e.target.value })}
          />
        </label>

        <label>
          Biographie du président
          <textarea
            rows={5}
            required
            value={form.president_bio}
            onChange={(e) => setForm({ ...form, president_bio: e.target.value })}
          />
        </label>

        <label>
          Photo du président
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
          />
        </label>

        {(photoFile || photoUrl) && (
          <img
            src={photoFile ? URL.createObjectURL(photoFile) : (photoUrl as string)}
            alt="Aperçu du président"
            className="photo-upload-preview"
          />
        )}

        {error && <p className="form-error">{error}</p>}
        {success && <p className="form-success">Présentation enregistrée.</p>}

        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </form>
    </div>
  )
}
