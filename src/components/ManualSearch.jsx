import React, { useState } from 'react';
import '../styles/components.css';

const ManualSearch = ({ onSearch }) => {
    const [input, setInput] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Parse input (supports "lat, lng" format)
        const parts = input.split(',').map(p => parseFloat(p.trim()));
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            onSearch({ lat: parts[0], lng: parts[1] });
        } else {
            alert("Please enter valid coordinates in format: lat, lng (e.g., 38.722, -9.139)");
        }
    };

    return (
        <div className="manual-search">
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter coordinates (e.g. 38.722, -9.139)"
                    className="search-input"
                />
                <button type="submit" className="btn-primary">Scout</button>
            </form>
        </div>
    );
};

export default ManualSearch;
