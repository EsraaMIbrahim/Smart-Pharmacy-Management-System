import React, { useState, useEffect } from 'react';
import { pharmacyApi } from '../services/apiService';


function OrderHistory({ userId, setView }) {
    const [myOrders, setMyOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!userId) return;
            try {
                const response = await pharmacyApi.getMyHistory(userId);
                setMyOrders(response.data);
            } catch (error) {
                console.error("Order Fetch Error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [userId]);

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>⏳ Loading your orders from database...</div>;

    return (
        <div style={containerStyle}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <h2 style={{ color: '#333', fontSize: '28px', marginBottom: '10px' }}>📦 My Online Orders</h2>
                <p style={{ color: '#666', marginBottom: '30px' }}>Track your recent pharmacy purchases and delivery status.</p>

                <div style={tableWrapperStyle}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ backgroundColor: '#f8fafc' }}>
                            <tr style={headerRowStyle}>
                                <th style={thStyle}>Date</th>
                                <th style={thStyle}>Medicine Item</th> {/* Adjusted header label */}
                                <th style={thStyle}>Delivery Address</th>
                                <th style={thStyle}>Payment Method</th>
                                <th style={thStyle}>Total Paid</th>
                                <th style={thStyle}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myOrders.length > 0 ? (
                                myOrders.map((order) => (
                                    <tr key={order.id} style={rowStyle}>
                                        <td style={tdStyle}>{new Date(order.orderDate).toLocaleDateString()}</td>

                                        {/* 🔗 ADJUSTED: Directly maps the camelCase property coming from our API record row */}
                                        <td style={tdStyle}>
                                            {order.medicineName || 'N/A'}
                                            {order.quantity ? ` (x${order.quantity})` : ''}
                                        </td>

                                        <td style={tdStyle}>{order.shippingAddress || 'N/A'}</td>
                                        <td style={tdStyle}>
                                            {order.paymentMethod === 'Cash' && (
                                                <span style={{ color: '#059669', fontWeight: 'bold' }}>💵 Cash</span>
                                            )}
                                            {order.paymentMethod === 'Visa' && (
                                                <span style={{ color: '#2563eb', fontWeight: 'bold' }}>💳 Card</span>
                                            )}
                                            {order.paymentMethod === 'Wallet' && (
                                                <span style={{ color: '#7c3aed', fontWeight: 'bold' }}>📱 Wallet</span>
                                            )}
                                        </td>
                                        <td style={{ ...tdStyle, fontWeight: 'bold', color: '#28a745' }}>
                                            {order.totalPrice?.toFixed(2)} EGP
                                        </td>
                                        <td style={tdStyle}>
                                            <span style={statusBadgeStyle(order.status)}>
                                                {order.status === 'Delivered' ? '✅ Delivered' : '🚚 ' + order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" style={emptyCellStyle}>
                                        No orders found yet. Start shopping to see your history!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <button onClick={() => setView('client_store')} style={backBtnStyle}>
                    ⬅ Back to Shopping
                </button>
            </div>
        </div>
    );
}

// --- STYLES  ---
const containerStyle = {
    padding: '40px',
    backgroundColor: '#f4f7f6',
    minHeight: '100vh',
    width: '100%',
    boxSizing: 'border-box',
    color: 'black'
};

const tableWrapperStyle = {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '15px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    overflowX: 'auto'
};

const headerRowStyle = { borderBottom: '2px solid #eee', textAlign: 'left', backgroundColor: '#fafafa' };
const thStyle = { padding: '20px 10px', color: '#475569', fontSize: '17px', fontWeight: '800', letterSpacing: '1px', textAlign: 'left', textTransform: 'uppercase' };
const tdStyle = { padding: '20px 10px', textAlign: 'left', borderBottom: '1px solid #f1f5f9', fontSize: '16px', color: '#1e293b', fontWeight: '500' };
const rowStyle = { transition: 'background 0.2s' };
const emptyCellStyle = { padding: '50px', textAlign: 'center', color: '#999' };
const backBtnStyle = {
    marginTop: '30px',
    padding: '12px 25px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold'
};

const statusBadgeStyle = (status) => ({
    backgroundColor: status === 'Delivered' ? '#d4edda' : '#fff3cd',
    color: status === 'Delivered' ? '#155724' : '#856404',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
    display: 'inline-block'
});

export default OrderHistory;