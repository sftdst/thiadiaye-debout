import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useMembreAuth } from '../context/MembreAuthContext'

interface SimpleLink {
  to: string
  label: string
}

interface GroupLink {
  label: string
  group: SimpleLink[]
}

const links: (SimpleLink | GroupLink)[] = [
  { to: '/', label: 'Accueil' },
  { to: '/carte', label: 'Carte' },
  {
    label: 'Galerie',
    group: [
      { to: '/lives', label: 'Live' },
      { to: '/videos', label: 'Vidéos' },
      { to: '/images', label: 'Image' },
    ],
  },
  {
    label: 'Actualité',
    group: [
      { to: '/journal', label: 'Journal' },
      { to: '/sondages', label: 'Sondages' },
      { to: '/idees', label: 'Idées' },
      { to: '/revue-presse', label: 'Revue de presse' },
    ],
  },
  { to: '/agenda', label: 'Agenda' },
  { to: '/classement', label: 'Classement' },
  { to: '/memoire', label: 'Mémoire' },
  { to: '/tableau-de-bord', label: 'Tableau de bord' },
]

export function NavBar() {
  const { membre, logout } = useMembreAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [openGroup, setOpenGroup] = useState<string | null>(null)

  function handleLogout() {
    logout()
    setMenuOpen(false)
    navigate('/')
  }

  function closeMenu() {
    setMenuOpen(false)
    setOpenGroup(null)
  }

  useEffect(() => {
    if (!openGroup) return
    function handleClickOutside(e: MouseEvent) {
      if (!(e.target as HTMLElement).closest('.navbar-dropdown')) {
        setOpenGroup(null)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [openGroup])

  return (
    <nav className="navbar">
      <div className="navbar-top">
        <NavLink to="/" end className="navbar-brand" onClick={closeMenu}>
          <img src="/logo.png" alt="Thiadiaye Debout" className="navbar-logo" />
          <span>Thiadiaye Debout</span>
        </NavLink>
        <div className="navbar-tools">
          <Link to="/adhesion" className="navbar-adhesion" onClick={closeMenu}>
            Adhérer au mouvement
          </Link>
          <button
            type="button"
            className="navbar-toggle"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Ouvrir le menu"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      <div className={`navbar-links ${menuOpen ? 'navbar-links-open' : ''}`}>
        {links.map((item) =>
          'group' in item ? (
            <div
              key={item.label}
              className={`navbar-dropdown ${openGroup === item.label ? 'open' : ''}`}
            >
              <button
                type="button"
                className={`navbar-dropdown-toggle ${
                  item.group.some((sub) => location.pathname.startsWith(sub.to)) ? 'nav-link-active' : ''
                }`}
                onClick={() => setOpenGroup(openGroup === item.label ? null : item.label)}
              >
                {item.label} <span className="caret">▾</span>
              </button>
              <div className="navbar-dropdown-menu">
                {item.group.map((sub) => (
                  <NavLink
                    key={sub.to}
                    to={sub.to}
                    onClick={closeMenu}
                    className={({ isActive }) => (isActive ? 'nav-link-active' : '')}
                  >
                    {sub.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={closeMenu}
              className={({ isActive }) => (isActive ? 'nav-link-active' : '')}
            >
              {item.label}
            </NavLink>
          ),
        )}
        {membre?.role === 'ambassadeur' && (
          <NavLink
            to="/ambassadeur"
            onClick={closeMenu}
            className={({ isActive }) => (isActive ? 'nav-link-active' : '')}
          >
            Espace ambassadeur
          </NavLink>
        )}

        <div className="navbar-divider" />

        {membre ? (
          <div className="navbar-account">
            <span className="navbar-user">{membre.nom}</span>
            <button className="btn-link" onClick={handleLogout}>
              Déconnexion
            </button>
          </div>
        ) : (
          <NavLink
            to="/connexion"
            onClick={closeMenu}
            className={({ isActive }) => `navbar-cta ${isActive ? 'nav-link-active' : ''}`}
          >
            Connexion
          </NavLink>
        )}
      </div>
    </nav>
  )
}
