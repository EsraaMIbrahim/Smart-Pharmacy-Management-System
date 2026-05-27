import React, { useState } from 'react';
import axios from 'axios';

function PaymentMethod({ selectedMethod, onMethodChange, onPrepareOnlineOrder, totalAmount }) {
    // State to handle UI loading behavior during API network requests
    const [loading, setLoading] = useState(false);

    // Standard checkout channels with English localizations
    const methods = [
        { id: 'Cash', label: 'Cash on Delivery', icon: '💵', desc: 'Pay with cash at your doorstep' },
        { id: 'Visa', label: 'Credit / Debit Card', icon: '💳', desc: 'Secure instantaneous online clearance' },
        { id: 'Wallet', label: 'Digital Mobile Wallet', icon: '📱', desc: 'Vodafone Cash / Orange Money / Instapay' }
    ];

    /**
     * Handles the checkout submission process by communicating with the .NET Core backend.
     */
    const handleConfirmPayment = async () => {
        // Guard clause: If the user selects Cash on Delivery, bypass the online payment gateway
        if (selectedMethod === 'Cash') {
            alert('Cash on Delivery selected successfully! Your order has been placed.');
            return;
        }

        setLoading(true);
        try {
            // Ensure the online order record is created before redirecting to the payment gateway
            let createdOrder = null;
            if (typeof onPrepareOnlineOrder === 'function') {
                createdOrder = await onPrepareOnlineOrder();
            }

            const orderDetails = {
                MerchantOrderId: localStorage.getItem('lastOnlineOrderItem') || createdOrder?.id || createdOrder?.orderId || null,
                TotalAmount: totalAmount?.toString() || '0.00',
                CustomerName: localStorage.getItem('savedFullName') || 'Valued Customer',
                CustomerEmail: 'client@pharmacy.com',
                CustomerPhone: localStorage.getItem('savedPhone') || '01000000000'
            };

            console.log(orderDetails);

            const response = await axios.post('https://localhost:7168/api/Payment/checkout', orderDetails);
            const paymentUrl = response.data?.paymentUrl;

            if (paymentUrl) {
                window.location.href = paymentUrl;
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
            <h3 style={titleStyle}>
                💳 Choose Payment Method
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {methods.map((m) => {
                    const isSelected = selectedMethod === m.id;

                    return (
                        <label
                            key={m.id}
                            style={labelCardStyle(isSelected)}
                            onMouseEnter={(e) => {
                                if (!isSelected) e.currentTarget.style.borderColor = '#94a3b8';
                            }}
                            onMouseLeave={(e) => {
                                if (!isSelected) e.currentTarget.style.borderColor = '#cbd5e1';
                            }}
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

            {/* CTA Submit Button - Conditional Rendering based on active selection */}
            {selectedMethod && (
                <button
                    onClick={handleConfirmPayment}
                    disabled={loading}
                    style={submitButtonStyle(loading)}
                >
                    {loading ? 'Processing Checkout... Please Wait 🚀' : `Confirm & Pay with ${selectedMethod}`}
                </button>
            )}
        </div>
    );
}

// --- STYLES ---
const containerStyle = { 
    marginTop: '25px', 
    textAlign: 'left', 
    width: '100%', 
    boxSizing: 'border-box' 
};

const titleStyle = { 
    fontSize: '16px', 
    fontWeight: '800', 
    color: '#1e293b', 
    marginBottom: '15px', 
    textTransform: 'uppercase', 
    letterSpacing: '0.5px' 
};

const labelCardStyle = (isSelected) => ({ 
    display: 'flex', 
    alignItems: 'center', 
    padding: '16px 20px', 
    borderRadius: '14px', 
    border: isSelected ? '2px solid #10b981' : '1px solid #cbd5e1', 
    backgroundColor: isSelected ? '#f0fdf4' : '#ffffff', 
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    boxShadow: isSelected ? '0 4px 12px rgba(16, 185, 129, 0.08)' : '0 2px 4px rgba(0,0,0,0.02)',
    boxSizing: 'border-box'
});

const radioStyle = { 
    marginRight: '18px', 
    transform: 'scale(1.25)', 
    accentColor: '#10b981', 
    cursor: 'pointer' 
};

const iconStyle = { 
    fontSize: '26px', 
    marginRight: '15px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center' 
};

const textWrapperStyle = { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '2px', 
    textAlign: 'left' 
};

const labelStyle = (isSelected) => ({ 
    fontWeight: '700', 
    fontSize: '15px', 
    color: isSelected ? '#065f46' : '#1e293b', 
    transition: 'color 0.15s ease' 
});

const descStyle = { 
    fontSize: '12px', 
    color: '#64748b', 
    fontWeight: '500' 
};

const submitButtonStyle = (loading) => ({ 
    marginTop: '25px', 
    width: '100%', 
    padding: '14px', 
    backgroundColor: loading ? '#cbd5e1' : '#10b981', 
    color: 'white', 
    border: 'none', 
    borderRadius: '12px', 
    fontSize: '16px', 
    fontWeight: '700', 
    cursor: loading ? 'not-allowed' : 'pointer', 
    transition: 'all 0.2s ease', 
    boxShadow: loading ? 'none' : '0 4px 6px -1px rgba(16, 185, 129, 0.2)' 
});

export default PaymentMethod;