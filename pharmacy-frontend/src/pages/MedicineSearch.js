import React from 'react';

function MedicineSearch({ searchTerm, onSearchChange, placeholder = "Search medicines by name or category..." }) {
    return (
        <div style={searchContainerStyle}>
            <div style={inputWrapperStyle}>
                <span style={iconStyle}>🔍</span>
                <input
                    type="text"
                    value={searchTerm}
                    placeholder={placeholder}
                    onChange={(e) => onSearchChange(e.target.value)}
                    style={inputStyle}
                />
                {searchTerm && (
                    <button
                        onClick={() => onSearchChange('')}
                        style={clearButtonStyle}
                        title="Clear search"
                    >
                        ✕
                    </button>
                )}
            </div>
        </div>
    );
}

// ---  STYLES ---
const searchContainerStyle = {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '25px'
};

const inputWrapperStyle = {
    position: 'relative',
    width: '100%',
    maxWidth: '650px', 
    display: 'flex',
    alignItems: 'center'
};

const inputStyle = {
    width: '100%',
    padding: '14px 45px', 
    borderRadius: '16px', 
    border: '1px solid #cbd5e1', 
    fontSize: '15px',
    fontWeight: '600',
    outline: 'none',
    color: '#333',
    backgroundColor: '#ffffff',
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)', 
    boxSizing: 'border-box'
};

const iconStyle = {
    position: 'absolute',
    left: '15px',
    fontSize: '18px',
    color: '#64748b' 
};

const clearButtonStyle = {
    position: 'absolute',
    right: '15px',
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
};

export default MedicineSearch;