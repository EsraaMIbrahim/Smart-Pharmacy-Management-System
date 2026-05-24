import React from 'react';

function PaymentMethod({ selectedMethod, onMethodChange }) {
    // Standard localized checkout channels
    const methods = [
        { id: 'Cash', label: 'Cash on Delivery', icon: '💵', desc: 'Pay with cash at your doorstep' },
        { id: 'Visa', label: 'Credit / Debit Card', icon: '💳', desc: 'Secure instantaneous online clearance' },
        { id: 'Wallet', label: 'Digital Mobile Wallet', icon: '📱', desc: 'Vodafone Cash / Orange Money / Instapay' }
    ];

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
    gap: '2px'
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

export default PaymentMethod;