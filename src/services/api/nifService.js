const NIF_PT_BASE_URL = "/nif-proxy"; // Access via Vite proxy to avoid CORS

export const fetchCompanyNif = async (companyName) => {
    const apiKey = import.meta.env.VITE_NIF_API_KEY;

    if (!apiKey) {
        console.warn("NIF Service: No API Key found. Returning mock data.");
        // Mock fallback if they remove the key
        return { nif: "500" + Math.floor(Math.random() * 1000000), source: "Mock Data" };
    }

    try {
        console.log(`Fetching NIF for: ${companyName}`);
        const url = `${NIF_PT_BASE_URL}/?json=1&q=${encodeURIComponent(companyName)}&key=${apiKey}`;

        const response = await fetch(url);

        if (!response.ok) {
            console.error(`NIF API Error: ${response.status}`);
            return null;
        }

        const data = await response.json();
        console.log("NIF.PT Response:", data);

        // Handle generic NIF.PT errors (e.g., "Key inactive")
        if (data.result === 'error') {
            return { error: data.message || "API Error" };
        }

        // NIF.PT Response Handling
        // If 'q' is a name, it likely returns a list of records.
        if (data && data.records) {
            // Get the first record keys
            const keys = Object.keys(data.records);
            if (keys.length > 0) {
                const firstRecord = data.records[keys[0]];
                return {
                    nif: firstRecord.nif,
                    source: "NIF.PT"
                };
            }
        }

        // If it returns a single object (less likely for name search but possible)
        if (data && data.nif) {
            return { nif: data.nif, source: "NIF.PT" };
        }

        return null;
    } catch (error) {
        console.error("Failed to fetch NIF:", error);
        return null;
    }
};
