import React, { useState, useRef, useEffect } from 'react';
import { pharmacyApi } from '../services/apiService';

/**
 *
 * Uses the EXISTING schema (Medicine.IngredientId FK + new Ingredient.TherapeuticClass column).
 * No new tables — just smarter query logic on the server.
 *
 *   Level 1 — Bio-Equivalent   : same IngredientId (identical active ingredient)
 *   Level 2 — Therapeutic Match: same ingredient, meaningfully different price/brand tier
 *   Level 3 — Class Match      : different ingredient, same TherapeuticClass
 *                                e.g. Ibuprofen → Diclofenac → Naproxen (all "NSAID")
 */
function AlternativeMatcher({ medicines = [] }) {
    const [search, setSearch] = useState('');
    const [result, setResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
    const handleClickOutside = (e) => {
        if (wrapperRef.current && !wrapperRef.current.contains(e.target))
            setShowDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    const handleInput = (value) => {
        setSearch(value);
        setResult(null);

        if (!value.trim()) {
            setSuggestions([]);
            setShowDropdown(false);
            return;
        }

        const query = value.toLowerCase();
        const filtered = medicines
            .filter(m => (m.isActive ?? m.IsActive) !== false)
            .filter(m => (m.name ?? m.Name ?? '').toLowerCase().includes(query))
            .slice(0, 8);

        setSuggestions(filtered);
        setShowDropdown(filtered.length > 0);
    };

    const handleSelect = (med) => {
        const name = med.name ?? med.Name ?? '';
        setSearch(name);
        setSuggestions([]);
        setShowDropdown(false);
        runSearch(name);
    };
    const runSearch = async (nameOverride) => {
        const query = (nameOverride ?? search).trim();
        if (!query) return;
        setIsLoading(true);
        setResult(null);
        try {
            const response = await pharmacyApi.getSmartAlternatives(query);
            setResult(response.data);
        } catch (err) {
            if (err?.response?.status === 404) setResult({ notFound: true });
            else setResult({ error: 'Could not connect to Substitution Engine.' });
        } finally {
            setIsLoading(false);
        }
    };

    const total = result
        ? (result.level1BioEquivalent?.length ?? 0) +
          (result.level2TherapeuticMatch?.length ?? 0) +
          (result.level3ClassMatch?.length ?? 0)
        : 0;

    return (
        <div style={card}>
            {/* Header */}
            <div style={headerRow}>
                <h3 style={titleStyle}>
                    <span style={iconBox}>🔍</span>
                    Alternative Matcher
                </h3>
                <span style={subtitle}>Substitution Engine</span>
            </div>

            {/* Search */}
            <div ref={wrapperRef} style={{ position: 'relative' }}>
                <div style={capsule}>
                    <input
                        placeholder="Type medicine name... (e.g. 'pana' → Panadol Extra)"
                        value={search}
                        onChange={e => handleInput(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter') { setShowDropdown(false); runSearch(); }
                            if (e.key === 'Escape') setShowDropdown(false);
                        }}
                        onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
                        style={inputStyle}
                        autoComplete="off"
                    />
                    {search && (
                        <button
                            onClick={() => { setSearch(''); setSuggestions([]); setResult(null); setShowDropdown(false); }}
                            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '16px', fontWeight: '700', padding: '4px 8px' }}
                        >
                            ✕
                        </button>
                    )}
                    <button
                        onClick={() => runSearch()}
                        disabled={isLoading || !search.trim()}
                        style={{ ...actionBtn, opacity: (isLoading || !search.trim()) ? 0.6 : 1 }}
                    >
                        {isLoading ? 'Scanning...' : 'Execute Scan'}
                    </button>
                </div>

                {/* Suggestions dropdown */}
                {showDropdown && suggestions.length > 0 && (
                    <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 20px 40px rgba(0,0,0,0.12)', zIndex: 1000, overflow: 'hidden' }}>
                        {suggestions.map(med => {
                            const id       = med.id ?? med.Id;
                            const name     = med.name ?? med.Name ?? '';
                            const ingName  = med.ingredient?.name ?? med.Ingredient?.Name ?? '';
                            const stock    = med.stockQuantity ?? med.StockQuantity ?? 0;
                            const query    = search.toLowerCase();
                            const idx      = name.toLowerCase().indexOf(query);
                            const highlighted = idx === -1 ? name : (
                                <>{name.slice(0, idx)}<span style={{ background: '#fef9c3', color: '#92400e', fontWeight: '900' }}>{name.slice(idx, idx + query.length)}</span>{name.slice(idx + query.length)}</>
                            );
                            return (
                                <div
                                    key={id}
                                    onClick={() => handleSelect(med)}
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', gap: '12px' }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ fontSize: '18px', background: '#f8fafc', padding: '6px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>💊</span>
                                        <div>
                                            <div style={{ fontWeight: '800', fontSize: '14px', color: '#1e293b' }}>{highlighted}</div>
                                            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{ingName && `🧬 ${ingName}`}</div>
                                        </div>
                                    </div>
                                    <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '8px', background: stock > 0 ? '#f0fdf4' : '#fef2f2', color: stock > 0 ? '#15803d' : '#dc2626', border: `1px solid ${stock > 0 ? '#bbf7d0' : '#fecaca'}` }}>
                                        {stock > 0 ? `${stock} in stock` : 'Out of stock'}
                                    </span>
                                </div>
                            );
                        })}
                        <div style={{ padding: '8px 16px', fontSize: '11px', color: '#94a3b8', fontWeight: '600', background: '#f8fafc', textAlign: 'center' }}>
                            {suggestions.length} result{suggestions.length > 1 ? 's' : ''} — press Enter to search
                        </div>
                    </div>
                )}
            </div>

            {/* Tier legend */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {[
                    ['L1  Bio-Equivalent', '#3b82f6', '#eff6ff'],
                    ['L2  Therapeutic Match', '#8b5cf6', '#f5f3ff'],
                    ['L3  Class Match', '#f59e0b', '#fffbeb'],
                ].map(([label, color, bg]) => (
                    <span key={label} style={{ padding: '5px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', background: bg, color, border: `1px solid ${color}30` }}>
                        {label}
                    </span>
                ))}
            </div>

            {/* Error states */}
            {result?.notFound && <div style={alertBox('#fef2f2', '#dc2626', '#fecaca')}>❌ Medicine not found in the active catalog.</div>}
            {result?.error && <div style={alertBox('#fef2f2', '#dc2626', '#fecaca')}>⚠️ {result.error}</div>}

            {/* Results */}
            {result && !result.notFound && !result.error && (
                <>
                    {/* Summary */}
                    <div style={summaryBar}>
                        <div>
                            <b style={{ fontSize: '16px', color: '#1e293b' }}>{result.targetMedicine}</b>
                            <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '10px' }}>
                                Active Ingredient: <b>{result.activeIngredient}</b>
                                {result.therapeuticClass && <> · Class: <b>{result.therapeuticClass}</b></>}
                            </span>
                        </div>
                        <span style={total > 0
                            ? { padding: '6px 16px', borderRadius: '20px', background: '#f0fdf4', color: '#15803d', fontWeight: '900', fontSize: '13px', border: '1px solid #bbf7d0' }
                            : { padding: '6px 16px', borderRadius: '20px', background: '#fef2f2', color: '#dc2626', fontWeight: '900', fontSize: '13px', border: '1px solid #fecaca' }
                        }>
                            {total > 0 ? `${total} alternative${total > 1 ? 's' : ''} found` : 'No alternatives in stock'}
                        </span>
                    </div>

                    <TierSection title="Level 1 — Bio-Equivalent" subtitle="Identical active ingredient" items={result.level1BioEquivalent} color="#3b82f6" bg="#eff6ff" icon="⚗️" />
                    <TierSection title="Level 2 — Therapeutic Match" subtitle="Same ingredient, different brand/price tier" items={result.level2TherapeuticMatch} color="#8b5cf6" bg="#f5f3ff" icon="💊" />
                    <TierSection title="Level 3 — Class Match" subtitle={`Different chemical, same class (${result.therapeuticClass ?? 'N/A'})`} items={result.level3ClassMatch} color="#f59e0b" bg="#fffbeb" icon="🔬" />
                </>
            )}
        </div>
    );
}

function TierSection({ title, subtitle, items, color, bg, icon }) {
    if (!items?.length) return null;
    return (
        <div style={{ background: bg, borderRadius: '16px', padding: '20px', border: `1px solid ${color}20` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <span style={{ fontSize: '20px' }}>{icon}</span>
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '900', fontSize: '15px', color }}>{title}</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{subtitle}</div>
                </div>
                <span style={{ padding: '4px 12px', borderRadius: '20px', background: '#fff', color, fontWeight: '900', fontSize: '13px', border: `1px solid ${color}50` }}>
                    {items.length}
                </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                {items.map(alt => (
                    <div key={alt.id} style={{ padding: '14px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                        <div style={{ fontWeight: '800', color: '#1e293b', fontSize: '14px' }}>{alt.name}</div>
                        {alt.activeIngredient && <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>🧬 {alt.activeIngredient}</div>}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                            <span style={{ fontWeight: '700', color: '#1e293b', fontSize: '13px' }}>💰 {alt.price} EGP</span>
                            <span style={{
                                padding: '3px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '700',
                                background: alt.stockQuantity > 0 ? '#f0fdf4' : '#fef2f2',
                                color: alt.stockQuantity > 0 ? '#15803d' : '#dc2626',
                                border: `1px solid ${alt.stockQuantity > 0 ? '#bbf7d0' : '#fecaca'}`
                            }}>
                                {alt.stockQuantity > 0 ? `📦 ${alt.stockQuantity}` : '❌ OOS'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const card = { width: '100%', padding: '35px', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '20px', boxSizing: 'border-box', background: '#f8fafc' };
const headerRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f1f5f9', paddingBottom: '15px', marginBottom: '10px' };
const titleStyle = { fontSize: '24px', fontWeight: '900', color: '#2d3436', margin: 0, display: 'flex', alignItems: 'center', gap: '15px' };
const iconBox = { background: '#f1f5f9', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', fontSize: '22px' };
const subtitle = { fontSize: '11px', fontWeight: '800', color: '#00b894', textTransform: 'uppercase', letterSpacing: '1.5px' };
const capsule = { display: 'flex', background: '#fff', borderRadius: '16px', padding: '8px', border: '1px solid #cbd5e1', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)', gap: '8px' };
const inputStyle = { flex: 1, border: 'none', background: 'transparent', padding: '12px 20px', fontSize: '15px', fontWeight: '600', color: '#333', outline: 'none' };
const actionBtn = { background: 'linear-gradient(to bottom, #00c9a7, #00897b)', color: '#fff', padding: '12px 30px', borderRadius: '12px', border: 'none', borderBottom: '3px solid #00695c', fontSize: '14px', fontWeight: '800', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '1px' };
const alertBox = (bg, color, border) => ({ padding: '16px 20px', borderRadius: '12px', background: bg, border: `1px solid ${border}`, borderLeft: `6px solid ${color}`, fontWeight: '700', color, fontSize: '14px' });
const summaryBar = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '10px' };

export default AlternativeMatcher;