import { Route, Routes } from 'react-router-dom'
import { Footer } from './components/Footer'
import { NavBar } from './components/NavBar'
import { LanguageProvider } from './context/LanguageContext'
import { MembreAuthProvider } from './context/MembreAuthContext'
import { SimplifiedModeProvider } from './context/SimplifiedModeContext'
import { AdhesionPage } from './pages/AdhesionPage'
import { AgendaPage } from './pages/AgendaPage'
import { CartePage } from './pages/CartePage'
import { ClassementPage } from './pages/ClassementPage'
import { EspaceAmbassadeurPage } from './pages/EspaceAmbassadeurPage'
import { HomePage } from './pages/HomePage'
import { IdeesPage } from './pages/IdeesPage'
import { ImagesPage } from './pages/ImagesPage'
import { JournalPage } from './pages/JournalPage'
import { LivesPage } from './pages/LivesPage'
import { LiveWatchPage } from './pages/LiveWatchPage'
import { MembreLoginPage } from './pages/MembreLoginPage'
import { MemoirePage } from './pages/MemoirePage'
import { RevueDePressePage } from './pages/RevueDePressePage'
import { SondagesPage } from './pages/SondagesPage'
import { TableauDeBordPage } from './pages/TableauDeBordPage'
import { VideosPage } from './pages/VideosPage'

function App() {
  return (
    <MembreAuthProvider>
      <LanguageProvider>
        <SimplifiedModeProvider>
          <div className="app-shell">
            <NavBar />
            <main className="app-main">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/adhesion" element={<AdhesionPage />} />
                <Route path="/connexion" element={<MembreLoginPage />} />
                <Route path="/sondages" element={<SondagesPage />} />
                <Route path="/idees" element={<IdeesPage />} />
                <Route path="/videos" element={<VideosPage />} />
                <Route path="/images" element={<ImagesPage />} />
                <Route path="/revue-presse" element={<RevueDePressePage />} />
                <Route path="/classement" element={<ClassementPage />} />
                <Route path="/memoire" element={<MemoirePage />} />
                <Route path="/journal" element={<JournalPage />} />
                <Route path="/carte" element={<CartePage />} />
                <Route path="/agenda" element={<AgendaPage />} />
                <Route path="/ambassadeur" element={<EspaceAmbassadeurPage />} />
                <Route path="/tableau-de-bord" element={<TableauDeBordPage />} />
                <Route path="/lives" element={<LivesPage />} />
                <Route path="/lives/:id" element={<LiveWatchPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </SimplifiedModeProvider>
      </LanguageProvider>
    </MembreAuthProvider>
  )
}

export default App
