import React, { useState, useEffect } from 'react';
import { pharmacyApi } from '../services/apiService';


 
function InteractionGuard() {
    const [medicines, setMedicines] = useState([]);

    const [selectedIngredientId1, setSelectedIngredientId1] = useState('');
    const [selectedIngredientId2, setSelectedIngredientId2] = useState('');

    const [selectedMedName1, setSelectedMedName1] = useState('');
    const [selectedMedName2, setSelectedMedName2] = useState('');

    const [safetyMessage, setSafetyMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchMedicines = async () => {
            try {
                const response = await pharmacyApi.getMedicines();
                const sorted = (response.data || []).sort((a, b) => {
                    const nameA = (a.name ?? a.Name ?? '').toLowerCase();
                    const nameB = (b.name ?? b.Name ?? '').toLowerCase();
                    return nameA.localeCompare(nameB);
                });
                setMedicines(sorted);
            } catch (error) {
                console.error("Failed to load medicines for safety gate:", error);
            }
        };
        fetchMedicines();
    }, []);

    const handleSelect1 = (e) => {
        const ingId = e.target.value;
        const med = medicines.find(m => String(m.ingredientId ?? m.IngredientId) === ingId);
        setSelectedIngredientId1(ingId);
        setSelectedMedName1(med ? (med.name ?? med.Name ?? '') : '');
    };

    const handleSelect2 = (e) => {
        const ingId = e.target.value;
        const med = medicines.find(m => String(m.ingredientId ?? m.IngredientId) === ingId);
        setSelectedIngredientId2(ingId);
        setSelectedMedName2(med ? (med.name ?? med.Name ?? '') : '');
    };

    const checkSafety = async () => {
        if (!selectedIngredientId1 || !selectedIngredientId2) {
            setSafetyMessage('⚠️ Please select two medicines to scan.');
            return;
        }

        if (selectedIngredientId1 === selectedIngredientId2) {
            setSafetyMessage('ℹ️ Please select two medicines with different active ingredients.');
            return;
        }

        setIsLoading(true);
        setSafetyMessage('🔍 Scanning clinical database...');

        try {

            const response = await pharmacyApi.checkInteraction(
                selectedIngredientId1,
                selectedIngredientId2
            );

            const data = response.data;

            if (data.interacts) {
                setSafetyMessage(
                    `🛑 DANGER — ${data.severity ?? 'Interaction Detected'}: ${data.message ?? 'These two medicines should not be taken together.'}`
                );
            } else {
                setSafetyMessage(
                    `✅ No known interaction between "${selectedMedName1}" and "${selectedMedName2}". Safe to dispense.`
                );
            }

        } catch (error) {
            console.error("Safety Engine error:", error);
            setSafetyMessage("❌ Error: Could not connect to Safety Engine.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="no-print" style={wideCardStyle}>
            {/* Header Area */}
            <div style={headerRow}>
                <h3 style={titleStyle}>
                    <span style={iconCircle}>🛡️</span>
                    Interaction Guard
                </h3>
                <span style={subtitleStyle}>Clinical Safety Engine</span>
            </div>

            <div style={searchCapsule}>

                <select
                    value={selectedIngredientId1}
                    onChange={handleSelect1}
                    style={capsuleInputStyle}
                >
                    <option value="">-- Select Medicine 1 --</option>
                    {medicines.map(med => {
                        const medId = med.id ?? med.Id;
                        const ingredientId = med.ingredientId ?? med.IngredientId;
                        const medName = med.name ?? med.Name ?? "Unknown";
                        return (
                            <option key={medId} value={String(ingredientId)}>
                                {medName}
                            </option>
                        );
                    })}
                </select>

                <div style={{ width: '2px', backgroundColor: '#e2e8f0', margin: '8px 10px' }}></div>

                <select
                    value={selectedIngredientId2}
                    onChange={handleSelect2}
                    style={capsuleInputStyle}
                >
                    <option value="">-- Select Medicine 2 --</option>
                    {medicines.map(med => {
                        const medId = med.id ?? med.Id;
                        const ingredientId = med.ingredientId ?? med.IngredientId;
                        const medName = med.name ?? med.Name ?? "Unknown";
                        return (
                            <option key={medId} value={String(ingredientId)}>
                                {medName}
                            </option>
                        );
                    })}
                </select>

                <button
                    onClick={checkSafety}
                    disabled={isLoading}
                    style={isLoading ? { ...actionBtnStyle, opacity: 0.6 } : actionBtnStyle}
                >
                    {isLoading ? 'Checking...' : 'Check Safety'}
                </button>
            </div>

            {safetyMessage && (
                <div style={resultBoxStyle(safetyMessage)}>
                    {safetyMessage}
                </div>
            )}
        </div>
    );
}

// ─── STYLES —───────────────────────────────────

const wideCardStyle = {
    width: '100%',
    backgroundColor: '#ffffff',
    padding: '35px',
    borderRadius: '24px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    boxSizing: 'border-box',
    background: '#f8fafc'
};

const headerRow = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '2px solid #f1f5f9',
    paddingBottom: '15px',
    marginBottom: '10px'
};

const titleStyle = {
    fontSize: '24px',
    fontWeight: '900',
    color: '#1e293b',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
};

const iconCircle = {
    backgroundColor: '#f1f5f9',
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #e2e8f0',
    fontSize: '22px'
};

const searchCapsule = {
    display: 'flex',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '8px',
    border: '1px solid #cbd5e1',
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)',
    marginTop: '10px'
};

const capsuleInputStyle = {
    flex: 1,
    border: 'none',
    background: 'transparent',
    padding: '12px 15px',
    fontSize: '15px',
    fontWeight: '600',
    color: '#333',
    outline: 'none',
    cursor: 'pointer'
};

const actionBtnStyle = {
    background: 'linear-gradient(to bottom, #475569, #1e293b)',
    color: 'white',
    padding: '12px 25px',
    borderRadius: '12px',
    border: 'none',
    borderBottom: '3px solid #0f172a',
    fontSize: '13px',
    fontWeight: '800',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    transition: 'all 0.1s ease'
};

const resultBoxStyle = (msg) => ({
    marginTop: '10px',
    padding: '20px',
    borderRadius: '12px',
    backgroundColor: '#fff',
    borderLeft: `6px solid ${msg.includes('DANGER') || msg.includes('⚠️') || msg.includes('❌') || msg.includes('🛑')
        ? '#dc3545' : '#28a745'
        }`,
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    fontWeight: '700',
    color: msg.includes('DANGER') || msg.includes('⚠️') || msg.includes('❌') || msg.includes('🛑')
        ? '#dc3545' : '#1e6b3e',
    fontSize: '15px'
});

const subtitleStyle = {
    fontSize: '11px',
    fontWeight: '800',
    color: '#34495e',
    textTransform: 'uppercase',
    letterSpacing: '1.5px'
};

export default InteractionGuard;