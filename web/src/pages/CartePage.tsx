import 'leaflet/dist/leaflet.css'
import { useEffect, useState } from 'react'
import { GeoJSON, MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import { api } from '../api/client'
import { PageHeader } from '../components/PageHeader'

// Le marker par défaut de Leaflet référence des images qui ne sont pas
// bundlées par Vite — on le redéfinit avec les URLs du CDN.
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

interface Quartier {
  id: number
  nom: string
  couleur: string
  membres_count: number
  geojson: GeoJSON.Geometry | null
}

interface Evenement {
  id: number
  titre: string
  latitude: string | null
  longitude: string | null
  debut_at: string
}

const CENTRE_THIADIAYE: [number, number] = [14.4, -16.9]

export function CartePage() {
  const [quartiers, setQuartiers] = useState<Quartier[]>([])
  const [evenements, setEvenements] = useState<Evenement[]>([])

  useEffect(() => {
    api.get('/quartiers').then(({ data }) => setQuartiers(data))
    api.get('/evenements').then(({ data }) => setEvenements(data))
  }, [])

  const evenementsGeolocalises = evenements.filter((e) => e.latitude && e.longitude)

  return (
    <>
      <PageHeader
        title="Carte interactive de Thiadiaye"
        subtitle={
          quartiers.filter((q) => q.geojson).length === 0
            ? "Le tracé des quartiers n'est pas encore renseigné (à valider avec la mairie)."
            : 'Cliquez sur un quartier pour voir son nombre de membres.'
        }
      />
      <div className="page-container">
        <div className="split-layout">
          <div
            style={{
              height: 520,
              borderRadius: 'var(--radius)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <MapContainer center={CENTRE_THIADIAYE} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {quartiers
                .filter((q) => q.geojson)
                .map((q) => (
                  <GeoJSON
                    key={q.id}
                    data={q.geojson as GeoJSON.GeoJsonObject}
                    style={{ color: q.couleur, fillColor: q.couleur, fillOpacity: 0.35 }}
                    onEachFeature={(_, layer) => {
                      layer.bindPopup(`<strong>${q.nom}</strong><br/>${q.membres_count} membre(s)`)
                    }}
                  />
                ))}
              {evenementsGeolocalises.map((e) => (
                <Marker key={e.id} position={[Number(e.latitude), Number(e.longitude)]} icon={icon}>
                  <Popup>
                    <strong>{e.titre}</strong>
                    <br />
                    {new Date(e.debut_at).toLocaleString('fr-FR')}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          <div>
            <h2>Quartiers</h2>
            <ol className="ranking-list">
              {quartiers.map((q) => (
                <li key={q.id}>
                  <span className="color-dot" style={{ background: q.couleur }} />
                  <span className="ranking-name">{q.nom}</span>
                  <span className="ranking-count">{q.membres_count} membres</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </>
  )
}
