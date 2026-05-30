import React, { useState } from 'react';
import AlternativeMatcher from '../pages/AlternativeMatcher';
import InteractionGuard from '../pages/InteractionGuard';
import PaymentMethod from '../pages/PaymentMethod';

function ClientStore({ medicines = [], cart = [], addToCart, removeFromCart, handleCheckout, salesCountMap = {}, TRENDING_THRESHOLD = 5 }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [checkoutStep, setCheckoutStep] = useState('shop');
    const [deliveryInfo, setDeliveryInfo] = useState({ address: '', city: 'Cairo', method: 'Cash' });
    const [isOrderPlaced, setIsOrderPlaced] = useState(false);

    // --- 1. SIMILARITY HELPER (The Typo Protection Engine) ---
    const getSimilarity = (str1, str2) => {
        const s1 = (str1 || "").toLowerCase().trim();
        const s2 = (str2 || "").toLowerCase().trim();
        if (s1 === s2) return 1;
        if (s1.includes(s2) || s2.includes(s1)) return 0.8;

        const lengthDiff = Math.abs(s1.length - s2.length);
        if (s1[0] === s2[0] && lengthDiff <= 2) {
            let matches = 0;
            for (let char of s1) { if (s2.includes(char)) matches++; }
            const score = matches / Math.max(s1.length, s2.length);
            if (score > 0.7) return 0.6;
        }
        return 0;
    };

    // --- 2. FILTERING LOGIC ---
    const displayMedicines = medicines.filter(m => {
        if (!m) return false;
        const activeVal = m.isActive ?? m.IsActive;
        const isActive = activeVal !== false && activeVal !== 0 && activeVal !== "0";
        const stock = m.stockQuantity ?? m.StockQuantity ?? 0;

        const name = (m.name ?? m.Name ?? "").toString().toLowerCase();
        const category = (m.category ?? m.Category ?? "").toString().toLowerCase();
        const description = (m.description ?? m.Description ?? "").toString().toLowerCase();

        const search = searchTerm.toLowerCase().trim();

        return isActive && stock > 0 &&
            (name.includes(search) || category.includes(search) || description.includes(search));
    });

    // --- 3. SUGGESTION LOGIC ---
    const suggestions = (searchTerm && displayMedicines.length === 0)
        ? medicines
            .map(m => ({ ...m, score: getSimilarity(searchTerm, m.name ?? m.Name) }))
            .filter(m => m.score > 0.4)
            .sort((a, b) => b.score - a.score)
            .slice(0, 3)
        : [];

    const dynamicCategories = [
        'All',
        ...new Set(
            medicines
                .map(m => m.category ?? m.Category)
                .filter(cat => cat && cat.toString().trim() !== "")
        )
    ];

    // --- 4. EMPTY STATE VIEW ---
    if (displayMedicines.length === 0 && searchTerm !== '') {
        return (
            <div style={{ textAlign: 'center', padding: '100px 20px', backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
                <div style={{ fontSize: '80px', marginBottom: '20px' }}>🔍</div>
                <h2 style={{ color: '#1e293b', fontWeight: '900' }}>No exact match for "{searchTerm}"</h2>

                {suggestions.length > 0 ? (
                    <div style={{ marginTop: '30px' }}>
                        <p style={{ fontSize: '18px', color: '#64748b' }}>💡 <strong>Did you mean?</strong></p>
                        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '20px' }}>
                            {suggestions.map(s => {
                                const currentName = s.name ?? s.Name;
                                const currentId = s.id ?? s.Id;
                                return (
                                    <button
                                        key={currentId}
                                        onClick={() => setSearchTerm(currentName)}
                                        style={suggestionBtnStyle}
                                    >
                                        {currentName}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div style={{ marginTop: '20px' }}>
                        <p style={{ color: '#64748b' }}>We couldn't find any close matches. Try a different term or category.</p>
                        <button onClick={() => setSearchTerm('')} style={backBtnStyle}>View All Medicines</button>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div style={{ padding: '40px', backgroundColor: '#f4f7f6', minHeight: '100vh', boxSizing: 'border-box', color: 'black' }}>
            {isOrderPlaced && (
                <div style={successBoxStyle}>
                    <h2>🎉 Thank you for your order!</h2>
                    <p>Medicines will be sent to: <strong>{deliveryInfo.address}</strong></p>
                    <button onClick={() => setIsOrderPlaced(false)} style={{ ...confirmBtnStyle, width: 'auto', padding: '10px 30px' }}>Dismiss</button>
                </div>
            )}

            {checkoutStep === 'shop' && (
                <>
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <h1 style={{ color: '#28a745', fontSize: '36px', fontWeight: '900' }}>✚ Online Pharmacy Store</h1>
                        <p style={{ color: '#666', fontSize: '18px' }}>Quality medicine with smart savings on every order.</p>

                        <input
                            type="text"
                            value={searchTerm}
                            placeholder="🔍 Search for medicine name or category..."
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={searchInputStyle}
                        />

                        {/* CATEGORY FILTER CHIPS */}
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '25px', flexWrap: 'wrap' }}>
                            {dynamicCategories.map(cat => {
                                const isCurrent = (searchTerm.toLowerCase() === cat.toLowerCase()) || (cat === 'All' && searchTerm === '');
                                return (
                                    <button
                                        key={cat}
                                        onClick={() => setSearchTerm(cat === 'All' ? '' : cat)}
                                        style={{
                                            ...categoryChipStyle,
                                            background: isCurrent ? '#28a745' : 'white',
                                            color: isCurrent ? 'white' : '#28a745',
                                            borderColor: '#28a745'
                                        }}
                                    >
                                        {cat}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', maxWidth: '1050px', margin: '40px auto' }}>
                        <AlternativeMatcher medicines={medicines} />
                        <InteractionGuard />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '40px' }}>
                        <div style={badgeStyle('#6610f2')}>🔥 Trending Now</div>
                        <div style={badgeStyle('#dc3545')}>📉 Smart Savings Applied</div>
                    </div>

                    <div style={gridStyle}>
                        {displayMedicines.map(med => (
                            <ProductCard
                                key={med.id ?? med.Id}
                                med={med}
                                addToCart={addToCart}
                                setCheckoutStep={setCheckoutStep}
                                salesCountMap={salesCountMap}
                                TRENDING_THRESHOLD={TRENDING_THRESHOLD}
                            />
                        ))}
                    </div>
                </>
            )}

            {checkoutStep === 'cart' && (
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <button onClick={() => setCheckoutStep('shop')} style={backBtnStyle}>⬅ Back to Medicines</button>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px' }}>
                        <div style={whiteCardStyle}>
                            <h2 style={{ color: '#28a745', fontWeight: '900' }}>🛒 Your Order Summary</h2>
                            {cart.map(item => (
                                <div key={item.cartId || item.id} style={cartItemStyle}>
                                    <div>
                                        <strong style={{ fontSize: '18px', color: '#666' }}>{item.name}</strong>
                                        <p style={{ margin: 0, color: '#666', fontWeight: '600' }}>Qty: {item.quantity}</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <strong style={{ display: 'block', color: '#666' }}>{Number(item.totalPrice).toFixed(2)} EGP</strong>
                                        <button onClick={() => removeFromCart(item.cartId || item.id)} style={removeBtnStyle}>🗑️ Remove</button>
                                    </div>
                                </div>
                            ))}
                            <h3 style={{ textAlign: 'right', marginTop: '20px', color: '#666', fontWeight: '900', fontSize: '22px' }}>
                                Total: {cart.reduce((sum, i) => sum + (i.totalPrice || 0), 0).toFixed(2)} EGP
                            </h3>
                        </div>

                        {/* DELIVERY & PAYMENT CONTAINER */}
                        <div style={whiteCardStyle}>
                            <h3 style={{ color: '#28a745', marginBottom: '20px', fontWeight: '800' }}>🚚 Delivery Info</h3>

                            <label style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>SHIPPING ADDRESS</label>
                            <textarea
                                placeholder="Street Name, Building, Apartment..."
                                style={inputStyle('80px')}
                                value={deliveryInfo.address}
                                onChange={(e) => setDeliveryInfo({ ...deliveryInfo, address: e.target.value })
                            }
                            />

                            <PaymentMethod
                                selectedMethod={deliveryInfo.method}
                                onMethodChange={(method) => setDeliveryInfo({ ...deliveryInfo, method })}
                                totalAmount={cart.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0).toFixed(2)}
                                onPrepareOnlineOrder={async () => {
                                    const created = await handleCheckout(deliveryInfo);
                                    if (created) {
                                        setIsOrderPlaced(true);
                                        setCheckoutStep('shop');
                                    }
                                    return created;
                                }}
                            />

                            <button
                                onClick={async () => {
                                    if (!deliveryInfo.address.trim()) {
                                        return alert("⚠️ Please enter your delivery address!");
                                    }

                                    if (deliveryInfo.method !== 'Cash') {
                                        return alert(`For ${deliveryInfo.method} payments, please use the card payment button above to complete checkout.`);
                                    }

                                    await handleCheckout(deliveryInfo);
                                    setIsOrderPlaced(true);
                                    setCheckoutStep('shop');
                                }}
                                style={{ ...confirmBtnStyle, marginTop: '30px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                            >
                                Confirm Order
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function ProductCard({ med, addToCart, setCheckoutStep, salesCountMap, TRENDING_THRESHOLD }) {
    const currentPrice = Number(med?.price ?? med?.Price ?? 0);
    const basePrice = Number(med?.basePrice ?? med?.BasePrice ?? currentPrice);
    const medName = med?.name ?? med?.Name ?? "Unknown Drug";
    const category = (med?.category ?? med?.Category ?? "General").toLowerCase();

    const getIcon = () => {
        const cat = category.toLowerCase();
        if (cat.includes('analgesic')) return '🩹';
        if (cat.includes('supplement')) return '🍊';
        if (cat.includes('antibiotic')) return '🧪';
        if (cat.includes('gastro')) return '🍃';
        if (cat.includes('chronic')) return '❤️';
        if (cat.includes('anticoagulant')) return '🩸';
        return '🛍️';
    };

    const cleanTrendingKey = medName.toLowerCase().trim();
    const isTrending = salesCountMap[cleanTrendingKey] >= TRENDING_THRESHOLD;

    return (
        <div style={enhancedCardStyle}>
            {/* SAVINGS BADGE */}
            {basePrice > currentPrice && (
                <div style={discountBadgeStyle}>
                    -{(((basePrice - currentPrice) / basePrice) * 100).toFixed(0)}%
                </div>
            )}

            {/* ICON SECTION */}
            <div style={iconContainerStyle}>
                <span style={{ fontSize: '50px' }}>{getIcon()}</span>
            </div>

            {/* TEXT SPECIFICATIONS */}
            <div style={{ padding: '0 10px' }}>
                <h3 style={medTitleStyle}>
                    {medName}
                    {isTrending && <span title="Trending High Demand" style={{ marginLeft: '6px' }}>🔥</span>}
                </h3>
                <p style={categoryTextStyle}>{category.toUpperCase()}</p>

                <div style={priceContainerStyle}>
                    <span style={currentPriceStyle}>{currentPrice.toFixed(2)}</span>
                    <span style={currencyStyle}>EGP</span>
                </div>
            </div>

            {/* BUY ACTION */}
            <button
                style={premiumBuyBtnStyle}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                onClick={() => {
                    addToCart(med);
                    if (window.confirm("Added to cart! Go to checkout now?")) setCheckoutStep('cart');
                }}
            >
                <span>➕</span> ADD TO ORDER
            </button>
        </div>
    );
}

// --- STYLES ---
const whiteCardStyle = { backgroundColor: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' };
const inputStyle = (h) => ({ width: '100%', padding: '12px', margin: '10px 0', borderRadius: '12px', border: '1px solid #cbd5e1', height: h, color: 'black', fontSize: '14px' });
const cartItemStyle = { display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid #eee' };
const removeBtnStyle = { background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '12px', textDecoration: 'underline', fontWeight: 'bold' };
const confirmBtnStyle = { width: '100%', marginTop: '20px', padding: '15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '15px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 4px 12px rgba(40, 167, 69, 0.2)' };
const backBtnStyle = { marginBottom: '20px', padding: '12px 25px', borderRadius: '12px', border: '1px solid #cbd5e1', cursor: 'pointer', fontWeight: '800', backgroundColor: 'white' };
const successBoxStyle = { backgroundColor: '#d4edda', color: '#155724', padding: '30px', borderRadius: '20px', marginBottom: '30px', textAlign: 'center', border: '1px solid #c3e6cb' };
const searchInputStyle = { width: '60%', minWidth: '300px', padding: '18px 30px', borderRadius: '50px', border: '2px solid #28a745', outline: 'none', fontSize: '16px', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px', maxWidth: '1200px', margin: '0 auto' };
const suggestionBtnStyle = { padding: '12px 25px', borderRadius: '50px', border: '2px solid #28a745', backgroundColor: 'white', color: '#28a745', fontWeight: '900', cursor: 'pointer', transition: '0.2s' };
const categoryChipStyle = { padding: '10px 24px', borderRadius: '50px', border: '1.5px solid #28a745', cursor: 'pointer', fontWeight: '800', fontSize: '14px', transition: '0.3s' };
const badgeStyle = (color = '#dc3545') => ({ backgroundColor: color, color: 'white', padding: '6px 14px', borderRadius: '50px', fontSize: '12px', fontWeight: '900', display: 'inline-block' });

const enhancedCardStyle = {
    backgroundColor: 'white',
    padding: '25px 15px',
    borderRadius: '28px',
    boxShadow: '0 12px 30px rgba(0,0,0,0.06)',
    position: 'relative',
    textAlign: 'center',
    border: '1px solid #f0f4f2',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '380px'
};

const iconContainerStyle = {
    backgroundColor: '#f8fafc',
    width: '90px',
    height: '90px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
    border: '4px solid #fff'
};

const medTitleStyle = {
    fontSize: '19px',
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: '5px',
    letterSpacing: '-0.5px'
};

const categoryTextStyle = {
    fontSize: '11px',
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: '1px',
    marginBottom: '15px'
};

const priceContainerStyle = {
    marginBottom: '20px'
};

const currentPriceStyle = {
    fontSize: '26px',
    fontWeight: '900',
    color: '#059669' // Emerald Green
};

const currencyStyle = {
    fontSize: '12px',
    fontWeight: '700',
    color: '#059669',
    marginLeft: '4px'
};

const discountBadgeStyle = {
    position: 'absolute',
    top: '15px',
    left: '15px',
    backgroundColor: '#ef4444',
    color: 'white',
    padding: '5px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '900',
    boxShadow: '0 4px 10px rgba(239, 68, 68, 0.3)'
};

const premiumBuyBtnStyle = {
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '18px',
    cursor: 'pointer',
    fontWeight: '900',
    fontSize: '13px',
    letterSpacing: '0.5px',
    boxShadow: '0 8px 20px rgba(16, 185, 129, 0.25)',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
};
export default ClientStore;