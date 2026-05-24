import React, { useState, useEffect } from 'react';
import { pharmacyApi } from '../services/apiService';

function Suppliers({ userRole, suppliers = [], medicines = [], refreshSuppliers, refreshMedicines }) {
    // --- 1. DATA STATES ---
    const [supplierData, setSupplierData] = useState({ name: '', phone: '', contactPerson: '', email: '', address: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [purchaseHistory, setPurchaseHistory] = useState([]);
    const [order, setOrder] = useState({ medicineId: '', supplierId: '', quantity: 0, costPrice: 0 });

    useEffect(() => {
        fetchPurchaseHistory();
    }, []);

    const fetchPurchaseHistory = async () => {
        try {
            const response = await pharmacyApi.getPurchaseHistory();
            setPurchaseHistory(response.data || []);
        } catch (error) {
            console.error("Supply history fetch error trace:", error);
        }
    };

    const resetForm = () => {
        setSupplierData({ name: '', phone: '', contactPerson: '', email: '', address: '' });
        setIsEditing(false);
        setEditId(null);
    };

    const handleSaveSupplier = async () => {
        if (!supplierData.name) return alert("⚠️ Supplier Company Name is required!");

        const currentId = editId;
        const payload = {
            ...supplierData,
            id: currentId,
            Id: currentId
        };

        try {
            if (isEditing) {
                await pharmacyApi.updateSupplier(currentId, payload);
                alert("✅ Supplier Updated Successfully!");
            } else {
                await pharmacyApi.addSupplier(supplierData);
                alert("✅ Supplier Registered Successfully!");
            }
            refreshSuppliers();
            resetForm();
        } catch (error) {
            alert("❌ Database transaction failed. Check the backend connection.");
        }
    };

    const handleEditClick = (s) => {
        const id = s.id ?? s.Id;
        setSupplierData({
            name: s.name ?? s.Name ?? '',
            phone: s.phone ?? s.Phone ?? '',
            contactPerson: s.contactPerson ?? s.ContactPerson ?? '',
            email: s.email ?? s.Email ?? '',
            address: s.address ?? s.Address ?? ''
        });
        setEditId(id);
        setIsEditing(true);
    };

    const toggleSupplierStatus = async (supplier) => {
        const targetId = supplier.id || supplier.Id;
        const currentStatus = supplier.isActive ?? supplier.IsActive ?? true;
        const newStatus = !currentStatus;

        if (!window.confirm(`Are you sure you want to ${newStatus ? 'Enable' : 'Disable'} this supplier?`)) return;

        try {
            const payload = {
                ...supplier,
                id: targetId,
                Id: targetId,
                isActive: newStatus,
                IsActive: newStatus
            };

            await pharmacyApi.updateSupplier(targetId, payload);
            refreshSuppliers();
            alert(`✅ Supplier status modified safely.`);
        } catch (error) {
            console.error("Supplier Toggle Error:", error);
            alert("❌ Failed to update supplier status.");
        }
    };

    const handleRecordShipment = async () => {
        if (!order.medicineId || !order.supplierId || !order.quantity) return alert("⚠️ Fill all fields mandatory fields.");
        try {
            await pharmacyApi.recordShipment({
                medicineId: parseInt(order.medicineId, 10),
                supplierId: parseInt(order.supplierId, 10),
                quantityReceived: parseInt(order.quantity, 10),
                costPrice: parseFloat(order.costPrice || 0)
            });
            fetchPurchaseHistory();
            refreshMedicines();
            setOrder({ medicineId: '', supplierId: '', quantity: 0, costPrice: 0 });
            alert("✅ Stock shipment successfully registered!");
        } catch (e) {
            alert("❌ Failed to record incoming shipment values.");
        }
    };

    return (
        <div style={containerStyle}>
            {/* VIEW HEADER */}
            <div style={viewHeaderContainer}>
                <div style={accentBar}></div>
                <div style={textContainer}>
                    <h2 style={viewTitleStyle}>🚚 Suppliers Management</h2>
                    <p style={viewSubtitleStyle}>Manage partners and track incoming inventory logs</p>
                </div>
            </div>

            {/* 1. REGISTRATION DOCK */}
            <div style={registrationDockStyle(isEditing)}>
                <h2 style={{ color: '#0ea5e9', marginBottom: '25px', fontSize: '20px', fontWeight: '900' }}>
                    {isEditing ? "📝 MODIFY PARTNER INFO" : "➕ REGISTER NEW SUPPLIER"}
                </h2>

                <span style={sectionLabel}>Corporate Identity</span>
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '25px' }}>
                    <input placeholder="Company Name" value={supplierData.name} onChange={e => setSupplierData({ ...supplierData, name: e.target.value })} style={modernInput} />
                    <input placeholder="Manager/Contact Person" value={supplierData.contactPerson} onChange={e => setSupplierData({ ...supplierData, contactPerson: e.target.value })} style={modernInput} />
                </div>

                <span style={sectionLabel}>Contact Channels & Location</span>
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '25px' }}>
                    <input placeholder="Phone" value={supplierData.phone} onChange={e => setSupplierData({ ...supplierData, phone: e.target.value })} style={modernInput} />
                    <input placeholder="Email" value={supplierData.email} onChange={e => setSupplierData({ ...supplierData, email: e.target.value })} style={modernInput} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
                    <input placeholder="Office Address" value={supplierData.address} onChange={e => setSupplierData({ ...supplierData, address: e.target.value })} style={{ ...modernInput, width: '100%', maxWidth: '815px' }} />
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button onClick={handleSaveSupplier} style={{ ...saveBtnStyle, background: isEditing ? '#f59e0b' : 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)' }}>
                        {isEditing ? "SAVE CHANGES" : "COMMIT PARTNER TO SYSTEM"}
                    </button>
                    {isEditing && <button onClick={resetForm} style={cancelBtnStyle}>CANCEL</button>}
                </div>
            </div>

            {/* 2. SHIPMENT DOCK */}
            <div style={shipmentDockStyle}>
                <h3 style={{ color: '#2563eb', fontWeight: '900', marginTop: 0, marginBottom: '20px' }}>📥 INCOMING STOCK SHIPMENT</h3>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <select value={order.medicineId} onChange={(e) => setOrder({ ...order, medicineId: e.target.value })} style={modernSelect}>
                        <option value="">-- Select Medicine --</option>
                        {medicines?.map(m => {
                            const id = m.id ?? m.Id;
                            return <option key={id} value={id}>{m.name ?? m.Name}</option>;
                        })}
                    </select>
                    <select value={order.supplierId} onChange={(e) => setOrder({ ...order, supplierId: e.target.value })} style={modernSelect}>
                        <option value="">-- Select Supplier --</option>
                        {suppliers?.map(s => {
                            const id = s.id ?? s.Id;
                            return <option key={id} value={id}>{s.name ?? s.Name}</option>;
                        })}
                    </select>
                    <input type="number" placeholder="Qty" value={order.quantity || ''} onChange={(e) => setOrder({ ...order, quantity: e.target.value })} style={{ ...modernInput, minWidth: '80px', flex: '0.5' }} />
                    <input type="number" placeholder="Cost (EGP)" value={order.costPrice || ''} onChange={(e) => setOrder({ ...order, costPrice: e.target.value })} style={{ ...modernInput, minWidth: '120px', flex: '0.5' }} />
                    <button onClick={handleRecordShipment} style={confirmShipmentBtn}>CONFIRM & UPDATE STOCK</button>
                </div>
            </div>

            {/* 3. ACTIVE SUPPLIERS LIST */}
            <div style={{ marginBottom: '50px' }}>
                <h3 style={{ color: '#1e293b', fontWeight: '900', marginBottom: '20px' }}>🚚 Active Partners</h3>
                <div style={{ ...tableWrapperStyle, maxWidth: '1150px', margin: '0 auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={{ ...tableHeaderStyle, width: '30%' }}>Company & Manager</th>
                                <th style={{ ...tableHeaderStyle, width: '25%' }}>Contact Channels</th>
                                <th style={{ ...tableHeaderStyle, width: '25%' }}>Office Address</th>
                                <th style={{ ...tableHeaderStyle, width: '20%' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {suppliers.map((s, index) => {
                                const currentId = s.id ?? s.Id;
                                const isInactive = s.isActive === false || s.IsActive === false;

                                const compName = s.name ?? s.Name ?? 'Unknown Distributor';
                                const manager = s.contactPerson ?? s.ContactPerson ?? 'N/A';
                                const phone = s.phone ?? s.Phone ?? 'N/A';
                                const email = s.email ?? s.Email ?? 'N/A';
                                const address = s.address ?? s.Address ?? 'N/A';

                                return (
                                    <tr key={currentId} style={{
                                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc',
                                        opacity: isInactive ? 0.6 : 1
                                    }}>
                                        <td style={tableCellStyle}>
                                            <div style={{ fontWeight: '900', color: isInactive ? '#94a3b8' : '#0f172a', fontSize: '17px' }}>
                                                {compName} {isInactive && "(Disabled)"}
                                            </div>
                                            <div style={{ color: '#64748b', fontSize: '13px' }}>👤 {manager}</div>
                                        </td>
                                        <td style={tableCellStyle}>
                                            <div style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{phone}</div>
                                            <div style={{ fontSize: '12px', color: '#3b82f6' }}>{email}</div>
                                        </td>
                                        <td style={{ ...tableCellStyle, fontSize: '14px', color: '#64748b' }}>📍 {address}</td>
                                        <td style={tableCellStyle}>
                                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                                <button onClick={() => handleEditClick(s)} style={actionBtnStyle('#3b82f6')}>
                                                    <span>✏️</span> <span>Edit</span>
                                                </button>

                                                {userRole?.toLowerCase().includes('admin') && (
                                                    <button
                                                        onClick={() => toggleSupplierStatus(s)}
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
            </div>

            {/* 4. SHIPMENT HISTORY TABLE */}
            <div style={{ paddingBottom: '60px' }}>
                <h3 style={{ color: '#1e293b', fontWeight: '900', marginBottom: '20px' }}>📜 Supply & Purchase History</h3>
                <div style={{ ...tableWrapperStyle, maxWidth: '1150px', margin: '0 auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={{ ...tableHeaderStyle, backgroundColor: '#334155', color: '#fff' }}>Date</th>
                                <th style={{ ...tableHeaderStyle, backgroundColor: '#334155', color: '#fff' }}>Medicine</th>
                                <th style={{ ...tableHeaderStyle, backgroundColor: '#334155', color: '#fff' }}>Supplier</th>
                                <th style={{ ...tableHeaderStyle, backgroundColor: '#334155', color: '#fff' }}>Qty Received</th>
                                <th style={{ ...tableHeaderStyle, backgroundColor: '#334155', color: '#fff' }}>Total Cost</th>
                            </tr>
                        </thead>
                        <tbody>
                            {purchaseHistory.length > 0 ? (
                                purchaseHistory.map((h, index) => {
                                    const dateVal = h.orderDate ?? h.OrderDate;
                                    const medName = h.medicineName ?? h.MedicineName ?? 'Unknown';
                                    const supName = h.supplierName ?? h.SupplierName ?? 'Unknown';
                                    const qty = h.quantityReceived ?? h.QuantityReceived ?? 0;
                                    const cost = h.costPrice ?? h.CostPrice ?? 0;

                                    return (
                                        <tr key={h.id || index} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                                            <td style={tableCellStyle}>{dateVal ? new Date(dateVal).toLocaleDateString() : 'N/A'}</td>
                                            <td style={{ ...tableCellStyle, fontWeight: '900', color: '#0f172a' }}>{medName}</td>
                                            <td style={tableCellStyle}>{supName}</td>
                                            <td style={{ ...tableCellStyle, fontWeight: 'bold' }}>{qty}</td>
                                            <td style={{ ...tableCellStyle, color: '#10b981', fontWeight: '900' }}>{Number(cost).toFixed(2)} EGP</td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '50px', color: '#94a3b8', fontSize: '16px' }}>
                                        No shipment records found in the archive.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// ---  STYLES ---
const containerStyle = { width: '95%', margin: '20px auto', paddingBottom: '50px' };
const viewHeaderContainer = { display: 'flex', alignItems: 'center', padding: '10px 0', marginBottom: '25px' };
const accentBar = { width: '6px', height: '35px', backgroundColor: '#0ea5e9', borderRadius: '10px', marginRight: '15px' };
const textContainer = { textAlign: 'left' };
const viewTitleStyle = { fontSize: '24px', fontWeight: '900', color: '#1e293b', margin: 0 };
const viewSubtitleStyle = { fontSize: '13px', color: '#64748b', margin: 0 };

const registrationDockStyle = (isEditing) => ({
    backgroundColor: isEditing ? '#fffbeb' : '#f8fafc',
    padding: '35px', borderRadius: '24px', border: '1px solid #e2e8f0',
    boxShadow: '0 10px 25px rgba(0,0,0,0.03)', marginBottom: '30px', textAlign: 'center'
});

const shipmentDockStyle = {
    backgroundColor: '#eff6ff', padding: '30px', borderRadius: '24px',
    border: '2px dashed #3b82f6', marginBottom: '40px', textAlign: 'center'
};

const sectionLabel = { fontSize: '11px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '15px', display: 'block' };

const modernInput = { padding: '14px 18px', borderRadius: '14px', border: '1px solid #cbd5e1', flex: 1, minWidth: '250px', fontSize: '15px', fontWeight: '600', backgroundColor: '#fff', boxSizing: 'border-box' };
const modernSelect = { padding: '14px 18px', borderRadius: '14px', border: '1px solid #3b82f6', minWidth: '200px', fontSize: '14px', fontWeight: '800', color: '#1e40af', backgroundColor: '#fff', cursor: 'pointer' };

const saveBtnStyle = { color: 'white', padding: '15px 40px', borderRadius: '15px', border: 'none', cursor: 'pointer', fontWeight: '900', fontSize: '14px', boxShadow: '0 4px 15px rgba(14, 165, 233, 0.2)' };
const cancelBtnStyle = { padding: '15px 30px', backgroundColor: '#64748b', color: 'white', border: 'none', borderRadius: '15px', cursor: 'pointer', fontWeight: '800' };
const confirmShipmentBtn = { backgroundColor: '#2563eb', color: 'white', padding: '14px 30px', borderRadius: '14px', border: 'none', cursor: 'pointer', fontWeight: '900', fontSize: '13px' };

const tableWrapperStyle = { backgroundColor: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' };
const tableHeaderStyle = { padding: '20px 15px', backgroundColor: '#f1f5f9', color: '#475569', fontSize: '13px', fontWeight: '900', textTransform: 'uppercase', textAlign: 'center', borderBottom: '3px solid #cbd5e1' };
const tableCellStyle = { padding: '22px 15px', fontSize: '16px', color: '#334155', textAlign: 'center', verticalAlign: 'middle', borderBottom: '1px solid #f1f5f9' };

const actionBtnStyle = (color) => ({
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 16px', borderRadius: '12px',
    backgroundColor: `${color}15`, color: color, border: `1.5px solid ${color}30`, cursor: 'pointer', fontWeight: '800', fontSize: '12px', transition: '0.2s'
});

export default Suppliers;