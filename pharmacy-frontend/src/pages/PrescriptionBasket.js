import React from 'react';

function PrescriptionBasket({ cart, removeFromCart, onCheckout }) {
    if (!cart || cart.length === 0) return null;

    
    const grandTotal = cart.reduce((sum, item) => {
        const itemTotal = item.totalPrice ?? ((item.price ?? 0) * (item.quantity ?? 1));
        return sum + itemTotal;
    }, 0);

    return (
        <div style={uniqueBasketContainer}>
            <div style={sideAccent}></div>

            <div style={contentWrapper}>
                <div style={headerRow}>
                    <h3 style={titleStyle}>
                        <span style={iconCircle}>🛒</span>
                        Prescription Summary
                    </h3>
                    <span style={itemCountBadge}>{cart.length} Items</span>
                </div>

                <table style={modernTable}>
                    <thead>
                        <tr style={tableHeaderRow}>
                            <th style={{ ...thStyle, width: '40%', textAlign: 'left', paddingLeft: '15px' }}>Clinical Item</th>
                            <th style={{ ...thStyle, width: '15%', textAlign: 'center' }}>Qty</th>
                            <th style={{ ...thStyle, width: '25%', textAlign: 'right' }}>Subtotal</th>
                            <th style={{ ...thStyle, width: '20%', textAlign: 'center' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cart.map((item, index) => {
                            const currentPrice = item.totalPrice ?? ((item.price ?? 0) * (item.quantity ?? 1));

                            return (
                                <tr key={item.cartId || item.id || item.Id || index} style={tableRow}>
                                    <td style={medNameCell}>{item.name}</td>
                                    <td style={qtyCell}>{item.quantity}x</td>
                                    <td style={priceCell}>{currentPrice.toFixed(2)} EGP</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <button
                                            onClick={() => removeFromCart(item.cartId || item.id || item.Id)}
                                            style={iconRemoveBtn}
                                            title="Remove Item"
                                        >
                                            <span style={{ fontSize: '14px' }}>🗑️</span>
                                            <span style={{ fontSize: '10px', fontWeight: '900', marginLeft: '4px' }}>DELETE</span>
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                <div style={footerSection}>
                    <div style={totalContainer}>
                        <span style={totalLabel}>Order Total</span>
                        <h2 style={totalValue}>
                            {grandTotal.toFixed(2)} <span style={{ fontSize: '14px' }}>EGP</span>
                        </h2>
                    </div>
                    <button onClick={onCheckout} style={uniqueConfirmBtn}>
                        Finalize & Issue Invoice ⚡
                    </button>
                </div>
            </div>
        </div>
    );
}

// ---  STYLES ---
const uniqueBasketContainer = {
    display: 'flex',
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    maxWidth: '1050px',
    margin: '20px auto 40px auto',
    boxShadow: '0 15px 35px rgba(0,0,0,0.08)',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
};

const sideAccent = {
    width: '10px',
    background: 'linear-gradient(to bottom, #ff9f43, #ff6b6b)',
};

const contentWrapper = { flex: 1, padding: '30px' };

const headerRow = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '15px'
};

const titleStyle = { fontSize: '22px', fontWeight: '900', color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' };
const iconCircle = { backgroundColor: '#fff7ed', padding: '8px', borderRadius: '10px', border: '1px solid #ffedd5' };
const itemCountBadge = { backgroundColor: '#f1f5f9', color: '#64748b', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '800' };
const modernTable = { width: '100%', borderCollapse: 'collapse' };
const thStyle = { fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1.5px', paddingBottom: '15px' };
const tableRow = { borderBottom: '1px solid #f8fafc' };
const medNameCell = { padding: '15px', fontWeight: '700', color: '#334155', textAlign: 'left' };
const qtyCell = { textAlign: 'center', color: '#64748b', fontWeight: '600' };
const priceCell = { textAlign: 'right', fontWeight: '800', color: '#10b981', paddingRight: '5px' };

const iconRemoveBtn = {
    backgroundColor: '#fee2e2',
    color: '#ef4444',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '6px 10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    margin: '0 auto'
};

const footerSection = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '30px' };
const totalContainer = { display: 'flex', flexDirection: 'column', gap: '4px' };
const totalLabel = { fontSize: '12px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' };
const totalValue = { margin: 0, fontSize: '36px', color: '#1e293b', fontWeight: '900', letterSpacing: '-1px' };

const uniqueConfirmBtn = {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    padding: '18px 45px',
    borderRadius: '14px',
    border: 'none',
    borderBottom: '5px solid #047857',
    fontSize: '16px',
    fontWeight: '900',
    cursor: 'pointer',
    boxShadow: '0 10px 20px rgba(16, 185, 129, 0.25)',
    transition: 'transform 0.1s ease',
    textTransform: 'uppercase'
};

const tableHeaderRow = {
    textAlign: 'left',
    display: 'table-row'
};

export default PrescriptionBasket;