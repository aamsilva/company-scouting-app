const GOOGLE_MAPS_URL = "https://maps.googleapis.com/maps/api/js";
let loadPromise = null;

export const loadGoogleMaps = () => {
    if (loadPromise) return loadPromise;

    loadPromise = new Promise((resolve, reject) => {
        if (window.google && window.google.maps) {
            resolve(window.google.maps);
            return;
        }

        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
            console.error("CRITICAL: Google Maps API Key is missing!");
            reject(new Error("Google Maps API Key is missing"));
            return;
        }

        const script = document.createElement("script");
        script.src = `${GOOGLE_MAPS_URL}?key=${apiKey}&v=weekly&libraries=places,maps,geometry`;
        script.async = true;
        script.defer = true;

        script.onload = () => {
            if (window.google && window.google.maps) {
                resolve(window.google.maps);
            } else {
                reject(new Error("Google Maps SDK loaded but window.google.maps is undefined"));
            }
        };

        script.onerror = (err) => {
            reject(new Error("Failed to load Google Maps script"));
        };

        document.head.appendChild(script);
    });

    return loadPromise;
};

// Singleton service instance
let mapInstance = null;

export const initPlacesService = async (mapDiv) => {
    console.log("initPlacesService start");
    await loadGoogleMaps();
    if (!mapDiv) {
        console.error("initPlacesService: mapDiv is missing");
        return;
    }

    try {
        console.log("initPlacesService: initializing Map");
        // Robust capability check
        let MapConstructor;

        if (window.google && window.google.maps && window.google.maps.Map) {
            console.log("Using global google.maps.Map");
            MapConstructor = window.google.maps.Map;
        } else {
            console.log("Waiting for importLibrary('maps')...");
            const lib = await google.maps.importLibrary("maps");
            MapConstructor = lib.Map;
        }

        mapInstance = new MapConstructor(mapDiv, {
            center: { lat: 38.722, lng: -9.139 },
            zoom: 15,
            mapId: "DEMO_MAP_ID",
        });
        console.log("initPlacesService: Map instance created");

        return { map: mapInstance };
    } catch (e) {
        console.error("Map initialization failed:", e);
        return { map: null };
    }
};

export const searchNearbyPlaces = async (location, radius = 500, type = "point_of_interest") => {
    await loadGoogleMaps();
    console.log('Searching nearby places...', location);

    // For search, we need the Place class.
    // Use importLibrary as it's the standard for new Places API
    const { Place } = await google.maps.importLibrary("places");

    const request = {
        fields: ['displayName', 'location', 'formattedAddress', 'businessStatus', 'rating', 'userRatingCount', 'id', 'googleMapsURI'],
        locationRestriction: {
            center: { lat: location.lat, lng: location.lng },
            radius: radius,
        },
        includedPrimaryTypes: [
            // Food & Drink
            'restaurant', 'cafe', 'bakery', 'bar', 'supermarket',
            // Retail
            'store', 'clothing_store', 'electronics_store', 'furniture_store', 'home_goods_store', 'hardware_store',
            // Services
            'hair_care', 'bank', 'pharmacy', 'hospital', 'gym', 'car_repair', 'car_wash', 'dry_cleaning', 'electrician', 'plumber', 'lawyer', 'accounting', 'real_estate_agency', 'travel_agency', 'veterinary_care',
            // Business & Industrial (B2B)
            'corporate_office', 'consultant', 'advertising_agency', 'architectural_bureau', 'engineering_consultant', 'insurance_agency', 'telecommunications_service_provider',
            'wholesaler', 'software_company', 'web_design_company',
            // General
            'local_government_office', 'school', 'university'
        ],
        maxResultCount: 20,
        rankPreference: 'DISTANCE',
    };

    const { places } = await Place.searchNearby(request);

    // Calculate distance for each place
    const origin = new google.maps.LatLng(location.lat, location.lng);

    return places.map(place => {
        const distance = google.maps.geometry.spherical.computeDistanceBetween(
            origin,
            place.location
        );

        return {
            place_id: place.id,
            name: place.displayName,
            vicinity: place.formattedAddress,
            rating: place.rating,
            user_ratings_total: place.userRatingCount,
            business_status: place.businessStatus,
            geometry: { location: place.location },
            google_maps_uri: place.googleMapsURI,
            distance: Math.round(distance) // Distance in meters
        };
    });
};
