import React, { useEffect, useState } from 'react';
import { fetchCompanyNif } from '../services/api/nifService';

const CompanyList = ({ places, isLoading }) => {
    const [placesWithNif, setPlacesWithNif] = useState([]);

    useEffect(() => {
        const enrichPlacesWithNif = async () => {
            if (!places || places.length === 0) {
                setPlacesWithNif([]);
                return;
            }

            // Map places to existing state to preserve already fetched NIFs if strictly necessary, 
            // but here we simply re-fetch or check cache. For simplicity, we fetch all.
            const enriched = await Promise.all(places.map(async (place) => {
                const nifData = await fetchCompanyNif(place.name);
                return { ...place, nifData };
            }));

            setPlacesWithNif(enriched);
        };

        if (places && places.length > 0) {
            enrichPlacesWithNif();
        }
    }, [places]);

    if (isLoading) {
        return <div className="loading-state">Scouting places...</div>;
    }

    if (!places || places.length === 0) {
        return <div className="empty-state">Select a location on the map to find nearby companies.</div>;
    }

    // Use local state if populated, else fallback to props (though props won't have NIF)
    const displayPlaces = placesWithNif.length === places.length ? placesWithNif : places;

    return (
        <div className="company-list">
            <h3>Nearby Companies ({displayPlaces.length})</h3>
            <div className="results-grid">
                {displayPlaces.map((place) => (
                    <div key={place.place_id} className="company-card">
                        <div className="company-info">
                            <h4>{place.name}</h4>
                            <p className="company-address">
                                {place.distance && <span className="distance-badge">{place.distance}m</span>}
                                {place.vicinity}
                            </p>

                            {/* NIF Display */}
                            <div className="company-nif" style={{ marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-primary)' }}>
                                {place.nifData ? (
                                    place.nifData.error ? (
                                        <span style={{ color: 'orange' }}>⚠ {place.nifData.error}</span>
                                    ) : (
                                        <span><strong>NIF:</strong> {place.nifData.nif} <small style={{ opacity: 0.7 }}>({place.nifData.source})</small></span>
                                    )
                                ) : (
                                    <span style={{ opacity: 0.5 }}>Fetching NIF...</span>
                                )}
                            </div>

                            <div className="company-meta">
                                {place.rating && <span className="rating">★ {place.rating}</span>}
                                {place.business_status && <span className={`status ${place.business_status.toLowerCase()}`}>{place.business_status}</span>}
                            </div>
                        </div>
                        <div className="company-actions">
                            <a
                                href={place.google_maps_uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-link"
                            >
                                View on Map
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CompanyList;
