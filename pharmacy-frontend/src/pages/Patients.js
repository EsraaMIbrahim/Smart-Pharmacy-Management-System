import React, { useState, useEffect } from 'react';
import { pharmacyApi } from '../services/apiService';

function Patients({ patients = [], refreshPatients, userRole }) {

    // --- DATA STATES ---
    const [patientName, setPatientName]   = useState('');
    const [patientPhone, setPatientPhone] = useState('');
    const [patientEmail, setPatientEmail] = useState('');
    const [isEditing, setIsEditing]       = useState(false);
    const [editId, setEditId]             = useState(null);

    // ── History panel states ──
    const [selectedPatient, setSelectedPatient]   = useState(null);
    const [selectedHistory, setSelectedHistory]   = useState([]);

    // ──  Profile Safety Check states ──
    const [allMedicines, setAllMedicines]         = useState([]);
    const [selectedMedIds, setSelectedMedIds]     = useState([]);   // medicines chosen to dispense
    const [profileScanResult, setProfileScanResult] = useState(null);
    const [profileScanLoading, setProfileScanLoading] = useState(false);

    // Load medicines once for the dispense selector
    useEffect(() => {
        pharmacyApi.getMedicines()
            .then(res => setAllMedicines(res.data || []))
            .catch(() => {});
    }, []);

    // ── Helpers ──
    const resetForm = () => {
        setPatientName(''); setPatientPhone(''); setPatientEmail('');
        setIsEditing(false); setEditId(null);
    };

    const resetPanel = () => {
        setSelectedPatient(null);
        setSelectedHistory([]);
        setSelectedMedIds([]);
        setProfileScanResult(null);
    };

    const handleSave = async () => {
        if (!patientPhone) return alert('Validation Error: Phone Number is required!');
        const payload = {
            id: isEditing ? editId : 0,
            fullName: patientName.trim() || 'Unknown Patient',
            phoneNumber: patientPhone.trim(),
            email: patientEmail.trim() || null,
            isActive: true
        };
        try {
            if (isEditing) {
                await pharmacyApi.updatePatient(editId, payload);
                alert('✅ Patient Profile Updated Successfully!');
            } else {
                await pharmacyApi.addPatient(payload);
                alert('✅ Patient Registered Successfully!');
            }
            refreshPatients();
            resetForm();
        } catch (error) {
            console.error('Patient save error:', error.response?.data);
            alert('❌ Operation Failed: Verify if this phone number is already registered.');
        }
    };

    const handleEditClick = (p) => {
        const id = p.id ?? p.Id;
        setPatientName(p.fullName ?? p.FullName ?? '');
        setPatientPhone(p.phoneNumber ?? p.PhoneNumber ?? '');
        setPatientEmail(p.email ?? p.Email ?? '');
        setEditId(id);
        setIsEditing(true);
    };

    const togglePatientStatus = async (patient) => {
        const targetId = patient.id ?? patient.Id;
        const currentStatus = patient.isActive ?? patient.IsActive ?? true;
        const newStatus = !currentStatus;
        if (!window.confirm(`Are you sure you want to ${newStatus ? 'Enable' : 'Disable'} this patient profile?`)) return;
        try {
            await pharmacyApi.updatePatient(targetId, { ...patient, id: targetId, Id: targetId, isActive: newStatus, IsActive: newStatus });
            await refreshPatients();
            alert('✅ Patient status modified successfully.');
        } catch (error) {
            console.error('Toggle error:', error);
            alert('❌ Failed to alter profile activation state.');
        }
    };

    // ── Open history panel ──
    const viewHistory = async (p) => {
        const id = p.id ?? p.Id;
        setSelectedPatient(p);
        setSelectedMedIds([]);
        setProfileScanResult(null);
        try {
            const res = await pharmacyApi.getPatientHistory(id);
            setSelectedHistory(res.data || []);
        } catch (e) {
            setSelectedHistory([]);
            console.error('History fetch error:', e);
        }
    };

    // ── toggle a medicine in the dispense selector ──
    const toggleMedSelection = (medId) => {
        setSelectedMedIds(prev =>
            prev.includes(medId)
                ? prev.filter(id => id !== medId)
                : [...prev, medId]
        );
        setProfileScanResult(null); // clear old result on change
    };

    // ──  run profile safety check ──
    const runProfileCheck = async () => {
        if (!selectedPatient || selectedMedIds.length === 0) return;
        setProfileScanLoading(true);
        setProfileScanResult(null);
        try {
            const patientId = selectedPatient.id ?? selectedPatient.Id;
            const res = await pharmacyApi.checkAgainstProfile(patientId, selectedMedIds);
            setProfileScanResult(res.data);
        } catch (e) {
            setProfileScanResult({ error: 'Could not connect to Safety Engine.' });
        } finally {
            setProfileScanLoading(false);
        }
    };

    // ── Severity color helper ──
    const sevColor = (s) => ({ high: '#dc3545', medium: '#fd7e14', low: '#ffc107' }[s?.toLowerCase()] ?? '#6c757d');

    return (
        <div style={containerStyle}>

            {/* HEADER */}
            <div style={viewHeaderContainer}>
                <div style={accentBar}></div>
                <div style={textContainer}>
                    <h2 style={viewTitleStyle}>👥 Patient Management</h2>
                    <p style={viewSubtitleStyle}>Monitor chronic purchase history and contact profiles</p>
                </div>
            </div>

            {/* REGISTRATION DOCK */}
            <div style={registrationDockStyle(isEditing)}>
                <h2 style={{ color: '#7e22ce', marginBottom: '25px', fontSize: '20px', fontWeight: '900' }}>
                    {isEditing ? '📝 MODIFY PATIENT PROFILE' : '➕ REGISTER NEW PATIENT'}
                </h2>
                <span style={sectionLabel}>Personal Identity</span>
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '25px' }}>
                    <input placeholder="Full Name" value={patientName} onChange={e => setPatientName(e.target.value)} style={modernInput} />
                </div>
                <span style={sectionLabel}>Contact Channels</span>
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '30px' }}>
                    <input placeholder="Phone (Required)" value={patientPhone} onChange={e => setPatientPhone(e.target.value)} style={modernInput} />
                    <input placeholder="Email (Optional)"  value={patientEmail} onChange={e => setPatientEmail(e.target.value)} style={modernInput} />
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button onClick={handleSave} style={{ ...saveBtnStyle(isEditing), padding: '15px 40px', borderRadius: '15px', fontSize: '16px', background: isEditing ? '#f59e0b' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 4px 15px rgba(16,185,129,0.2)' }}>
                        {isEditing ? '💾 SAVE CHANGES' : '🚀 COMMIT TO SYSTEM'}
                    </button>
                    {isEditing && <button onClick={resetForm} style={cancelBtnStyle}>CANCEL</button>}
                </div>
            </div>

            {/* PATIENTS TABLE */}
            <div style={{ ...tableWrapperStyle, maxWidth: '1100px', margin: '0 auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={{ ...tableHeaderStyle, width: '10%' }}>ID</th>
                            <th style={{ ...tableHeaderStyle, width: '40%' }}>Patient Name</th>
                            <th style={{ ...tableHeaderStyle, width: '25%' }}>Contact Number</th>
                            <th style={{ ...tableHeaderStyle, width: '25%' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {patients.map((p, index) => {
                            const currentId  = p.id ?? p.Id;
                            const isInactive = p.isActive === false || p.IsActive === false;
                            const fullName   = p.fullName ?? p.FullName ?? 'Unknown Patient';
                            const phone      = p.phoneNumber ?? p.PhoneNumber ?? 'N/A';

                            return (
                                <tr key={currentId} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc', opacity: isInactive ? 0.6 : 1 }}>
                                    <td style={{ ...tableCellStyle, color: '#94a3b8', fontWeight: 'bold' }}>{currentId}</td>
                                    <td style={{ ...tableCellStyle, fontWeight: '900', color: isInactive ? '#94a3b8' : '#0f172a', fontSize: '19px' }}>
                                        {fullName} {isInactive && <span style={{ fontSize: '12px', color: '#ef4444' }}>(Disabled)</span>}
                                    </td>
                                    <td style={{ ...tableCellStyle, fontFamily: 'monospace', letterSpacing: '1px' }}>{phone}</td>
                                    <td style={tableCellStyle}>
                                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', alignItems: 'center' }}>
                                            <button onClick={() => viewHistory(p)} style={actionBtnStyle('#0ea5e9')}>
                                                <span>📜</span><span>History</span>
                                            </button>
                                            <button onClick={() => handleEditClick(p)} style={actionBtnStyle('#3b82f6')}>
                                                <span>✏️</span><span>Edit</span>
                                            </button>
                                            {userRole?.toLowerCase().includes('admin') && (
                                                <button onClick={() => togglePatientStatus(p)} style={actionBtnStyle(isInactive ? '#10b981' : '#ef4444')}>
                                                    <span>{isInactive ? '🔓' : '🚫'}</span>
                                                    <span>{isInactive ? 'Enable' : 'Disable'}</span>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* ── PATIENT PROFILE PANEL ── */}
            {selectedPatient && (
                <div style={historyBoxStyle}>

                    {/* Panel header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <div>
                            <h3 style={{ margin: 0, color: '#1e293b', fontSize: '20px', fontWeight: '900' }}>
                                👤 {selectedPatient.fullName ?? selectedPatient.FullName}
                            </h3>
                            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
                                📞 {selectedPatient.phoneNumber ?? selectedPatient.PhoneNumber}
                            </span>
                        </div>
                        <button onClick={resetPanel} style={closeBtnStyle}>✕ Close</button>
                    </div>

                    {/* ── PURCHASE HISTORY LOG ── */}
                    <div style={sectionDivider}>
                        <span style={sectionChip('#0ea5e9')}>📋 Medication History</span>
                    </div>

                    <div style={{ ...tableWrapperStyle, marginBottom: '32px' }}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                            <thead>
                                <tr>
                                    <th style={tableHeaderStyle}>Date</th>
                                    <th style={tableHeaderStyle}>Medicine</th>
                                    <th style={tableHeaderStyle}>Qty</th>
                                    <th style={tableHeaderStyle}>Total Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedHistory.length > 0 ? selectedHistory.map((h, index) => {
                                    const stamp   = h.purchaseDate ?? h.PurchaseDate;
                                    const medName = h.medicineName ?? h.MedicineName ?? 'Unknown';
                                    const qty     = h.quantity ?? h.Quantity ?? 0;
                                    const price   = h.totalPrice ?? h.TotalPrice ?? 0;
                                    return (
                                        <tr key={h.id || index} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                                            <td style={tableCellStyle}>{stamp ? new Date(stamp).toLocaleDateString() : 'N/A'}</td>
                                            <td style={{ ...tableCellStyle, fontWeight: '800' }}>{medName}</td>
                                            <td style={tableCellStyle}>{qty}x</td>
                                            <td style={{ ...tableCellStyle, color: '#10b981', fontWeight: '900' }}>{Number(price).toFixed(2)} EGP</td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontWeight: '600' }}>
                                            No prior transaction logs found for this patient.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* ── PROFILE SAFETY CHECK ── */}
                    <div style={sectionDivider}>
                        <span style={sectionChip('#7c3aed')}>🛡️ Profile Safety Check</span>
                        <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '10px' }}>
                            Select medicines to dispense — we'll check them against this patient's history
                        </span>
                    </div>

                    {/* Medicine multi-selector */}
                    <div style={medicineGrid}>
                        {allMedicines
                            .filter(m => (m.isActive ?? m.IsActive) !== false && (m.stockQuantity ?? m.StockQuantity ?? 0) > 0)
                            .sort((a, b) => (a.name ?? a.Name ?? '').localeCompare(b.name ?? b.Name ?? ''))
                            .map(med => {
                                const id       = med.id ?? med.Id;
                                const name     = med.name ?? med.Name ?? 'Unknown';
                                const ingName  = med.ingredient?.name ?? med.Ingredient?.Name ?? '—';
                                const selected = selectedMedIds.includes(id);
                                return (
                                    <div
                                        key={id}
                                        onClick={() => toggleMedSelection(id)}
                                        style={medSelectCard(selected)}
                                    >
                                        <div style={{ fontWeight: '800', fontSize: '13px', color: selected ? '#7c3aed' : '#1e293b' }}>
                                            {name}
                                        </div>
                                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px' }}>
                                            🧬 {ingName}
                                        </div>
                                        {selected && (
                                            <div style={selectedTick}>✓</div>
                                        )}
                                    </div>
                                );
                            })
                        }
                    </div>

                    {/* Selected medicines summary + scan button */}
                    {selectedMedIds.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', margin: '16px 0', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>
                                {selectedMedIds.length} medicine{selectedMedIds.length > 1 ? 's' : ''} selected
                            </span>
                            <button
                                onClick={runProfileCheck}
                                disabled={profileScanLoading}
                                style={{ ...profileScanBtn, opacity: profileScanLoading ? 0.6 : 1 }}
                            >
                                {profileScanLoading ? '🔍 Checking...' : '🛡️ Check Against Patient Profile'}
                            </button>
                            <button
                                onClick={() => { setSelectedMedIds([]); setProfileScanResult(null); }}
                                style={clearSelBtn}
                            >
                                Clear
                            </button>
                        </div>
                    )}

                    {/* Scan result */}
                    {profileScanResult && (
                        <div style={{ marginTop: '8px' }}>
                            {profileScanResult.error && (
                                <div style={resultAlert('#fef2f2', '#dc2626', '#fecaca')}>
                                    ⚠️ {profileScanResult.error}
                                </div>
                            )}

                            {!profileScanResult.error && profileScanResult.safe && (
                                <div style={resultAlert('#f0fdf4', '#15803d', '#bbf7d0')}>
                                    ✅ Safe to dispense — No conflicts found between the selected medicines and this patient's medication history.
                                    {profileScanResult.note && (
                                        <div style={{ fontSize: '12px', marginTop: '6px', opacity: 0.8 }}>
                                            ℹ️ {profileScanResult.note}
                                        </div>
                                    )}
                                </div>
                            )}

                            {!profileScanResult.error && !profileScanResult.safe && profileScanResult.interactions?.length > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <div style={resultAlert('#fef2f2', '#dc2626', '#fecaca')}>
                                        🛑 {profileScanResult.interactions.length} conflict{profileScanResult.interactions.length > 1 ? 's' : ''} found with patient's medication history
                                    </div>
                                    {profileScanResult.interactions.map((itx, i) => (
                                        <div key={i} style={interactionCard(sevColor(itx.severity))}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                                <span style={sevBadge(itx.severity)}>
                                                    {itx.severity?.toUpperCase()} RISK
                                                </span>
                                                <span style={{ fontWeight: '900', fontSize: '14px', color: '#1e293b' }}>
                                                    {itx.newIngredient} ↔ {itx.conflictsWithProfileIngredient}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: '14px', color: '#374151', margin: '8px 0' }}>
                                                {itx.message}
                                            </div>
                                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '12px' }}>
                                                <span style={conflictTag('#7c3aed', '#f5f3ff')}>
                                                    💊 New: {itx.newMedicine}
                                                </span>
                                                <span style={{ color: '#94a3b8', fontWeight: '700' }}>conflicts with history →</span>
                                                <span style={conflictTag('#dc2626', '#fef2f2')}>
                                                    📋 Profile: {itx.conflictsWithProfileIngredient}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                </div>
            )}
        </div>
    );
}

// ── Styles ──
const containerStyle         = { width: '95%', margin: '20px auto', paddingBottom: '50px' };
const viewHeaderContainer    = { display: 'flex', alignItems: 'center', padding: '10px 0', marginBottom: '25px' };
const accentBar              = { width: '6px', height: '35px', backgroundColor: '#7e22ce', borderRadius: '10px', marginRight: '15px' };
const textContainer          = { textAlign: 'left' };
const viewTitleStyle         = { fontSize: '24px', fontWeight: '900', color: '#1e293b', margin: 0 };
const viewSubtitleStyle      = { fontSize: '13px', color: '#64748b', margin: 0 };
const sectionLabel           = { fontSize: '11px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '15px', display: 'block' };
const modernInput            = { padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', flex: 1, minWidth: '200px', fontSize: '14px', fontWeight: '600', backgroundColor: '#fff', boxSizing: 'border-box' };
const tableWrapperStyle      = { backgroundColor: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' };
const tableHeaderStyle       = { padding: '18px 15px', backgroundColor: '#f1f5f9', color: '#475569', fontSize: '15px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1.5px', textAlign: 'center', borderBottom: '3px solid #cbd5e1', borderRight: '1px solid #cbd5e1' };
const tableCellStyle         = { padding: '20px 15px', fontSize: '16px', color: '#334155', textAlign: 'center', verticalAlign: 'middle', borderBottom: '1px solid #f1f5f9', borderRight: '1px solid #f1f5f9' };
const historyBoxStyle        = { marginTop: '40px', padding: '30px', backgroundColor: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' };
const closeBtnStyle          = { backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '8px 18px', borderRadius: '10px', cursor: 'pointer', fontWeight: '900' };
const sectionDivider         = { display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 16px 0' };
const sectionChip            = (color) => ({ padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '900', backgroundColor: `${color}15`, color, border: `1px solid ${color}30` });
const medicineGrid           = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px', marginBottom: '8px' };
const medSelectCard          = (selected) => ({ position: 'relative', padding: '12px 14px', borderRadius: '12px', border: `2px solid ${selected ? '#7c3aed' : '#e2e8f0'}`, backgroundColor: selected ? '#f5f3ff' : '#fff', cursor: 'pointer', transition: 'all 0.15s ease', boxShadow: selected ? '0 0 0 3px #7c3aed20' : 'none' });
const selectedTick           = { position: 'absolute', top: '8px', right: '10px', color: '#7c3aed', fontWeight: '900', fontSize: '14px' };
const profileScanBtn         = { background: 'linear-gradient(to bottom, #7c3aed, #5b21b6)', color: '#fff', padding: '12px 24px', borderRadius: '12px', border: 'none', borderBottom: '3px solid #4c1d95', fontSize: '14px', fontWeight: '800', cursor: 'pointer' };
const clearSelBtn            = { background: '#f1f5f9', color: '#64748b', padding: '12px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '13px', fontWeight: '700', cursor: 'pointer' };
const resultAlert            = (bg, color, border) => ({ padding: '16px 20px', borderRadius: '12px', background: bg, border: `1px solid ${border}`, borderLeft: `6px solid ${color}`, fontWeight: '700', color, fontSize: '14px' });
const interactionCard        = (color) => ({ padding: '16px', borderRadius: '12px', background: '#fff', borderLeft: `6px solid ${color}`, border: `1px solid #e2e8f0`, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '4px' });
const sevBadge               = (sev) => { const m = { high: ['#fef2f2','#dc3545','#fecaca'], medium: ['#fff7ed','#fd7e14','#fed7aa'], low: ['#fefce8','#ca8a04','#fde68a'] }; const [bg,c,b] = m[sev?.toLowerCase()] ?? ['#f8fafc','#6c757d','#e2e8f0']; return { padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '900', letterSpacing: '1px', background: bg, color: c, border: `1px solid ${b}` }; };
const conflictTag            = (color, bg) => ({ padding: '4px 12px', borderRadius: '8px', background: bg, color, fontWeight: '800', border: `1px solid ${color}20` });
const registrationDockStyle  = (isEditing) => ({ backgroundColor: isEditing ? '#fffbeb' : '#f8fafc', padding: '30px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(0,0,0,0.03)', marginBottom: '40px', textAlign: 'center' });
const actionBtnStyle         = (color) => ({ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 18px', borderRadius: '15px', backgroundColor: `${color}15`, color, border: `1.5px solid ${color}30`, cursor: 'pointer', gap: '8px', transition: '0.3s all', fontWeight: '800', fontSize: '13px' });
const saveBtnStyle           = (isEditing) => ({ backgroundColor: isEditing ? '#f59e0b' : '#10b981', color: 'white', padding: '12px 25px', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '900', fontSize: '14px' });
const cancelBtnStyle         = { padding: '12px 25px', backgroundColor: '#64748b', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '800' };

export default Patients;