import React, { useEffect, useRef } from 'react';
import { loadGoogleMaps, initPlacesService } from '../services/api/googlePlaces';
import '../styles/components.css'; // We will create this

const MapPicker = ({ onLocationSelect, onMapReady }) => {
    const mapRef = useRef(null);

    useEffect(() => {
        let mapInstance;

        const init = async () => {
            console.log("MapPicker: init called");
            try {
                console.log("MapPicker: loading Google Maps...");
                await loadGoogleMaps();
                // Initialize map
                const { map } = await initPlacesService(mapRef.current);
                mapInstance = map;

                if (onMapReady) onMapReady(map);

                // Add click listener
                map.addListener("click", (e) => {
                    const lat = e.latLng.lat();
                    const lng = e.latLng.lng();

                    // Add a marker
                    new window.google.maps.Marker({
                        position: { lat, lng },
                        map: map,
                        title: "Selected Location"
                    });

                    if (onLocationSelect) {
                        onLocationSelect({ lat, lng });
                    }
                });

            } catch (error) {
                console.error("Error loading Google Maps:", error);
            }
        };

        if (mapRef.current) {
            init();
        }
    }, [onLocationSelect, onMapReady]);

    return (
        <div className="map-container">
            <div ref={mapRef} style={{ width: '100%', height: '100%', borderRadius: 'var(--radius-md)' }} />
        </div>
    );
};

export default MapPicker;
