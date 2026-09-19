import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { AmbassadeursPage } from './pages/AmbassadeursPage'
import { ArticlesPressePage } from './pages/ArticlesPressePage'
import { DashboardPage } from './pages/DashboardPage'
import { DefisPage } from './pages/DefisPage'
import { EvenementsPage } from './pages/EvenementsPage'
import { IdeesPage } from './pages/IdeesPage'
import { LivesPage } from './pages/LivesPage'
import { LoginPage } from './pages/LoginPage'
import { MembresPage } from './pages/MembresPage'
import { MemoirePage } from './pages/MemoirePage'
import { PresentationMouvementPage } from './pages/PresentationMouvementPage'
import { PublicationsPage } from './pages/PublicationsPage'
import { QuartiersPage } from './pages/QuartiersPage'
import { RealisationsPage } from './pages/RealisationsPage'
import { SondagesPage } from './pages/SondagesPage'
import { TraductionsPage } from './pages/TraductionsPage'
import { VideosPage } from './pages/VideosPage'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <DashboardPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/membres"
          element={
            <ProtectedRoute>
              <Layout>
                <MembresPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/quartiers"
          element={
            <ProtectedRoute>
              <Layout>
                <QuartiersPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/sondages"
          element={
            <ProtectedRoute>
              <Layout>
                <SondagesPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/idees"
          element={
            <ProtectedRoute>
              <Layout>
                <IdeesPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/videos"
          element={
            <ProtectedRoute>
              <Layout>
                <VideosPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/defis"
          element={
            <ProtectedRoute>
              <Layout>
                <DefisPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/memoire"
          element={
            <ProtectedRoute>
              <Layout>
                <MemoirePage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/presentation"
          element={
            <ProtectedRoute>
              <Layout>
                <PresentationMouvementPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/publications"
          element={
            <ProtectedRoute>
              <Layout>
                <PublicationsPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/realisations"
          element={
            <ProtectedRoute>
              <Layout>
                <RealisationsPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/articles-presse"
          element={
            <ProtectedRoute>
              <Layout>
                <ArticlesPressePage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/evenements"
          element={
            <ProtectedRoute>
              <Layout>
                <EvenementsPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/ambassadeurs"
          element={
            <ProtectedRoute>
              <Layout>
                <AmbassadeursPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/lives"
          element={
            <ProtectedRoute>
              <Layout>
                <LivesPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/traductions"
          element={
            <ProtectedRoute>
              <Layout>
                <TraductionsPage />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  )
}

export default App
