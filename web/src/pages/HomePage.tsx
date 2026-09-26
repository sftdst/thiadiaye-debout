import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { useLanguage } from '../context/LanguageContext'

interface LiveEnCours {
  id: number
  titre: string
}

interface Presentation {
  description: string | null
  president_nom: string | null
  president_titre: string | null
  president_bio: string | null
  president_photo_url: string | null
  president_cv_url: string | null
}

export function HomePage() {
  const { t } = useLanguage()
  const [totalMembres, setTotalMembres] = useState<number | null>(null)
  const [liveEnCours, setLiveEnCours] = useState<LiveEnCours | null>(null)
  const [presentation, setPresentation] = useState<Presentation | null>(null)

  useEffect(() => {
    api
      .get('/tableau-de-bord')
      .then(({ data }) => setTotalMembres(data.total_membres))
      .catch(() => {})

    api
      .get('/lives')
      .then(({ data }) => setLiveEnCours(data.en_cours[0] ?? null))
      .catch(() => {})

    api
      .get('/presentation-mouvement')
      .then(({ data }) => setPresentation(data))
      .catch(() => {})
  }, [])

  return (
    <>
      <div className="hero">
        <div className="hero-glow" />
        {liveEnCours && (
          <Link to={`/lives/${liveEnCours.id}`} className="live-banner">
            <span className="badge-pill badge-live">EN DIRECT</span>
            {liveEnCours.titre} — Regarder maintenant
          </Link>
        )}
        <img src="/logo.png" alt="Thiadiaye Debout" className="hero-logo" />
        <h1>
          Thiadiaye <span className="hero-accent">Debout</span>
        </h1>
        {t('accueil.bienvenue', '') && (
          <p className="hero-greeting">{t('accueil.bienvenue', '')}</p>
        )}
        <p>
          La plateforme citoyenne du mouvement d'El Hadj Omar Youm : informez-vous, participez,
          mobilisez-vous pour Thiadiaye.
        </p>
        <div className="hero-actions">
          <Link to="/adhesion" className="btn-primary btn-hero">
            {t('accueil.cta_adhesion', 'Adhérer au mouvement')}
          </Link>
          <Link to="/tableau-de-bord" className="btn-hero-ghost">
            Voir le tableau de bord
          </Link>
        </div>
        {totalMembres !== null && (
          <p className="hero-stat">
            <strong>{totalMembres}</strong> membres ont déjà rejoint le mouvement
          </p>
        )}
      </div>

      {presentation?.description && (
        <section className="page-container mouvement-section">
          <span className="mouvement-kicker">Le Mouvement</span>
          <p className="mouvement-text">{presentation.description}</p>
        </section>
      )}

      {presentation?.president_nom && (
        <section className="page-container">
          <div className="president-feature">
            <div className="president-feature-photo">
              <span className="president-dots" aria-hidden="true" />
              {presentation.president_photo_url && (
                <img
                  src={presentation.president_photo_url}
                  alt={presentation.president_nom}
                  className="president-photo-rect"
                />
              )}
            </div>
            <div className="president-feature-content">
              <div className="president-tag">
                <span className="president-tag-title">Le Mot du Président</span>
                <span className="president-tag-name">{presentation.president_nom}</span>
              </div>
              {presentation.president_titre && (
                <p className="president-titre">{presentation.president_titre}</p>
              )}
              {presentation.president_bio && (
                <p className="president-bio-text">{presentation.president_bio}</p>
              )}
              {presentation.president_cv_url && (
                <a
                  href={presentation.president_cv_url}
                  target="_blank"
                  rel="noreferrer"
                  className="president-cv-link"
                >
                  📄 Lire la biographie complète (PDF)
                </a>
              )}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
