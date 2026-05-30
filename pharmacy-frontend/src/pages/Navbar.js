import React from 'react';

function Navbar({ userRole, username, setView, currentView, onLogout }) {

    const getBtnStyle = (viewName) => ({
        padding: '10px 22px',
        borderRadius: '12px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontWeight: '800',
        fontSize: '15px', 
        transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        border: 'none',
        backgroundColor: currentView === viewName ? '#28a745' : 'transparent',
        color: currentView === viewName ? '#fff' : '#e0e0e0', 
        boxShadow: currentView === viewName ? '0 0 15px rgba(40, 167, 69, 0.5)' : 'none',
        transform: currentView === viewName ? 'scale(1.05)' : 'scale(1)',
    });

    return (
        <nav className="no-print" style={navContainerStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                <h2
                    style={brandStyle}
                    onClick={() => setView(userRole === 'Client' ? 'client_store' : 'inventory')}
                >
                    ✚ Smart Pharmacy
                </h2>

                <div style={navPillsContainer}>
                    {userRole === 'Client' ? (
                        <>
                            <button onClick={() => setView('client_store')} style={getBtnStyle('client_store')}>
                                🛒 Shop
                            </button>
                            <button onClick={() => setView('my_orders')} style={getBtnStyle('my_orders')}>
                                📜 Orders
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => setView('inventory')} style={getBtnStyle('inventory')}>
                                📦 Inventory
                            </button>
                            <button onClick={() => setView('patients')} style={getBtnStyle('patients')}>
                                👥 Patients
                            </button>
                            <button onClick={() => setView('suppliers')} style={getBtnStyle('suppliers')}>
                                🚚 Suppliers
                                </button>
                            {(userRole === 'Admin' || userRole === 'Pharmacist' || userRole === 'Staff') && (
                                <button onClick={() => setView('online_orders')} style={getBtnStyle('online_orders')}>
                                    🚚 Orders
                                </button>)}
                            {(userRole === 'Admin' || userRole === 'Pharmacist') && (
                                <button onClick={() => setView('analytics')} style={getBtnStyle('analytics')}>
                                    📊 Analytics
                                </button>)}

                        </>
                    )}
                </div>
            </div>

            <div style={userActionWrapper}>
                <div style={userInfo}>
                    <span style={userNameStyle}>{username || 'Esraa'}</span>
                    <span style={roleBadge}>{userRole} PORTAL</span>
                </div>

                <div style={divider}></div>

                <button
                    onClick={() => { if (window.confirm("Terminate session?")) onLogout(); }}
                    style={logoutButtonStyle}
                >
                    <span style={{ fontSize: '18px' }}>⏻</span>
                    Logout
                </button>
            </div>
        </nav>
    );
}

// --- STYLES ---

const navContainerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 40px',
    backgroundColor: '#141414', 
    borderBottom: '1px solid #222',
    color: 'white',
    boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
};

const brandStyle = {
    margin: 0,
    background: 'linear-gradient(to right, #00ff87, #60efff)', 
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    cursor: 'pointer',
    fontSize: '24px',
    fontWeight: '900',
    letterSpacing: '-1px',
    filter: 'drop-shadow(0 0 5px rgba(0, 255, 135, 0.3))' 
};

const navPillsContainer = {
    display: 'flex',
    gap: '12px',
    backgroundColor: '#222', 
    padding: '6px',
    borderRadius: '16px',
    border: '1px solid #333',
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)'
};

const userActionWrapper = {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#252525', 
    padding: '8px 8px 8px 20px',
    borderRadius: '14px',
    border: '1px solid #444',
    boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
};

const userInfo = {
    display: 'flex',
    flexDirection: 'column',
    marginRight: '15px',
    textAlign: 'right'
};

const userNameStyle = {
    color: '#ffffff', 
    fontSize: '18px', 
    fontWeight: '900',
    letterSpacing: '0.5px',
    textShadow: '0 2px 4px rgba(0,0,0,0.5)'
};

const roleBadge = {
    color: '#00ff87', 
    fontSize: '11px', 
    fontWeight: '900',
    letterSpacing: '1.5px',
    textTransform: 'uppercase'
};

const divider = {
    width: '1px',
    height: '24px',
    backgroundColor: '#444',
    marginRight: '10px'
};

const logoutButtonStyle = {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '8px 15px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: '0.2s',
};

export default Navbar;