import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div>
          <div className="site-footer-brand">
            <img src="/logo.png" alt="Thiadiaye Debout" />
            <span>Thiadiaye Debout</span>
          </div>
          <p>
            La plateforme citoyenne du mouvement d'El Hadj Omar Youm pour Thiadiaye : informez-vous,
            participez, mobilisez-vous.
          </p>
        </div>
        <div>
          <h3>Participer</h3>
          <div className="site-footer-links">
            <Link to="/adhesion">Adhérer au mouvement</Link>
            <Link to="/sondages">Sondages</Link>
            <Link to="/idees">Boîte à idées</Link>
            <Link to="/agenda">Agenda citoyen</Link>
          </div>
        </div>
        <div>
          <h3>Découvrir</h3>
          <div className="site-footer-links">
            <Link to="/journal">Journal du mouvement</Link>
            <Link to="/carte">Carte interactive</Link>
            <Link to="/memoire">Mémoire de Thiadiaye</Link>
            <Link to="/tableau-de-bord">Tableau de bord</Link>
          </div>
        </div>
      </div>
      <div className="site-footer-bottom">
        © {new Date().getFullYear()} Thiadiaye Debout — Mouvement d'El Hadj Omar Youm
      </div>
    </footer>
  )
}
