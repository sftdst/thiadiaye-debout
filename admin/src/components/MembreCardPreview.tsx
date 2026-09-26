import { QRCodeSVG } from 'qrcode.react'
import { getBadgeColor } from '../utils/badgeColors'

interface MembreCardPreviewProps {
  numeroCarte: string
  nom: string
  quartier: { nom: string; couleur: string }
  dateAdhesion: string
  badge?: string
}

export function MembreCardPreview({ numeroCarte, nom, quartier, dateAdhesion, badge }: MembreCardPreviewProps) {
  return (
    <div className="membre-card-print">
      <div className="membre-card-visual">
        <div className="membre-card-visual-header">
          <div className="membre-card-visual-brand-group">
            <img src="/logo.png" alt="" className="membre-card-visual-logo" />
            <span className="membre-card-visual-brand">Thiadiaye Debout</span>
          </div>
          {badge && (
            <span
              className="membre-card-visual-badge"
              style={{ background: getBadgeColor(badge).bg, color: getBadgeColor(badge).fg }}
            >
              {badge}
            </span>
          )}
        </div>
        <p className="membre-card-visual-nom">{nom}</p>
        <p className="membre-card-visual-quartier">
          <span className="color-dot" style={{ background: quartier.couleur }} />
          {quartier.nom}
        </p>
        <div className="membre-card-visual-footer">
          <div>
            <p className="membre-card-visual-numero">{numeroCarte}</p>
            <p className="membre-card-visual-date">
              Membre depuis le {new Date(dateAdhesion).toLocaleDateString('fr-FR')}
            </p>
          </div>
          <div className="membre-card-visual-qr">
            <QRCodeSVG value={numeroCarte} size={64} />
          </div>
        </div>
      </div>
      <button type="button" className="btn-primary" onClick={() => window.print()}>
        Imprimer la carte
      </button>
    </div>
  )
}
