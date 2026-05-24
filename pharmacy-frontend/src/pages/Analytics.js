import React, { useState, useEffect, useRef } from 'react';
import { pharmacyApi } from '../services/apiService';

// ══════════════════════════════════════════════════════════════
// CHART.JS LOADER
// ══════════════════════════════════════════════════════════════
function ChartLoader({ children }) {
    const [loaded, setLoaded] = useState(!!window.Chart);
    useEffect(() => {
        if (window.Chart) { setLoaded(true); return; }
        const s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js';
        s.onload = () => setLoaded(true);
        document.head.appendChild(s);
    }, []);
    if (!loaded) return <div style={loadingStyle}>⏳ Loading charts...</div>;
    return children;
}

// ══════════════════════════════════════════════════════════════
// PRINT HANDLER
// ══════════════════════════════════════════════════════════════
function handlePrint() {
    const el = document.getElementById('printable-analytics');
    if (!el) { window.print(); return; }


    // 1. Clone the entire analytics DOM
    const clone = el.cloneNode(true);

    // 2. Find every canvas in the LIVE DOM and every canvas placeholder in the clone
    const liveCanvases = el.querySelectorAll('canvas');
    const cloneCanvases = clone.querySelectorAll('canvas');

    liveCanvases.forEach((canvas, i) => {
        if (!cloneCanvases[i]) return;
        try {
            // Convert the live canvas pixels to a base64 PNG
            const dataUrl = canvas.toDataURL('image/png');
            // Build a replacement <img> with the same dimensions
            const img = document.createElement('img');
            img.src = dataUrl;
            img.style.width = '100%';
            img.style.maxHeight = canvas.style.height || '300px';
            img.style.objectFit = 'contain';
            img.style.display = 'block';
            // Swap the blank canvas placeholder with the real image
            cloneCanvases[i].replaceWith(img);
        } catch (e) {
            // If canvas is tainted or empty, just remove it gracefully
            cloneCanvases[i].style.display = 'none';
        }
    });

    // 3. Open print window and inject the fixed clone HTML
    const win = window.open('', '_blank', 'width=1100,height=800');
    win.document.write(`
        <!DOCTYPE html><html><head>
        <title>Smart Pharmacy — Analytics Report</title>
        <style>
            * { box-sizing: border-box; }
            body { font-family: 'Segoe UI', Arial, sans-serif; color:#1e293b; margin:20px 30px; background:white; }
            h1  { font-size:22px; font-weight:900; margin:0 0 4px 0; color:#1e293b; }
            p   { margin:0 0 20px 0; font-size:13px; color:#64748b; }
            .kpi-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:20px; }
            .kpi-card { border:1px solid #e2e8f0; border-radius:12px; padding:16px; }
            .kpi-label { font-size:10px; color:#94a3b8; font-weight:800; text-transform:uppercase; letter-spacing:1px; }
            .kpi-value { font-size:20px; font-weight:900; color:#1e293b; margin:6px 0 0 0; }
            .kpi-sub   { font-size:11px; color:#94a3b8; }
            .section   { border:1px solid #e2e8f0; border-radius:14px; padding:20px; margin-bottom:16px; }
            .section h2 { font-size:16px; font-weight:900; margin:0 0 14px 0; }
            .tf-grid { display:grid; grid-template-columns:repeat(5,1fr); gap:10px; }
            .tf-tile { background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:14px; text-align:center; }
            .tf-label { font-size:10px; color:#64748b; font-weight:700; text-transform:uppercase; letter-spacing:1px; }
            .tf-val   { font-size:18px; font-weight:900; color:#1e293b; margin-top:6px; }
            table { width:100%; border-collapse:collapse; font-size:12px; }
            th { padding:8px 10px; text-align:left; font-size:10px; color:#94a3b8; font-weight:800; text-transform:uppercase; border-bottom:2px solid #f1f5f9; }
            td { padding:10px; border-bottom:1px solid #f8fafc; }
            .tab-title { font-size:14px; font-weight:900; color:#28a745; text-transform:uppercase; letter-spacing:1px; margin:24px 0 12px 0; border-top:2px solid #e2e8f0; padding-top:18px; }
            .no-print { display:none !important; }
            img { max-width:100%; height:auto; page-break-inside:avoid; }
            @media print {
                .no-print { display:none !important; }
                img { max-width:100%; page-break-inside:avoid; }
                body { margin: 10px 20px; }
            }
        </style>
        </head><body>${clone.innerHTML}</body></html>
    `);
    win.document.close();
    win.focus();
    // Give the browser a moment to render the images before printing
    setTimeout(() => { win.print(); win.close(); }, 800);
}

// ══════════════════════════════════════════════════════════════
// MAIN ANALYTICS COMPONENT
// ══════════════════════════════════════════════════════════════
function Analytics({ setView }) {
    const [activeTab, setActiveTab] = useState('inventory');
    const [period, setPeriod] = useState('month');
    const [customFrom, setCustomFrom] = useState('');
    const [customTo, setCustomTo] = useState('');

    const [kpis, setKpis] = useState(null);
    const [salesTrend, setSalesTrend] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [shipments, setShipments] = useState([]);
    const [clientOrders, setClientOrders] = useState([]);
    const [expiryEngine, setExpiryEngine] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const [metricsRes, trendRes, topRes, shipRes, clientRes, expiryRes] =
                    await Promise.all([
                        pharmacyApi.getDashboardMetrics(),
                        pharmacyApi.getSalesTrend(),
                        pharmacyApi.getTopProducts(),
                        pharmacyApi.getAnalyticsShipments(),
                        pharmacyApi.getClientOrders(),
                        pharmacyApi.getExpiryEngine(),
                    ]);
                setKpis(metricsRes.data);
                setSalesTrend(trendRes.data);
                setTopProducts(topRes.data);
                setShipments(shipRes.data);
                setClientOrders(clientRes.data);
                setExpiryEngine(expiryRes.data);
            } catch (err) {
                console.error('Analytics load error:', err);
                setError('Could not connect to the API. Is the backend running?');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return <div style={loadingStyle}>⏳ Syncing real data from SQL Server...</div>;
    if (error) return <div style={errorStyle}>❌ {error}</div>;

    // ── KPI values ──
    const totalRevenue = kpis?.finances?.grossRevenue ?? 0;
    const totalExpenses = kpis?.finances?.totalExpenses ?? 0;
    const netProfit = kpis?.finances?.netProfit ?? 0;
    const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0.0';
    const capitalAtRisk = kpis?.riskMetrics?.capitalAtRisk ?? 0;
    const totalOnlineOrders = (kpis?.clientMetrics?.totalPendingOrders ?? 0)
        + (kpis?.clientMetrics?.totalCompletedOrders ?? 0);
    const onlineRevenue = kpis?.inStoreVsOnline?.onlineTotal ?? 0;
    const avgOrderValue = totalOnlineOrders > 0 ? Math.round(onlineRevenue / totalOnlineOrders) : 0;
    const topAddress = kpis?.clientMetrics?.topShippingAddresses?.[0]?.address ?? 'N/A';

    const rawPayments = kpis?.clientMetrics?.paymentBreakdown ?? [];
    const totalPayCount = rawPayments.reduce((s, p) => s + p.count, 0) || 1;
    const paymentMethods = rawPayments.map(p => ({
        method: p.method, count: p.count,
        percent: Math.round((p.count / totalPayCount) * 100)
    }));

    // — HISTORICAL MONTHS
    const getMonthRevenue = (offsetMonths) => {
        const now = new Date();
        const year = new Date(now.getFullYear(), now.getMonth() + offsetMonths, 1).getFullYear();
        const mon = new Date(now.getFullYear(), now.getMonth() + offsetMonths, 1).getMonth();
        return salesTrend
            .filter(d => {
                if (!d.date) return false;
                const dt = new Date(d.date);
                return dt.getFullYear() === year && dt.getMonth() === mon;
            })
            .reduce((s, d) => s + (d.revenue ?? 0), 0);
    };

    const monthName = (offset) => {
        const d = new Date();
        d.setMonth(d.getMonth() + offset);
        return d.toLocaleString('default', { month: 'long', year: 'numeric' });
    };

    // ── Period data for Revenue vs Cost chart ──
    const getPeriodData = () => {
        if (period === 'custom' && customFrom && customTo) {
            const from = new Date(customFrom);
            const to = new Date(customTo);
            to.setHours(23, 59, 59, 999);
            return salesTrend.filter(d => {
                if (!d.date) return false;
                const dt = new Date(d.date);
                return dt >= from && dt <= to;
            });
        }
        if (period === 'day') return salesTrend.slice(-7);
        if (period === 'week') {
            const weeks = [];
            for (let i = 0; i < salesTrend.length; i += 7) {
                const chunk = salesTrend.slice(i, i + 7);
                if (!chunk.length) continue;
                weeks.push({
                    date: `Week of ${chunk[0].date?.slice(5)}`,
                    revenue: chunk.reduce((s, d) => s + (d.revenue ?? 0), 0),
                    cost: chunk.reduce((s, d) => s + (d.cost ?? 0), 0),
                    profit: chunk.reduce((s, d) => s + (d.profit ?? 0), 0),
                });
            }
            return weeks;
        }
        if (period === 'year') {
            const now = new Date();
            return Array.from({ length: 12 }, (_, i) => {
                const offset = i - 11; // last 12 months
                const target = new Date(now.getFullYear(), now.getMonth() + offset, 1);
                const filtered = salesTrend.filter(d => {
                    if (!d.date) return false;
                    const dt = new Date(d.date);
                    return dt.getFullYear() === target.getFullYear() && dt.getMonth() === target.getMonth();
                });
                return {
                    date: target.toLocaleString('default', { month: 'short', year: '2-digit' }),
                    revenue: filtered.reduce((s, d) => s + (d.revenue ?? 0), 0),
                    cost: filtered.reduce((s, d) => s + (d.cost ?? 0), 0),
                    profit: filtered.reduce((s, d) => s + (d.profit ?? ((d.revenue ?? 0) - (d.cost ?? 0))), 0),
                };
            });
        }
        // month view — last 3 months side by side
        return [-2, -1, 0].map(offset => ({
            date: monthName(offset),
            revenue: getMonthRevenue(offset),
            cost: salesTrend
                .filter(d => {
                    if (!d.date) return false;
                    const now = new Date(); const dt = new Date(d.date);
                    const target = new Date(now.getFullYear(), now.getMonth() + offset, 1);
                    return dt.getFullYear() === target.getFullYear() && dt.getMonth() === target.getMonth();
                })
                .reduce((s, d) => s + (d.cost ?? 0), 0),
            profit: salesTrend
                .filter(d => {
                    if (!d.date) return false;
                    const now = new Date(); const dt = new Date(d.date);
                    const target = new Date(now.getFullYear(), now.getMonth() + offset, 1);
                    return dt.getFullYear() === target.getFullYear() && dt.getMonth() === target.getMonth();
                })
                .reduce((s, d) => s + (d.profit ?? ((d.revenue ?? 0) - (d.cost ?? 0))), 0),
        }));
    };

    return (
        <div id="printable-analytics" style={pageStyle}>

            {/* ── PAGE HEADER ── */}
            <div style={headerStyle}>
                <div>
                    <h1 style={pageTitleStyle}>📈 Insights & Analytics Center</h1>
                    <p style={pageSubStyle}>
                        Live financial intelligence · Total Revenue:{' '}
                        <strong>{Number(totalRevenue).toLocaleString()} EGP</strong>
                    </p>
                </div>

                <div className="no-print" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button onClick={handlePrint} style={printBtnStyle}>
                        🖨️ Print Analytics
                    </button>
                    <button onClick={() => setView('inventory')} style={backBtnStyle}>
                        ← Back to Inventory
                    </button>
                </div>
            </div>

            {/* ── TAB BAR ── */}
            <div className="no-print" style={tabBarStyle}>
                <button onClick={() => setActiveTab('inventory')} style={tabBtnStyle(activeTab === 'inventory')}>
                    📦 Inventory Finance
                </button>
                <button onClick={() => setActiveTab('client')} style={tabBtnStyle(activeTab === 'client')}>
                    🛒 Client Portal Finance
                </button>
            </div>

            {/* For print: show section label instead of tabs */}
            <div className="print-only-tab-label" style={{ display: 'none' }}>
                <div style={{ fontSize: '14px', fontWeight: '900', color: '#28a745', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
                    📦 Inventory Finance
                </div>
            </div>

            {activeTab === 'inventory' && (
                <InventoryTab
                    totalRevenue={totalRevenue}
                    totalExpenses={totalExpenses}
                    netProfit={netProfit}
                    profitMargin={profitMargin}
                    capitalAtRisk={capitalAtRisk}
                    period={period}
                    setPeriod={setPeriod}
                    customFrom={customFrom}
                    customTo={customTo}
                    setCustomFrom={setCustomFrom}
                    setCustomTo={setCustomTo}
                    periodData={getPeriodData()}
                    topProducts={topProducts}
                    shipments={shipments}
                    expiryEngine={expiryEngine}
                    kpis={kpis}
                    getMonthRevenue={getMonthRevenue}
                    monthName={monthName}
                />
            )}

            {activeTab === 'client' && (
                <ClientTab
                    totalOnlineOrders={totalOnlineOrders}
                    onlineRevenue={onlineRevenue}
                    avgOrderValue={avgOrderValue}
                    topAddress={topAddress}
                    clientOrders={clientOrders}
                    paymentMethods={paymentMethods}
                    kpis={kpis}
                />
            )}
        </div>
    );
}

// ══════════════════════════════════════════════════════════════
// INVENTORY FINANCE TAB
// ══════════════════════════════════════════════════════════════
function InventoryTab({
    totalRevenue, totalExpenses, netProfit, profitMargin, capitalAtRisk,
    period, setPeriod, customFrom, customTo, setCustomFrom, setCustomTo,
    periodData, topProducts, shipments, expiryEngine, kpis,
    getMonthRevenue, monthName
}) {
    const revenueRef = useRef(null);
    const profitRef = useRef(null);
    const productsRef = useRef(null);
    const charts = useRef({});

    useEffect(() => {
        if (!window.Chart) return;
        Object.values(charts.current).forEach(c => c?.destroy());
        charts.current = {};

        const labels = periodData.map(d => d.date);
        const revenues = periodData.map(d => d.revenue ?? 0);
        const costs = periodData.map(d => d.cost ?? 0);
        const profits = periodData.map(d => d.profit ?? ((d.revenue ?? 0) - (d.cost ?? 0)));

        if (revenueRef.current) {
            charts.current.revenue = new window.Chart(revenueRef.current, {
                type: 'bar',
                data: {
                    labels, datasets: [
                        { label: 'Revenue', data: revenues, backgroundColor: '#28a745cc', borderColor: '#28a745', borderWidth: 1.5, borderRadius: 6 },
                        { label: 'Cost', data: costs, backgroundColor: '#dc354580', borderColor: '#dc3545', borderWidth: 1.5, borderRadius: 6 }
                    ]
                },
                options: chartOpts()
            });
        }

        if (profitRef.current) {
            charts.current.profit = new window.Chart(profitRef.current, {
                type: 'line',
                data: {
                    labels, datasets: [{
                        label: 'Net Profit', data: profits,
                        borderColor: '#6610f2', backgroundColor: '#6610f215',
                        borderWidth: 2.5, fill: true, tension: 0.4,
                        pointBackgroundColor: '#6610f2', pointRadius: 4
                    }]
                },
                options: chartOpts()
            });
        }

        if (productsRef.current && topProducts.length > 0) {
            charts.current.products = new window.Chart(productsRef.current, {
                type: 'bar',
                data: {
                    labels: topProducts.map(p => p.name),
                    datasets: [{
                        label: 'Revenue (EGP)', data: topProducts.map(p => p.revenue),
                        backgroundColor: ['#007bff', '#28a745', '#17a2b8', '#6610f2', '#fd7e14', '#dc3545'], borderRadius: 8
                    }]
                },
                options: {
                    indexAxis: 'y', responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => `${Number(ctx.raw).toLocaleString()} EGP` } } },
                    scales: {
                        x: { ticks: { callback: v => v.toLocaleString(), font: { size: 11 } }, grid: { color: '#f1f5f9' } },
                        y: { ticks: { font: { size: 12, weight: '600' } }, grid: { display: false } }
                    }
                }
            });
        }

        return () => { Object.values(charts.current).forEach(c => c?.destroy()); };
    }, [period, periodData, topProducts]);

    const expirySavedTotal = expiryEngine.reduce((s, e) => s + (e.saved ?? 0), 0);
    const totalShipmentCost = shipments.reduce((s, r) => s + (r.amount ?? 0), 0);

    const timeframeTiles = [
        { label: 'Today', value: kpis?.timeFrames?.todayTotal ?? 0 },
        { label: 'This Week', value: kpis?.timeFrames?.weekTotal ?? 0 },
        { label: monthName(0), value: getMonthRevenue(0) },
        { label: monthName(-1), value: getMonthRevenue(-1) },
        { label: monthName(-2), value: getMonthRevenue(-2) },
    ];

    return (
        <div>
            {/* KPI ROW */}
            <div style={kpiGrid}>
                <KPICard icon="💰" label="Total Revenue" value={`${Number(totalRevenue).toLocaleString()} EGP`} color="#28a745" sub="In-store + Online" />
                <KPICard icon="📦" label="Total Procurement" value={`${Number(totalExpenses).toLocaleString()} EGP`} color="#007bff" sub="Paid to suppliers" />
                <KPICard icon="📈" label="Net Profit" value={`${Number(netProfit).toLocaleString()} EGP`} color="#6610f2" sub={`${profitMargin}% margin`} />
                <KPICard icon="⚠️" label="Capital at Risk" value={`${Number(capitalAtRisk).toLocaleString()} EGP`} color="#fd7e14" sub="Expiring in 30 days" />
            </div>

            {/* TIMEFRAME TILES — now 5 tiles including 2 historical months */}
            <div style={sectionCard}>
                <h2 style={sectionTitle}>🕐 Revenue by Timeframe</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginTop: '16px' }}>
                    {timeframeTiles.map((t, i) => (
                        <div key={i} style={{
                            ...timeframeTile,
                            borderTop: i >= 2 ? '3px solid #e2e8f0' : '3px solid #28a745',
                            // Highlight current month more than historical
                            opacity: i === 2 ? 1 : (i < 2 ? 1 : 0.85)
                        }}>
                            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                                {t.label}
                                {/* "historical" tag for the 2 past months */}
                                {i >= 3 && (
                                    <span style={{ display: 'block', fontSize: '9px', color: '#94a3b8', marginTop: '2px', fontStyle: 'italic' }}>historical</span>
                                )}
                            </div>
                            <div style={{ fontSize: '22px', fontWeight: '900', color: '#1e293b' }}>
                                {Number(t.value).toLocaleString()} <span style={{ fontSize: '12px', color: '#94a3b8' }}>EGP</span>
                            </div>
                            {/* Simple comparison badge for historical tiles */}
                            {i === 3 && getMonthRevenue(0) > 0 && getMonthRevenue(-1) > 0 && (
                                <div style={{ marginTop: '6px', fontSize: '10px', fontWeight: '800', color: getMonthRevenue(0) >= getMonthRevenue(-1) ? '#28a745' : '#dc3545' }}>
                                    {getMonthRevenue(0) >= getMonthRevenue(-1) ? '▲' : '▼'} vs this month
                                </div>
                            )}
                            {i === 4 && getMonthRevenue(-1) > 0 && getMonthRevenue(-2) > 0 && (
                                <div style={{ marginTop: '6px', fontSize: '10px', fontWeight: '800', color: getMonthRevenue(-1) >= getMonthRevenue(-2) ? '#28a745' : '#dc3545' }}>
                                    {getMonthRevenue(-1) >= getMonthRevenue(-2) ? '▲' : '▼'} vs last month
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* REVENUE VS COST CHART */}
            <div style={sectionCard}>
                <div style={sectionHeader}>
                    <div>
                        <h2 style={sectionTitle}>📊 Revenue vs Cost</h2>
                        <div style={legendRow}><LegendDot color="#28a745" label="Revenue" /><LegendDot color="#dc3545" label="Cost" /></div>
                    </div>
                    <div className="no-print" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                        {/* Day / Week / Month / Year / Custom period buttons */}
                        <div style={periodToggle}>
                            {[
                                { key: 'day', label: 'Day (×7)' },
                                { key: 'week', label: 'Week' },
                                { key: 'month', label: 'Month (×3)' },
                                { key: 'year', label: 'Year (×12)' },
                                { key: 'custom', label: '📅 Custom' },
                            ].map(p => (
                                <button key={p.key} onClick={() => setPeriod(p.key)} style={periodBtn(period === p.key)}>
                                    {p.label}
                                </button>
                            ))}
                        </div>
                        {/*  Date range pickers — only shown when Custom is selected */}
                        {period === 'custom' && (
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', backgroundColor: '#f8fafc', padding: '8px 12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>FROM</span>
                                <input
                                    type="date"
                                    value={customFrom}
                                    onChange={e => setCustomFrom(e.target.value)}
                                    style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '5px 10px', fontSize: '13px', fontWeight: '600', color: '#1e293b', outline: 'none' }}
                                />
                                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>TO</span>
                                <input
                                    type="date"
                                    value={customTo}
                                    onChange={e => setCustomTo(e.target.value)}
                                    style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '5px 10px', fontSize: '13px', fontWeight: '600', color: '#1e293b', outline: 'none' }}
                                />
                            </div>
                        )}
                    </div>
                </div>
                <div style={{ height: '280px', marginTop: '15px' }}><canvas ref={revenueRef} /></div>
                {periodData.every(d => (d.revenue ?? 0) === 0) && <p style={noDataNote}>No in-store sales recorded in this period yet.</p>}
            </div>

            {/* NET PROFIT TREND */}
            <div style={sectionCard}>
                <div style={sectionHeader}>
                    <h2 style={sectionTitle}>📉 Net Profit Trend</h2>
                    <span style={pillBadge('#6610f2')}>Revenue − Cost</span>
                </div>
                <div style={{ height: '220px', marginTop: '15px' }}><canvas ref={profitRef} /></div>
            </div>

            {/* TOP PRODUCTS + SHIPMENTS */}
            <div style={twoCol}>
                <div style={sectionCard}>
                    <h2 style={sectionTitle}>🔥 Top Selling Medicines</h2>
                    <p style={mutedText}>Revenue from in-store PurchaseHistory</p>
                    {topProducts.length === 0
                        ? <p style={noDataNote}>No sales recorded yet.</p>
                        : <div style={{ height: `${topProducts.length * 46 + 60}px`, marginTop: '15px' }}><canvas ref={productsRef} /></div>
                    }
                </div>

                <div style={sectionCard}>
                    <h2 style={sectionTitle}>🚚 Recent Shipments</h2>
                    <p style={mutedText}>From PurchaseOrders · CostPrice × QuantityReceived</p>
                    {shipments.length === 0
                        ? <p style={noDataNote}>No supplier shipments recorded yet.</p>
                        : (
                            <table style={{ ...tableStyle, marginTop: '15px' }}>
                                <thead><tr>
                                    <th style={th}>Supplier</th><th style={th}>Medicine</th>
                                    <th style={th}>Qty</th><th style={{ ...th, textAlign: 'right' }}>Cost</th>
                                </tr></thead>
                                <tbody>
                                    {shipments.map((s, i) => (
                                        <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                                            <td style={td}><strong>{s.supplier}</strong></td>
                                            <td style={td}>{s.medicine}</td>
                                            <td style={td}>{s.items}</td>
                                            <td style={{ ...td, textAlign: 'right', color: '#007bff', fontWeight: '800' }}>{Number(s.amount).toLocaleString()} EGP</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot><tr>
                                    <td colSpan="3" style={{ ...td, fontWeight: '900' }}>Total Procurement</td>
                                    <td style={{ ...td, textAlign: 'right', fontWeight: '900', color: '#007bff', fontSize: '15px' }}>{Number(totalShipmentCost).toLocaleString()} EGP</td>
                                </tr></tfoot>
                            </table>
                        )
                    }
                </div>
            </div>

            {/* EXPIRY ENGINE */}
            <div style={sectionCard}>
                <div style={sectionHeader}>
                    <div>
                        <h2 style={sectionTitle}>⏰ Expiry Engine — Discount Recovery</h2>
                        <p style={mutedText}>Medicines where BasePrice &gt; Price (discount applied)</p>
                    </div>
                    {expiryEngine.length > 0 && (
                        <div style={savedBadge}>💚 {Number(expirySavedTotal).toLocaleString()} EGP recoverable</div>
                    )}
                </div>
                {expiryEngine.length === 0
                    ? <p style={noDataNote}>✅ No medicines with active expiry discounts right now.</p>
                    : (
                        <div style={expiryGrid}>
                            {expiryEngine.map((e, i) => (
                                <div key={i} style={expiryCard}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <strong style={{ fontSize: '15px', color: '#1e293b' }}>{e.medicine}</strong>
                                        <span style={daysLeftBadge(e.daysLeft)}>{e.daysLeft}d left</span>
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '6px' }}>{e.units} units · {e.mechanism}</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                        <span>Base: <strong>{Number(e.basePrice).toFixed(2)} EGP</strong></span>
                                        <span>Now: <strong style={{ color: '#28a745' }}>{Number(e.currentPrice).toFixed(2)} EGP</strong></span>
                                    </div>
                                    <div style={savedAmountStyle}>✅ Recoverable: <strong style={{ color: '#28a745' }}>{Number(e.saved).toLocaleString()} EGP</strong></div>
                                </div>
                            ))}
                        </div>
                    )
                }
            </div>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════
// CLIENT PORTAL FINANCE TAB
// ══════════════════════════════════════════════════════════════
function ClientTab({ totalOnlineOrders, onlineRevenue, avgOrderValue, topAddress, clientOrders, paymentMethods, kpis }) {
    const clientChartRef = useRef(null);
    const paymentChartRef = useRef(null);
    const charts = useRef({});
    const payColors = React.useMemo(() => ['#28a745', '#007bff', '#6610f2'], []);
    useEffect(() => {
        if (!window.Chart) return;
        Object.values(charts.current).forEach(c => c?.destroy());
        charts.current = {};

        if (clientChartRef.current && clientOrders.length > 0) {
            charts.current.client = new window.Chart(clientChartRef.current, {
                type: 'bar',
                data: {
                    labels: clientOrders.map(d => d.month), datasets: [
                        { label: 'Online Orders', data: clientOrders.map(d => d.online), backgroundColor: '#28a745cc', borderColor: '#28a745', borderWidth: 1.5, borderRadius: 6 },
                        { label: 'In-Store Sales', data: clientOrders.map(d => d.inStore), backgroundColor: '#007bffcc', borderColor: '#007bff', borderWidth: 1.5, borderRadius: 6 }
                    ]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { ticks: { font: { size: 11 } }, grid: { color: '#f1f5f9' } },
                        x: { ticks: { font: { size: 12 } }, grid: { display: false } }
                    }
                }
            });
        }

        if (paymentChartRef.current && paymentMethods.length > 0) {
            charts.current.payment = new window.Chart(paymentChartRef.current, {
                type: 'doughnut',
                data: {
                    labels: paymentMethods.map(p => p.method),
                    datasets: [{ data: paymentMethods.map(p => p.count), backgroundColor: payColors, borderWidth: 2, borderColor: '#fff' }]
                },
                options: { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { display: false } } }
            });
        }

        return () => { Object.values(charts.current).forEach(c => c?.destroy()); };
    }, [clientOrders, paymentMethods, payColors]);

    return (
        <div>
            <div style={kpiGrid}>
                <KPICard icon="🛒" label="Total Online Orders" value={totalOnlineOrders.toString()} color="#28a745" sub="All statuses" />
                <KPICard icon="💳" label="Online Revenue" value={`${Number(onlineRevenue).toLocaleString()} EGP`} color="#007bff" sub="Client portal" />
                <KPICard icon="🎯" label="Avg Order Value" value={`${Number(avgOrderValue).toLocaleString()} EGP`} color="#6610f2" sub="Per transaction" />
                <KPICard icon="📍" label="Top Delivery Area" value={topAddress} color="#fd7e14" sub="Most orders" />
            </div>

            {/* ONLINE VS IN-STORE ORDERS CHART */}
            <div style={sectionCard}>
                <div style={sectionHeader}>
                    <h2 style={sectionTitle}>📦 Online vs In-Store — Last 6 Months</h2>
                    <div style={legendRow}><LegendDot color="#28a745" label="Online" /><LegendDot color="#007bff" label="In-Store" /></div>
                </div>
                {clientOrders.length === 0
                    ? <p style={noDataNote}>No order history to display yet.</p>
                    : <div style={{ height: '260px', marginTop: '15px' }}><canvas ref={clientChartRef} /></div>
                }
            </div>

            <div style={twoCol}>
                {/* PAYMENT METHODS */}
                <div style={sectionCard}>
                    <h2 style={sectionTitle}>💳 Payment Methods</h2>
                    <p style={mutedText}>How clients prefer to pay (from OnlineOrders)</p>
                    {paymentMethods.length === 0
                        ? <p style={noDataNote}>No payment data yet.</p>
                        : (
                            <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginTop: '20px' }}>
                                <div style={{ height: '180px', width: '180px', flexShrink: 0 }}><canvas ref={paymentChartRef} /></div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                    {paymentMethods.map((m, i) => (
                                        <div key={i}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '14px', fontWeight: '700' }}>
                                                <span>{m.method}</span><span style={{ color: payColors[i] }}>{m.percent}%</span>
                                            </div>
                                            <div style={progressBg}><div style={{ ...progressFill, width: `${m.percent}%`, backgroundColor: payColors[i] }} /></div>
                                            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '3px' }}>{m.count} orders</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    }
                </div>

                {/* ORDER STATUS */}
                <div style={sectionCard}>
                    <h2 style={sectionTitle}>📋 Order Status Summary</h2>
                    <p style={mutedText}>Live from SQL OnlineOrders table</p>
                    <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {[
                            { label: 'Total Online Orders', value: totalOnlineOrders, icon: '🛒', color: '#28a745' },
                            { label: 'Processing (Pending)', value: kpis?.clientMetrics?.totalPendingOrders ?? 0, icon: '⏳', color: '#fd7e14' },
                            { label: 'Delivered / Completed', value: kpis?.clientMetrics?.totalCompletedOrders ?? 0, icon: '✅', color: '#007bff' },
                            { label: 'Online Revenue', value: `${Number(onlineRevenue).toLocaleString()} EGP`, icon: '💰', color: '#6610f2' },
                            { label: 'Average Order Value', value: `${Number(avgOrderValue).toLocaleString()} EGP`, icon: '🎯', color: '#17a2b8' },
                            { label: 'Top Delivery Location', value: topAddress, icon: '📍', color: '#dc3545' },
                        ].map((row, i) => (
                            <div key={i} style={summaryRow}>
                                <span style={{ fontSize: '18px' }}>{row.icon}</span>
                                <span style={{ flex: 1, fontSize: '14px', color: '#475569', fontWeight: '600' }}>{row.label}</span>
                                <span style={{ fontWeight: '900', fontSize: '15px', color: row.color }}>{row.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* MONTHLY REVENUE TABLE */}
            {clientOrders.length > 0 && (
                <div style={sectionCard}>
                    <h2 style={sectionTitle}>📅 Monthly Revenue Breakdown</h2>
                    <table style={{ ...tableStyle, marginTop: '16px' }}>
                        <thead><tr>
                            <th style={th}>Month</th>
                            <th style={th}>Online Orders</th>
                            <th style={th}>Online Revenue</th>
                            <th style={th}>In-Store Sales</th>
                            <th style={{ ...th, textAlign: 'right' }}>In-Store Revenue</th>
                        </tr></thead>
                        <tbody>
                            {clientOrders.map((row, i) => (
                                <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                                    <td style={{ ...td, fontWeight: '800' }}>{row.month}</td>
                                    <td style={td}>{row.online}</td>
                                    <td style={{ ...td, color: '#28a745', fontWeight: '700' }}>{Number(row.onlineRevenue ?? 0).toLocaleString()} EGP</td>
                                    <td style={td}>{row.inStore}</td>
                                    <td style={{ ...td, textAlign: 'right', color: '#007bff', fontWeight: '700' }}>{Number(row.inStoreRevenue ?? 0).toLocaleString()} EGP</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

// ══════════════════════════════════════════════════════════════
// REUSABLE COMPONENTS
// ══════════════════════════════════════════════════════════════
function KPICard({ icon, label, value, color, sub }) {
    return (
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '22px', border: `2px solid ${color}22`, borderLeft: `5px solid ${color}`, boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}>
            <span style={{ fontSize: '28px', marginBottom: '10px', display: 'block' }}>{icon}</span>
            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '5px' }}>{label}</div>
            <div style={{ fontSize: '22px', fontWeight: '900', color: '#1e293b', letterSpacing: '-0.5px' }}>{value}</div>
            {sub && <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', fontWeight: '600' }}>{sub}</div>}
        </div>
    );
}

function LegendDot({ color, label }) {
    return (
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748b', fontWeight: '600' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: color, display: 'inline-block' }} />
            {label}
        </span>
    );
}

function chartOpts() {
    return {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${Number(ctx.raw).toLocaleString()} EGP` } } },
        scales: {
            y: { ticks: { callback: v => Number(v).toLocaleString(), font: { size: 11 } }, grid: { color: '#f1f5f9' } },
            x: { ticks: { font: { size: 11 } }, grid: { display: false } }
        }
    };
}

// ══════════════════════════════════════════════════════════════
// STYLES
// ══════════════════════════════════════════════════════════════
const pageStyle = { padding: '40px', backgroundColor: '#f4f7f6', minHeight: '100vh', fontFamily: "'Segoe UI', system-ui, sans-serif", color: '#1e293b', boxSizing: 'border-box' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' };
const pageTitleStyle = { fontSize: '30px', fontWeight: '900', color: '#1e293b', margin: 0, letterSpacing: '-0.5px' };
const pageSubStyle = { color: '#64748b', fontSize: '14px', marginTop: '5px', marginBottom: 0 };
const backBtnStyle = { padding: '10px 22px', borderRadius: '10px', border: '1.5px solid #cbd5e1', backgroundColor: 'white', color: '#475569', cursor: 'pointer', fontWeight: '700', fontSize: '14px' };
const printBtnStyle = { padding: '10px 22px', borderRadius: '10px', border: 'none', backgroundColor: '#1e293b', color: 'white', cursor: 'pointer', fontWeight: '800', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' };
const tabBarStyle = { display: 'flex', gap: '8px', marginBottom: '28px', backgroundColor: 'white', padding: '6px', borderRadius: '14px', border: '1px solid #e2e8f0', width: 'fit-content', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' };
const tabBtnStyle = (a) => ({ padding: '10px 24px', borderRadius: '10px', border: 'none', backgroundColor: a ? '#28a745' : 'transparent', color: a ? 'white' : '#64748b', fontWeight: '800', fontSize: '14px', cursor: 'pointer', boxShadow: a ? '0 4px 10px rgba(40,167,69,0.25)' : 'none' });
const kpiGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' };
const sectionCard = { backgroundColor: 'white', borderRadius: '20px', padding: '28px', marginBottom: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' };
const sectionHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' };
const sectionTitle = { fontSize: '18px', fontWeight: '900', color: '#1e293b', margin: 0 };
const twoCol = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', marginBottom: '20px' };
const periodToggle = { display: 'flex', gap: '4px', backgroundColor: '#f8fafc', padding: '4px', borderRadius: '10px', border: '1px solid #e2e8f0' };
const periodBtn = (a) => ({ padding: '6px 14px', borderRadius: '7px', border: 'none', backgroundColor: a ? '#1e293b' : 'transparent', color: a ? 'white' : '#64748b', fontWeight: '700', fontSize: '12px', cursor: 'pointer' });
const legendRow = { display: 'flex', gap: '14px', marginTop: '6px' };
const mutedText = { fontSize: '13px', color: '#94a3b8', marginTop: '4px', marginBottom: 0 };
const noDataNote = { fontSize: '14px', color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', padding: '30px 0' };
const pillBadge = (c) => ({ fontSize: '11px', backgroundColor: `${c}20`, color: c, padding: '4px 12px', borderRadius: '20px', fontWeight: '800' });
const savedBadge = { backgroundColor: '#d1fae5', color: '#065f46', padding: '8px 18px', borderRadius: '12px', fontWeight: '900', fontSize: '14px', border: '1px solid #6ee7b7' };
const timeframeTile = { backgroundColor: '#f8fafc', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', textAlign: 'center' };
const expiryGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginTop: '20px' };
const expiryCard = { backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '14px', padding: '18px' };
const savedAmountStyle = { fontSize: '13px', color: '#64748b', backgroundColor: '#f0fdf4', padding: '8px 12px', borderRadius: '8px', fontWeight: '600', marginTop: '10px' };
const daysLeftBadge = (d) => ({ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '900', backgroundColor: d <= 5 ? '#fee2e2' : d <= 14 ? '#fef3c7' : '#f0fdf4', color: d <= 5 ? '#dc2626' : d <= 14 ? '#92400e' : '#166534' });
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const th = { padding: '10px 12px', textAlign: 'left', fontSize: '11px', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '2px solid #f1f5f9' };
const td = { padding: '12px', fontSize: '14px', color: '#334155', borderBottom: '1px solid #f8fafc' };
const progressBg = { height: '6px', backgroundColor: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' };
const progressFill = { height: '100%', borderRadius: '3px', transition: 'width 0.5s ease' };
const summaryRow = { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid #f1f5f9' };
const loadingStyle = { padding: '80px', textAlign: 'center', color: '#94a3b8', fontSize: '18px', fontWeight: '600' };
const errorStyle = { padding: '80px', textAlign: 'center', color: '#dc3545', fontSize: '16px', fontWeight: '600' };

export default function AnalyticsWithCharts(props) {
    return <ChartLoader><Analytics {...props} /></ChartLoader>;
}