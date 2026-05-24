import React from 'react';
import { getSmartDiscount } from '../pages/PricingEngine';

function StatCards({ medicines, salesCountMap, TRENDING_THRESHOLD = 5, setView }) {

    // --- LOGIC & STATISTICS ---

    // 1. Safely isolate active medicine types checking for camelCase and fallback states
    const activeMeds = medicines.filter(m => {
        const status = m.isActive ?? m.IsActive;
        return status !== false && status !== 0 && status !== "0";
    });

    const totalItems = activeMeds.length;

    // 2. Sum of all physical boxes currently remaining on stock shelves (Only for active SKU's)
    const totalUnits = medicines.reduce((sum, m) => {
        const status = m.isActive ?? m.IsActive;
        const isActive = status !== false && status !== 0 && status !== "0";
        const stock = m.stockQuantity ?? m.StockQuantity ?? 0;

        return isActive ? sum + stock : sum;
    }, 0);

    // 3. Track low stock counts for items dropping below threshold limits
    const lowStockCount = medicines.filter(m => {
        const status = m.isActive ?? m.IsActive;
        const isActive = status !== false && status !== 0 && status !== "0";
        const stock = m.stockQuantity ?? m.StockQuantity ?? 0;
        return isActive && stock < 10;
    }).length;

    // 4. Inventory expiry safety monitor tracking next 30 days
    const expiringCount = medicines.filter(m => {
        const status = m.isActive ?? m.IsActive;
        const isActive = status !== false && status !== 0 && status !== "0";

        const expValue = m.expiryDate ?? m.ExpiryDate;
        if (!expValue) return false;

        const d = new Date(expValue);
        const today = new Date();
        const thirtyDays = new Date();
        thirtyDays.setDate(today.getDate() + 30);

        return isActive && d <= thirtyDays && d >= today;
    }).length;

    // 5. Dead stock matches products with an inventory box level of exactly zero
    const deadStockCount = activeMeds.filter(m =>
        (m.stockQuantity ?? m.StockQuantity ?? 0) === 0
    ).length;

    // 6. Tracks fast-moving consumer lines matching trending retail counters
    const trendingCount = activeMeds.filter(m => {
        const n = (m.name || m.Name || "").toLowerCase().trim();
        return salesCountMap?.[n] >= TRENDING_THRESHOLD;
    }).length;

    const capitalAtRisk = activeMeds
        .filter(m => {
            const expValue = m.expiryDate ?? m.ExpiryDate;
            return expValue ? getSmartDiscount(expValue) > 0 : false;
        })
        .reduce((sum, m) => {
            const cost = Number(m.costPrice || m.CostPrice || m.price || m.Price || 0);
            const stock = Number(m.stockQuantity ?? m.StockQuantity ?? 0);
            return sum + (cost * stock);
        }, 0);

    return (
        <div className="no-print" style={dashboardWrapper}>

            {/* 1. SECTION HEADLINE & UNIFIED ACTION */}
            <div style={headerContainer}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h3 style={headlineStyle}>📊 Business Intelligence Dashboard</h3>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                        <span style={statusDot}>System Online</span>
                        <span style={dataTag}>{totalItems} Active SKU's</span>
                    </div>
                </div>

                <button
                    onClick={() => setView('analytics')}
                    style={analyticsBtnStyle}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
                >
                    🔍 View Full Insights Center
                </button>
            </div>

            {/* 2. METRIC CARDS CAROUSEL GRID */}
            <div style={gridStyle}>

                <div style={cardStyle('#007bff')}>
                    <div style={iconBox}>📦</div>
                    <h2 style={valStyle}>{totalItems}</h2>
                    <p style={labelStyle}>Product Types</p>
                </div>

                <div style={cardStyle('#17a2b8')}>
                    <div style={iconBox}>🏢</div>
                    <h2 style={valStyle}>{totalUnits.toLocaleString()}</h2>
                    <p style={labelStyle}>Total Units</p>
                </div>

                <div style={cardStyle('#dc3545')}>
                    <div style={iconBox}>🚨</div>
                    <h2 style={valStyle}>{lowStockCount}</h2>
                    <p style={labelStyle}>Low Stock</p>
                </div>

                {/* Expiry Warning Intelligence Center Card */}
                <div style={{ ...cardStyle('#ffc107', true), flex: '1 1 200px', border: '3px solid #fd7e14' }}>
                    <div style={iconBox}>⚠️</div>

                    <div style={expiryHeader}>
                        <span style={{ fontWeight: 'bold' }}>EXPIRY CENTER</span>
                        <span style={badgeStyle}>ACTION REQ.</span>
                    </div>

                    <h2 style={{ ...valStyle, margin: '10px 0' }}>
                        {expiringCount} <small style={{ fontSize: '16px' }}>Items</small>
                    </h2>

                    <div style={riskFooter}>
                        <div style={riskLabel}>CAPITAL AT RISK</div>
                        <div style={riskVal}>{capitalAtRisk.toFixed(2)} EGP</div>
                    </div>
                </div>

                <div style={cardStyle('#6610f2')}>
                    <div style={iconBox}>🔥</div>
                    <h2 style={valStyle}>{trendingCount}</h2>
                    <p style={labelStyle}>High Demand</p>
                </div>

                <div style={cardStyle('#495057')}>
                    <div style={iconBox}>🌑</div>
                    <h2 style={valStyle}>{deadStockCount}</h2>
                    <p style={labelStyle}>Out of Stock</p>
                </div>

            </div>
        </div>
    );
}

// --- STYLES---
const headerContainer = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px',
    padding: '0 5px'
};

const headlineStyle = {
    fontSize: '22px',
    fontWeight: '900',
    color: '#2d3436',
    margin: 0,
    textTransform: 'uppercase',
    letterSpacing: '1px'
};

const statusDot = {
    fontSize: '10px',
    backgroundColor: '#e6fffa',
    color: '#38b2ac',
    padding: '4px 10px',
    borderRadius: '20px',
    fontWeight: 'bold',
    border: '1px solid #38b2ac'
};

const gridStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: '12px',
    width: '100%',
    flexWrap: 'wrap',
    boxSizing: 'border-box'
};

const cardStyle = (bg, darkText = false) => ({
    flex: '1 1 150px',
    backgroundColor: bg,
    color: darkText ? '#212529' : 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '160px',
    boxSizing: 'border-box',
    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    cursor: 'default'
});

const analyticsBtnStyle = {
    marginLeft: 'auto',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    fontWeight: 'bold',
    fontSize: '14px',
    cursor: 'pointer',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
};

const dataTag = {
    fontSize: '10px',
    backgroundColor: '#f1f3f5',
    color: '#495057',
    padding: '4px 10px',
    borderRadius: '20px',
    fontWeight: 'bold',
    border: '1px solid #dee2e6'
};

const dashboardWrapper = {
    width: '100%',
    background: 'linear-gradient(145deg, #f0f2f5, #ffffff)',
    padding: '25px',
    borderRadius: '20px',
    marginBottom: '40px',
    border: '1px solid #e9ecef',
    boxSizing: 'border-box',
    overflow: 'hidden',
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
};

const iconBox = {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
    marginBottom: '15px'
};

const valStyle = { fontSize: '38px', margin: 0, fontWeight: '900', letterSpacing: '-1px' };
const labelStyle = { margin: 0, fontWeight: '800', fontSize: '15px', opacity: 1, textTransform: 'uppercase' };
const expiryHeader = { display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 'bold' };
const badgeStyle = { backgroundColor: '#fd7e14', color: 'white', padding: '2px 6px', borderRadius: '4px' };
const riskFooter = { borderTop: '1px solid rgba(0,0,0,0.1)', marginTop: '10px', paddingTop: '8px' };
const riskLabel = { fontSize: '9px', fontWeight: 'bold', opacity: 0.7 };
const riskVal = { fontSize: '16px', fontWeight: '900', color: '#d9480f' };

export default StatCards;