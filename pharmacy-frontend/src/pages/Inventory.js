import React, { useState } from 'react';
import { pharmacyApi } from '../services/apiService';
import AlternativeMatcher from '../pages/AlternativeMatcher';
import InteractionGuard from '../pages/InteractionGuard';
import StatCards from '../pages/StatCards';
import { getSmartDiscount } from '../pages/PricingEngine';
import PricingCell from '../pages/PricingCell';
import BarcodeScanner from '../pages/BarcodeScanner';
import PrescriptionBasket from '../pages/PrescriptionBasket';
import InvoiceModal from '../pages/InvoiceModal';

function Inventory({
    medicines,
    fetchMedicines,
    setMedicines,
    salesCountMap,
    userRole,
    currentUserId,
    loginCredentials,
    fetchPatients,
    fetchMyHistory,
    cart,
    setCart,
    isOrderPlaced,
    setIsOrderPlaced,
    currentInvoice,
    setCurrentInvoice,
    setView,
    patients = []
}) {

    // 1. DATA STATES
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        name: '', ingredientId: '', price: 0, basePrice: 0, costPrice: 0, stockQuantity: 0, expiryDate: '', category: '', barcode: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [barcodeInput, setBarcodeInput] = useState('');
    const [dismissedSuggestions, setDismissedSuggestions] = useState([]);

    const [deliveryInfo] = useState({ address: 'In-Store Sale', method: 'Cash' });
    const TRENDING_THRESHOLD = 5;

    // 3. FUNCTIONS

    /**
     * Resets the inventory form to default values.
     */
    const clearForm = () => {
        setFormData({ name: '', ingredientId: '', price: 0, basePrice: 0, costPrice: 0, stockQuantity: 0, expiryDate: '', category: '', barcode: '' });
        setIsEditing(false);
        setEditId(null);
    };

    const handleEditClick = (med) => {
        setFormData({
            name: med.name ?? med.Name ?? '',
            ingredientId: med.ingredientId ?? med.ingredient?.id ?? '',
            price: med.price ?? med.Price ?? 0,
            basePrice: (med.basePrice || med.BasePrice || med.price || med.Price || 0),
            costPrice: med.costPrice ?? med.CostPrice ?? 0,
            stockQuantity: med.stockQuantity ?? med.StockQuantity ?? 0,
            expiryDate: (med.expiryDate ?? med.ExpiryDate ?? '').split('T')[0],
            category: med.category ?? med.Category ?? '',
            barcode: med.barcode ?? med.Barcode ?? ''
        });
        setEditId(med.id ?? med.Id);
        setIsEditing(true);
    };

    /**
     * Adds medicine to the virtual cart.
     * Includes an automated Clinical Interaction check against existing items.
     */
    const handleAddToCart = async (newMedicine) => {
        if (!newMedicine) return;

        const medName = newMedicine.Name || newMedicine.name;
        const medId = newMedicine.Id || newMedicine.id;
        const medPrice = Number(newMedicine.Price || newMedicine.price || 0);
        const newIngredientId = newMedicine.ingredientId ?? newMedicine.IngredientId;

        const isActive = newMedicine.IsActive ?? newMedicine.isActive;
        if (isActive === false) {
            alert(`🚫 ${medName} is currently restricted (Inactive).`);
            return;
        }

        const currentStock = Number(newMedicine.stockQuantity ?? newMedicine.StockQuantity ?? 0);
        const alreadyInCart = cart.find(item => item.id === medId);
        const qtyInCart = alreadyInCart ? alreadyInCart.quantity : 0;
        if (currentStock === 0 || currentStock - qtyInCart <= 0) {
            alert(`❌ OUT OF STOCK: "${medName}" has no available units.\n\nPlease record a new shipment from Suppliers before selling.`);
            return;
        }

        
        for (const cartItem of cart) {
            const cartIngredientId = cartItem.ingredientId ?? cartItem.IngredientId;
            if (!newIngredientId || !cartIngredientId) continue;

            try {
                const response = await pharmacyApi.checkInteraction(cartIngredientId, newIngredientId);
                const data = response.data;

                if (data.interacts) {
                    const severity = data.severity ?? 'Interaction Detected';
                    const warningMsg = data.message ?? 'These medicines may interact dangerously.';
                    const proceed = window.confirm(
                        ` DRUG INTERACTION WARNING\n` +
                        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                        `"${medName}" + "${cartItem.name}"\n\n` +
                        ` Severity: ${severity}\n\n` +
                        `${warningMsg}\n\n` +
                        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                        `Press OK to add anyway, or Cancel to stop.`
                    );
                    if (!proceed) return;
                }
            } catch (error) {
                console.error("Interaction check failed for cart item:", cartItem.name, error);
            }
        }

        const existingItem = cart.find(item => item.id === medId);

        if (existingItem) {
            setCart(cart.map(item =>
                item.id === medId
                    ? { ...item, quantity: item.quantity + 1, totalPrice: (item.quantity + 1) * medPrice }
                    : item
            ));
        } else {
            const newItem = {
                id: medId,
                Id: medId,
                name: medName,
                price: medPrice,
                ingredientId: newIngredientId,
                IngredientId: newIngredientId,
                quantity: 1,
                totalPrice: medPrice,
                cartId: Date.now()
            };
            setCart(prevCart => [...prevCart, newItem]);
        }

        alert(`✅ Added ${medName} to prescription basket.`);
    };

    const removeFromCart = (cartId) => {
        setCart(cart.filter(item => item.cartId !== cartId));
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        setCurrentInvoice(null);
        const finalAddress = deliveryInfo.address.trim();

        if (userRole === 'Client' && finalAddress === "") {
            alert("⚠️ Please enter a delivery address before confirming.");
            return;
        }

        if (userRole === 'Client' && !currentUserId) {
            alert("❌ Session Error: Please log out and log back in.");
            return;
        }

        let customerIdentifier = "";
        let displayIdentifier = "";

        if (userRole === 'Client') {
            customerIdentifier = loginCredentials.username;
            displayIdentifier = loginCredentials.username;
        } else {
            const phone = prompt("Enter Patient Phone Number (Leave blank for Anonymous):");
            customerIdentifier = phone || "0000000000";
            displayIdentifier = phone || "Walk-in Customer";

            // ── Profile Safety Check ──
            // If a phone was entered, look up the patient and check their
            // medication history against every medicine in the cart.
            if (phone && phone.trim() !== "") {
                const matchedPatient = patients.find(p =>
                    (p.phoneNumber ?? p.PhoneNumber ?? '') === phone.trim()
                );

                if (matchedPatient) {
                    try {
                        const patientId  = matchedPatient.id ?? matchedPatient.Id;
                        const cartMedIds = cart.map(item => parseInt(item.id ?? item.Id));

                        const profileRes = await pharmacyApi.checkAgainstProfile(patientId, cartMedIds);
                        const profileData = profileRes.data;

                        if (!profileData.safe && profileData.interactions?.length > 0) {
                            // Build a readable warning message
                            const lines = profileData.interactions.map(itx =>
                                `• [${(itx.severity ?? 'UNKNOWN').toUpperCase()}] ${itx.newIngredient} ↔ ${itx.conflictsWithProfileIngredient}\n` +
                                `  ${itx.message}`
                            ).join('\n\n');

                            const proceed = window.confirm(
                                ` PATIENT PROFILE CONFLICT\n` +
                                `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                                `Patient: ${matchedPatient.fullName ?? matchedPatient.FullName}\n\n` +
                                `${lines}\n\n` +
                                `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                                `Press OK to dispense anyway, or Cancel to abort.`
                            );

                            if (!proceed) return; // pharmacist chose to abort
                        }
                    } catch (profileErr) {
                        console.error("Profile safety check error:", profileErr);
                        // Non-blocking — if the check fails, allow checkout to continue
                    }
                }
            }
            // ── End Profile Safety Check ──
        }

        try {
            await Promise.all(cart.map(item => {
                if (userRole === 'Client') {
                    return pharmacyApi.createOnlineOrder({
                        UserId: parseInt(currentUserId),
                        MedicineName: String(item.name),
                        Quantity: parseInt(item.quantity),
                        TotalPrice: parseFloat(item.totalPrice),
                        ShippingAddress: finalAddress,
                        PaymentMethod: String(deliveryInfo.method || "Cash"),
                        Status: "Processing",
                        OrderDate: new Date().toISOString()
                    });
                } else {
                    return pharmacyApi.recordPatientPurchase({
                        patientPhone: String(customerIdentifier),
                        medicineId: parseInt(item.id || item.Id, 10),
                        quantity: parseInt(item.quantity),
                        totalPrice: parseFloat(item.totalPrice)
                    });
                }
            }));

            setCurrentInvoice({
                items: [...cart],
                total: cart.reduce((sum, item) => sum + item.totalPrice, 0),
                date: new Date().toLocaleString(),
                patient: displayIdentifier,
                address: userRole === 'Client' ? finalAddress : "In-Store Sale",
                paymentMethod: deliveryInfo.method
            });

            await fetchMedicines();
            await fetchPatients();
            if (userRole === 'Client' && typeof fetchMyHistory === 'function') {
                await fetchMyHistory();
            }

            setIsOrderPlaced(true);
            setCart([]);

            alert(userRole === 'Client' ? `✅ Order confirmed! Delivering to: ${finalAddress}` : "✅ Sale Complete!");

        } catch (error) {
            console.error("DEBUG SERVER ERROR:", error.response?.data);
            const errorData = error.response?.data;
            const errorMessage = errorData?.errors
                ? JSON.stringify(errorData.errors)
                : (errorData?.message || errorData || "C# Server Connection Error");
            alert(`❌ Checkout Failed: ${errorMessage}`);
        }
    };

    const handleApplyInventoryDiscount = async (med) => {
        const expiryDate = med.expiryDate ?? med.ExpiryDate;
        const currentPrice = Number(med.price ?? med.Price ?? 0);

        
        const rawBase = med.basePrice ?? med.BasePrice;
        const basePrice = Number(rawBase || currentPrice);

        const discountFactor = getSmartDiscount(expiryDate);
        if (discountFactor === 0) return;

        const suggestedPrice = (basePrice * (1 - discountFactor)).toFixed(2);
        const percentage = (discountFactor * 100).toFixed(0);

        if (currentPrice <= parseFloat(suggestedPrice)) {
            alert("This discount has already been applied.");
            setDismissedSuggestions(prev => [...prev, med.id ?? med.Id]);
            return;
        }

        if (window.confirm(`Apply ${percentage}% smart discount? New price: ${suggestedPrice} EGP`)) {
            try {
                const targetId = med.id ?? med.Id;
                await pharmacyApi.updateMedicine(targetId, {
                    ...med,
                    price: parseFloat(suggestedPrice),
                    Price: parseFloat(suggestedPrice),
                    basePrice: basePrice,
                    BasePrice: basePrice,
                    Id: targetId,
                    id: targetId
                });
                setMedicines(prev => prev.map(m =>
                    (m.id === targetId || m.Id === targetId) ? { ...m, price: parseFloat(suggestedPrice), Price: parseFloat(suggestedPrice) } : m
                ));
                setDismissedSuggestions(prev => [...prev, targetId]);
                alert(`✅ Success: ${percentage}% Discount Applied!`);
            } catch (error) {
                console.error("Discount Error:", error);
                alert("❌ Database update failed. Check the C# console.");
            }
        }
    };

    const addMedicine = async () => {
        if (!formData.name || !formData.ingredientId || !formData.category || !formData.expiryDate) {
            alert("⚠️ Validation Error: Please fill in all mandatory fields.");
            return;
        }
        try {
            await pharmacyApi.addMedicine({
                ...formData,
                ingredientId: parseInt(formData.ingredientId, 10)
            });
            fetchMedicines();
            clearForm();
            alert("✅ Inventory entry created successfully!");
        } catch (error) {
            alert("❌ Database Write Error: Check server connection.");
        }
    };

    const updateMedicine = async () => {
        try {
            await pharmacyApi.updateMedicine(editId, {
                ...formData,
                id: editId,
                ingredientId: parseInt(formData.ingredientId, 10)
            });
            fetchMedicines();
            clearForm();
            alert("✅ Record updated successfully!");
        } catch (error) {
            alert("❌ Update failed. Record may be locked or missing.");
        }
    };

    const toggleActiveStatus = async (medicine) => {
        const targetId = medicine.id || medicine.Id;
        const currentStatus = (medicine.IsActive !== undefined) ? medicine.IsActive : medicine.isActive;
        const newStatus = !currentStatus;

        try {
            setMedicines(prev => prev.map(m =>
                (m.id === targetId || m.Id === targetId)
                    ? { ...m, IsActive: newStatus, isActive: newStatus }
                    : m
            ));
            await pharmacyApi.updateMedicine(targetId, {
                ...medicine,
                Id: targetId,
                id: targetId,
                IsActive: newStatus,
                isActive: newStatus
            });
            await fetchMedicines();
            alert(`✅ ${medicine.name ?? medicine.Name} is now ${newStatus ? 'Active' : 'Disabled'}.`);
        } catch (error) {
            console.error("Update Error:", error.response?.data || error.message);
            await fetchMedicines();
            alert("❌ Update failed. Check the C# Console.");
        }
    };

    const disableExpiredMedicines = async () => {
        const expiredOnes = medicines.filter(m =>
            new Date(m.expiryDate ?? m.ExpiryDate) < new Date() &&
            (m.IsActive ?? m.isActive) !== false
        );

        if (expiredOnes.length === 0) return alert("✅ No active expired medicines found!");

        if (window.confirm(`Found ${expiredOnes.length} expired items. Disable all for safety?`)) {
            try {
                for (const med of expiredOnes) {
                    await pharmacyApi.updateMedicine(med.id || med.Id, { ...med, IsActive: false });
                }
                await fetchMedicines();
                alert(`✅ Successfully disabled ${expiredOnes.length} items.`);
            } catch (error) {
                alert("❌ Error during batch update.");
            }
        }
    };

    const handleBarcodeKeyDown = (e) => {
        if (e.key === 'Enter') {
            const cleanInput = barcodeInput.trim();
            const foundMed = medicines.find(m =>
                (m.barcode || m.Barcode) === cleanInput
            );

            if (foundMed) {
                const isActive = foundMed.IsActive ?? foundMed.isActive;
                if (isActive === false || isActive === 0) {
                    alert(`🚫 Scanned: ${foundMed.name || foundMed.Name} is currently INACTIVE.`);
                } else {
                    handleAddToCart(foundMed);
                }
                setBarcodeInput('');
            } else {
                alert("⚠️ Barcode not found. Please ensure the product is registered in Inventory.");
                setBarcodeInput('');
            }
        }
    };

    const filteredMedicines = medicines.filter(med => {
        if (!med) return false;
        const name = (med.Name ?? med.name ?? "").toString().toLowerCase();
        const category = (med.Category ?? med.category ?? "").toString().toLowerCase();
        const ingredient = (med.ingredient?.name ?? med.Ingredient?.Name ?? med.ActiveIngredient ?? med.activeIngredient ?? "").toString().toLowerCase();
        const search = searchTerm.toLowerCase().trim();
        return (
            name.includes(search) ||
            category.includes(search) ||
            ingredient.includes(search)
        );
    }).sort((a, b) => {
        const nameA = (a.Name ?? a.name ?? "").toLowerCase();
        const nameB = (b.Name ?? b.name ?? "").toLowerCase();
        return nameA.localeCompare(nameB);
    });

    const handlePrint = () => {
        const reportEl = document.getElementById('printable-report');
        if (!reportEl) { window.print(); return; }

        const reportHTML = reportEl.outerHTML;
        const printWindow = window.open('', '_blank', 'width=900,height=700');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Smart Pharmacy — Stock Report</title>
                <style>
                    body { font-family: Arial, sans-serif; color: #000; margin: 20px 30px; }
                    .report-header { margin-bottom: 16px; }
                    .report-header h2 { margin: 0 0 4px 0; color: #28a745; font-size: 20px; }
                    .report-header p  { margin: 0 0 12px 0; font-size: 12px; color: #555; }
                    table { width: 100%; border-collapse: collapse; font-size: 11px; }
                    th { background-color: #f0f0f0; border: 1px solid #bbb; padding: 7px 8px; text-align: left; font-size: 11px; }
                    td { border: 1px solid #ddd; padding: 6px 8px; font-size: 11px; }
                    tr:nth-child(even) td { background-color: #f9f9f9; }
                    .no-print { display: none !important; }
                    @media print { .no-print { display: none !important; } }
                </style>
            </head>
            <body>${reportHTML}</body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 400);
    };

    return (
        <div className="inventory-page">
            <div style={viewHeaderContainer}>
                <div style={accentBar}></div>
                <div style={textContainer}>
                    <h2 style={viewTitleStyle}>Inventory Management</h2>
                    <p style={viewSubtitleStyle}>Real-time stock monitoring & control</p>
                </div>
                <div style={statusBadge}>
                    Live Inventory Mode
                </div>
            </div>

            <StatCards medicines={medicines} salesCountMap={salesCountMap} setView={setView} />

            {userRole !== 'Client' && (
                <>
                    <div className="no-print" style={commandBarContainer}>
                        <div style={commandBarInner}>
                            <div style={toolLabelStyle}>
                                <span style={{ fontSize: '18px' }}>🛠️</span>
                                <span>SYSTEM MAINTENANCE CONSOLE</span>
                            </div>
                            <button
                                onClick={disableExpiredMedicines}
                                style={autoDisableBtnStyle}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                🧹 Auto-Disable All Expired Stock
                            </button>
                        </div>
                    </div>

                    {(userRole === 'Admin' || userRole === 'Pharmacist') && (
                        <div className="no-print" style={formContainerStyle}>
                            <h3 style={formHeaderStyle}>
                                <span style={{ fontSize: '24px' }}>
                                    {isEditing ? "📝" : "✚"}
                                </span>
                                {isEditing ? "Modify Medicine Details" : "Register New Inventory"}
                            </h3>

                            <p style={labelStyle}>Drug Specifications</p>
                            <div style={inputGroupGrid}>
                                <input
                                    placeholder="Medicine Name"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    style={modernInput}
                                />
                                <input
                                    placeholder="Active Ingredient ID (e.g. 1)"
                                    value={formData.ingredientId}
                                    onChange={e => setFormData({ ...formData, ingredientId: e.target.value })}
                                    style={modernInput}
                                />
                                <input
                                    placeholder="Category (e.g. Antibiotic)"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    style={modernInput}
                                />
                            </div>

                            <p style={{ ...labelStyle, marginTop: '25px' }}>Logistics & Finance</p>
                            <div style={inputGroupGrid}>
                                <input
                                    type="number"
                                    placeholder="Unit Price (EGP)"
                                    value={formData.price || ''}
                                    onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                    style={modernInput}
                                />
                                
                                <input
                                    type="number"
                                    placeholder="Base Price / Original Price (EGP)"
                                    value={formData.basePrice || ''}
                                    onChange={e => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })}
                                    style={{ ...modernInput, borderColor: '#f59e0b' }}
                                />
                                <input
                                    type="number"
                                    placeholder="Cost Price / Supplier Price (EGP)"
                                    value={formData.costPrice || ''}
                                    onChange={e => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                                    style={modernInput}
                                />
                                <input
                                    type="number"
                                    placeholder="Stock Quantity"
                                    value={formData.stockQuantity || ''}
                                    onChange={e => setFormData({ ...formData, stockQuantity: parseInt(e.target.value, 10) || 0 })}
                                    style={modernInput}
                                />
                                <input
                                    type="date"
                                    value={formData.expiryDate}
                                    onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                                    style={modernInput}
                                />
                            </div>

                            <p style={{ ...labelStyle, marginTop: '25px' }}>Advanced Tracking</p>
                            <div style={inputGroupGrid}>
                                <input
                                    placeholder="📟 Barcode (Optional Scan)"
                                    value={formData.barcode}
                                    onChange={e => setFormData({ ...formData, barcode: e.target.value })}
                                    style={{
                                        ...modernInput,
                                        border: '2px solid #00b894',
                                        backgroundColor: '#f0fff4',
                                        fontFamily: 'monospace',
                                        color: '#1e293b'
                                    }}
                                />
                                <div />
                                <div />
                            </div>

                            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                                <button
                                    onClick={isEditing ? updateMedicine : addMedicine}
                                    style={isEditing ? { ...addBtnStyle, background: 'linear-gradient(to bottom, #f59e0b, #d97706)' } : addBtnStyle}
                                >
                                    {isEditing ? "💾 Save Changes" : "🚀 Commit to System"}
                                </button>
                                {isEditing && (
                                    <button
                                        onClick={clearForm}
                                        style={cancelBtnStyle}
                                    >
                                        ✕ Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', maxWidth: '1050px', margin: '40px auto' }}>
                        <AlternativeMatcher medicines={medicines} />
                        <InteractionGuard patients={patients} userRole={userRole} />
                    </div>

                    <div className="no-print" style={navigationDockStyle}>
                        <div style={searchDockWrapper}>
                            <span style={{ marginRight: '10px', fontSize: '18px' }}>🔍</span>
                            <input
                                type="text"
                                placeholder="Search Inventory by Name, Category, or Active Ingredient..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={searchDockInput}
                            />
                        </div>
                        <button onClick={handlePrint} style={printDockBtn}>
                            <span style={{ marginRight: '8px' }}>🖨️</span>
                            Generate Stock Report
                        </button>
                    </div>

                    <BarcodeScanner
                        barcodeInput={barcodeInput}
                        setBarcodeInput={setBarcodeInput}
                        onKeyDown={handleBarcodeKeyDown}
                    />

                    <PrescriptionBasket
                        cart={cart}
                        removeFromCart={removeFromCart}
                        onCheckout={handleCheckout}
                    />

                    {isOrderPlaced && (
                        <InvoiceModal
                            invoice={currentInvoice}
                            onClose={() => setIsOrderPlaced(false)}
                        />
                    )}

                    <div id="printable-report">
                        <div className="report-header" style={{ display: 'none' }}>
                            <h2>✚ Smart Pharmacy</h2>
                            <p>Stock Report — Generated: {new Date().toLocaleString()}</p>
                        </div>

                        <div style={tableContainerStyle}>
                            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
                                <thead>
                                    <tr>
                                        <th style={tableHeaderStyle}>Category</th>
                                        <th style={tableHeaderStyle}>Product Name</th>
                                        <th style={tableHeaderStyle}>Active Ingredient</th>
                                        <th style={{ ...tableHeaderStyle, textAlign: 'center' }}>Price Intelligence</th>
                                        <th style={tableHeaderStyle}>Inventory</th>
                                        <th style={tableHeaderStyle}>Expiry Status</th>
                                        <th className="no-print" style={{ ...tableHeaderStyle, justifyContent: 'center', textAlign: 'center' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredMedicines.map((med, index) => {
                                        const activeVal = med.IsActive ?? med.isActive;
                                        const isInactive = activeVal === false || activeVal === 0 || activeVal === "0";

                                        const stock = med.StockQuantity ?? med.stockQuantity ?? 0;
                                        const isLow = !isInactive && stock < 10;
                                        const isOutOfStock = !isInactive && stock === 0;
                                        const isLocked = isInactive || isOutOfStock;

                                        const medName = med.Name ?? med.name ?? "Unknown";
                                        const medIngredient = med.ingredient?.name ?? med.Ingredient?.Name ?? med.ActiveIngredient ?? med.activeIngredient ?? "N/A";
                                        const medCat = med.Category ?? med.category ?? "General";

                                        const d = new Date(med.ExpiryDate ?? med.expiryDate);
                                        const isSoon = !isInactive && d <= new Date(new Date().setDate(new Date().getDate() + 30)) && d >= new Date();

                                        return (
                                            <tr key={med.Id ?? med.id} style={getRowStyle(isInactive, isLow, index)}>
                                                <td style={tableCellStyle}>
                                                    <span style={{
                                                        fontSize: '12px',
                                                        fontWeight: '700',
                                                        color: '#64748b',
                                                        backgroundColor: '#f1f5f9',
                                                        padding: '4px 10px',
                                                        borderRadius: '8px',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.5px'
                                                    }}>
                                                        {medCat}
                                                    </span>
                                                </td>

                                                <td style={{ ...tableCellStyle, fontWeight: '800', color: '#1e293b' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexDirection: 'column', justifyContent: 'center' }}>
                                                        {medName}
                                                        {salesCountMap[medName.toLowerCase().trim()] >= TRENDING_THRESHOLD && (
                                                            <span title="Trending High Demand" style={trendingBadge}>🔥 HOT</span>
                                                        )}
                                                    </div>
                                                    {isInactive && <span style={inactiveBadge}>🚫 DEACTIVATED</span>}
                                                </td>

                                                <td style={{ ...tableCellStyle, color: '#475569', fontSize: '14px', fontWeight: '500', fontStyle: 'italic' }}>
                                                    {medIngredient}
                                                </td>

                                                <td style={{ ...tableCellStyle, textAlign: 'center', minWidth: '220px' }}>
                                                    <PricingCell
                                                        med={med}
                                                        userRole={userRole}
                                                        dismissedSuggestions={dismissedSuggestions}
                                                        onApplyDiscount={handleApplyInventoryDiscount}
                                                        onDismiss={(id) => setDismissedSuggestions([...dismissedSuggestions, id])}
                                                        onManualPriceChange={(id, newPrice) => {
                                                            setMedicines(medicines.map(m =>
                                                                (m.id === id || m.Id === id) ? { ...m, price: newPrice, Price: newPrice } : m
                                                            ));
                                                        }}
                                                    />
                                                </td>

                                                <td style={tableCellStyle}>
                                                    <span style={stockBadgeStyle(isLow, isInactive)}>
                                                        {stock} {isLow ? '🚨 LOW' : 'Units'}
                                                    </span>
                                                </td>

                                                <td style={tableCellStyle}>
                                                    <span style={expiryBadgeStyle(isSoon, isInactive)}>
                                                        {d.toLocaleDateString()} {isSoon && '⚠️'}
                                                    </span>
                                                </td>

                                                <td className="no-print" style={{ ...tableCellStyle, textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                        {(userRole === 'Admin' || userRole === 'Pharmacist') && (
                                                            <button
                                                                title="Edit Product"
                                                                onClick={() => handleEditClick(med)}
                                                                style={actionBtnStyle('#3b82f6')}
                                                            >
                                                                ✏️ Edit
                                                            </button>
                                                        )}
                                                        <button
                                                            title="Add to Basket"
                                                            onClick={() => handleAddToCart(med)}
                                                            disabled={isLocked}
                                                            style={isLocked ? lockedBtnStyle : actionBtnStyle('#10b981')}
                                                        >
                                                            {isInactive ? '🔒 Locked' : isOutOfStock ? '❌ No Stock' : '🛒 Cart'}
                                                        </button>
                                                        {userRole === 'Admin' && (
                                                            <button
                                                                title={isInactive ? "Enable Product" : "Disable Product"}
                                                                onClick={() => toggleActiveStatus(med)}
                                                                style={actionBtnStyle(isInactive ? '#0ea5e9' : '#ef4444')}
                                                            >
                                                                {isInactive ? '🔓 Enable' : '🚫 Disable'}
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
            <p>Total Medicines: {medicines.length}</p>
        </div>
    );
}

// ---  STYLES ---
const actionBtnStyle = (color) => ({
    backgroundColor: `${color}15`,
    color: color,
    border: `1.5px solid ${color}`,
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '11px',
    fontWeight: '800',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textTransform: 'uppercase',
});

const viewHeaderContainer = { display: 'flex', alignItems: 'center', padding: '20px 30px', backgroundColor: '#ffffff', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '30px', border: '1px solid #f1f3f5', position: 'relative', overflow: 'hidden' };
const accentBar = { width: '6px', height: '40px', backgroundColor: '#28a745', borderRadius: '10px', marginRight: '20px' };
const textContainer = { textAlign: 'left' };
const viewTitleStyle = { fontSize: '26px', fontWeight: '800', color: '#212529', margin: 0, letterSpacing: '-0.5px' };
const viewSubtitleStyle = { fontSize: '13px', color: '#6c757d', margin: '2px 0 0 0', fontWeight: '500' };
const statusBadge = { marginLeft: 'auto', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#28a745', backgroundColor: '#eafaf1', padding: '6px 12px', borderRadius: '20px', letterSpacing: '1px' };

const formContainerStyle = { background: '#f8fafc', padding: '45px', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', border: '1px solid #e2e8f0', maxWidth: '1050px', margin: '0 auto 60px auto', boxSizing: 'border-box' };
const formHeaderStyle = { textAlign: 'center', marginBottom: '35px', fontSize: '27px', color: '#00b894', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', textTransform: 'uppercase', letterSpacing: '2px', textShadow: '0 2px 10px rgba(0, 184, 148, 0.1)' };

const inputGroupGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '30px' };
const modernInput = { width: '100%', padding: '16px 20px', borderRadius: '12px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: '600', color: '#1e293b', boxSizing: 'border-box', transition: 'all 0.2s ease', outline: 'none' };
const addBtnStyle = { background: 'linear-gradient(to bottom, #00c9a7, #00897b)', color: 'white', padding: '18px 65px', borderRadius: '14px', border: 'none', borderBottom: '4px solid #00695c', fontSize: '16px', fontWeight: '900', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '1.5px', transition: 'transform 0.1s' };
// 🔴 FIX 4: Cancel button style for edit mode
const cancelBtnStyle = { background: 'linear-gradient(to bottom, #64748b, #475569)', color: 'white', padding: '18px 40px', borderRadius: '14px', border: 'none', borderBottom: '4px solid #334155', fontSize: '16px', fontWeight: '900', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '1.5px', transition: 'transform 0.1s' };
const labelStyle = { fontSize: '11px', fontWeight: '800', color: '#64748b', marginBottom: '10px', marginLeft: '5px', textTransform: 'uppercase', letterSpacing: '1.5px', display: 'block' };

const commandBarContainer = { width: '100%', maxWidth: '1050px', margin: '0 auto 25px auto', padding: '0 10px' };
const commandBarInner = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f1f3f9', padding: '12px 25px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' };
const toolLabelStyle = { fontSize: '12px', fontWeight: '800', color: '#64748b', display: 'flex', alignItems: 'center', gap: '10px', letterSpacing: '1px', textTransform: 'uppercase' };

const autoDisableBtnStyle = { backgroundColor: '#6f42c1', background: 'linear-gradient(135deg, #6f42c1 0%, #5a32a3 100%)', color: 'white', padding: '10px 24px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '800', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', boxShadow: '0 4px 12px rgba(111, 66, 193, 0.3)', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '8px' };

const navigationDockStyle = { display: 'flex', gap: '20px', maxWidth: '1100px', margin: '30px auto', padding: '15px 25px', backgroundColor: '#ffffff', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', alignItems: 'center', boxSizing: 'border-box' };
const searchDockWrapper = { flex: 2, display: 'flex', alignItems: 'center', backgroundColor: '#f8fafc', padding: '10px 20px', borderRadius: '14px', border: '1px solid #cbd5e1' };
const searchDockInput = { border: 'none', background: 'transparent', width: '100%', fontSize: '14px', fontWeight: '600', color: '#1e293b', outline: 'none' };
const printDockBtn = { flex: 0.8, background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', color: 'white', padding: '14px 25px', borderRadius: '14px', border: 'none', borderBottom: '3px solid #0f172a', fontSize: '14px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s ease', textTransform: 'uppercase', letterSpacing: '1px' };

const tableContainerStyle = { backgroundColor: '#ffffff', borderRadius: '24px', padding: '10px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)', border: '1px solid #e2e8f0', margin: '20px auto 50px auto', maxWidth: '1200px' };
const tableHeaderStyle = { padding: '18px 15px', fontSize: '16px', fontWeight: '900', color: '#475569', textTransform: 'uppercase', letterSpacing: '1.5px', borderBottom: '3px solid #cbd5e1', textAlign: 'center', backgroundColor: '#f8fafc', borderRight: '1px solid #cbd5e1' };
const tableCellStyle = { padding: '20px 15px', fontSize: '18px', borderBottom: '1px solid #e2e8f0', textAlign: 'center', borderRight: '1px solid #edf2f7', color: '#334155', verticalAlign: 'middle' };

const trendingBadge = { backgroundColor: '#fef2f2', color: '#dc2626', fontSize: '10px', padding: '2px 8px', borderRadius: '6px', fontWeight: '900', border: '1px solid #fee2e2' };
const stockBadgeStyle = (low, inactive) => ({ backgroundColor: inactive ? '#f1f5f9' : (low ? '#fef2f2' : '#f0fdf4'), color: inactive ? '#94a3b8' : (low ? '#991b1b' : '#166534'), padding: '5px 12px', borderRadius: '10px', fontWeight: '800', fontSize: '12px' });
const expiryBadgeStyle = (soon, inactive) => ({ color: inactive ? '#94a3b8' : (soon ? '#9a3412' : '#475569'), fontWeight: soon ? '900' : '600', fontSize: '13px' });
const lockedBtnStyle = { backgroundColor: '#f1f5f9', color: '#cbd5e1', padding: '8px 16px', borderRadius: '10px', border: 'none', cursor: 'not-allowed' };
const inactiveBadge = { backgroundColor: '#f1f5f9', color: '#64748b', fontSize: '10px', padding: '2px 8px', borderRadius: '6px', fontWeight: '900', border: '1px solid #cbd5e1', display: 'inline-block', marginTop: '4px' };

const getRowStyle = (isInactive, isLow, index) => {
    if (isInactive) return { backgroundColor: '#f1f5f9' };
    if (isLow) return { backgroundColor: '#fff5f5' };
    return {
        backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc',
        transition: 'background-color 0.2s ease'
    };
};

export default Inventory;