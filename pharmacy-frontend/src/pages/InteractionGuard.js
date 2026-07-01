import React, { useState, useEffect } from 'react';
import { pharmacyApi } from '../services/apiService';

/**
 *
 * Two modes toggled by a tab switcher:
 *
 *  Tab 1 — Cart Scan (N-Tier Matrix)
 *    Build a list of N medicines → scan all pairs at once → shows every
 *    interaction with severity + affected product names on both sides.
 *
 *  Tab 2 — Patient Profile Check
 *    Select a patient → select medicines to dispense → checks new medicines
 *    against everything the patient has bought before.
 */
function InteractionGuard({ patients = [] }) {

    const [activeTab, setActiveTab] = useState('cart'); // 'cart' | 'profile'

    // ── Shared data ──
    const [medicines, setMedicines] = useState([]);

    useEffect(() => {
        pharmacyApi.getMedicines()
            .then(res => setMedicines(
                (res.data || []).sort((a, b) =>
                    (a.name ?? a.Name ?? '').toLowerCase()
                        .localeCompare((b.name ?? b.Name ?? '').toLowerCase())
                )
            ))
            .catch(() => {});
    }, []);

    // ── Tab 1: Cart Scan state ──
    const [cartItems, setCartItems]       = useState([]);
    const [selectedMedId, setSelectedMedId] = useState('');
    const [cartResult, setCartResult]     = useState(null);
    const [cartLoading, setCartLoading]   = useState(false);

    const addToCart = () => {
        if (!selectedMedId) return;
        const med = medicines.find(m => String(m.id ?? m.Id) === selectedMedId);
        if (!med) return;
        const medId = String(med.id ?? med.Id);
        if (cartItems.some(c => c.id === medId)) return;
        setCartItems(prev => [...prev, {
            id: medId,
            name: med.name ?? med.Name ?? 'Unknown',
            ingredientName: med.ingredient?.name ?? med.Ingredient?.Name ?? '—',
        }]);
        setSelectedMedId('');
        setCartResult(null);
    };

    const removeFromCart = (id) => {
        setCartItems(prev => prev.filter(c => c.id !== id));
        setCartResult(null);
    };

    const runCartScan = async () => {
        if (cartItems.length < 2) { setCartResult({ error: 'Add at least 2 medicines to run the scan.' }); return; }
        setCartLoading(true); setCartResult(null);
        try {
            const res = await pharmacyApi.scanCart(cartItems.map(c => parseInt(c.id)));
            setCartResult(res.data);
        } catch { setCartResult({ error: 'Could not connect to Safety Engine.' }); }
        finally { setCartLoading(false); }
    };

    const clearCart = () => { setCartItems([]); setCartResult(null); setSelectedMedId(''); };

    // ── Tab 2: Patient Profile state ──
    const [selectedPatientId, setSelectedPatientId] = useState('');
    const [profileMedId, setProfileMedId]           = useState('');
    const [profileItems, setProfileItems]           = useState([]);
    const [profileResult, setProfileResult]         = useState(null);
    const [profileLoading, setProfileLoading]       = useState(false);

    const addToProfile = () => {
        if (!profileMedId) return;
        const med = medicines.find(m => String(m.id ?? m.Id) === profileMedId);
        if (!med) return;
        const medId = String(med.id ?? med.Id);
        if (profileItems.some(c => c.id === medId)) return;
        setProfileItems(prev => [...prev, {
            id: medId,
            name: med.name ?? med.Name ?? 'Unknown',
            ingredientName: med.ingredient?.name ?? med.Ingredient?.Name ?? '—',
        }]);
        setProfileMedId('');
        setProfileResult(null);
    };

    const removeFromProfile = (id) => {
        setProfileItems(prev => prev.filter(c => c.id !== id));
        setProfileResult(null);
    };

    const runProfileCheck = async () => {
        if (!selectedPatientId) { setProfileResult({ error: 'Please select a patient first.' }); return; }
        if (profileItems.length === 0) { setProfileResult({ error: 'Add at least 1 medicine to check.' }); return; }
        setProfileLoading(true); setProfileResult(null);
        try {
            const res = await pharmacyApi.checkAgainstProfile(
                parseInt(selectedPatientId),
                profileItems.map(c => parseInt(c.id))
            );
            setProfileResult(res.data);
        } catch { setProfileResult({ error: 'Could not connect to Safety Engine.' }); }
        finally { setProfileLoading(false); }
    };

    const clearProfile = () => { setProfileItems([]); setProfileResult(null); setProfileMedId(''); setSelectedPatientId(''); };

    return (
        <div style={card}>

            {/* Header */}
            <div style={headerRow}>
                <h3 style={titleStyle}>
                    <span style={iconBox}>🛡️</span>
                    Interaction Guard
                </h3>
                <span style={subtitleStyle}> Clinical Safety Engine</span>
            </div>

            {/* Tab switcher */}
            <div style={tabBar}>
                <button
                    onClick={() => setActiveTab('cart')}
                    style={tabBtn(activeTab === 'cart')}
                >
                    🔬 Cart Scan
                    <span style={tabBadge(activeTab === 'cart')}>N-Tier Matrix</span>
                </button>
                <button
                    onClick={() => setActiveTab('profile')}
                    style={tabBtn(activeTab === 'profile')}
                >
                    👤 Patient Profile Check
                    <span style={tabBadge(activeTab === 'profile')}>Medication History</span>
                </button>
            </div>

            {/* ── TAB 1: CART SCAN ── */}
            {activeTab === 'cart' && (
                <>
                    <p style={tabDescription}>
                        Add all medicines in the current order. The engine scans <b>every possible pair</b> at once and flags all interactions.
                    </p>

                    {/* Medicine selector */}
                    <div style={capsule}>
                        <select value={selectedMedId} onChange={e => setSelectedMedId(e.target.value)} style={selectStyle}>
                            <option value="">— Select a medicine to add —</option>
                            {medicines.map(med => {
                                const id = String(med.id ?? med.Id);
                                const inCart = cartItems.some(c => c.id === id);
                                return (
                                    <option key={id} value={id} disabled={inCart}>
                                        {med.name ?? med.Name}{inCart ? ' ✓' : ''}
                                    </option>
                                );
                            })}
                        </select>
                        <button onClick={addToCart} disabled={!selectedMedId} style={addBtn('#1e293b')}>
                            + Add
                        </button>
                    </div>

                    {/* Pills */}
                    {cartItems.length > 0 && (
                        <div style={pillsRow}>
                            {cartItems.map(item => (
                                <div key={item.id} style={pill}>
                                    <b>{item.name}</b>
                                    <span style={pillSub}>({item.ingredientName})</span>
                                    <button onClick={() => removeFromCart(item.id)} style={removePillBtn}>×</button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            onClick={runCartScan}
                            disabled={cartLoading || cartItems.length < 2}
                            style={{ ...primaryBtn('#1d4ed8'), opacity: (cartLoading || cartItems.length < 2) ? 0.5 : 1 }}
                        >
                            {cartLoading ? '🔍 Scanning...' : `🔬 Run Full Scan (${cartItems.length} medicines)`}
                        </button>
                        {cartItems.length > 0 && <button onClick={clearCart} style={ghostBtn}>Clear All</button>}
                    </div>

                    {/* Cart result */}
                    <ScanResult result={cartResult} />
                </>
            )}

            {/* ── TAB 2: PATIENT PROFILE CHECK ── */}
            {activeTab === 'profile' && (
                <>
                    <p style={tabDescription}>
                        Select the patient, then add the medicines you want to dispense. The engine checks them against <b>everything this patient has bought before</b>.
                    </p>

                    {/* Patient selector */}
                    <div style={capsule}>
                        <select
                            value={selectedPatientId}
                            onChange={e => { setSelectedPatientId(e.target.value); setProfileResult(null); }}
                            style={selectStyle}
                        >
                            <option value="">— Select a patient —</option>
                            {patients
                                .filter(p => (p.isActive ?? p.IsActive) !== false)
                                .map(p => {
                                    const id   = p.id ?? p.Id;
                                    const name = p.fullName ?? p.FullName ?? 'Unknown';
                                    const phone = p.phoneNumber ?? p.PhoneNumber ?? '';
                                    return (
                                        <option key={id} value={String(id)}>
                                            {name} — {phone}
                                        </option>
                                    );
                                })
                            }
                        </select>
                    </div>

                    {/* Medicine selector */}
                    <div style={capsule}>
                        <select value={profileMedId} onChange={e => setProfileMedId(e.target.value)} style={selectStyle}>
                            <option value="">— Select a medicine to dispense —</option>
                            {medicines.map(med => {
                                const id = String(med.id ?? med.Id);
                                const inList = profileItems.some(c => c.id === id);
                                return (
                                    <option key={id} value={id} disabled={inList}>
                                        {med.name ?? med.Name}{inList ? ' ✓' : ''}
                                    </option>
                                );
                            })}
                        </select>
                        <button onClick={addToProfile} disabled={!profileMedId} style={addBtn('#5b21b6')}>
                            + Add
                        </button>
                    </div>

                    {/* Pills */}
                    {profileItems.length > 0 && (
                        <div style={pillsRow}>
                            {profileItems.map(item => (
                                <div key={item.id} style={{ ...pill, borderColor: '#ddd6fe' }}>
                                    <b>{item.name}</b>
                                    <span style={pillSub}>({item.ingredientName})</span>
                                    <button onClick={() => removeFromProfile(item.id)} style={removePillBtn}>×</button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            onClick={runProfileCheck}
                            disabled={profileLoading || !selectedPatientId || profileItems.length === 0}
                            style={{ ...primaryBtn('#5b21b6'), opacity: (profileLoading || !selectedPatientId || profileItems.length === 0) ? 0.5 : 1 }}
                        >
                            {profileLoading ? '🔍 Checking...' : '🛡️ Check Against Patient Profile'}
                        </button>
                        {(profileItems.length > 0 || selectedPatientId) &&
                            <button onClick={clearProfile} style={ghostBtn}>Clear All</button>
                        }
                    </div>

                    {/* Profile result */}
                    <ProfileResult result={profileResult} />
                </>
            )}

        </div>
    );
}

// ── Shared result components ──

function ScanResult({ result }) {
    if (!result) return null;
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {result.error && <div style={alertBox('#fef2f2', '#dc2626', '#fecaca')}>⚠️ {result.error}</div>}

            {!result.error && result.safe && (
                <div style={alertBox('#f0fdf4', '#15803d', '#bbf7d0')}>
                    ✅ All Clear — No interactions detected across {result.totalPairsScanned ?? 0} ingredient pair{result.totalPairsScanned !== 1 ? 's' : ''}. Safe to dispense.
                </div>
            )}

            {!result.error && !result.safe && (
                <>
                    <div style={dangerBanner}>
                        🛑 {result.interactions?.length} Interaction{result.interactions?.length > 1 ? 's' : ''} Detected
                        <span style={{ fontSize: '12px', fontWeight: '600', marginLeft: '10px', opacity: 0.8 }}>
                            ({result.totalPairsScanned} pairs scanned)
                        </span>
                    </div>
                    {result.interactions?.map((itx, i) => (
                        <div key={i} style={interactionCard(itx.severity)}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                <SeverityBadge severity={itx.severity} />
                                <span style={{ fontWeight: '800', fontSize: '14px', color: '#1e293b' }}>
                                    {itx.ingredient1} ↔ {itx.ingredient2}
                                </span>
                            </div>
                            <div style={{ fontSize: '14px', color: '#374151', margin: '6px 0' }}>{itx.message}</div>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                                <span style={medTag}>📦 {itx.affectedMedicines1?.join(', ')}</span>
                                <span style={{ color: '#94a3b8', fontWeight: '900' }}>×</span>
                                <span style={medTag}>📦 {itx.affectedMedicines2?.join(', ')}</span>
                            </div>
                        </div>
                    ))}
                </>
            )}
        </div>
    );
}

function ProfileResult({ result }) {
    if (!result) return null;
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {result.error && <div style={alertBox('#fef2f2', '#dc2626', '#fecaca')}>⚠️ {result.error}</div>}

            {!result.error && result.safe && (
                <div style={alertBox('#f0fdf4', '#15803d', '#bbf7d0')}>
                    ✅ Safe to dispense — No conflicts found between the selected medicines and this patient's medication history.
                    {result.note && <div style={{ fontSize: '12px', marginTop: '6px', opacity: 0.8 }}>ℹ️ {result.note}</div>}
                </div>
            )}

            {!result.error && !result.safe && result.interactions?.length > 0 && (
                <>
                    <div style={dangerBanner}>
                        🛑 {result.interactions.length} conflict{result.interactions.length > 1 ? 's' : ''} found with patient's medication history
                    </div>
                    {result.interactions.map((itx, i) => (
                        <div key={i} style={interactionCard(itx.severity)}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                <SeverityBadge severity={itx.severity} />
                                <span style={{ fontWeight: '800', fontSize: '14px', color: '#1e293b' }}>
                                    {itx.newIngredient} ↔ {itx.conflictsWithProfileIngredient}
                                </span>
                            </div>
                            <div style={{ fontSize: '14px', color: '#374151', margin: '6px 0' }}>{itx.message}</div>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                                <span style={{ ...medTag, background: '#f5f3ff', color: '#7c3aed', borderColor: '#ddd6fe' }}>
                                    💊 New: {itx.newMedicine}
                                </span>
                                <span style={{ color: '#94a3b8', fontWeight: '700' }}>conflicts with history →</span>
                                <span style={{ ...medTag, background: '#fef2f2', color: '#dc2626', borderColor: '#fecaca' }}>
                                    📋 Profile: {itx.conflictsWithProfileIngredient}
                                </span>
                            </div>
                        </div>
                    ))}
                </>
            )}
        </div>
    );
}

function SeverityBadge({ severity }) {
    const map = {
        high:   ['#fef2f2', '#dc3545', '#fecaca'],
        medium: ['#fff7ed', '#fd7e14', '#fed7aa'],
        low:    ['#fefce8', '#ca8a04', '#fde68a'],
    };
    const [bg, color, border] = map[severity?.toLowerCase()] ?? ['#f8fafc', '#6c757d', '#e2e8f0'];
    return (
        <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '900', letterSpacing: '1px', background: bg, color, border: `1px solid ${border}` }}>
            {severity?.toUpperCase()} RISK
        </span>
    );
}

// ── Styles ──
const card         = { width: '100%', background: '#f8fafc', padding: '35px', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '20px', boxSizing: 'border-box' };
const headerRow    = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f1f5f9', paddingBottom: '15px', marginBottom: '4px' };
const titleStyle   = { fontSize: '24px', fontWeight: '900', color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '15px' };
const iconBox      = { background: '#f1f5f9', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', fontSize: '22px' };
const subtitleStyle = { fontSize: '11px', fontWeight: '800', color: '#34495e', textTransform: 'uppercase', letterSpacing: '1.5px' };

const tabBar  = { display: 'flex', gap: '8px', background: '#f1f5f9', padding: '6px', borderRadius: '16px' };
const tabBtn  = (active) => ({ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', padding: '12px 16px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: '800', fontSize: '14px', transition: 'all 0.15s ease', background: active ? '#fff' : 'transparent', color: active ? '#1e293b' : '#64748b', boxShadow: active ? '0 2px 8px rgba(0,0,0,0.08)' : 'none' });
const tabBadge = (active) => ({ fontSize: '10px', fontWeight: '700', letterSpacing: '0.5px', color: active ? '#64748b' : '#94a3b8', textTransform: 'uppercase' });
const tabDescription = { margin: 0, fontSize: '13px', color: '#64748b', lineHeight: '1.6', padding: '12px 16px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' };

const capsule      = { display: 'flex', background: '#fff', borderRadius: '16px', padding: '8px', border: '1px solid #cbd5e1', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)', gap: '8px' };
const selectStyle  = { flex: 1, border: 'none', background: 'transparent', padding: '12px 15px', fontSize: '15px', fontWeight: '600', color: '#333', outline: 'none', cursor: 'pointer' };
const addBtn       = (color) => ({ background: `linear-gradient(to bottom, ${color}dd, ${color})`, color: '#fff', padding: '12px 20px', borderRadius: '12px', border: 'none', borderBottom: `3px solid ${color}`, fontSize: '13px', fontWeight: '800', cursor: 'pointer' });
const pillsRow     = { display: 'flex', flexWrap: 'wrap', gap: '10px' };
const pill         = { display: 'flex', alignItems: 'center', gap: '6px', background: '#fff', padding: '8px 14px', borderRadius: '30px', border: '1px solid #cbd5e1', fontSize: '13px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' };
const pillSub      = { color: '#64748b', fontSize: '11px' };
const removePillBtn = { background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '18px', fontWeight: '700', lineHeight: 1, padding: '0 2px' };
const primaryBtn   = (color) => ({ background: `linear-gradient(to bottom, ${color}ee, ${color})`, color: '#fff', padding: '14px 30px', borderRadius: '14px', border: 'none', borderBottom: `3px solid ${color}`, fontSize: '14px', fontWeight: '800', cursor: 'pointer' });
const ghostBtn     = { background: '#f1f5f9', color: '#64748b', padding: '14px 24px', borderRadius: '14px', border: '1px solid #e2e8f0', fontSize: '14px', fontWeight: '700', cursor: 'pointer' };

const alertBox     = (bg, color, border) => ({ padding: '20px', borderRadius: '12px', background: bg, border: `1px solid ${border}`, borderLeft: `6px solid ${color}`, fontWeight: '700', color, fontSize: '15px' });
const dangerBanner = { padding: '14px 20px', borderRadius: '12px', background: '#fef2f2', border: '1px solid #fecaca', fontWeight: '900', color: '#dc2626', fontSize: '16px' };
const interactionCard = (sev) => {
    const colors = { high: '#dc3545', medium: '#fd7e14', low: '#ffc107' };
    return { padding: '18px', borderRadius: '12px', background: '#fff', borderLeft: `6px solid ${colors[sev?.toLowerCase()] ?? '#6c757d'}`, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' };
};
const medTag = { padding: '4px 12px', borderRadius: '8px', background: '#f1f5f9', border: '1px solid #e2e8f0', fontSize: '12px', fontWeight: '700', color: '#475569' };

export default InteractionGuard;