import React, { useState } from 'react';
import axios from 'axios';

function PaymentMethod({ selectedMethod, onMethodChange, onPrepareOnlineOrder, totalAmount }) {
    const [loading, setLoading] = useState(false);

    const methods = [
        { id: 'Cash', label: 'Cash on Delivery', icon: '💵', desc: 'Pay with cash at your doorstep' },
        { id: 'Visa', label: 'Credit / Debit Card', icon: '💳', desc: 'Secure instantaneous online clearance' },
        //{ id: 'Wallet', label: 'Digital Mobile Wallet', icon: '📱', desc: 'Vodafone Cash / Orange Money / Instapay' }
    ];

    const handleConfirmPayment = async () => {
        if (selectedMethod === 'Cash') {
            alert('Cash on Delivery selected successfully! Your order has been placed.');
            return;
        }

        setLoading(true);
        try {
            // 1. Create the online order structure inside SQL database first
            let createdOrder = null;
            if (typeof onPrepareOnlineOrder === 'function') {
                createdOrder = await onPrepareOnlineOrder();
            }

            // 2. Resolve the tracking ID safely for the checkout initialization
            const initialOrderId = localStorage.getItem('lastOnlineOrderItem') || createdOrder?.id || createdOrder?.orderId;

            const orderDetails = {
                MerchantOrderId: initialOrderId || null,
                TotalAmount: totalAmount?.toString() || '0.00',
                CustomerName: localStorage.getItem('savedFullName') || 'Valued Customer',
                CustomerEmail: 'client@pharmacy.com',
                CustomerPhone: localStorage.getItem('savedPhone') || '01000000000'
            };

            console.log("Sending checkout payload:", orderDetails);

            const response = await axios.post('https://localhost:7168/api/Payment/checkout', orderDetails);
            const paymentUrl = response.data?.paymentUrl;

            if (paymentUrl) {
                // 3. Open the Paymob iframe interface in a separate secured tab
                const paymentWindow = window.open(paymentUrl, '_blank');
                 
                // 4. Start the passive tracking loop interval engine
                const timer = setInterval(async () => {
                    if (paymentWindow.closed) {
                        clearInterval(timer); // Break the loop immediately upon detection
                        
                        // FIX: Safely pull the active ID fresh from storage right inside the async scope
                        const activeOrderId = localStorage.getItem('lastOnlineOrderItem') || initialOrderId;

                        try {
                            // Hit the server confirmation state machine to update status
                            await axios.post('https://localhost:7168/api/Payment/confirm', {
                                orderId: parseInt(activeOrderId, 10),
                                success: true, 
                                status: "Processing" 
                            });

                            alert(`🎉 Payment Process Completed! Order #${activeOrderId} is now being processed.`);
                        } catch (confirmError) {
                            console.error("Sub-routine status sync error:", confirmError);
                            alert("Payment window closed. Please refresh your order log history to verify updates.");
                        }
                    }
                }, 1000); 

            } else {
                alert('Failed to initialize payment route. Server did not return a valid checkout URL.');
            }
        } catch (error) {
            console.error('Payment API Integration Error:', error);
            alert('A server connectivity issue occurred. Please check your backend service or try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={containerStyle}>
            <h3 style={titleStyle}>💳 Choose Payment Method</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {methods.map((m) => {
                    const isSelected = selectedMethod === m.id;
                    return (
                        <label
                            key={m.id}
                            style={labelCardStyle(isSelected)}
                            onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.borderColor = '#94a3b8'; }}
                            onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.borderColor = '#cbd5e1'; }}
                        >
                            <input
                                type="radio"
                                name="payment"
                                value={m.id}
                                checked={isSelected}
                                onChange={() => onMethodChange(m.id)}
                                style={radioStyle}
                            />
                            <div style={iconStyle}>{m.icon}</div>
                            <div style={textWrapperStyle}>
                                <div style={labelStyle(isSelected)}>{m.label}</div>
                                <div style={descStyle}>{m.desc}</div>
                            </div>
                        </label>
                    );
                })}
            </div>

            {selectedMethod && (
                <button onClick={handleConfirmPayment} disabled={loading} style={submitButtonStyle(loading)}>
                    {loading ? 'Processing Checkout... Please Wait 🚀' : `Confirm & Pay with ${selectedMethod}`}
                </button>
            )}
        </div>
    );
}

// --- STYLES (Keep intact as your original layout) ---
const containerStyle = { marginTop: '25px', textAlign: 'left', width: '100%', boxSizing: 'border-box' };
const titleStyle = { fontSize: '16px', fontWeight: '800', color: '#1e293b', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '0.5px' };
const labelCardStyle = (isSelected) => ({ display: 'flex', alignItems: 'center', padding: '16px 20px', borderRadius: '14px', border: isSelected ? '2px solid #10b981' : '1px solid #cbd5e1', backgroundColor: isSelected ? '#f0fdf4' : '#ffffff', cursor: 'pointer', transition: 'all 0.15s ease', boxShadow: isSelected ? '0 4px 12px rgba(16, 185, 129, 0.08)' : '0 2px 4px rgba(0,0,0,0.02)', boxSizing: 'border-box' });
const radioStyle = { marginRight: '18px', transform: 'scale(1.25)', accentColor: '#10b981', cursor: 'pointer' };
const iconStyle = { fontSize: '26px', marginRight: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const textWrapperStyle = { display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' };
const labelStyle = (isSelected) => ({ fontWeight: '700', fontSize: '15px', color: isSelected ? '#065f46' : '#1e293b', transition: 'color 0.15s ease' });
const descStyle = { fontSize: '12px', color: '#64748b', fontWeight: '500' };
const submitButtonStyle = (loading) => ({ marginTop: '25px', width: '100%', padding: '14px', backgroundColor: loading ? '#cbd5e1' : '#10b981', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s ease', boxShadow: loading ? 'none' : '0 4px 6px -1px rgba(16, 185, 129, 0.2)' });

export default PaymentMethod;