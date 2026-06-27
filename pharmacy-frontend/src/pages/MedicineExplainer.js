import React, { useState, useEffect, useCallback } from 'react';
import { pharmacyApi } from '../services/apiService';

function MedicineExplainer({ userId }) {
    const [medicineName, setMedicineName] = useState('');
    const [explanation, setExplanation] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [savedList, setSavedList] = useState([]);
    const [mostSearched, setMostSearched] = useState([]);
    const [isSaved, setIsSaved] = useState(false);
    const [savingMsg, setSavingMsg] = useState('');

    const fetchSaved = useCallback(async () => {
        if (!userId) return;
        try {
            const res = await pharmacyApi.getSavedExplanations(userId);
            setSavedList(res.data);
        } catch { /* silent */ }
    }, [userId]);

    const fetchMostSearched = async () => {
        try {
            const res = await pharmacyApi.getMostSearched();
            setMostSearched(res.data);
        } catch { /* silent */ }
    };

    useEffect(() => {
        fetchSaved();
        fetchMostSearched();
    }, [fetchSaved]);

    const handleExplain = async (name) => {
        const target = name || medicineName;
        if (!target.trim()) return;
        if (!name) setMedicineName(target);
        setLoading(true);
        setError('');
        setExplanation('');
        setIsSaved(false);
        setSavingMsg('');
        try {
            const res = await pharmacyApi.explainMedicine(target.trim());
            const text = res.data.explanation;
            if (text.trim() === 'UNKNOWN_MEDICINE') {
                setError(`"${target}" is not a recognized medicine. Please check the name and try again.`);
            } else {
                setExplanation(text);
                const alreadySaved = savedList.some(s => s.medicineName.toLowerCase() === target.toLowerCase());
                setIsSaved(alreadySaved);
                fetchMostSearched();
            }
        } catch {
            setError('Failed to get explanation. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!explanation || !medicineName || !userId) return;
        try {
            await pharmacyApi.saveExplanation(userId, medicineName, explanation);
            setIsSaved(true);
            setSavingMsg('Saved to bookmarks!');
            fetchSaved();
        } catch (err) {
            if (err.response?.status === 409) {
                setSavingMsg('Already in bookmarks.');
                setIsSaved(true);
            }
        }
    };

    const handleDelete = async (id) => {
        try {
            await pharmacyApi.deleteSavedExplanation(id);
            setSavedList(prev => prev.filter(s => s.id !== id));
            if (savedList.find(s => s.id === id)?.medicineName.toLowerCase() === medicineName.toLowerCase()) {
                setIsSaved(false);
                setSavingMsg('');
            }
        } catch { /* silent */ }
    };

    const sectionIcons = {
        'What it does': '💊',
        'How to take it': '📋',
        'Common side effects': '⚠️',
        'What to avoid': '🚫',
    };

    const renderExplanation = (text) => {
        const lines = text.split('\n').filter(line => line.trim());
        const result = [];
        let i = 0;
        while (i < lines.length) {
            const line = lines[i];
            const boldMatch = line.match(/^\*\*(.*?)\*\*[:\s]*(.*)$/);
            if (boldMatch) {
                const header = boldMatch[1].replace(':', '').trim();
                let body = boldMatch[2].trim();
                if (!body && i + 1 < lines.length && !lines[i + 1].match(/^\*\*/)) {
                    i++;
                    body = lines[i].trim();
                }
                const icon = sectionIcons[header] || '•';
                result.push(
                    <div key={i} style={sectionCardStyle}>
                        <div style={sectionHeaderStyle}>
                            <span style={{ fontSize: 20 }}>{icon}</span>
                            <span style={sectionTitleStyle}>{header}</span>
                        </div>
                        {body && <p style={sectionBodyStyle}>{body}</p>}
                    </div>
                );
            } else {
                result.push(<p key={i} style={{ ...sectionBodyStyle, paddingLeft: 8 }}>{line}</p>);
            }
            i++;
        }
        return result;
    };

    return (
        <div style={pageStyle}>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

            {/* Page Header */}
            <div style={pageHeaderStyle}>
                <h2 style={pageTitleStyle}>✦ AI Medicine Explainer</h2>
                <p style={pageSubStyle}>Search any medicine · Save bookmarks · See what others search</p>
            </div>

            {/* 3-Column Layout */}
            <div style={columnsStyle}>

                {/* ── LEFT: Bookmarks ── */}
                <div style={panelStyle}>
                    <div style={panelHeaderStyle}>
                        <span style={panelIconStyle}>📚</span>
                        <span style={panelTitleStyle}>Bookmarks</span>
                        <span style={panelCountStyle}>{savedList.length}</span>
                    </div>
                    {savedList.length === 0 ? (
                        <div style={emptyPanelStyle}>
                            <p style={{ margin: 0, color: '#94a3b8', fontSize: 13, textAlign: 'center' }}>
                                No bookmarks yet.<br />Save an explanation to see it here.
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {savedList.map(s => (
                                <div key={s.id} style={bookmarkItemStyle}>
                                    <span
                                        style={bookmarkNameStyle}
                                        onClick={() => { setMedicineName(s.medicineName); setExplanation(s.explanation); setIsSaved(true); setSavingMsg(''); setError(''); }}
                                    >
                                        💊 {s.medicineName}
                                    </span>
                                    <button
                                        onClick={() => handleDelete(s.id)}
                                        style={deleteBtnStyle}
                                        title="Remove bookmark"
                                    >✕</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── CENTER: Main Search ── */}
                <div style={centerStyle}>
                    <div style={cardStyle}>
                        <label style={labelStyle}>MEDICINE NAME</label>
                        <div style={searchRowStyle}>
                            <input
                                type="text"
                                placeholder="e.g. Paracetamol, Amoxicillin..."
                                value={medicineName}
                                onChange={e => setMedicineName(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && !loading && handleExplain()}
                                style={inputStyle}
                            />
                            <button
                                onClick={() => handleExplain()}
                                disabled={loading || !medicineName.trim()}
                                style={{ ...btnStyle, opacity: (loading || !medicineName.trim()) ? 0.6 : 1, cursor: (loading || !medicineName.trim()) ? 'not-allowed' : 'pointer' }}
                            >
                                {loading ? 'Analyzing...' : 'Explain'}
                            </button>
                        </div>
                    </div>

                    {loading && (
                        <div style={{ ...cardStyle, textAlign: 'center', padding: '40px 20px' }}>
                            <div style={spinnerStyle} />
                            <p style={{ color: '#666', marginTop: 14, fontSize: 15 }}>
                                AI is analyzing <strong style={{ color: '#28a745' }}>{medicineName}</strong>...
                            </p>
                        </div>
                    )}

                    {error && <div style={errorStyle}>⚠️ {error}</div>}

                    {explanation && !loading && (
                        <div style={cardStyle}>
                            <div style={resultHeaderStyle}>
                                <span style={medBadgeStyle}>{medicineName}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    {savingMsg && <span style={{ color: '#28a745', fontSize: 12, fontWeight: 700 }}>{savingMsg}</span>}
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaved}
                                        style={{ ...saveBtnStyle, opacity: isSaved ? 0.5 : 1, cursor: isSaved ? 'default' : 'pointer' }}
                                    >
                                        {isSaved ? '✓ Saved' : '+ Save'}
                                    </button>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {renderExplanation(explanation)}
                            </div>
                            <div style={disclaimerStyle}>
                                ⚕️ AI-generated information for educational purposes only. Always consult your pharmacist or doctor for personal medical advice.
                            </div>
                        </div>
                    )}
                </div>

                {/* ── RIGHT: Most Searched ── */}
                <div style={panelStyle}>
                    <div style={panelHeaderStyle}>
                        <span style={panelIconStyle}>🔥</span>
                        <span style={panelTitleStyle}>Most Searched</span>
                    </div>
                    {mostSearched.length === 0 ? (
                        <div style={emptyPanelStyle}>
                            <p style={{ margin: 0, color: '#94a3b8', fontSize: 13, textAlign: 'center' }}>
                                No searches yet.<br />Start searching to see trends.
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {mostSearched.map((item, index) => (
                                <div
                                    key={item.medicineName}
                                    style={trendingItemStyle}
                                    onClick={() => handleExplain(item.medicineName)}
                                >
                                    <span style={rankStyle}>{index + 1}</span>
                                    <span style={trendingNameStyle}>{item.medicineName}</span>
                                    <span style={countBadgeStyle}>{item.searchCount}x</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

/* ── Styles ── */
const pageStyle = { padding: '32px 24px', backgroundColor: '#f4f7f6', minHeight: '100vh', boxSizing: 'border-box' };
const pageHeaderStyle = { marginBottom: 24 };
const pageTitleStyle = { fontSize: 28, fontWeight: 800, color: '#1e293b', margin: 0 };
const pageSubStyle = { color: '#666', marginTop: 6, fontSize: 14 };

const columnsStyle = { display: 'flex', gap: 20, alignItems: 'flex-start' };
const centerStyle = { flex: 1, display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 };

const panelStyle = { width: 240, flexShrink: 0, backgroundColor: '#fff', borderRadius: 15, padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', position: 'sticky', top: 20 };
const panelHeaderStyle = { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, paddingBottom: 12, borderBottom: '2px solid #f1f5f9' };
const panelIconStyle = { fontSize: 18 };
const panelTitleStyle = { fontWeight: 800, color: '#1e293b', fontSize: 15, flex: 1 };
const panelCountStyle = { background: '#f1f5f9', color: '#475569', borderRadius: 20, padding: '2px 8px', fontSize: 12, fontWeight: 700 };
const emptyPanelStyle = { padding: '20px 0' };

const bookmarkItemStyle = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', borderRadius: 8, padding: '8px 10px', border: '1px solid #e2e8f0' };
const bookmarkNameStyle = { fontSize: 13, fontWeight: 600, color: '#1e293b', cursor: 'pointer', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };
const deleteBtnStyle = { background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 12, padding: '0 0 0 6px', flexShrink: 0 };

const trendingItemStyle = { display: 'flex', alignItems: 'center', gap: 8, background: '#f8fafc', borderRadius: 8, padding: '9px 10px', border: '1px solid #e2e8f0', cursor: 'pointer' };
const rankStyle = { width: 20, height: 20, background: '#28a745', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0 };
const trendingNameStyle = { fontSize: 13, fontWeight: 600, color: '#1e293b', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };
const countBadgeStyle = { background: '#dcfce7', color: '#166534', borderRadius: 10, padding: '2px 7px', fontSize: 11, fontWeight: 700, flexShrink: 0 };

const cardStyle = { backgroundColor: '#fff', borderRadius: 15, padding: '28px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' };
const labelStyle = { display: 'block', color: '#475569', fontSize: 12, fontWeight: 800, letterSpacing: '1.2px', marginBottom: 10 };
const searchRowStyle = { display: 'flex', gap: 12 };
const inputStyle = { flex: 1, padding: '14px 18px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 15, color: '#1e293b', outline: 'none', background: '#f8fafc' };
const btnStyle = { padding: '14px 28px', background: '#28a745', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 800, fontSize: 15, transition: '.2s', whiteSpace: 'nowrap' };

const spinnerStyle = { width: 40, height: 40, border: '4px solid #e2e8f0', borderTop: '4px solid #28a745', borderRadius: '50%', animation: 'spin 0.9s linear infinite', margin: '0 auto' };
const errorStyle = { backgroundColor: '#fff5f5', border: '1px solid #fed7d7', color: '#c53030', padding: '16px 20px', borderRadius: 12, fontSize: 14 };

const resultHeaderStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottom: '2px solid #f1f5f9' };
const medBadgeStyle = { background: '#28a745', color: '#fff', padding: '7px 18px', borderRadius: 20, fontWeight: 800, fontSize: 15 };
const saveBtnStyle = { padding: '7px 16px', background: '#fff', color: '#28a745', border: '2px solid #28a745', borderRadius: 10, fontWeight: 800, fontSize: 13 };

const sectionCardStyle = { background: '#f8fafc', borderRadius: 10, padding: '16px 20px', border: '1px solid #e2e8f0' };
const sectionHeaderStyle = { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 };
const sectionTitleStyle = { fontWeight: 800, color: '#1e293b', fontSize: 15 };
const sectionBodyStyle = { margin: 0, color: '#475569', fontSize: 14, lineHeight: 1.75 };
const disclaimerStyle = { marginTop: 20, padding: '13px 18px', background: '#f0fdf4', borderRadius: 10, color: '#166534', fontSize: 13, borderLeft: '4px solid #28a745', lineHeight: 1.6 };

export default MedicineExplainer;
