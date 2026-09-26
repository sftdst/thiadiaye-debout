import { useState, type ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <div className="layout">
      <header className="mobile-topbar">
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={() => setMenuOpen(true)}
          aria-label="Ouvrir le menu"
        >
          ☰
        </button>
        <div className="sidebar-brand">
          <img src="/logo.png" alt="Thiadiaye Debout" className="sidebar-logo" />
          <span>Thiadiaye Debout</span>
        </div>
      </header>

      {menuOpen && <div className="sidebar-overlay" onClick={closeMenu} />}

      <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand sidebar-brand-desktop">
          <img src="/logo.png" alt="Thiadiaye Debout" className="sidebar-logo" />
          <span>Thiadiaye Debout</span>
        </div>
        <nav className="sidebar-nav" onClick={closeMenu}>
          <NavLink to="/" end>
            Tableau de bord
          </NavLink>
          <NavLink to="/membres">Membres</NavLink>
          <NavLink to="/quartiers">Quartiers</NavLink>

          <div className="sidebar-section">Contenu</div>
          <NavLink to="/presentation">Présentation du mouvement</NavLink>
          <NavLink to="/publications">Journal</NavLink>
          <NavLink to="/realisations">Réalisations</NavLink>
          <NavLink to="/articles-presse">Revue de presse</NavLink>
          <NavLink to="/videos">Vidéos</NavLink>
          <NavLink to="/lives">Lives</NavLink>
          <NavLink to="/memoire">Mémoire (Images & témoignages)</NavLink>

          <div className="sidebar-section">Participation</div>
          <NavLink to="/sondages">Sondages</NavLink>
          <NavLink to="/idees">Idées</NavLink>
          <NavLink to="/defis">Défis</NavLink>

          <div className="sidebar-section">Mobilisation</div>
          <NavLink to="/evenements">Agenda</NavLink>
          <NavLink to="/ambassadeurs">Ambassadeurs</NavLink>
          <NavLink to="/traductions">Multilingue</NavLink>
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <strong>{user?.name}</strong>
            <span>{user?.role}</span>
          </div>
          <button onClick={handleLogout} className="btn-secondary">
            Déconnexion
          </button>
        </div>
      </aside>
      <main className="content">{children}</main>
    </div>
  )
}
