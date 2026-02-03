import { useState, useCallback } from 'react'
import MapPicker from './components/MapPicker'
import CompanyList from './components/CompanyList'
import ManualSearch from './components/ManualSearch'
import { searchNearbyPlaces } from './services/api/index'
import './styles/layout.css'
import './styles/components.css'

function App() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLocationSelect = useCallback(async (location) => {
    setLoading(true);
    setError(null);
    try {
      // Search for 'point_of_interest' with 150m radius (balanced precision)
      const results = await searchNearbyPlaces(location, 150, 'establishment');
      setPlaces(results);
    } catch (err) {
      console.error("Search failed in App.jsx", err);
      setError(`Search failed: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand-logo">
          <span>EmpresaScout</span>
        </div>
        <div className="brand-subtitle">
          Plataforma de Scouting Empresarial
        </div>
      </header>

      <main className="main-content">
        <div className="dashboard-grid">
          <section className="results-section">
            <h2 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>Scout Companies</h2>
            <CompanyList places={places} isLoading={loading} />
          </section>

          <section className="map-section">
            <ManualSearch onSearch={handleLocationSelect} />
            <MapPicker onLocationSelect={handleLocationSelect} />
            <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
              <p>Click on the map to scout for companies in that area.</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default App
