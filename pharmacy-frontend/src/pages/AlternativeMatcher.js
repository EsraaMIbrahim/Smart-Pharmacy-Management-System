import React, { useState } from 'react';
import { pharmacyApi } from '../services/apiService';

function AlternativeMatcher({ medicines }) {
    const [searchAlt, setSearchAlt] = useState('');
    const [alternatives, setAlternatives] = useState([]);

    /**
     * Queries the database for alternatives based on active ingredients.
     */
    const findAlternatives = async () => {
        if (!searchAlt) return;
        try {
            const response = await pharmacyApi.findAlternatives(encodeURIComponent(searchAlt));

            const activeAlts = response.data.filter(alt => {
                const isActive = alt.isActive ?? alt.IsActive ?? true;
                return isActive !== false;
            });

            if (activeAlts.length === 0) {
                alert("Medicine found, but zero units are currently active in stock.");
                setAlternatives([]);
            } else {
                setAlternatives(activeAlts);
            }
        } catch (error) {
            setAlternatives([]);
            alert("❌ Medicine not found.");
        }
    };

    return (
        <div className="no-print" style={wideCardStyle}>
            {/* Header Area */}
            <div style={headerRow}>
                <h3 style={titleStyle}>
                    <span style={iconCircle}>🔍</span>
                    Alternative Matcher
                </h3>
                <span style={subtitleStyle}>Stock Substitution Engine</span>
            </div>

            {/* --- THE CAPSULE DESIGN --- */}
            <div style={searchCapsule}>
                <input
                    placeholder="Enter Out-of-Stock Medicine Name..."
                    value={searchAlt}
                    onChange={(e) => setSearchAlt(e.target.value)}
                    style={capsuleInputStyle}
                />
                <button
                    onClick={findAlternatives}
                    style={actionBtnStyle}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    Execute Scan
                </button>
            </div>

            {/* Results Display */}
            {alternatives.length > 0 && (
                <div style={resultsContainer}>
                    {alternatives.map(alt => {
                        const currentId = alt.id ?? alt.Id;
                        const currentName = alt.name ?? alt.Name;
                        const currentPrice = alt.price ?? alt.Price;
                        const currentStock = alt.stockQuantity ?? alt.StockQuantity ?? 0;

                        return (
                            <div key={currentId} style={resultItemCard}>
                                <div style={{ fontWeight: '800', color: '#2d3436' }}>
                                    {currentName}
                                </div>
                                <div style={resultMeta}>
                                    <span>💰 {currentPrice} EGP</span>
                                    <span style={stockBadge(currentStock)}>
                                        {currentStock > 0 ? `📦 Stock: ${currentStock}` : '❌ Out of Stock'}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// --- STYLES ---
const wideCardStyle = {
    width: '100%',
    padding: '35px',
    borderRadius: '24px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    boxSizing: 'border-box',
    background: '#f8fafc'
};

const headerRow = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '2px solid #f8f9fa',
    paddingBottom: '15px',
    marginBottom: '10px'
};

const titleStyle = {
    fontSize: '24px',
    fontWeight: '900',
    color: '#2d3436',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
};

const iconCircle = {
    backgroundColor: '#f1f5f9',
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #e2e8f0',
    fontSize: '22px'
};

const subtitleStyle = {
    fontSize: '11px',
    fontWeight: '800',
    color: '#00b894',
    textTransform: 'uppercase',
    letterSpacing: '1.5px'
};

const searchCapsule = {
    display: 'flex',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '8px',
    border: '1px solid #cbd5e1',
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)',
    marginTop: '10px'
};

const capsuleInputStyle = {
    flex: 1,
    border: 'none',
    background: 'transparent',
    padding: '12px 20px',
    fontSize: '15px',
    fontWeight: '600',
    color: '#333',
    outline: 'none'
};

const actionBtnStyle = {
    background: 'linear-gradient(to bottom, #00c9a7, #00897b)',
    color: 'white',
    padding: '12px 30px',
    borderRadius: '12px',
    border: 'none',
    borderBottom: '3px solid #00695c',
    fontSize: '14px',
    fontWeight: '800',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    boxShadow: '0 4px 12px rgba(0, 137, 123, 0.2)',
    transition: 'all 0.1s ease'
};

const resultsContainer = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    marginTop: '10px'
};

const resultItemCard = {
    padding: '15px',
    backgroundColor: '#fff',
    borderRadius: '12px',
    border: '1px solid #edf2f7',
    boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
};

const resultMeta = {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    marginTop: '8px',
    color: '#636e72'
};

const stockBadge = (qty) => ({
    color: qty > 0 ? '#28a745' : '#dc3545',
    fontWeight: 'bold'
});

export default AlternativeMatcher;