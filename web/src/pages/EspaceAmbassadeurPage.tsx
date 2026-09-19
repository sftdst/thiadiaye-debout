import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { PageHeader } from '../components/PageHeader'
import { useMembreAuth } from '../context/MembreAuthContext'

interface EspaceAmbassadeur {
  recrutements_count: number
  filleuls: { id: number; nom: string; date_adhesion: string }[]
  classement: { id: number; nom: string; filleuls_count: number }[]
  contenu_formation: { id: number; titre: string; contenu: string | null; url: string | null }[]
  prochaine_reunion: { titre: string; debut_at: string; lien_reunion: string | null } | null
  lien_groupe_whatsapp: string | null
  lien_parrainage: string
}

export function EspaceAmbassadeurPage() {
  const { membre, loading: authLoading } = useMembreAuth()
  const [espace, setEspace] = useState<EspaceAmbassadeur | null>(null)
  const [loading, setLoading] = useState(true)
  const [erreurAcces, setErreurAcces] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!membre) {
      setLoading(false)
      return
    }
    api
      .get('/ambassadeur/espace')
      .then(({ data }) => setEspace(data))
      .catch(() => setErreurAcces(true))
      .finally(() => setLoading(false))
  }, [membre, authLoading])

  if (authLoading || loading) {
    return (
      <>
        <PageHeader title="Espace ambassadeur" />
        <div className="page-container">
          <p>Chargement…</p>
        </div>
      </>
    )
  }

  if (!membre) {
    return (
      <>
        <PageHeader title="Espace ambassadeur" />
        <div className="page-container">
          <p className="auth-hint">
            <Link to="/connexion">Connectez-vous</Link> pour accéder à votre espace ambassadeur.
          </p>
        </div>
      </>
    )
  }

  if (erreurAcces || !espace) {
    return (
      <>
        <PageHeader title="Espace ambassadeur" />
        <div className="page-container">
          <p>Cet espace est réservé aux ambassadeurs du mouvement.</p>
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="Espace ambassadeur"
        subtitle="Vos recrutements, votre classement et vos ressources de formation."
      />
      <div className="page-container">
        <div className="split-layout">
          <div>
            <div className="card">
              <h2 style={{ margin: 0 }}>{espace.recrutements_count} recrutement(s)</h2>
              <p className="auth-hint">
                Votre lien de parrainage : <code>{espace.lien_parrainage}</code>
              </p>
            </div>

            {espace.prochaine_reunion && (
              <div className="card">
                <span className="badge-pill">Réunion mensuelle</span>
                <h3>{espace.prochaine_reunion.titre}</h3>
                <p>{new Date(espace.prochaine_reunion.debut_at).toLocaleString('fr-FR')}</p>
                {espace.prochaine_reunion.lien_reunion && (
                  <a href={espace.prochaine_reunion.lien_reunion} target="_blank" rel="noreferrer">
                    Rejoindre
                  </a>
                )}
              </div>
            )}

            {espace.lien_groupe_whatsapp && (
              <p>
                <a href={espace.lien_groupe_whatsapp} target="_blank" rel="noreferrer" className="btn-primary">
                  Rejoindre le groupe WhatsApp
                </a>
              </p>
            )}

            {espace.contenu_formation.length > 0 && (
              <>
                <h2>Formation</h2>
                <div className="card-grid">
                  {espace.contenu_formation.map((f) => (
                    <div key={f.id} className="card">
                      <h3>{f.titre}</h3>
                      {f.contenu && <p>{f.contenu}</p>}
                      {f.url && (
                        <a href={f.url} target="_blank" rel="noreferrer">
                          Voir la ressource
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div>
            <h2>Classement des ambassadeurs</h2>
            <ol className="ranking-list">
              {espace.classement.map((a) => (
                <li key={a.id}>
                  <span className="ranking-name">{a.nom}</span>
                  <span className="ranking-count">{a.filleuls_count} recrutement(s)</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </>
  )
}
