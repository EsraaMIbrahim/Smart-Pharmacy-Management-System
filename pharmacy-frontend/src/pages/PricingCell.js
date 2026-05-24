import React from 'react';
import { calculateDiscountDetails } from '../pages/PricingEngine';

function PricingCell({
    med,
    userRole,
    onApplyDiscount,
    dismissedSuggestions,
    onDismiss,
    onManualPriceChange
}) {
    const currentId = med?.id ?? med?.Id;
    const currentPrice = Number(med?.price ?? med?.Price ?? 0);

    
    const rawBasePrice = med?.basePrice ?? med?.BasePrice;
    const basePrice = Number(rawBasePrice || currentPrice);

    const expiryValue = med?.expiryDate ?? med?.ExpiryDate;

    const { suggestedPrice, hasRisk } = calculateDiscountDetails(basePrice, expiryValue);

    const isDismissed = dismissedSuggestions.includes(currentId);
    const needsAction = hasRisk && !isDismissed && currentPrice > suggestedPrice;

    const handlePriceInputChange = (valString) => {
        if (valString === '') {
            onManualPriceChange(currentId, 0);
            return;
        }
        const parsedVal = parseFloat(valString);
        if (!isNaN(parsedVal)) {
            onManualPriceChange(currentId, parsedVal);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            {needsAction ? (
                /* --- STYLE A: THE SMART DECISION INTERFACE --- */
                <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <input
                            type="number"
                            value={med?.price ?? med?.Price ?? ''}
                            disabled={userRole === 'Staff'}
                            onChange={(e) => handlePriceInputChange(e.target.value)}
                            style={{
                                width: '90px',
                                padding: '8px',
                                borderRadius: '10px',
                                border: '2px solid #ffc107',
                                backgroundColor: userRole === 'Staff' ? '#f1f5f9' : '#ffffff',
                                cursor: userRole === 'Staff' ? 'not-allowed' : 'text',
                                fontWeight: '900',
                                textAlign: 'center',
                                color: '#1e293b',
                                outline: 'none'
                            }}
                        />
                        <span style={{ fontSize: '12px', fontWeight: '900', color: '#64748b' }}>EGP</span>
                    </div>
                    <div style={riskBoxStyle}>
                        <span style={{ color: '#92400e', fontWeight: '900', fontSize: '15px', display: 'block', marginBottom: '4px' }}>⚠️ EXPIRY RISK</span>
                        <div style={{ marginBottom: '8px', color: '#1e293b', fontWeight: '800' }}>
                            Suggest: <strong style={{ color: '#059669', fontSize: '15px' }}>{suggestedPrice}</strong>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                            {userRole === 'Admin' || userRole === 'Pharmacist' ? (
                                <>
                                    <button
                                        onClick={() => onApplyDiscount(med)}
                                        style={acceptBtn}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#10b98140'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b98120'}
                                    >
                                        Accept
                                    </button>
                                    <button
                                        onClick={() => onDismiss(currentId)}
                                        style={discardBtn}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ef444440'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef444420'}
                                    >
                                        Discard
                                    </button>
                                </>
                            ) : (
                                <div style={pendingStyle}>Pending Approval...</div>
                            )}
                        </div>
                    </div>
                </>
            ) : (
                /* --- STYLE B: THE PERMANENT PROFESSIONAL VIEW --- */
                <div style={{ padding: '10px', textAlign: 'center' }}>
                    <span style={{ fontSize: '18px', fontWeight: '900', color: '#1e293b' }}>
                        {currentPrice.toFixed(2)}
                    </span>
                    <span style={{ fontSize: '11px', marginLeft: '6px', fontWeight: '700', color: '#94a3b8' }}>EGP</span>
                    {basePrice > currentPrice && (
                        <div style={badgeStyle}>
                            ✨ {(((basePrice - currentPrice) / basePrice) * 100).toFixed(0)}% DISCOUNT APPLIED
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ---  STYLES  ---
const riskBoxStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    backgroundColor: '#fffbeb',
    padding: '14px',
    borderRadius: '16px',
    border: '1px solid #fef3c7',
    marginTop: '10px',
    position: 'relative',
    width: '100%',
    maxWidth: '180px',
    boxSizing: 'border-box',
    textAlign: 'center'
};

const acceptBtn = {
    flex: 1,
    backgroundColor: '#10b98120',
    color: '#10b981',
    border: 'none',
    borderRadius: '10px',
    padding: '8px',
    cursor: 'pointer',
    fontWeight: '900',
    fontSize: '11px',
    textTransform: 'uppercase',
    transition: 'all 0.2s ease'
};

const discardBtn = {
    flex: 1,
    backgroundColor: '#ef444420',
    color: '#ef4444',
    border: 'none',
    borderRadius: '10px',
    padding: '8px',
    cursor: 'pointer',
    fontWeight: '900',
    fontSize: '11px',
    textTransform: 'uppercase',
    transition: 'all 0.2s ease'
};

const pendingStyle = {
    flex: 1,
    textAlign: 'center',
    color: '#92400e',
    fontSize: '10px',
    fontWeight: '800',
    fontStyle: 'italic',
    padding: '8px',
    backgroundColor: '#fef3c7',
    borderRadius: '8px',
    textTransform: 'uppercase'
};

const badgeStyle = {
    marginTop: '10px',
    backgroundColor: '#f0fdf4',
    color: '#166534',
    fontSize: '10px',
    fontWeight: '900',
    padding: '5px 12px',
    borderRadius: '12px',
    border: '1px solid #dcfce7',
    letterSpacing: '0.5px'
};

export default PricingCell;