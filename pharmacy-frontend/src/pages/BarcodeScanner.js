import React, { useRef } from 'react';

function BarcodeScanner({ barcodeInput, setBarcodeInput, onKeyDown }) {
    const inputRef = useRef(null);

    const handleContainerClick = () => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    return (
        <div
            className="no-print"
            style={scanModuleStyle}
            onClick={handleContainerClick}
            title="Click anywhere here to capture scanner laser inputs"
        >
            {/* Header with high-tech badge */}
            <div style={scanHeaderStyle}>
                <span style={iconBadge}>📟</span>
                <div>
                    <h3 style={titleText}>Quick Scan Console</h3>
                    <span style={statusText}>📡 System Status: Ready to receive</span>
                </div>
            </div>

            {/* The Monospace "Scanner" Input */}
            <input
                ref={inputRef} // Attached reference pointer
                type="text"
                placeholder="TYPE BARCODE & PRESS ENTER..."
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyDown={onKeyDown}
                style={scanInputStyle}
                autoFocus
            />

            <p style={tipStyle}>
                Tip: Real hardware scanners issue an 'Enter' signal automatically.
            </p>
        </div>
    );
}

// --- STYLES  ---
const scanModuleStyle = {
    maxWidth: '700px',
    margin: '0 auto 40px auto',
    backgroundColor: '#ffffff',
    padding: '30px',
    borderRadius: '24px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    border: '1px solid #e2e8f0',
    borderTop: '6px solid #00b894', 
    textAlign: 'center',
    cursor: 'pointer' 
};

const scanHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '15px',
    marginBottom: '25px'
};

const iconBadge = {
    backgroundColor: '#f1f5f9',
    width: '50px',
    height: '50px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    border: '1px solid #e2e8f0'
};

const titleText = {
    color: '#1e293b',
    margin: 0,
    fontSize: '18px',
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    textAlign: 'left'
};

const statusText = {
    fontSize: '11px',
    fontWeight: '800',
    color: '#00b894',
    display: 'block',
    textAlign: 'left'
};

const scanInputStyle = {
    width: '90%',
    padding: '18px',
    borderRadius: '15px',
    backgroundColor: '#f8fafc',
    border: '2px solid #cbd5e1',
    textAlign: 'center',
    fontSize: '22px',
    fontWeight: '800',
    color: '#1e293b',
    fontFamily: 'monospace',
    letterSpacing: '3px',
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
    outline: 'none',
    transition: 'all 0.3s ease'
};

const tipStyle = {
    color: '#94a3b8',
    fontSize: '12px',
    marginTop: '15px',
    fontWeight: '600',
    fontStyle: 'italic'
};

export default BarcodeScanner;