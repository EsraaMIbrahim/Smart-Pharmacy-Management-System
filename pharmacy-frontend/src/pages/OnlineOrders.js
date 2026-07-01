import React, { useState, useEffect } from 'react';
import { pharmacyApi } from '../services/apiService'; // Importing your existing shared API services handler

function OnlineOrders({ setView }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('All');

    // Fetch all pharmacy orders on component lifecycle mount
    useEffect(() => {
        const fetchAllOrders = async () => {
            try {
                // Invoking the global service architecture mapping for admin panels
                const response = await pharmacyApi.getAllOrders();
                setOrders(response.data);
            } catch (error) {
                console.error("Admin Orders Fetch Error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAllOrders();
    }, []);

    // Handles the core finite state machine transition logic for orders processing
    const handleStatusTransition = async (orderId, nextStatus) => {
        const check = window.confirm(`Are you sure you want to mark Order #${orderId} as ${nextStatus}?`);
        if (!check) return;

        try {
            // Structuring payload strictly matching the C# PaymentConfirmationRequest model
            const payload = {
                orderId: orderId,
                success: nextStatus !== 'Cancelled', // Fails safely if marked as Cancelled
                status: nextStatus
            };

            await pharmacyApi.confirmOrderUpdate(payload);

            // Dynamically update local component state arrays to mirror changes instantly
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order.id === orderId ? { ...order, status: nextStatus } : order
                )
            );
            alert(`Order #${orderId} has been successfully updated to ${nextStatus}.`);
        } catch (error) {
            console.error("Status Update Error:", error);
            alert("Failed to update order status. Please check server logs.");
        }
    };
    

    // Filter tabular views based on active selected filter state tab
    const filteredOrders = filterStatus === 'All'
        ? orders
        : orders.filter(order => order.status === filterStatus);

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>⏳ Loading pharmacy orders pipeline...</div>;

    return (
        <div style={containerStyle}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <h2 style={{ color: '#333', fontSize: '28px', marginBottom: '10px' }}>📋 Staff Order Management Dashboard</h2>
                <p style={{ color: '#666', marginBottom: '30px' }}>Review incoming prescriptions, manage dispensations, and change delivery workflows.</p>

                {/* Filter Management Tab Controls */}
                <div style={filterBarStyle}>
                    {['All', 'Pending', 'Processing', 'Delivered', 'Cancelled'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            style={{
                                ...filterBtnStyle,
                                ...(filterStatus === status ? activeFilterBtnStyle : {})
                            }}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                <div style={tableWrapperStyle}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ backgroundColor: '#f8fafc' }}>
                            <tr style={headerRowStyle}>
                                <th style={thStyle}>Order ID</th>
                                <th style={thStyle}>Date</th>
                                <th style={thStyle}>Medicine Item</th>
                                <th style={thStyle}>Total Paid</th>
                                <th style={thStyle}>Current Status</th>
                                <th style={{ ...thStyle, textAlign: 'center' }}>Management Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.length > 0 ? (
                                filteredOrders.map((order) => (
                                    <tr key={order.id} style={rowStyle}>
                                        <td style={{ ...tdStyle, fontWeight: 'bold' }}>#{order.id}</td>
                                        <td style={tdStyle}>{new Date(order.orderDate).toLocaleDateString()}</td>
                                        <td style={tdStyle}>
                                            <span style={{ fontWeight: '600' }}>{order.medicineName || 'N/A'}</span>
                                            {order.quantity ? ` (x${order.quantity})` : ''}
                                        </td>
                                        <td style={{ ...tdStyle, fontWeight: 'bold', color: '#28a745' }}>
                                            {order.totalPrice?.toFixed(2)} EGP
                                        </td>
                                        <td style={tdStyle}>
                                            <span style={statusBadgeStyle(order.status)}>
                                                {order.status === 'Delivered' ? '✅ Delivered' : '🚚 ' + order.status}
                                            </span>
                                        </td>
                                        <td style={actionsCellStyle}>
                                            {/* Contextual Action Workflows matching state guards strictly */}
                                            {order.status === 'Pending' && (
                                                <>
                                                    <button onClick={() => handleStatusTransition(order.id, 'Processing')} style={{ ...actionBtnStyle, backgroundColor: '#0dcaf0', color: '#000' }}>
                                                        Prepare
                                                    </button>
                                                    {/*
                                                    <button onClick={() => handleStatusTransition(order.id, 'Cancelled')} style={{ ...actionBtnStyle, backgroundColor: '#dc3545', color: '#fff' }}>
                                                        Cancel
                                                    </button>
                                                    */}
                                                </>
                                            )}

                                            {order.status === 'Processing' && (
                                                <>
                                                    <button onClick={() => handleStatusTransition(order.id, 'Delivered')} style={{ ...actionBtnStyle, backgroundColor: '#198754', color: '#fff' }}>
                                                        Deliver
                                                    </button>
                                                    {/*
                                                    <button onClick={() => handleStatusTransition(order.id, 'Cancelled')} style={{ ...actionBtnStyle, backgroundColor: '#dc3545', color: '#fff' }}>
                                                        Cancel
                                                    </button>
                                                    */}
                                                </>
                                            )}

                                            {/* Terminated and completed states are locked down for tracking integrity */}
                                            {(order.status === 'Delivered' || order.status === 'Cancelled') && (
                                                <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '14px' }}>Done</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" style={emptyCellStyle}>
                                        No active orders found matching the filter criteria.
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

// --- Shared CSS UI Styling layout configurations ---
const containerStyle = { padding: '40px', backgroundColor: '#f4f7f6', minHeight: '100vh', width: '100%', boxSizing: 'border-box', color: 'black' };
const tableWrapperStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', overflowX: 'auto' };
const headerRowStyle = { borderBottom: '2px solid #eee', textAlign: 'left', backgroundColor: '#fafafa' };
const thStyle = { padding: '20px 10px', color: '#475569', fontSize: '16px', fontWeight: '800', textAlign: 'left' };
const tdStyle = { padding: '20px 10px', textAlign: 'left', borderBottom: '1px solid #f1f5f9', fontSize: '15px', color: '#1e293b' };
const rowStyle = { transition: 'background 0.2s' };
const emptyCellStyle = { padding: '50px', textAlign: 'center', color: '#999', fontSize: '16px' };

const filterBarStyle = { display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' };
const filterBtnStyle = { padding: '10px 20px', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontWeight: 'bold', color: '#475569', transition: 'all 0.2s' };
const activeFilterBtnStyle = { background: '#1e293b', color: '#fff', borderColor: '#1e293b' };

const actionsCellStyle = { padding: '20px 10px', display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' };
const actionBtnStyle = { padding: '8px 16px', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' };

const statusBadgeStyle = (status) => ({
    backgroundColor: status === 'Delivered' ? '#d4edda' : status === 'Processing' ? '#cce5ff' : status === 'Cancelled' ? '#f8d7da' : '#fff3cd',
    color: status === 'Delivered' ? '#155724' : status === 'Processing' ? '#004085' : status === 'Cancelled' ? '#721c24' : '#856404',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
    display: 'inline-block'
});

export default OnlineOrders;