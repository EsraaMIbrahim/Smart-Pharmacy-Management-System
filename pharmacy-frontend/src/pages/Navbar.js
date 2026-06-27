import React from 'react';

function Navbar({ userRole, username, setView, currentView, onLogout }) {
    const button = (name) => ({ ...buttonStyle, backgroundColor: currentView === name ? '#28a745' : 'transparent', color: currentView === name ? '#fff' : '#e0e0e0', boxShadow: currentView === name ? '0 0 15px rgba(40,167,69,.5)' : 'none' });
    return <nav className="no-print" style={navStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
            <h2 style={brandStyle} onClick={() => setView(userRole === 'Client' ? 'client_store' : 'inventory')}>✚ Smart Pharmacy</h2>
            <div style={pillsStyle}>{userRole === 'Client' ? <>
                <button onClick={() => setView('client_store')} style={button('client_store')}>Shop</button>
                <button onClick={() => setView('my_orders')} style={button('my_orders')}>Orders</button>
                <button onClick={() => setView('consultations')} style={button('consultations')}>Consultations</button>
                <button onClick={() => setView('ai_explainer')} style={button('ai_explainer')}>✦ AI Explainer</button>
            </> : <>
                <button onClick={() => setView('inventory')} style={button('inventory')}>Inventory</button>
                <button onClick={() => setView('patients')} style={button('patients')}>Patients</button>
                <button onClick={() => setView('suppliers')} style={button('suppliers')}>Suppliers</button>
                {(userRole === 'Admin' || userRole === 'Pharmacist') && <>
                    <button onClick={() => setView('analytics')} style={button('analytics')}>Analytics</button>
                    <button onClick={() => setView('consultation_management')} style={button('consultation_management')}>Consultations</button>

                </>}
                 {(userRole === 'Admin' || userRole === 'Pharmacist' || userRole === 'Staff') && (
                     <button onClick={() => setView('online_orders')} style={button('online_orders')}>Orders</button>)}
                <button onClick={() => setView('ai_explainer')} style={button('ai_explainer')}>✦ AI Explainer</button>
            </>}</div>
        </div>
        <div style={userStyle}><div style={{ textAlign: 'right' }}><strong>{username || 'User'}</strong><small style={roleStyle}>{userRole} PORTAL</small></div><button onClick={() => window.confirm('Terminate session?') && onLogout()} style={logoutStyle}>Logout</button></div>
    </nav>;
}

const navStyle={display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 40px',background:'#141414',color:'#fff',boxShadow:'0 4px 20px rgba(0,0,0,.4)'};
const brandStyle={margin:0,color:'#5be29a',cursor:'pointer',fontSize:24,fontWeight:900,letterSpacing:'-1px'};
const pillsStyle={display:'flex',gap:8,background:'#222',padding:6,borderRadius:16,border:'1px solid #333'};
const buttonStyle={padding:'10px 17px',borderRadius:11,cursor:'pointer',fontWeight:800,fontSize:14,border:0,transition:'.2s'};
const userStyle={display:'flex',alignItems:'center',gap:15,background:'#252525',padding:'8px 8px 8px 18px',borderRadius:14,border:'1px solid #444'};
const roleStyle={display:'block',color:'#00ff87',fontSize:9,letterSpacing:'1.2px',marginTop:2};
const logoutStyle={background:'#dc3545',color:'#fff',border:0,padding:'9px 14px',borderRadius:8,fontWeight:700,cursor:'pointer'};
export default Navbar;
