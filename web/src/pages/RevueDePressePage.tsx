import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { PageHeader } from '../components/PageHeader'

interface ArticlePresse {
  id: number
  titre: string
  source: string
  lien: string
  image_url: string | null
  date_publication: string | null
}

export function RevueDePressePage() {
  const [articles, setArticles] = useState<ArticlePresse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/articles-presse')
      .then(({ data }) => setArticles(data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <PageHeader
        title="Revue de presse"
        subtitle="Le mouvement Thiadiaye Debout dans les médias."
      />
      <div className="page-container">
        {loading ? (
          <p>Chargement…</p>
        ) : (
          <div className="card-grid">
            {articles.map((article) => (
              <a
                key={article.id}
                href={article.lien}
                target="_blank"
                rel="noreferrer"
                className="card presse-card"
              >
                {article.image_url && (
                  <img src={article.image_url} alt={article.titre} className="presse-card-image" />
                )}
                <span className="badge-pill">{article.source}</span>
                <h3>{article.titre}</h3>
                {article.date_publication && (
                  <p className="presse-card-date">
                    {new Date(article.date_publication).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                )}
                <span className="btn-link">Lire l'article →</span>
              </a>
            ))}
            {articles.length === 0 && <p>Aucun article pour le moment.</p>}
          </div>
        )}
      </div>
    </>
  )
}
