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
// Remove 'cart' and 'addToCart' from here
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
    setView
}) {

    // 1. DATA STATES
    
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        name: '', activeIngredient: '', price: 0, stockQuantity: 0, expiryDate: '', category: '', barcode: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [barcodeInput, setBarcodeInput] = useState('');
    const [dismissedSuggestions, setDismissedSuggestions] = useState([]);
    
    
    const [deliveryInfo] = useState({ address: 'In-Store Sale', method: 'Cash' });
    const [checkoutStep, setCheckoutStep] = useState('shop');
    const TRENDING_THRESHOLD = 5;


    // 3. FUNCTIONS

    /**
     * Resets the inventory form to default values.
     */
    const clearForm = () => {
        setFormData({ name: '', activeIngredient: '', price: 0, stockQuantity: 0, expiryDate: '', category: '', barcode: '' });
        setIsEditing(false);
        setEditId(null);
    };

    
    const handleEditClick = (med) => {
    setFormData({
        name: med.name ?? med.Name ?? '',
        activeIngredient: med.activeIngredient ?? med.ActiveIngredient ?? '',
        price: med.price ?? med.Price ?? 0,
        stockQuantity: med.stockQuantity ?? med.StockQuantity ?? 0,
        // The split('T')[0] is vital to make the <input type="date"> work!
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

        const isActive = newMedicine.IsActive ?? newMedicine.isActive;
        if (isActive === false) {
            alert(`🚫 ${medName} is currently restricted (Inactive).`);
            return;
        }

        // 1. Clinical Guard (Checks only if there are items in the cart)
        for (const cartItem of cart) {
            try {
                const response = await pharmacyApi.checkInteraction(medName, cartItem.name);
                if (response.data.includes("DANGER") || response.data.includes("⚠️")) {
                    const proceed = window.confirm(`🚨 INTERACTION ALERT:\n\n${response.data}\n\nAdd anyway?`);
                    if (!proceed) return;
                }
            } catch (error) {
                console.error("Check failed", error);
            }
        }

        // ✅ THE BRACE ABOVE ENDS THE LOOP. 
        // Now, Step 2 runs even if the cart was empty!

        // 2. FINAL CART LOGIC: Update state
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
                name: medName,
                price: medPrice,
                quantity: 1,
                totalPrice: medPrice,
                cartId: Date.now()
            };
            setCart(prevCart => [...prevCart, newItem]);
        }

        alert(`✅ Added ${medName} to prescription basket.`);
    };

        /**
     * Finalizes order based on User Role.
     * Clients create 'OnlineOrders' while Staff record 'PatientPurchases'.
     */
        const removeFromCart = (cartId) => {
            setCart(cart.filter(item => item.cartId !== cartId));
        };
    const handleCheckout = async () => {
        if (cart.length === 0) return;
        setCurrentInvoice(null); 
        const finalAddress = deliveryInfo.address.trim();

        // 1. Validation Checks
        if (userRole === 'Client' && finalAddress === "") {
            alert("⚠️ Please enter a delivery address before confirming.");
            return;
        }

        if (userRole === 'Client' && !currentUserId) {
            alert("❌ Session Error: Please log out and log back in.");
            return;
        }

        // 2. Identify Customer
        let customerIdentifier = "";
        let displayIdentifier = "";

        if (userRole === 'Client') {
            customerIdentifier = loginCredentials.username;
            displayIdentifier = loginCredentials.username;
        } else {
            const phone = prompt("Enter Patient Phone Number (Leave blank for Anonymous):");
            customerIdentifier = phone || "0000000000";
            displayIdentifier = phone || "Walk-in Customer";
        }

        try {
            // 🚀 THE FIX: Use Promise.all to ensure ATOMIC execution
            // This sends all items and waits for ALL of them to return 'OK'
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
                        patientPhone: String(customerIdentifier),  // ✅ camelCase
                        medicineName: String(item.name),
                        quantity: parseInt(item.quantity),
                        totalPrice: parseFloat(item.totalPrice)
                    });
                }
            }));

            // ✅ THE GATEKEEPER: This code ONLY runs if the Promise.all above succeeded 100%
            setCurrentInvoice({
                items: [...cart], // Use a copy to avoid reference issues
                total: cart.reduce((sum, item) => sum + item.totalPrice, 0),
                date: new Date().toLocaleString(),
                patient: displayIdentifier,
                address: userRole === 'Client' ? finalAddress : "In-Store Sale",
                paymentMethod: deliveryInfo.method
            });

            // 3. UI Synchronization
            await fetchMedicines();
            await fetchPatients();
            if (userRole === 'Client' && typeof fetchMyHistory === 'function') {
                await fetchMyHistory();
            }

            setIsOrderPlaced(true);
            setCheckoutStep('shop');
            setCart([]); // Clear cart only after success

            alert(userRole === 'Client' ? `✅ Order confirmed! Delivering to: ${finalAddress}` : "✅ Sale Complete!");

        } catch (error) {
            console.error("DEBUG SERVER ERROR:", error.response?.data);

            // 💡 Better Error Handling for your Graduation Project
            const errorData = error.response?.data;
            const errorMessage = errorData?.errors
                ? JSON.stringify(errorData.errors)
                : (errorData?.message || errorData || "C# Server Connection Error");

            alert(`❌ Checkout Failed: ${errorMessage}`);

            // Important: We do NOT set currentInvoice here, so the modal won't show!
        }
    };

    /**
     * Executes the Smart Discounting algorithm on a specific SKU.
     * Adjusts the current price while preserving the original BasePrice.
     */
    const handleApplyInventoryDiscount = async (med) => {
        // 1. Calculate the discount details first
        const discountFactor = getSmartDiscount(med.expiryDate);
        if (discountFactor === 0) return;

        // FIX: Always calculate based on the original BasePrice
        const suggestedPrice = (med.basePrice * (1 - discountFactor)).toFixed(2);
        const percentage = (discountFactor * 100).toFixed(0);

        // If the current price is already equal to or lower than the suggestion, stop.
        if (med.price <= parseFloat(suggestedPrice)) {
            alert("This discount has already been applied.");
            setDismissedSuggestions(prev => [...prev, med.id]);
            return;
        }

        // 2. Professional confirmation including the percentage
        if (window.confirm(`Apply ${percentage}% smart discount? New price: ${suggestedPrice} EGP`)) {
            try {
                await pharmacyApi.updateMedicine(med.id, {
                    ...med,
                    price: parseFloat(suggestedPrice),
                    basePrice: med.basePrice, // Keep original base price permanent
                    Id: med.id
                });
                setMedicines(prev => prev.map(m =>
                    m.id === med.id ? { ...m, price: parseFloat(suggestedPrice) } : m
                ));

                // 4. Update UI: Change the price immediately
                /*setMedicines(prev => prev.map(m =>
                    m.id === med.id ? { ...m, price: parseFloat(suggestedPrice), basePrice: m.basePrice || m.price } : m
                ));*/

                // 6. Hide the yellow decision box (Move it to dismissed)
                setDismissedSuggestions(prev => [...prev, med.id]);

                alert(`✅ Success: ${percentage}% Discount Applied!`);
            } catch (error) {
                console.error("Discount Error:", error);
                alert("❌ Database update failed. Check the C# console.");
            }
        }
        };
    /**
     * Persists a new medicine entry to the database.
     */
    const addMedicine = async () => {
        if (!formData.name || !formData.activeIngredient || !formData.category || !formData.expiryDate) {
            alert("⚠️ Validation Error: Please fill in all mandatory fields.");
            return;
        }
        try {
            await pharmacyApi.addMedicine(formData); 
            fetchMedicines();// Refresh view
            clearForm();
            alert("✅ Inventory entry created successfully!");
        } catch (error) {
            alert("❌ Database Write Error: Check server connection.");
        }
    };

    /**
     * Updates an existing medicine record using safe ID targeting.
     */
    const updateMedicine = async () => {
        try {
            await pharmacyApi.updateMedicine(editId, { ...formData, id: editId });
            fetchMedicines();
            clearForm();
            alert("✅ Record updated successfully!");
        } catch (error) {
            alert("❌ Update failed. Record may be locked or missing.");
        }
    };
    /**
     * Toggles the logical availability of a product without deleting it.
     * Essential for maintaining historical sales records.
     */
    const toggleActiveStatus = async (medicine) => {
        // 1. Calculate exactly what we want to send
        const targetId = medicine.id || medicine.Id;
        // We check both naming styles to be 100% safe
        const currentStatus = (medicine.IsActive !== undefined) ? medicine.IsActive : medicine.isActive;
        const newStatus = !currentStatus;

        try {
            // UI Update: Update both names in local state for instant feedback
            setMedicines(prev => prev.map(m =>
                (m.id === targetId || m.Id === targetId)
                    ? { ...m, IsActive: newStatus, isActive: newStatus }
                    : m
            ));

            // API Update: Send both naming styles so C# can't miss it
            await pharmacyApi.updateMedicine(targetId, {
                ...medicine,
                Id: targetId,
                id: targetId,
                IsActive: newStatus,
                isActive: newStatus
            });

            await fetchMedicines();
            alert(`✅ ${medicine.name} is now ${newStatus ? 'Active' : 'Disabled'}.`);

        } catch (error) {
            console.error("Update Error:", error.response?.data || error.message);
            // If it fails, pull the real data back to fix the UI
            await fetchMedicines();
            alert("❌ Update failed. Check the Black C# Console.");
        }
        };
    /**
     * Safety Protocol: Scans for expired stock and deactivates them in bulk.
     */
    const disableExpiredMedicines = async () => {
        const expiredOnes = medicines.filter(m =>
            new Date(m.expiryDate) < new Date() && (m.IsActive ?? m.isActive) !== false
        );

        if (expiredOnes.length === 0) return alert("✅ No active expired medicines found!");

        if (window.confirm(`Found ${expiredOnes.length} expired items. Disable all for safety?`)) {
            try {
                // Loop through each expired item and call your existing toggle function
                for (const med of expiredOnes) {
                    await pharmacyApi.updateMedicine(med.id || med.Id, { ...med, IsActive: false });
                }
                await fetchMedicines(); // Refresh the table
                alert(`✅ Successfully disabled ${expiredOnes.length} items.`);
            } catch (error) {
                alert("❌ Error during batch update.");
            }
        }


        };
   
    
    /** * Captures physical barcode scanner input.
     * Triggered by the 'Enter' key which most hardware scanners send automatically.
     */
    const handleBarcodeKeyDown = (e) => {
        if (e.key === 'Enter') {
            // Normalizing the input to prevent "not found" errors due to spaces or casing
            const cleanInput = barcodeInput.trim();

            const foundMed = medicines.find(m =>
                (m.barcode || m.Barcode) === cleanInput
            );

            if (foundMed) {
                // Check if the medicine is active before adding
                const isActive = foundMed.IsActive ?? foundMed.isActive;

                if (isActive === false || isActive === 0) {
                    alert(`🚫 Scanned: ${foundMed.name || foundMed.Name} is currently INACTIVE.`);
                } else {
                    // Hand it over to your main cart logic (which handles clinical checks)
                    handleAddToCart(foundMed);
                }
                setBarcodeInput(''); // Reset for the next physical scan
            } else {
                alert("⚠️ Barcode not found. Please ensure the product is registered in Inventory.");
                setBarcodeInput('');
            }
        }
    };
    // --- 5. SEARCH & FILTER LOGIC ---

    /** * Performs a multi-criteria search filter on the medicine array.
     * Robust against null values and supports both SQL (PascalCase) and JS (camelCase).
     */
    const filteredMedicines = medicines.filter(med => {
        if (!med) return false;

        // DATA NORMALIZATION:
        // Extracting fields using the Nullish Coalescing operator (??) 
        // This handles cases where values might be empty or missing from the DB.
        const name = (med.Name ?? med.name ?? "").toString().toLowerCase();
        const category = (med.Category ?? med.category ?? "").toString().toLowerCase();
        const ingredient = (med.ActiveIngredient ?? med.activeIngredient ?? "").toString().toLowerCase();

        const search = searchTerm.toLowerCase().trim();

        // Match against Name, Category, OR Active Ingredient
        return (
            name.includes(search) ||
            category.includes(search) ||
            ingredient.includes(search)
        );
    });

    /** * Triggers the browser's native print interface.
     * Tip: Ensure your CSS has @media print { .no-print { display: none; } }
     */
    const handlePrint = () => {
        window.print();
    };

    // Add this right before your return statement in Inventory.js
    console.log("System Status:", { checkoutStep, isOrderPlaced, currentInvoice });

    return (
        <div className="inventory-page">
            <div style={viewHeaderContainer}>
                <div style={accentBar}></div>
                <div style={textContainer}>
                    <h2 style={viewTitleStyle}>Inventory Management</h2>
                    <p style={viewSubtitleStyle}>Real-time stock monitoring & control</p>
                </div>

                {/* This pushes everything to the left and adds a "last updated" feel */}
                <div style={statusBadge}>
                    Live Inventory Mode
                </div>
            </div>
            <StatCards medicines={medicines} salesCountMap={salesCountMap} setView={setView} />
            {userRole !== 'Client' && (
                <>
                    

                    {/*"Safety Clean-up" Button*/}
                    <div className="no-print" style={commandBarContainer}>
                        <div style={commandBarInner}>
                            {/* Tool Identity */}
                            <div style={toolLabelStyle}>
                                <span style={{ fontSize: '18px' }}>🛠️</span>
                                <span>SYSTEM MAINTENANCE CONSOLE</span>
                            </div>

                            {/* The Power Action */}
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


                    {/* 2. ENTRY FORM - THE SMART CONSOLE */}
                    {(userRole === 'Admin' || userRole === 'Pharmacist') && (
                        <div className="no-print" style={formContainerStyle}>

                            {/* Dynamic Header */}
                            <h3 style={formHeaderStyle}>
                                <span style={{ fontSize: '24px' }}>
                                    {isEditing ? "📝" : "✚"}
                                </span>
                                {isEditing ? "Modify Medicine Details" : "Register New Inventory"}
                            </h3>

                            {/* --- SECTION 1: PRODUCT IDENTITY --- */}
                            <p style={labelStyle}>Drug Specifications</p>
                            <div style={inputGroupGrid}>
                                <input
                                    placeholder="Medicine Name"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    style={modernInput}
                                />
                                <input
                                    placeholder="Active Ingredient"
                                    value={formData.activeIngredient}
                                    onChange={e => setFormData({ ...formData, activeIngredient: e.target.value })}
                                    style={modernInput}
                                />
                                <input
                                    placeholder="Category (e.g. Antibiotic)"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    style={modernInput}
                                />
                            </div>

                            {/* --- SECTION 2: LOGISTICS & PRICING --- */}
                            <p style={{ ...labelStyle, marginTop: '25px' }}>Logistics & Finance</p>
                            <div style={inputGroupGrid}>
                                <input
                                    type="number"
                                    placeholder="Unit Price (EGP)"
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                    style={modernInput}
                                />
                                <input
                                    type="number"
                                    placeholder="Stock Quantity"
                                    value={formData.stockQuantity}
                                    onChange={e => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) })}
                                    style={modernInput}
                                />
                                <input
                                    type="date"
                                    value={formData.expiryDate}
                                    onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                                    style={modernInput}
                                />
                            </div>

                            {/* --- SECTION 3: SCANNING --- */}
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
                                        fontFamily: 'monospace', // Visual link to the scanner console
                                        color: '#1e293b'
                                    }}
                                />
                                <div />
                                <div />
                            </div>

                            {/* Modern Action Button */}
                            <button
                                onClick={isEditing ? updateMedicine : addMedicine}
                                style={isEditing ? { ...addBtnStyle, background: 'orange' } : addBtnStyle}
                            >
                                {isEditing ? (isEditing ? "💾 Save Changes" : "🚀 Commit to System") : "🚀 Commit to System"}
                            </button>
                        </div>
                    )}

                    
                    {/* --- STACKED CLINICAL ENGINES --- */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', maxWidth: '1050px', margin: '40px auto' }}>
                        <AlternativeMatcher medicines={medicines} />
                        <InteractionGuard />
                    </div>
                    
                    {/* --- 5. TABLE ACTIONS / NAVIGATION DOCK --- */}
                    <div className="no-print" style={navigationDockStyle}>

                        {/* Search Capsule */}
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

                        {/* Print Action */}
                        <button onClick={handlePrint} style={printDockBtn}>
                            <span style={{ marginRight: '8px' }}>🖨️</span>
                            Generate Stock Report
                        </button>
                    </div>

                    {/* 4. BARCODE SECTION */}
                    <BarcodeScanner
                        barcodeInput={barcodeInput}
                        setBarcodeInput={setBarcodeInput}
                        onKeyDown={handleBarcodeKeyDown}
                    />

                    {/* 5. BASKET SECTION */}
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


                    {/* 6. TABLE */}
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
                                // --- DATA NORMALIZATION ---
                                const activeVal = med.IsActive ?? med.isActive;
                                const isInactive = activeVal === false || activeVal === 0 || activeVal === "0";

                                // Stock & Case Sensitivity check
                                const stock = med.StockQuantity ?? med.stockQuantity ?? 0;
                                const isLow = !isInactive && stock < 10;

                                const medName = med.Name ?? med.name ?? "Unknown";
                                const medIngredient = med.ActiveIngredient ?? med.activeIngredient ?? "N/A";
                                const medCat = med.Category ?? med.category ?? "General";

                                const d = new Date(med.ExpiryDate ?? med.expiryDate);
                                const isSoon = !isInactive && d <= new Date(new Date().setDate(new Date().getDate() + 30)) && d >= new Date();

                                return (
                                    <tr key={med.Id ?? med.id} style={getRowStyle(isInactive, isLow, index)}>
                                        {/* Category with soft font */}
                                        <td style={tableCellStyle}>
                                            <span style={{
                                                fontSize: '12px',
                                                fontWeight: '700',
                                                color: '#64748b',
                                                backgroundColor: '#f1f5f9', // Very soft blue-gray background
                                                padding: '4px 10px',
                                                borderRadius: '8px',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}>
                                                {medCat}
                                            </span>
                                        </td>

                                        {/* Name with Bold emphasis */}
                                        <td style={{ ...tableCellStyle, fontWeight: '800', color: '#1e293b' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexDirection: 'column', justifyContent: 'center'}}>
                                                {medName}
                                                {salesCountMap[medName.toLowerCase().trim()] >= TRENDING_THRESHOLD && (
                                                    <span title="Trending High Demand" style={trendingBadge}>🔥 HOT</span>
                                                )}
                                            </div>
                                            {isInactive && <span style={inactiveBadge}>🚫 DEACTIVATED</span>}
                                        </td>

                                        <td style={{ ...tableCellStyle, color: '#475569', fontSize: '14px', fontWeight: '500', fontStyle: 'italic' }}>
                                            {medIngredient ?? "N/A"}
                                        </td>

                                        {/* Pricing Cell - Restored with Full Logic */}
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

                                        {/* Inventory with Pill Badges */}
                                        <td style={tableCellStyle}>
                                            <span style={stockBadgeStyle(isLow, isInactive)}>
                                                {stock} {isLow ? '🚨 LOW' : 'Units'}
                                            </span>
                                        </td>

                                        {/* Expiry with Status Logic */}
                                        <td style={tableCellStyle}>
                                            <span style={expiryBadgeStyle(isSoon, isInactive)}>
                                                {d.toLocaleDateString()} {isSoon && '⚠️'}
                                            </span>
                                        </td>

                                        {/* Actions with Icon-style spacing */}
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
                                                    disabled={isInactive}
                                                    style={isInactive ? lockedBtnStyle : actionBtnStyle('#10b981')}
                                                >
                                                    {isInactive ? '🔒 Locked' : '🛒 Cart'}
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
                </>
            )}
            <p>Total Medicines: {medicines.length}</p>
        </div>
    );
}
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

const viewHeaderContainer = {
    display: 'flex',
    alignItems: 'center',
    padding: '20px 30px',
    backgroundColor: '#ffffff',
    borderRadius: '15px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)', // Subtle elevation
    marginBottom: '30px',
    border: '1px solid #f1f3f5',
    position: 'relative',
    overflow: 'hidden'
};

const accentBar = {
    width: '6px',
    height: '40px',
    backgroundColor: '#28a745', // Match your pharmacy green
    borderRadius: '10px',
    marginRight: '20px'
};

const textContainer = {
    textAlign: 'left' // Move away from center for a professional app look
};

const viewTitleStyle = {
    fontSize: '26px',
    fontWeight: '800',
    color: '#212529',
    margin: 0,
    letterSpacing: '-0.5px'
};

const viewSubtitleStyle = {
    fontSize: '13px',
    color: '#6c757d',
    margin: '2px 0 0 0',
    fontWeight: '500'
};

const statusBadge = {
    marginLeft: 'auto',
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#28a745',
    backgroundColor: '#eafaf1',
    padding: '6px 12px',
    borderRadius: '20px',
    letterSpacing: '1px'
};

const formContainerStyle = {
    background: '#f8fafc', // Slightly cooler white (Slate 50)
    padding: '45px',
    borderRadius: '24px',
    // 1. SHARPER SHADOW: Stronger at the bottom, lighter on sides
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    // 2. DEFINED BORDER: A light gray-blue border makes the edges sharp
    border: '1px solid #e2e8f0',
    maxWidth: '1050px',
    margin: '0 auto 60px auto',
    boxSizing: 'border-box'
};

const formHeaderStyle = {
    textAlign: 'center',
    marginBottom: '35px',
    // 4. Vibrant Mint Green for a fresh medical feel
    fontSize: '27px',
    color: '#00b894',
    fontWeight: '900',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '15px',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    textShadow: '0 2px 10px rgba(0, 184, 148, 0.1)'
};

const inputGroupGrid = {
    display: 'grid',
    // FIX: auto-fit ensures boxes jump to the next line on small screens
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
};

const modernInput = {
    width: '100%',
    padding: '16px 20px',
    borderRadius: '12px',
    backgroundColor: '#ffffff',
    // 3. INPUT CONTRAST: Darker border so you can see exactly where to click
    border: '1px solid #cbd5e1',
    fontSize: '15px',
    fontWeight: '600',
    color: '#1e293b', // Deep navy-slate for better text contrast
    boxSizing: 'border-box',
    transition: 'all 0.2s ease',
    outline: 'none'
};

const addBtnStyle = {
    background: 'linear-gradient(to bottom, #00c9a7, #00897b)', // Deeper Teal/Emerald
    color: 'white',
    padding: '18px 65px',
    borderRadius: '14px',
    border: 'none',
    borderBottom: '4px solid #00695c', // Adds a 3D "Push-button" feel
    fontSize: '16px',
    fontWeight: '900',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    transition: 'transform 0.1s' // Makes it feel "clickable"
};
const labelStyle = {
    fontSize: '11px',
    fontWeight: '800',
    color: '#64748b', // Slate Gray for sharp contrast
    marginBottom: '10px',
    marginLeft: '5px',
    textTransform: 'uppercase',
    letterSpacing: '1.5px', // This is the secret to the "High-End" look
    display: 'block'
};

//autodisabled button
const commandBarContainer = {
    width: '100%',
    maxWidth: '1050px',
    margin: '0 auto 25px auto', // Centers the bar
    padding: '0 10px'
};

const commandBarInner = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f1f3f9', // A soft, clean gray-blue
    padding: '12px 25px',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
};

const toolLabelStyle = {
    fontSize: '12px',
    fontWeight: '800',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    letterSpacing: '1px',
    textTransform: 'uppercase'
};

const autoDisableBtnStyle = {
    backgroundColor: '#6f42c1',
    background: 'linear-gradient(135deg, #6f42c1 0%, #5a32a3 100%)',
    color: 'white',
    padding: '10px 24px',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '800',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    boxShadow: '0 4px 12px rgba(111, 66, 193, 0.3)',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
};
//navigation (search and print)
const navigationDockStyle = {
    display: 'flex',
    gap: '20px',
    maxWidth: '1100px', // Matches your clinical tools width
    margin: '30px auto',
    padding: '15px 25px',
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    // High-definition shadow to ground the dock
    boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
    border: '1px solid #e2e8f0',
    alignItems: 'center',
    boxSizing: 'border-box'
};

const searchDockWrapper = {
    flex: 2,
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: '10px 20px',
    borderRadius: '14px',
    border: '1px solid #cbd5e1'
};

const searchDockInput = {
    border: 'none',
    background: 'transparent',
    width: '100%',
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b',
    outline: 'none'
};

const printDockBtn = {
    flex: 0.8,
    background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', // Royal Navy
    color: 'white',
    padding: '14px 25px',
    borderRadius: '14px',
    border: 'none',
    borderBottom: '3px solid #0f172a', // 3D "Push" effect
    fontSize: '14px',
    fontWeight: '800',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textTransform: 'uppercase',
    letterSpacing: '1px'
};
//table

const tableContainerStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    padding: '10px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e2e8f0',
    margin: '20px auto 50px auto',
    maxWidth: '1200px'
};

const tableHeaderStyle = {
    padding: '18px 15px',
    fontSize: '16px', // Slightly larger
    fontWeight: '900',
    color: '#475569', // Darker gray for headers
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    borderBottom: '3px solid #cbd5e1',
    textAlign: 'center',
    backgroundColor: '#f8fafc',
    borderRight: '1px solid #cbd5e1',
};

const tableCellStyle = {
    padding: '20px 15px', // More vertical space for a premium feel
    fontSize: '18px', // Increased from 14px
    borderBottom: '1px solid #e2e8f0',
    textAlign: 'center',
    borderRight: '1px solid #edf2f7',
    color: '#334155', // Deeper Slate for better readability
    verticalAlign: 'middle'
};

const getRowStyle = (isInactive, isLow, index) => {
    if (isInactive) return { backgroundColor: '#f1f5f9' };
    if (isLow) return { backgroundColor: '#fff5f5' };

    // Zebra Effect: White and a very soft "Off-White Blue"
    return {
        backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc',
        transition: 'background-color 0.2s ease'
    };
};

// --- BADGE STYLES ---

const trendingBadge = {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    fontSize: '10px',
    padding: '2px 8px',
    borderRadius: '6px',
    fontWeight: '900',
    border: '1px solid #fee2e2'
};

const stockBadgeStyle = (low, inactive) => ({
    backgroundColor: inactive ? '#f1f5f9' : (low ? '#fef2f2' : '#f0fdf4'),
    color: inactive ? '#94a3b8' : (low ? '#991b1b' : '#166534'),
    padding: '5px 12px',
    borderRadius: '10px',
    fontWeight: '800',
    fontSize: '12px'
});

const expiryBadgeStyle = (soon, inactive) => ({
    color: inactive ? '#94a3b8' : (soon ? '#9a3412' : '#475569'),
    fontWeight: soon ? '900' : '600',
    fontSize: '13px'
});

const lockedBtnStyle = {
    backgroundColor: '#f1f5f9',
    color: '#cbd5e1',
    padding: '8px 16px',
    borderRadius: '10px',
    border: 'none',
    cursor: 'not-allowed'
};
const inactiveBadge = {
    backgroundColor: '#f1f5f9',
    color: '#64748b',
    fontSize: '10px',
    padding: '2px 8px',
    borderRadius: '6px',
    fontWeight: '900',
    border: '1px solid #cbd5e1',
    display: 'inline-block',
    marginTop: '4px'
};

export default Inventory;
