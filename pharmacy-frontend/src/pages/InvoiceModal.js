import React from 'react';


function InvoiceModal({ invoice, onClose }) {
    if (!invoice) return null;

    console.log("Rendering Invoice Modal with data:", invoice);
    console.log("hhhh");

    const handlePrint = () => {
        window.print();
    };

    return (
        <div style={overlayStyle}>
            <div id="printable-invoice" style={modalStyle}>
                {/* --- RECEIPT HEADER --- */}
                <div style={{ borderBottom: '2px solid #28a745', marginBottom: '20px', paddingBottom: '10px' }}>
                    <h2 style={{ margin: 0, color: '#28a745' }}>✚ Smart Pharmacy</h2>
                    <p style={{ fontSize: '12px', color: '#666', margin: '5px 0' }}>Official Transaction Receipt</p>
                </div>

                <div style={{ textAlign: 'left', marginBottom: '20px', fontSize: '14px' }}>
                    <p><strong>Date:</strong> {invoice.date}</p>
                    <p><strong>Customer:</strong> {invoice.patient || 'Walk-in Customer'}</p>
                    {invoice.address && <p><strong>Delivery To:</strong> {invoice.address}</p>}
                </div>

                {/* --- ITEMS TABLE --- */}
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #eee' }}>
                            <th style={thStyle}>Medicine</th>
                            <th style={thStyle}>Qty</th>
                            <th style={{ ...thStyle, textAlign: 'right' }}>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoice.items.map((item, index) => (
                            <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={tdStyle}>{item.name}</td>
                                <td style={tdStyle}>{item.quantity}</td>
                                <td style={{ ...tdStyle, textAlign: 'right' }}>{item.totalPrice.toFixed(2)} EGP</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* --- FOOTER & TOTAL --- */}
                <div style={{ textAlign: 'right', marginTop: '20px' }}>
                    <h3 style={{ margin: 0, fontSize: '22px' }}>Total: {invoice.total.toFixed(2)} EGP</h3>
                    <p style={{ fontSize: '11px', color: '#999', marginTop: '10px' }}>Payment via: {invoice.paymentMethod || 'Cash'}</p>
                    <p style={{ fontSize: '12px' }}>Thank you for choosing Smart Pharmacy!</p>
                </div>

                {/* --- ACTIONS (Hidden during print) --- */}
                <div className="no-print" style={{ marginTop: '30px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button onClick={handlePrint} style={printBtnStyle}>🖨️ Print Receipt</button>
                    <button onClick={onClose} style={closeBtnStyle}>Close</button>
                </div>
            </div>
        </div>
    );
}

// --- Styles ---
const overlayStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 };
const modalStyle = { backgroundColor: 'white', color: 'black', padding: '40px', borderRadius: '15px', width: '450px', boxShadow: '0 15px 35px rgba(0,0,0,0.5)', position: 'relative' };
const thStyle = { padding: '10px', textAlign: 'left', fontSize: '13px', color: '#888' };
const tdStyle = { padding: '12px 10px', fontSize: '15px' };
const printBtnStyle = { backgroundColor: '#28a745', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const closeBtnStyle = { backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' };

export default InvoiceModal;