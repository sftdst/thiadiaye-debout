const BADGE_COLORS: Record<string, { bg: string; fg: string }> = {
  'Nouveau membre': { bg: '#0ECEF7', fg: '#02323d' },
  'Actif': { bg: '#027EED', fg: '#ffffff' },
  'Ambassadeur': { bg: '#F7B506', fg: '#3a2900' },
  'Pilier de Thiadiaye': { bg: '#0246B0', fg: '#ffffff' },
}

const FALLBACK = { bg: '#fff3d6', fg: '#7a5200' }

export function getBadgeColor(nom: string) {
  return BADGE_COLORS[nom] ?? FALLBACK
}
