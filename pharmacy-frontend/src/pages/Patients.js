import React, { useState } from 'react';
import { pharmacyApi } from '../services/apiService';

function Patients({ patients = [], refreshPatients, userRole }) {
    // --- DATA STATES ---
    const [patientName, setPatientName] = useState('');
    const [patientPhone, setPatientPhone] = useState('');
    const [patientEmail, setPatientEmail] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [selectedHistory, setSelectedHistory] = useState([]);

    const resetForm = () => {
        setPatientName('');
        setPatientPhone('');
        setPatientEmail('');
        setIsEditing(false);
        setEditId(null);
    };

    
    const handleSave = async () => {
        if (!patientPhone) return alert("Validation Error: Phone Number is required!");

        const payload = {
            id: isEditing ? editId : 0,
            fullName: patientName.trim() || "Unknown Patient",
            phoneNumber: patientPhone.trim(),
            email: patientEmail.trim() || null,
            isActive: true
        };

        try {
            if (isEditing) {
                await pharmacyApi.updatePatient(editId, payload);
                alert("✅ Patient Profile Updated Successfully!");
            } else {
                await pharmacyApi.addPatient(payload);
                alert("✅ Patient Registered Successfully!");
            }
            refreshPatients(); 
            resetForm();
        } catch (error) {
            console.error("Patient insertion fail log:", error.response?.data);
            alert("❌ Operation Failed: Verify if this phone number is already registered.");
        }
    };

    const handleEditClick = (p) => {
        const id = p.id ?? p.Id;
        setPatientName(p.fullName ?? p.FullName ?? "");
        setPatientPhone(p.phoneNumber ?? p.PhoneNumber ?? "");
        setPatientEmail(p.email ?? p.Email ?? "");
        setEditId(id);
        setIsEditing(true);
    };

    const togglePatientStatus = async (patient) => {
        const targetId = patient.id ?? patient.Id;
        const currentStatus = patient.isActive ?? patient.IsActive ?? true;
        const newStatus = !currentStatus;

        if (!window.confirm(`Are you sure you want to ${newStatus ? 'Enable' : 'Disable'} this patient profile?`)) return;

        try {
            const payload = {
                ...patient,
                id: targetId,
                Id: targetId,
                isActive: newStatus,
                IsActive: newStatus
            };

            await pharmacyApi.updatePatient(targetId, payload);
            await refreshPatients();
            alert(`✅ Patient status modified successfully.`);
        } catch (error) {
            console.error("Patient Toggle Error:", error);
            alert("❌ Failed to alter profile activation state.");
        }
    };

    const viewHistory = async (p) => {
        const id = p.id ?? p.Id;
        setSelectedPatient(p);
        try {
            const res = await pharmacyApi.getPatientHistory(id);
            setSelectedHistory(res.data || []);
        } catch (e) {
            setSelectedHistory([]);
            console.error("History fetch compilation trace:", e);
        }
    };

    return (
        <div style={containerStyle}>
            {/* VIEW HEADER CONTAINER */}
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
                    {isEditing ? "📝 MODIFY PATIENT PROFILE" : "➕ REGISTER NEW PATIENT"}
                </h2>

                <span style={sectionLabel}>Personal Identity</span>
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '25px' }}>
                    <input placeholder="Full Name" value={patientName} onChange={(e) => setPatientName(e.target.value)} style={modernInput} />
                </div>

                <span style={sectionLabel}>Contact Channels</span>
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '30px' }}>
                    <input placeholder="Phone (Required)" value={patientPhone} onChange={(e) => setPatientPhone(e.target.value)} style={modernInput} />
                    <input placeholder="Email (Optional)" value={patientEmail} onChange={(e) => setPatientEmail(e.target.value)} style={modernInput} />
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button onClick={handleSave} style={{
                        ...saveBtnStyle(isEditing),
                        padding: '15px 40px',
                        borderRadius: '15px',
                        fontSize: '16px',
                        background: isEditing ? '#f59e0b' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        boxShadow: '0 4px 15px rgba(16, 185, 129, 0.2)'
                    }}>
                        {isEditing ? "💾 SAVE CHANGES" : "🚀 COMMIT TO SYSTEM"}
                    </button>
                    {isEditing && <button onClick={resetForm} style={cancelBtnStyle}>CANCEL</button>}
                </div>
            </div>

            {/* MAIN PATIENTS TABLE */}
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
                            const currentId = p.id ?? p.Id;
                            const isInactive = p.isActive === false || p.IsActive === false;
                            const fullName = p.fullName ?? p.FullName ?? 'Unknown Patient';
                            const phone = p.phoneNumber ?? p.PhoneNumber ?? 'N/A';

                            return (
                                <tr key={currentId} style={{
                                    backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc',
                                    opacity: isInactive ? 0.6 : 1
                                }}>
                                    <td style={{ ...tableCellStyle, color: '#94a3b8', fontWeight: 'bold' }}>{currentId}</td>

                                    <td style={{ ...tableCellStyle, fontWeight: '900', color: isInactive ? '#94a3b8' : '#0f172a', fontSize: '19px' }}>
                                        {fullName} {isInactive && <span style={{ fontSize: '12px', color: '#ef4444' }}> (Disabled)</span>}
                                    </td>

                                    <td style={{ ...tableCellStyle, fontFamily: 'monospace', letterSpacing: '1px' }}>
                                        {phone}
                                    </td>

                                    <td style={tableCellStyle}>
                                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', alignItems: 'center' }}>
                                            <button onClick={() => viewHistory(p)} style={actionBtnStyle('#0ea5e9')}>
                                                <span>📜</span> <span>History</span>
                                            </button>

                                            <button onClick={() => handleEditClick(p)} style={actionBtnStyle('#3b82f6')}>
                                                <span>✏️</span> <span>Edit</span>
                                            </button>

                                            {userRole?.toLowerCase().includes('admin') && (
                                                <button
                                                    onClick={() => togglePatientStatus(p)}
                                                    style={actionBtnStyle(isInactive ? '#10b981' : '#ef4444')}
                                                >
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

            {/* HISTORY CLINICAL LOG ENGINE PANEL */}
            {selectedPatient && (
                <div style={historyBoxStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0, color: '#1e293b' }}>📋 Purchase Log: {selectedPatient.fullName ?? selectedPatient.FullName}</h3>
                        <button onClick={() => setSelectedPatient(null)} style={closeBtnStyle}>Close Log</button>
                    </div>
                    <div style={tableWrapperStyle}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
                            <thead>
                                <tr>
                                    <th style={tableHeaderStyle}>Date</th>
                                    <th style={tableHeaderStyle}>Medicine</th>
                                    <th style={tableHeaderStyle}>Qty</th>
                                    <th style={tableHeaderStyle}>Total Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedHistory.length > 0 ? (
                                    selectedHistory.map((h, index) => {
                                        const stamp = h.purchaseDate ?? h.PurchaseDate;
                                        const medName = h.medicineName ?? h.MedicineName ?? 'Unknown Product';
                                        const qty = h.quantity ?? h.Quantity ?? 0;
                                        const price = h.totalPrice ?? h.TotalPrice ?? 0;

                                        return (
                                            <tr key={h.id || index} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                                                <td style={tableCellStyle}>{stamp ? new Date(stamp).toLocaleDateString() : 'N/A'}</td>
                                                <td style={{ ...tableCellStyle, fontWeight: '800' }}>{medName}</td>
                                                <td style={tableCellStyle}>{qty}x</td>
                                                <td style={{ ...tableCellStyle, color: '#10b981', fontWeight: '900' }}>{Number(price).toFixed(2)} EGP</td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontWeight: '600' }}>
                                            No prior transaction logs compiled under this patient's scope.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

// --- STYLE ---
const containerStyle = { width: '95%', margin: '20px auto', paddingBottom: '50px' };
const viewHeaderContainer = { display: 'flex', alignItems: 'center', padding: '10px 0', marginBottom: '25px' };
const accentBar = { width: '6px', height: '35px', backgroundColor: '#7e22ce', borderRadius: '10px', marginRight: '15px' };
const textContainer = { textAlign: 'left' };
const viewTitleStyle = { fontSize: '24px', fontWeight: '900', color: '#1e293b', margin: 0 };
const viewSubtitleStyle = { fontSize: '13px', color: '#64748b', margin: 0 };

const registrationDockStyle = (isEditing) => ({
    backgroundColor: isEditing ? '#fffbeb' : '#f8fafc',
    padding: '30px',
    borderRadius: '24px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 10px 25px rgba(0,0,0,0.03)',
    marginBottom: '40px',
    textAlign: 'center'
});
const sectionLabel = { fontSize: '11px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '15px', display: 'block' };
const modernInput = { padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', flex: 1, minWidth: '200px', fontSize: '14px', fontWeight: '600', backgroundColor: '#fff', boxSizing: 'border-box' };
const tableWrapperStyle = { backgroundColor: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' };
const tableHeaderStyle = { padding: '18px 15px', backgroundColor: '#f1f5f9', color: '#475569', fontSize: '15px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1.5px', textAlign: 'center', borderBottom: '3px solid #cbd5e1', borderRight: '1px solid #cbd5e1' };
const tableCellStyle = { padding: '20px 15px', fontSize: '16px', color: '#334155', textAlign: 'center', verticalAlign: 'middle', borderBottom: '1px solid #f1f5f9', borderRight: '1px solid #f1f5f9' };

const actionBtnStyle = (color) => ({
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 18px', borderRadius: '15px',
    backgroundColor: `${color}15`, color: color, border: `1.5px solid ${color}30`, cursor: 'pointer', gap: '8px', transition: '0.3s all', fontWeight: '800', fontSize: '13px'
});

const saveBtnStyle = (isEditing) => ({ backgroundColor: isEditing ? '#f59e0b' : '#10b981', color: 'white', padding: '12px 25px', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '900', fontSize: '14px' });
const cancelBtnStyle = { padding: '12px 25px', backgroundColor: '#64748b', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '800' };
const historyBoxStyle = { marginTop: '40px', padding: '30px', backgroundColor: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' };
const closeBtnStyle = { backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontWeight: '900' };

export default Patients;