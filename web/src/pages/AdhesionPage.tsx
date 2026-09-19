import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import { WebcamPhotoInput } from '../components/WebcamPhotoInput'

interface Quartier {
  id: number
  nom: string
  couleur: string
}

interface MembreResult {
  numero_carte: string
  nom: string
}

const initialForm = {
  nom: '',
  telephone: '',
  password: '',
  quartier_id: '',
  langue_preferee: 'fr',
  cni_numero: '',
}

export function AdhesionPage() {
  const [searchParams] = useSearchParams()
  const codeParrain = searchParams.get('parrain')
  const [quartiers, setQuartiers] = useState<Quartier[]>([])
  const [form, setForm] = useState(initialForm)
  const [photoProfil, setPhotoProfil] = useState<File | null>(null)
  const [cniRecto, setCniRecto] = useState<File | null>(null)
  const [cniVerso, setCniVerso] = useState<File | null>(null)
  const [consentement, setConsentement] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [membre, setMembre] = useState<MembreResult | null>(null)

  useEffect(() => {
    api.get('/quartiers').then(({ data }) => setQuartiers(data))
  }, [])

  function pickFile(setter: (file: File | null) => void) {
    return (e: ChangeEvent<HTMLInputElement>) => setter(e.target.files?.[0] ?? null)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const payload = new FormData()
      payload.append('nom', form.nom)
      payload.append('telephone', form.telephone)
      if (form.password) payload.append('password', form.password)
      payload.append('quartier_id', form.quartier_id)
      payload.append('langue_preferee', form.langue_preferee)
      payload.append('cni_numero', form.cni_numero)
      payload.append('consentement_donnees', consentement ? '1' : '0')
      if (codeParrain) payload.append('code_parrain', codeParrain)
      if (photoProfil) payload.append('photo_profil', photoProfil)
      if (cniRecto) payload.append('cni_recto', cniRecto)
      if (cniVerso) payload.append('cni_verso', cniVerso)

      const { data } = await api.post('/adhesion', payload)
      setMembre(data.membre)
    } catch (err: unknown) {
      const response = (err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })
        ?.response
      const firstFieldError = response?.data?.errors ? Object.values(response.data.errors)[0]?.[0] : undefined
      setError(firstFieldError ?? response?.data?.message ?? 'Une erreur est survenue. Vérifiez vos informations.')
    } finally {
      setSubmitting(false)
    }
  }

  if (membre) {
    return (
      <div className="adhesion-success">
        <h1>Merci, {membre.nom.split(' ')[0]} !</h1>
        <div className="adhesion-pending-card">
          <span className="badge-pill badge-pending">En attente de validation</span>
          <p>
            Votre demande d'adhésion a bien été reçue sous le numéro <strong>{membre.numero_carte}</strong>.
          </p>
          <p>
            Un administrateur va vérifier votre pièce d'identité avant de valider votre compte. Vous pourrez vous
            connecter à votre espace personnel dès que votre adhésion sera approuvée.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="adhesion-page">
      <h1>Adhérer au mouvement</h1>
      {codeParrain && <p className="auth-hint">Invitation d'un ambassadeur ({codeParrain})</p>}
      <form className="adhesion-form" onSubmit={handleSubmit}>
        <label>
          Nom complet
          <input
            type="text"
            required
            value={form.nom}
            onChange={(e) => setForm({ ...form, nom: e.target.value })}
          />
        </label>

        <label>
          Téléphone
          <input
            type="tel"
            required
            placeholder="77 000 00 00"
            value={form.telephone}
            onChange={(e) => setForm({ ...form, telephone: e.target.value })}
          />
        </label>

        <label>
          Mot de passe (optionnel — pour accéder à votre espace personnel)
          <input
            type="password"
            minLength={6}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </label>

        <label>
          Quartier
          <select
            required
            value={form.quartier_id}
            onChange={(e) => setForm({ ...form, quartier_id: e.target.value })}
          >
            <option value="" disabled>
              Sélectionnez votre quartier
            </option>
            {quartiers.map((q) => (
              <option key={q.id} value={q.id}>
                {q.nom}
              </option>
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

        <label>
          Photo de profil
          <WebcamPhotoInput value={photoProfil} onChange={setPhotoProfil} />
        </label>

        <label>
          Numéro de la CNI
          <input
            type="text"
            required
            placeholder="Numéro de votre carte nationale d'identité"
            value={form.cni_numero}
            onChange={(e) => setForm({ ...form, cni_numero: e.target.value })}
          />
        </label>

        <label>
          Photo de la CNI — recto
          <input type="file" accept="image/*" required onChange={pickFile(setCniRecto)} />
        </label>

        <label>
          Photo de la CNI — verso
          <input type="file" accept="image/*" required onChange={pickFile(setCniVerso)} />
        </label>

        <p className="adhesion-cni-hint">
          Ces informations servent uniquement à vérifier votre identité avant de valider votre adhésion. Votre
          compte restera en attente tant qu'un administrateur ne l'aura pas approuvé.
        </p>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={consentement}
            onChange={(e) => setConsentement(e.target.checked)}
            required
          />
          J'accepte que mes données (téléphone, quartier, pièce d'identité) soient utilisées dans le cadre de mon
          adhésion au mouvement, conformément à la politique de confidentialité.
        </label>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Envoi…' : "Confirmer l'adhésion"}
        </button>
      </form>
    </div>
  )
}
